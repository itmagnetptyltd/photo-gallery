import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Jimp } from 'jimp'

import { createServer } from '../src/server.js'
import { openStore } from '../src/store.js'
import { useStore, PAGE_SIZE } from '../src/photos.js'
import { THUMBNAIL_EDGE } from '../src/thumbnails.js'
import { makePng, makeJpeg } from './support/png.js'

/** A server backed by a throwaway store holding the given uploads. */
const withGallery = async (uploads, run) => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-tiles-'))
  const store = openStore({ directory })
  useStore(store)

  const saved = []
  for (const upload of uploads) saved.push(await store.savePhoto(upload))

  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`

  try {
    const markup = await fetch(origin + '/').then((r) => r.text())
    return await run({ origin, markup, saved, store })
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await store.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

const png = (bytes = makePng(256), filename = 'photo.png') => ({
  bytes,
  filename,
  type: 'image/png',
})

/** Every image source the home page asks the browser to fetch. */
const tileSourcesIn = (markup) =>
  [...markup.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1])

// @covers REQ-PHOTO-002@v1
test('the tile image is rendered at tile size, not the Original size', async () => {
  const original = makePng(256)

  await withGallery([png(original)], async ({ origin, markup }) => {
    const [source] = tileSourcesIn(markup)
    const served = Buffer.from(await fetch(origin + source).then((r) => r.arrayBuffer()))

    const rendition = await Jimp.read(served)
    const source_ = await Jimp.read(original)

    assert.equal(rendition.width, THUMBNAIL_EDGE)
    assert.ok(
      rendition.width < source_.width,
      `the Rendition (${rendition.width}px) must be narrower than the Original (${source_.width}px)`,
    )
  })
})

// @covers REQ-PHOTO-002@v1
test('every tile image request succeeds and carries image data', async () => {
  await withGallery([png(), png(makePng(64), 'small.png')], async ({ origin, markup }) => {
    const sources = tileSourcesIn(markup)
    assert.equal(sources.length, 2, 'both Photos must have a tile image')

    for (const source of sources) {
      const response = await fetch(origin + source)
      assert.equal(response.status, 200, `${source} must not be broken`)
      assert.match(response.headers.get('content-type') ?? '', /^image\//)
      assert.ok((await response.arrayBuffer()).byteLength > 0)
    }
  })
})

// @covers REQ-PHOTO-002@v1
test('a JPEG Original and a PNG Original both render', async () => {
  const uploads = [
    png(makePng(128), 'a.png'),
    { bytes: await makeJpeg(128), filename: 'b.jpg', type: 'image/jpeg' },
  ]

  await withGallery(uploads, async ({ origin, markup }) => {
    const sources = tileSourcesIn(markup)
    assert.equal(sources.length, 2)

    for (const source of sources) {
      const response = await fetch(origin + source)
      assert.equal(response.status, 200)
      assert.ok((await response.arrayBuffer()).byteLength > 0)
    }
  })
})

// @covers REQ-PHOTO-002@v1
test('the tile is served the Rendition and never the Original', async () => {
  const original = makePng(256)

  await withGallery([png(original)], async ({ origin, markup, saved, store }) => {
    const [source] = tileSourcesIn(markup)
    const served = Buffer.from(await fetch(origin + source).then((r) => r.arrayBuffer()))
    const thumbnail = await store.readThumbnail(saved[0].id)

    assert.deepEqual(served, thumbnail, 'the tile must be served the stored Rendition')
    assert.ok(
      served.length < original.length,
      `the Rendition (${served.length}) must be smaller than the Original (${original.length})`,
    )
    assert.doesNotMatch(
      source,
      /original/i,
      'the tile must not point at an Original route',
    )
  })
})

// @covers REQ-PHOTO-002@v1
test('a tile presents the image alone', async () => {
  await withGallery([png(makePng(64), 'holiday-2026.png')], async ({ markup }) => {
    const tile = /<li class="tile"[^>]*>([\s\S]*?)<\/li>/.exec(markup)
    assert.ok(tile, 'a tile must be present')

    assert.doesNotMatch(tile[1], /holiday-2026/, 'no filename beside the image')
    assert.doesNotMatch(tile[1], /\d{4}-\d{2}-\d{2}/, 'no date beside the image')
    assert.doesNotMatch(tile[1], /\bKB\b|\bMB\b|\bbytes\b/i, 'no size beside the image')

    const withoutTags = tile[1].replace(/<[^>]*>/g, '').trim()
    assert.equal(withoutTags, '', 'a tile carries no text at all')
  })
})

// @covers REQ-PHOTO-002@v1
test('Renditions are requested only for the tiles presented', async () => {
  const uploads = Array.from({ length: PAGE_SIZE + 6 }, (_, i) =>
    png(makePng(16), `photo-${i}.png`),
  )

  await withGallery(uploads, async ({ markup }) => {
    assert.equal(
      tileSourcesIn(markup).length,
      PAGE_SIZE,
      'the page must not ask for a Rendition per stored Photo',
    )
  })
})
