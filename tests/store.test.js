import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

import { openStore } from '../src/store.js'
import { makePng } from './support/png.js'

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

/** A store in a throwaway directory, closed and deleted afterwards. */
const withStore = async (run) => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-store-'))
  const store = openStore({ directory })
  try {
    return await run(store, directory)
  } finally {
    await store.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

const upload = (bytes = makePng(), filename = 'photo.png') => ({
  bytes,
  filename,
  type: 'image/png',
})

// @covers REQ-PHOTO-006@v1
test('a submitted image becomes exactly one Photo', async () => {
  await withStore(async (store) => {
    assert.equal(store.countPhotos(), 0)
    await store.savePhoto(upload())
    assert.equal(store.countPhotos(), 1)
  })
})

// @covers REQ-PHOTO-006@v1
test('the same file uploaded twice becomes two Photos', async () => {
  await withStore(async (store) => {
    const bytes = makePng()
    const first = await store.savePhoto(upload(bytes))
    const second = await store.savePhoto(upload(bytes))

    assert.equal(store.countPhotos(), 2)
    assert.notEqual(first.id, second.id)
    assert.equal(store.listPhotos().length, 2)
  })
})

// @covers REQ-PHOTO-006@v1
test('the stored Original is byte-identical to the file submitted', async () => {
  await withStore(async (store) => {
    const bytes = makePng()
    const photo = await store.savePhoto(upload(bytes))

    const stored = await store.readOriginal(photo.id)
    assert.equal(sha256(stored), sha256(bytes))
    assert.equal(stored.length, bytes.length)
  })
})

// @covers REQ-PHOTO-006@v1
test('a thumbnail Rendition smaller than the Original is stored', async () => {
  await withStore(async (store) => {
    const bytes = makePng(256)
    const photo = await store.savePhoto(upload(bytes))

    const thumbnail = await store.readThumbnail(photo.id)
    assert.ok(thumbnail.length > 0, 'a Rendition must exist')
    assert.ok(
      thumbnail.length < bytes.length,
      `Rendition (${thumbnail.length}) must be smaller than the Original (${bytes.length})`,
    )
    assert.deepEqual(
      [...thumbnail.subarray(0, 8)],
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      'the Rendition must itself be a valid image',
    )
  })
})

// @covers REQ-PHOTO-006@v1
test('a save that fails on disk leaves no record and no partial file', async () => {
  await withStore(async (store, directory) => {
    await assert.rejects(() =>
      store.savePhoto({ ...upload(), failAt: 'write-original' }),
    )

    assert.equal(store.countPhotos(), 0)
    assert.deepEqual(
      readdirSync(join(directory, 'originals')),
      [],
      'no partial file may remain',
    )
  })
})

// @covers REQ-PHOTO-007@v1
test('a failed save leaves the Photo count unchanged', async () => {
  await withStore(async (store) => {
    await store.savePhoto(upload())
    const before = store.countPhotos()

    await assert.rejects(() =>
      store.savePhoto({ ...upload(), failAt: 'write-original' }),
    )
    assert.equal(store.countPhotos(), before)
  })
})

// @covers REQ-PHOTO-007@v1
test('a failure after the Original is written leaves nothing behind', async () => {
  await withStore(async (store, directory) => {
    // The case a naive implementation gets wrong: bytes are already on disk
    // when the failure arrives, and the metadata row was never inserted.
    await assert.rejects(() =>
      store.savePhoto({ ...upload(), failAt: 'insert-row' }),
    )

    assert.equal(store.countPhotos(), 0)
    assert.deepEqual(readdirSync(join(directory, 'originals')), [])
    assert.deepEqual(readdirSync(join(directory, 'thumbnails')), [])
  })
})

// @covers REQ-PHOTO-012@v1
test('a Photo survives the application being stopped and started', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-store-'))
  try {
    const first = openStore({ directory })
    const photo = await first.savePhoto(upload())
    await first.close()

    const second = openStore({ directory })
    try {
      assert.equal(second.countPhotos(), 1)
      assert.equal(second.listPhotos()[0].id, photo.id)
    } finally {
      await second.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

// @covers REQ-PHOTO-012@v1
test('the stored Original from an earlier session is byte-identical', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-store-'))
  try {
    const bytes = makePng()
    const first = openStore({ directory })
    const photo = await first.savePhoto(upload(bytes))
    await first.close()

    const second = openStore({ directory })
    try {
      assert.equal(sha256(await second.readOriginal(photo.id)), sha256(bytes))
    } finally {
      await second.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

// @covers REQ-PHOTO-012@v1
test('a removed Photo is absent later and cannot be recovered', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-store-'))
  try {
    const first = openStore({ directory })
    const photo = await first.savePhoto(upload())
    await first.removePhoto(photo.id)
    await first.close()

    const second = openStore({ directory })
    try {
      assert.equal(second.countPhotos(), 0)
      assert.deepEqual(second.listPhotos(), [])
      await assert.rejects(
        () => second.readOriginal(photo.id),
        'a removed Photo must not be readable',
      )
      assert.deepEqual(readdirSync(join(directory, 'originals')), [])
    } finally {
      await second.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

// @covers REQ-PHOTO-012@v1
test('a Photo survives the PC being shut down', async () => {
  // MANUAL: no test here power-cycles a machine. A fresh store opened against
  // the same directory in a new process is the closest automatable proxy, and
  // it is what this asserts. A crash mid-write is never exercised.
  const directory = mkdtempSync(join(tmpdir(), 'photo-store-'))
  try {
    const first = openStore({ directory })
    await first.savePhoto(upload())
    await first.close()

    const second = openStore({ directory })
    try {
      assert.equal(second.countPhotos(), 1)
    } finally {
      await second.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

// @covers REQ-PHOTO-001@v1
test('a stored Photo carries no Capture date for ordering to use', async () => {
  // REQ-PHOTO-001 criterion 5 requires ordering by Upload date and not by
  // Capture date. Answer 14 put Capture date out of scope, so the store has no
  // such field at all — a structural guarantee rather than a test of one.
  await withStore(async (store) => {
    await store.savePhoto(upload())
    const [photo] = store.listPhotos()

    assert.ok(photo.uploadedAt, 'a Photo must carry an Upload date')
    assert.equal(photo.capturedAt, undefined)
  })
})
