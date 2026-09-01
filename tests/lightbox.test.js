import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createHash } from 'node:crypto'

import { createServer } from '../src/server.js'
import { openStore } from '../src/store.js'
import { useStore } from '../src/photos.js'
import { makePng, makeJpeg } from './support/png.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

const withGallery = async (uploads, run) => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-lightbox-'))
  const store = openStore({ directory })
  useStore(store)

  const saved = []
  for (const upload of uploads) saved.push(await store.savePhoto(upload))

  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`

  try {
    const markup = await fetch(origin + '/').then((r) => r.text())
    const script = await fetch(origin + '/lightbox.js').then((r) => r.text())
    return await run({ origin, markup, script, saved, store })
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

/* ------------------------------------------------------------------ *
 * Real behaviour — the Original route is HTTP, so these prove what
 * they claim.
 * ------------------------------------------------------------------ */

// @covers REQ-PHOTO-009@v1
test('the Original is served, byte-identical and distinct from the Rendition', async () => {
  const original = makePng(256)

  await withGallery([png(original)], async ({ origin, saved, store }) => {
    const response = await fetch(`${origin}/photos/${saved[0].id}/original`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'image/png')

    const served = Buffer.from(await response.arrayBuffer())
    assert.equal(sha256(served), sha256(original), 'the Original must be unaltered')

    const thumbnail = await store.readThumbnail(saved[0].id)
    assert.notEqual(sha256(served), sha256(thumbnail), 'this must not be the Rendition')
    assert.ok(served.length > thumbnail.length)
  })
})

// @covers REQ-PHOTO-009@v1
test('the Original is served with the type it was uploaded as', async () => {
  const uploads = [{ bytes: await makeJpeg(128), filename: 'b.jpg', type: 'image/jpeg' }]

  await withGallery(uploads, async ({ origin, saved }) => {
    const response = await fetch(`${origin}/photos/${saved[0].id}/original`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'image/jpeg')
  })
})

// @covers REQ-PHOTO-009@v1
test('an unknown Photo id is refused rather than reaching the filesystem', async () => {
  await withGallery([png()], async ({ origin }) => {
    for (const id of [
      '00000000-0000-4000-8000-000000000000',
      '..%2f..%2fpackage.json',
      '..',
    ]) {
      const response = await fetch(`${origin}/photos/${id}/original`)
      assert.ok(
        response.status >= 400,
        `${id} must be refused, got ${response.status}`,
      )
    }
  })
})

/* ------------------------------------------------------------------ *
 * Served markup — inspected, not rendered.
 * ------------------------------------------------------------------ */

// @covers REQ-PHOTO-009@v1
test('each tile is a focusable control that can be activated', async () => {
  await withGallery([png(), png(makePng(64), 'b.png')], async ({ markup }) => {
    const tiles = [...markup.matchAll(/<li class="tile"[^>]*>([\s\S]*?)<\/li>/g)]
    assert.equal(tiles.length, 2)

    for (const [, inner] of tiles) {
      const button = /<button[^>]*>/.exec(inner)
      assert.ok(button, 'a tile must contain a real <button> so Enter activates it')
      assert.doesNotMatch(button[0], /tabindex="-1"/)
    }
  })
})

// @covers REQ-PHOTO-009@v1
test('the larger view is a dialog carrying no metadata text', async () => {
  await withGallery([png(makePng(64), 'holiday-2026.png')], async ({ markup }) => {
    const dialog = /<dialog[^>]*class="[^"]*lightbox[^"]*"[^>]*>([\s\S]*?)<\/dialog>/.exec(
      markup,
    )
    assert.ok(dialog, 'a <dialog class="lightbox"> must be present')

    assert.doesNotMatch(dialog[1], /holiday-2026/, 'no filename in the larger view')
    assert.doesNotMatch(dialog[1], /\d{4}-\d{2}-\d{2}/, 'no date')
    assert.doesNotMatch(dialog[1], /\bKB\b|\bMB\b|\bbytes\b/i, 'no size')
  })
})

// @covers REQ-PHOTO-009@v1
test('the lightbox image is filled from an Original, never a thumbnail', async () => {
  await withGallery([png()], async ({ markup, script }) => {
    const dialog = /<dialog[^>]*class="[^"]*lightbox[^"]*"[^>]*>([\s\S]*?)<\/dialog>/.exec(
      markup,
    )
    assert.match(dialog[1], /<img[^>]*class="[^"]*lightbox-image/)

    assert.match(script, /\/original/, 'the script must request the Original')
    assert.doesNotMatch(script, /\/thumbnail/, 'never the Rendition')
  })
})

// @covers REQ-PHOTO-009@v1
test('the larger view renders bigger than a tile', async () => {
  // CSS-LEVEL: compares declarations, not rendered boxes. A stylesheet that
  // reads correctly and paints wrongly passes.
  const css = readFileSync(join(ROOT, 'src', 'public', 'gallery.css'), 'utf8')

  const image = /\.lightbox-image\s*\{[^}]*\}/.exec(css)
  assert.ok(image, 'gallery.css must size .lightbox-image')
  assert.match(
    image[0],
    /max-width:\s*\d+vw|max-width:\s*100%/,
    'the larger view must be sized against the viewport',
  )
  assert.match(image[0], /max-height:\s*\d+vh|max-height:\s*100%/)

  const tile = /\.gallery-grid\s*\{[^}]*\}/.exec(css)
  assert.match(tile[0], /minmax\(/, 'tiles stay bounded by the grid track')
})

// @covers REQ-PHOTO-010@v1
test('the larger view carries a close control', async () => {
  await withGallery([png()], async ({ markup }) => {
    const dialog = /<dialog[^>]*class="[^"]*lightbox[^"]*"[^>]*>([\s\S]*?)<\/dialog>/.exec(
      markup,
    )
    assert.match(dialog[1], /<button[^>]*class="[^"]*lightbox-close/)
  })
})

/* ------------------------------------------------------------------ *
 * Script source. WEAKER: no browser is driven anywhere in this
 * repository. Accepted in slice 3 and recorded in this slice's plan.
 * ------------------------------------------------------------------ */

// @covers REQ-PHOTO-009@v1
test('activating a tile opens that tile own Photo', async () => {
  await withGallery([png()], async ({ script }) => {
    assert.match(script, /data-photo-id|dataset\.photoId/)
    assert.match(script, /showModal\(\)/)
  })
})

// @covers REQ-PHOTO-009@v1
test('the larger view opens as an overlay without navigating', async () => {
  await withGallery([png()], async ({ script }) => {
    assert.match(script, /showModal\(\)/)
    assert.doesNotMatch(script, /location\s*\.\s*(href|assign|replace|reload)/)
    assert.doesNotMatch(script, /window\.open/)
  })
})

// @covers REQ-PHOTO-009@v1
test('next and previous step through the grid order and stop at the ends', async () => {
  await withGallery([png()], async ({ script }) => {
    assert.match(script, /lightbox-next/)
    assert.match(script, /lightbox-previous/)
    // Stopping, not wrapping: the record licenses no wrap.
    assert.match(script, /Math\.min|Math\.max/)
    assert.doesNotMatch(script, /%\s*photos\.length|%\s*tiles\.length/)
  })
})

// @covers REQ-PHOTO-009@v1
test('the tile listener is delegated so newly uploaded tiles open too', async () => {
  // Slice 5 inserts tiles after load. A listener bound per tile at load would
  // leave those dead, and the grid itself may not exist when the script runs.
  await withGallery([png()], async ({ script }) => {
    assert.doesNotMatch(
      script,
      /querySelectorAll\([^)]*tile[^)]*\)[\s\S]{0,120}addEventListener/,
      'binding per tile would miss tiles inserted after load',
    )
    assert.match(script, /closest\(/, 'a delegated listener resolves the tile with closest()')
  })
})

// @covers REQ-PHOTO-010@v1
test('the close control returns to the grid and Escape is left to the dialog', async () => {
  await withGallery([png()], async ({ script }) => {
    assert.match(script, /lightbox-close/)
    assert.match(script, /\.close\(\)/)
    assert.doesNotMatch(
      script,
      /addEventListener\(\s*['"]cancel['"][\s\S]{0,120}preventDefault/,
      'Escape must close the larger view, not be blocked',
    )
  })
})
