import { test } from 'node:test'
import assert from 'node:assert/strict'

import { renderHomePage } from '../src/home-page.js'
import { stylesheet, ruleFor } from './support/css.js'

const aPhoto = (id) => ({ id, thumbnailUrl: `/thumbnails/${id}` })

const pageWithPhotos = () =>
  renderHomePage({ photos: [aPhoto('a'), aPhoto('b')], total: 2, offset: 0, pageSize: 24 })

const pageWithNoPhoto = () =>
  renderHomePage({ photos: [], total: 0, offset: 0, pageSize: 24 })

/** The app bar element and its inner markup, or null. */
const appBar = (markup) =>
  /<header[^>]*class="[^"]*app-bar[^"]*"[^>]*>([\s\S]*?)<\/header>/.exec(markup)

// @covers REQ-PHOTO-019@v1
test('the home page presents an app bar containing the product name', () => {
  const bar = appBar(pageWithPhotos())

  assert.ok(bar, 'the home page must present an app bar region')
  assert.match(bar[1], /Photo Gallery/, 'the app bar must carry the product name as text')
})

// @covers REQ-PHOTO-019@v1
test('the app bar overlaps neither the grid nor the upload control', () => {
  const markup = pageWithPhotos()
  const css = stylesheet()

  // In normal flow before <main>, nothing can be overlapped.
  assert.ok(
    markup.indexOf('<header') < markup.indexOf('<main'),
    'the app bar must precede the main content',
  )

  const rule = ruleFor(css, '.app-bar')
  assert.ok(rule, 'gallery.css must style .app-bar')
  assert.doesNotMatch(rule, /position:\s*(absolute|fixed|sticky)/, 'it must stay in flow')
  assert.doesNotMatch(rule, /margin[^:]*:\s*-/, 'it must not be pulled over its neighbours')
})

// @covers REQ-PHOTO-019@v1
test('the app bar is present with the same name when no photo is held', () => {
  const withPhotos = appBar(pageWithPhotos())
  const empty = appBar(pageWithNoPhoto())

  assert.ok(empty, 'the app bar must be present on the empty home page')
  assert.equal(
    empty[1].trim(),
    withPhotos[1].trim(),
    'the app bar reads the same whether or not Photos are held',
  )
})

// @covers REQ-PHOTO-019@v1
test('the app bar reads Photo Gallery', () => {
  const bar = appBar(pageWithPhotos())

  const text = bar[1].replace(/<[^>]*>/g, '').trim()
  assert.equal(text, 'Photo Gallery')
})

// @covers REQ-PHOTO-019@v1
test('the app bar scrolls away with the content rather than being fixed', () => {
  const css = stylesheet()

  // Answer 34: not fixed, so no strip of the viewport is permanently taken
  // from the Grid and REQ-PHOTO-011@v1 is unaffected.
  const rule = ruleFor(css, '.app-bar')
  assert.doesNotMatch(rule, /position:\s*(fixed|sticky)/)
})

// @covers REQ-PHOTO-019@v1
test('the app bar carries the product name and nothing else', () => {
  const markup = pageWithPhotos()
  const bar = appBar(markup)

  // Answer 35: the "+ Upload Photo" control does not move into the app bar.
  assert.doesNotMatch(bar[1], /<(button|a|input|form)\b/, 'the app bar carries no control')

  const main = /<main[\s\S]*<\/main>/.exec(markup)
  assert.ok(main, 'the page must have a main region')
  assert.match(main[0], /class="upload-control"/, 'the upload control stays above the Grid')
  assert.ok(
    main[0].indexOf('upload-control') < main[0].indexOf('gallery-grid'),
    'the upload control precedes the Grid',
  )
})

// @covers REQ-PHOTO-019@v1
test('the larger view covers the app bar when a photo is open', () => {
  const markup = pageWithPhotos()
  const css = stylesheet()

  // Answer 36: the overlay covers the app bar and the Photo has the whole
  // viewport. A <dialog> opened with showModal() renders in the top layer,
  // above every element in the document regardless of stacking context.
  assert.match(markup, /<dialog[^>]*class="[^"]*lightbox/, 'the Larger view must be a dialog')

  const rule = ruleFor(css, '.app-bar')
  assert.doesNotMatch(rule, /z-index/, 'no z-index may lift the app bar over the overlay')
})

// @covers REQ-PHOTO-019@v1
test('the app bar is the token sheet surface on the page ground', () => {
  const css = stylesheet()

  const rule = ruleFor(css, '.app-bar')
  assert.match(rule, /background:\s*var\(--color-surface\)/, 'the app bar is a white surface')

  const body = ruleFor(css, 'body')
  assert.match(body, /background:\s*var\(--color-page\)/, 'the page ground is near-white')
})
