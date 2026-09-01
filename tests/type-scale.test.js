import { test } from 'node:test'
import assert from 'node:assert/strict'

import { renderHomePage } from '../src/home-page.js'
import {
  stylesheet,
  tokenSheet,
  ruleFor,
  token,
  fontSizes,
  filesUnderSrc,
} from './support/css.js'

/*
 * CSS-LEVEL throughout, for the reason recorded at the head of
 * tests/support/css.js. These tests assert that the stylesheet names no text
 * size outside the scale. They cannot assert what a browser paints.
 */

const STEPS = [
  'text-app-bar-title',
  'text-heading',
  'text-body',
  'text-small',
  'text-caption',
]

// @covers REQ-PHOTO-017@v1
test('every text size in the stylesheet comes from the type scale', () => {
  const css = stylesheet()

  const sizes = fontSizes(css)
  assert.ok(sizes.length > 0, 'the stylesheet must size text somewhere')

  for (const value of sizes) {
    assert.match(
      value,
      /^var\(--text-[a-z-]+\)$/,
      `font-size "${value}" is not a step of the type scale`,
    )
  }
})

// @covers REQ-PHOTO-017@v1
test('the same kind of text element is sized at the same step on every view', () => {
  const css = stylesheet()

  const appBarTitle = ruleFor(css, '.app-bar h1')
  assert.ok(appBarTitle, 'gallery.css must size the app bar title')
  assert.match(appBarTitle, /font-size:\s*var\(--text-app-bar-title\)/)

  const modalHeading = ruleFor(css, '.upload-modal h2')
  assert.ok(modalHeading, 'gallery.css must size the upload modal heading')
  assert.match(
    modalHeading,
    /font-size:\s*var\(--text-heading\)/,
    'a heading on any view is sized at the heading step',
  )
})

// @covers REQ-PHOTO-017@v1
test('the type scale is readable in one place in the stylesheet', () => {
  const css = stylesheet()

  for (const step of STEPS) {
    assert.ok(token(css, step), `:root must declare --${step}`)
  }
})

// @covers REQ-PHOTO-017@v1
test('the token sheet names the five steps of the type scale', () => {
  const sheet = tokenSheet()

  for (const step of STEPS) {
    assert.ok(sheet.includes(`--${step}`), `ADR-0001 must name --${step}`)
  }

  for (const name of ['app bar title', 'section heading', 'body', 'small', 'caption']) {
    assert.ok(
      sheet.toLowerCase().includes(name),
      `ADR-0001 must name the "${name}" step in words a person can read`,
    )
  }
})

// @covers REQ-PHOTO-017@v1
test('text is set in a system font stack and no font file ships', () => {
  const css = stylesheet()

  const stack = token(css, 'font-stack')
  assert.ok(stack, ':root must declare --font-stack')
  assert.match(stack, /^system-ui\b/, 'the stack must start with the system typeface')

  const body = ruleFor(css, 'body')
  assert.match(body, /font-family:\s*var\(--font-stack\)/)

  const fontFiles = filesUnderSrc(['.woff', '.woff2', '.ttf', '.otf', '.eot'])
  assert.deepEqual(fontFiles, [], 'no font file may ship with the application')
})

// @covers REQ-PHOTO-017@v1
test('opening the page downloads no font file', () => {
  const css = stylesheet()

  assert.doesNotMatch(css, /@font-face/, 'a @font-face rule would fetch a font')
  assert.doesNotMatch(css, /@import/, 'an @import could fetch a font stylesheet')
  assert.doesNotMatch(css, /url\(/, 'the stylesheet must request no external file')

  const markup = renderHomePage({ photos: [], total: 0, offset: 0, pageSize: 24 })
  const stylesheets = [...markup.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g)].map((m) => m[0])

  assert.equal(stylesheets.length, 1, 'the page links exactly one stylesheet')
  assert.match(stylesheets[0], /href="\/gallery\.css"/)
  assert.doesNotMatch(markup, /fonts\.(googleapis|gstatic)\.com/)
})
