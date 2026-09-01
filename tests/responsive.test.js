import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { createServer } from '../src/server.js'
import { openStore } from '../src/store.js'
import { useStore } from '../src/photos.js'
import { makePng } from './support/png.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const stylesheet = () =>
  readFileSync(join(ROOT, 'src', 'public', 'gallery.css'), 'utf8')

/** The rule body for a selector, or null. */
const ruleFor = (css, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`${escaped}\\s*\\{[^}]*\\}`).exec(css)?.[0] ?? null
}

const homePageWithOnePhoto = async () => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-responsive-'))
  const store = openStore({ directory })
  useStore(store)
  await store.savePhoto({ bytes: makePng(64), filename: 'a.png', type: 'image/png' })

  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`

  try {
    return await fetch(origin + '/').then((r) => r.text())
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await store.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

/*
 * CSS-LEVEL throughout. REQ-PHOTO-015 permits no browser automation
 * dependency, so nothing here renders a page at a viewport width. These tests
 * assert the declarations that produce the required behaviour; a stylesheet
 * that reads correctly and paints wrongly would pass. Recorded and accepted in
 * this slice's plan.
 */

// @covers REQ-PHOTO-011@v1
test('the grid reflows rather than overflowing the viewport', async () => {
  const css = stylesheet()
  const grid = ruleFor(css, '.gallery-grid')
  assert.ok(grid, 'gallery.css must style .gallery-grid')

  assert.match(
    grid,
    /repeat\(\s*auto-(fill|fit)\s*,\s*minmax\(/,
    'tracks must shrink to fit rather than hold a fixed count',
  )

  // Nothing may pin a width wider than its container.
  assert.doesNotMatch(css, /width:\s*\d{3,}px/, 'no fixed pixel width over 99px')
  assert.doesNotMatch(css, /min-width:\s*\d{3,}px/)

  const image = ruleFor(css, '.tile img')
  assert.match(image, /width:\s*100%/, 'tile images must be bounded by their tile')
})

// @covers REQ-PHOTO-011@v1
test('the upload control sits in normal flow, reachable without scrolling', async () => {
  const markup = await homePageWithOnePhoto()
  const css = stylesheet()

  assert.match(markup, /<button[^>]*class="[^"]*upload-control/)

  const control = ruleFor(css, '.upload-control')
  assert.ok(control)
  assert.doesNotMatch(control, /position:\s*(absolute|fixed)/, 'must stay in flow')
  assert.doesNotMatch(control, /left:\s*-|margin-left:\s*-/, 'must not be pushed off-canvas')
})

// @covers REQ-PHOTO-011@v1
test('tile spacing is uniform and no tile can overlap another', async () => {
  const css = stylesheet()
  const grid = ruleFor(css, '.gallery-grid')

  assert.match(grid, /gap:\s*/, 'one gap governs every gutter, so spacing cannot vary')

  const tile = ruleFor(css, '.tile')
  assert.ok(tile)
  assert.doesNotMatch(
    tile,
    /position:\s*(absolute|fixed)/,
    'a positioned tile could overlap its neighbours',
  )
  assert.doesNotMatch(tile, /margin:/, 'per-tile margins would make spacing uneven')
})

// @covers REQ-PHOTO-011@v1
test('every control needed to upload and to open and close the larger view is focusable', async () => {
  const markup = await homePageWithOnePhoto()

  const required = [
    'upload-control',
    'tile-open',
    'upload-submit',
    'upload-close',
    'lightbox-previous',
    'lightbox-next',
    'lightbox-close',
  ]

  for (const control of required) {
    const element = new RegExp(`<(button|input|a)[^>]*class="[^"]*${control}[^"]*"[^>]*>`).exec(
      markup,
    )
    assert.ok(element, `${control} must be a real focusable element, not a div`)
    assert.doesNotMatch(
      element[0],
      /tabindex="-1"/,
      `${control} must remain in the tab order`,
    )
  }

  const fileInput = /<input[^>]*type="file"[^>]*>/.exec(markup)
  assert.ok(fileInput, 'choosing a file must be keyboard reachable')
  assert.doesNotMatch(fileInput[0], /tabindex="-1"/)
})

// @covers REQ-PHOTO-011@v1
test('keyboard focus is visible on every control', async () => {
  // A tile is an image with no text and .tile-open removes border and
  // background, so without this a keyboard user cannot tell where focus is.
  const css = stylesheet()

  const focus = /:focus-visible\s*\{[^}]*\}/.exec(css)
  assert.ok(focus, 'gallery.css must style :focus-visible')
  assert.doesNotMatch(focus[0], /outline:\s*(none|0)/, 'focus must not be removed')
  assert.match(focus[0], /outline:/, 'focus must be drawn')

  assert.doesNotMatch(
    css,
    /:focus\s*\{[^}]*outline:\s*(none|0)/,
    'no rule may strip the focus indicator',
  )
})
