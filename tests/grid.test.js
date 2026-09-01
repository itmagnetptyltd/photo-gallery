import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { createServer } from '../src/server.js'
import { openStore } from '../src/store.js'
import { useStore, PAGE_SIZE } from '../src/photos.js'
import { makePng } from './support/png.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Seeds `count` Photos into a throwaway store, one at a time so their Upload
 * order is the order they were saved, then fetches the home page.
 *
 * Slice 2 seeded plain objects through a `seedPhotos` seam. Slice 4 removed it
 * when the store arrived, so these tests now exercise the real path.
 */
const homePageWith = async (count, { removeAt = null, query = '' } = {}) => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-grid-'))
  const store = openStore({ directory })
  useStore(store)

  const saved = []
  for (let i = 0; i < count; i += 1) {
    saved.push(
      await store.savePhoto({
        bytes: makePng(16),
        filename: `photo-${i}.png`,
        type: 'image/png',
      }),
    )
  }

  let removed = null
  if (removeAt !== null) {
    removed = saved[removeAt]
    await store.removePhoto(removed.id)
  }

  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`

  try {
    const response = await fetch(origin + '/' + query)
    assert.equal(response.status, 200)
    return { markup: await response.text(), saved, removed }
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await store.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

const tileIdsIn = (markup) =>
  [...markup.matchAll(/data-photo-id="([^"]+)"/g)].map((m) => m[1])

// @covers REQ-PHOTO-001@v1
test('presents one tile for each stored Photo', async () => {
  const { markup } = await homePageWith(3)
  assert.equal(tileIdsIn(markup).length, 3)
})

// @covers REQ-PHOTO-001@v1
test('lays tiles out in rows and columns rather than one vertical list', async () => {
  const { markup } = await homePageWith(1)
  assert.match(markup, /class="[^"]*\bgallery-grid\b[^"]*"/)

  const css = readFileSync(join(ROOT, 'src', 'public', 'gallery.css'), 'utf8')
  const rule = /\.gallery-grid\s*\{[^}]*\}/.exec(css)
  assert.ok(rule, 'gallery.css must style .gallery-grid')
  assert.match(rule[0], /display:\s*grid/)
  assert.match(
    rule[0],
    /grid-template-columns:\s*repeat\(/,
    'a single column would be a vertical list, not a grid',
  )
})

// @covers REQ-PHOTO-001@v1
test('shows all Photos in one collection with no gallery selector', async () => {
  const { markup } = await homePageWith(2)

  assert.equal(
    [...markup.matchAll(/class="[^"]*\bgallery-grid\b[^"]*"/g)].length,
    1,
    'more than one grid would mean more than one collection',
  )
  assert.doesNotMatch(markup, /<select/i)
  assert.doesNotMatch(markup, /\balbum\b/i)
})

// @covers REQ-PHOTO-001@v1
test('serves the home page without a sign-in prompt', async () => {
  const { markup } = await homePageWith(1)

  assert.doesNotMatch(markup, /type="password"/i)
  assert.doesNotMatch(markup, /\bsign[ -]?in\b/i)
  assert.doesNotMatch(markup, /\blog[ -]?in\b/i)
})

// @covers REQ-PHOTO-001@v1
test('orders tiles by Upload date and time, most recent first', async () => {
  const { markup, saved } = await homePageWith(3)

  const expected = [...saved].reverse().map((photo) => photo.id)
  assert.deepEqual(tileIdsIn(markup), expected)
})

// @covers REQ-PHOTO-001@v1
test('renders a bounded subset when more Photos are held than fit a screen', async () => {
  const total = PAGE_SIZE + 5
  const { markup } = await homePageWith(total)

  assert.equal(tileIdsIn(markup).length, PAGE_SIZE)
  assert.ok(total > PAGE_SIZE, 'this test is meaningless without more than one page')
  assert.match(
    markup,
    /href="\/\?offset=/,
    'the remainder must be reachable from the page',
  )
})

// @covers REQ-PHOTO-001@v1
test('shows an empty state with the upload control when no Photo is held', async () => {
  const { markup } = await homePageWith(0)

  assert.equal(tileIdsIn(markup).length, 0)
  assert.doesNotMatch(markup, /class="[^"]*\bgallery-grid\b[^"]*"/)
  assert.match(markup, /\+ Upload Photo/)
  assert.match(markup, /\bupload\b/i)
})

// @covers REQ-PHOTO-001@v1
test('does not present a tile for a Photo that has been removed', async () => {
  const { markup, removed } = await homePageWith(3, { removeAt: 1 })

  assert.equal(tileIdsIn(markup).length, 2)
  assert.doesNotMatch(markup, new RegExp(removed.id))
})
