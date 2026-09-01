import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createServer } from '../src/server.js'
import { openStore } from '../src/store.js'
import { useStore } from '../src/photos.js'
import { makePng } from './support/png.js'

const withApp = async (run) => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-live-'))
  const store = openStore({ directory })
  useStore(store)

  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`

  try {
    return await run({ origin, store })
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await store.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

const upload = (origin, bytes = makePng(64)) =>
  fetch(origin + '/uploads', {
    method: 'POST',
    headers: { 'content-type': 'image/png', 'x-filename': 'new.png' },
    body: bytes,
  })

const tileIdsIn = (markup) =>
  [...markup.matchAll(/data-photo-id="([^"]+)"/g)].map((m) => m[1])

// @covers REQ-PHOTO-008@v1
test('a completed Upload returns a tile the page can insert', async () => {
  await withApp(async ({ origin, store }) => {
    const response = await upload(origin)

    assert.equal(response.status, 201)
    assert.match(response.headers.get('content-type') ?? '', /^text\/html/)

    const fragment = await response.text()
    const [id] = tileIdsIn(fragment)
    assert.ok(id, 'the response must be a tile carrying the new Photo id')
    assert.equal(id, store.listPhotos()[0].id)
    assert.match(fragment, /<img[^>]*src="\/photos\/[^"]+\/thumbnail"/)
  })
})

// @covers REQ-PHOTO-008@v1
test('the client inserts the returned tile without reloading', async () => {
  // SOURCE-LEVEL: no browser is run anywhere in this repository. This asserts
  // the script inserts the response body and never navigates or reloads.
  await withApp(async ({ origin }) => {
    const script = await fetch(origin + '/upload-modal.js').then((r) => r.text())

    assert.match(script, /insertAdjacentHTML/)
    assert.doesNotMatch(script, /location\s*\.\s*(href|assign|replace|reload)/)
    assert.doesNotMatch(script, /window\.location/)
  })
})

// @covers REQ-PHOTO-008@v1
test('the new tile is inserted in first position', async () => {
  await withApp(async ({ origin, store }) => {
    // SOURCE-LEVEL half: the client prepends rather than appends.
    const script = await fetch(origin + '/upload-modal.js').then((r) => r.text())
    assert.match(script, /'afterbegin'|"afterbegin"/)

    // REAL half: the same ordering guarantee seen from the server.
    await upload(origin, makePng(16))
    await upload(origin, makePng(32))
    const newest = store.listPhotos()[0].id

    const markup = await fetch(origin + '/').then((r) => r.text())
    assert.equal(tileIdsIn(markup)[0], newest, 'the newest Upload must be first')
  })
})

// @covers REQ-PHOTO-008@v1
test('the first Upload creates the grid the empty state does not have', async () => {
  // Criterion 7 with N = 0: there is no .gallery-grid to prepend into until a
  // Photo exists, so the client must create it.
  await withApp(async ({ origin }) => {
    const empty = await fetch(origin + '/').then((r) => r.text())
    assert.doesNotMatch(empty, /class="[^"]*gallery-grid/, 'no grid when empty')

    const script = await fetch(origin + '/upload-modal.js').then((r) => r.text())
    assert.match(script, /gallery-grid/, 'the client must be able to create the grid')
    assert.match(script, /empty-state/, 'and remove the empty state it replaces')
  })
})
