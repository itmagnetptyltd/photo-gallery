import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { createServer } from '../src/server.js'
import { seedPhotos, PAGE_SIZE } from '../src/photos.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const startOnEphemeralPort = async () => {
  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  return {
    origin: `http://127.0.0.1:${port}`,
    stop: () => new Promise((resolve) => server.close(resolve)),
  }
}

/** Fetches the home page markup with the given Photos seeded. */
const homePageWith = async (photos) => {
  seedPhotos(photos)
  const app = await startOnEphemeralPort()
  try {
    const response = await fetch(app.origin + '/')
    assert.equal(response.status, 200)
    return await response.text()
  } finally {
    await app.stop()
  }
}

const tileIdsIn = (markup) =>
  [...markup.matchAll(/data-photo-id="([^"]+)"/g)].map((m) => m[1])

const photo = (id, uploadedAt, capturedAt = null) => ({
  id,
  uploadedAt,
  capturedAt,
  imageUrl: `/photos/${id}/image`,
})

// @covers REQ-PHOTO-001@v1
test('presents one tile for each stored Photo', async () => {
  const markup = await homePageWith([
    photo('a', '2026-08-01T10:00:00Z'),
    photo('b', '2026-08-02T10:00:00Z'),
    photo('c', '2026-08-03T10:00:00Z'),
  ])

  assert.equal(tileIdsIn(markup).length, 3)
})

// @covers REQ-PHOTO-001@v1
test('lays tiles out in rows and columns rather than one vertical list', async () => {
  const markup = await homePageWith([photo('a', '2026-08-01T10:00:00Z')])
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
  const markup = await homePageWith([
    photo('a', '2026-08-01T10:00:00Z'),
    photo('b', '2026-08-02T10:00:00Z'),
  ])

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
  const markup = await homePageWith([photo('a', '2026-08-01T10:00:00Z')])

  assert.doesNotMatch(markup, /type="password"/i)
  assert.doesNotMatch(markup, /\bsign[ -]?in\b/i)
  assert.doesNotMatch(markup, /\blog[ -]?in\b/i)
})

// @covers REQ-PHOTO-001@v1
test('orders tiles by Upload date and time, most recent first', async () => {
  const markup = await homePageWith([
    photo('middle', '2026-08-02T10:00:00Z', '2020-01-01T00:00:00Z'),
    photo('oldest', '2026-08-01T10:00:00Z', '2030-01-01T00:00:00Z'),
    photo('newest', '2026-08-03T10:00:00Z', '2010-01-01T00:00:00Z'),
  ])

  assert.deepEqual(tileIdsIn(markup), ['newest', 'middle', 'oldest'])
})

// @covers REQ-PHOTO-001@v1
test('renders a bounded subset when more Photos are held than fit a screen', async () => {
  const many = Array.from({ length: PAGE_SIZE * 3 }, (_, i) =>
    photo(`p${i}`, new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString()),
  )
  const markup = await homePageWith(many)

  assert.equal(tileIdsIn(markup).length, PAGE_SIZE)
  assert.ok(
    many.length > PAGE_SIZE,
    'this test is meaningless unless more Photos are held than one page',
  )
  assert.match(
    markup,
    /href="\/\?offset=/,
    'the remainder must be reachable from the page',
  )
})

// @covers REQ-PHOTO-001@v1
test('shows an empty state with the upload control when no Photo is held', async () => {
  const markup = await homePageWith([])

  assert.equal(tileIdsIn(markup).length, 0)
  assert.doesNotMatch(markup, /class="[^"]*\bgallery-grid\b[^"]*"/)
  assert.match(markup, /\+ Upload Photo/)
  assert.match(markup, /\bupload\b/i)
})

// @covers REQ-PHOTO-001@v1
test('does not present a tile for a Photo that has been removed', async () => {
  const remaining = [
    photo('kept-a', '2026-08-01T10:00:00Z'),
    photo('kept-b', '2026-08-02T10:00:00Z'),
  ]
  const markup = await homePageWith(remaining)

  assert.equal(tileIdsIn(markup).length, 2)
  assert.doesNotMatch(markup, /removed-one/)
})
