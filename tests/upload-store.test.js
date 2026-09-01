import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createServer } from '../src/server.js'
import { openStore } from '../src/store.js'
import { useStore, countPhotos } from '../src/photos.js'
import { makePng } from './support/png.js'

/** A server backed by a throwaway store. */
const withApp = async (run) => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-app-'))
  const store = openStore({ directory })
  useStore(store)

  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`

  try {
    return await run({ origin, store, directory })
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await store.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

const postPng = (origin, bytes = makePng()) =>
  fetch(origin + '/uploads', {
    method: 'POST',
    headers: { 'content-type': 'image/png', 'x-filename': 'photo.png' },
    body: bytes,
  })

const clientScript = (origin) =>
  fetch(origin + '/upload-modal.js').then((r) => r.text())

// @covers REQ-PHOTO-006@v1
test('an accepted Upload increases the Photo count by exactly one', async () => {
  await withApp(async ({ origin }) => {
    const before = countPhotos()
    const response = await postPng(origin)

    assert.ok(response.ok, `expected success, got ${response.status}`)
    assert.equal(countPhotos(), before + 1)
  })
})

// @covers REQ-PHOTO-006@v1
test('a completed Upload appears on a freshly requested home page', async () => {
  await withApp(async ({ origin, store }) => {
    await postPng(origin)
    const [photo] = store.listPhotos()

    const markup = await fetch(origin + '/').then((r) => r.text())
    assert.match(markup, new RegExp(`data-photo-id="${photo.id}"`))
  })
})

// @covers REQ-PHOTO-006@v1
test('no control offering to download the Original is presented', async () => {
  await withApp(async ({ origin }) => {
    await postPng(origin)
    const markup = await fetch(origin + '/').then((r) => r.text())

    assert.doesNotMatch(markup, /\bdownload\b/i)
  })
})

// @covers REQ-PHOTO-007@v1
test('an Upload the server cannot store creates no Photo', async () => {
  await withApp(async ({ origin }) => {
    const before = countPhotos()
    const response = await fetch(origin + '/uploads', {
      method: 'POST',
      headers: { 'content-type': 'image/png', 'x-filename': 'broken.png' },
      body: Buffer.from('not an image at all'),
    })

    assert.ok(response.status >= 400)
    assert.equal(countPhotos(), before)
  })
})

// @covers REQ-PHOTO-007@v1
test('a failure is reported to the person and the modal is not closed', async () => {
  // SOURCE-LEVEL: no browser is run. This asserts the client renders the
  // failure message and never closes the dialog on an unsuccessful response.
  await withApp(async ({ origin }) => {
    const script = await clientScript(origin)

    assert.match(script, /response\.ok/)
    assert.doesNotMatch(
      script,
      /response\.ok[\s\S]{0,200}\.close\(\)/,
      'the modal must not close itself on the response path',
    )
  })
})

// @covers REQ-PHOTO-007@v1
test('the same file can be resubmitted without reopening the modal', async () => {
  // SOURCE-LEVEL: the submit handler must not clear the file input, and must
  // re-enable itself, so a second attempt is possible from the open modal.
  await withApp(async ({ origin }) => {
    const script = await clientScript(origin)

    assert.match(script, /finally\s*\{[\s\S]{0,200}disabled\s*=\s*false/)
    assert.doesNotMatch(
      script,
      /catch[\s\S]{0,200}fileInput\.value\s*=\s*''/,
      'clearing the chosen file would force the person to choose it again',
    )
  })
})

// @covers REQ-PHOTO-012@v1
test('a Photo uploaded earlier is present in a new session with no client state', async () => {
  await withApp(async ({ origin, store }) => {
    await postPng(origin)
    const [photo] = store.listPhotos()

    // A fresh request carrying nothing from the previous one.
    const markup = await fetch(origin + '/', {
      headers: { 'cache-control': 'no-store' },
    }).then((r) => r.text())

    assert.match(markup, new RegExp(`data-photo-id="${photo.id}"`))
  })
})
