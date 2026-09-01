import sqlite from 'node-sqlite3-wasm'
import { mkdirSync } from 'node:fs'
import { open, rename, rm, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

import { makeThumbnail } from './thumbnails.js'

/**
 * Where Photos live. The client asked for files on disk with metadata in
 * SQLite (ANSWERS.md, question 24).
 *
 * The metadata row is the commit point. Files are written and renamed into
 * place first, and the row is inserted last, so a failure can leave a file with
 * no row — invisible and collectable — but never a row with no file. Every
 * failure path unlinks what it wrote, because REQ-PHOTO-006 and REQ-PHOTO-007
 * both require that nothing partial remains.
 */

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS photos (
    id          TEXT PRIMARY KEY,
    filename    TEXT NOT NULL,
    type        TEXT NOT NULL,
    uploaded_at TEXT NOT NULL
  )
`

/** Writes bytes and flushes them to the platter before returning. */
const writeDurably = async (path, bytes) => {
  const handle = await open(path, 'w')
  try {
    await handle.write(bytes)
    await handle.sync()
  } finally {
    await handle.close()
  }
}

const discard = async (...paths) => {
  for (const path of paths) await rm(path, { force: true })
}

const toPhoto = (row) => ({
  id: row.id,
  filename: row.filename,
  type: row.type,
  uploadedAt: row.uploaded_at,
  thumbnailUrl: `/photos/${row.id}/thumbnail`,
})

export const openStore = ({ directory }) => {
  const originals = join(directory, 'originals')
  const thumbnails = join(directory, 'thumbnails')

  mkdirSync(originals, { recursive: true })
  mkdirSync(thumbnails, { recursive: true })

  const db = new sqlite.Database(join(directory, 'photos.db'))
  db.run(SCHEMA)

  const pathsFor = (id) => ({
    original: join(originals, id),
    originalTemp: join(originals, `${id}.part`),
    thumbnail: join(thumbnails, id),
    thumbnailTemp: join(thumbnails, `${id}.part`),
  })

  /**
   * `failAt` injects a failure at a named step. REQ-PHOTO-006 criterion 6 is
   * about an exhausted disk and REQ-PHOTO-007 criterion 4 about a failure
   * part-way through writing; neither should be provoked for real in a test.
   */
  const savePhoto = async ({ bytes, filename, type, failAt = null }) => {
    const id = randomUUID()
    const path = pathsFor(id)

    try {
      await writeDurably(path.originalTemp, bytes)
      if (failAt === 'write-original') {
        throw new Error('injected failure while writing the Original')
      }
      await rename(path.originalTemp, path.original)

      await writeDurably(path.thumbnailTemp, await makeThumbnail(bytes))
      await rename(path.thumbnailTemp, path.thumbnail)

      if (failAt === 'insert-row') {
        throw new Error('injected failure before the row was inserted')
      }

      const uploadedAt = new Date().toISOString()
      db.run('INSERT INTO photos (id, filename, type, uploaded_at) VALUES (?, ?, ?, ?)', [
        id,
        filename,
        type,
        uploadedAt,
      ])

      return toPhoto({ id, filename, type, uploaded_at: uploadedAt })
    } catch (failure) {
      await discard(
        path.originalTemp,
        path.original,
        path.thumbnailTemp,
        path.thumbnail,
      )
      throw failure
    }
  }

  /** Newest Upload first. Ties break by insertion order, newest first. */
  const listPhotos = ({ limit = 24, offset = 0 } = {}) =>
    db
      .all('SELECT * FROM photos ORDER BY uploaded_at DESC, rowid DESC LIMIT ? OFFSET ?', [
        limit,
        offset,
      ])
      .map(toPhoto)

  const countPhotos = () => db.get('SELECT COUNT(*) AS n FROM photos').n

  const requireRow = (id) => {
    const row = db.get('SELECT * FROM photos WHERE id = ?', [id])
    if (!row) throw new Error(`no Photo with id ${id}`)
    return row
  }

  const readOriginal = async (id) => {
    requireRow(id)
    return readFile(pathsFor(id).original)
  }

  const readThumbnail = async (id) => {
    requireRow(id)
    return readFile(pathsFor(id).thumbnail)
  }

  /**
   * Removal is permanent: the row and both files go, and nothing is retained
   * to recover from (ANSWERS.md, question 17).
   */
  const removePhoto = async (id) => {
    requireRow(id)
    db.run('DELETE FROM photos WHERE id = ?', [id])

    const path = pathsFor(id)
    await discard(path.original, path.thumbnail)
  }

  const close = async () => db.close()

  return {
    savePhoto,
    listPhotos,
    countPhotos,
    readOriginal,
    readThumbnail,
    removePhoto,
    close,
  }
}
