import { test } from 'node:test'
import assert from 'node:assert/strict'

import { stylesheet, tokenSheet, ruleFor, token, spaces } from './support/css.js'

/*
 * CSS-LEVEL throughout, for the reason recorded at the head of
 * tests/support/css.js.
 *
 * "Every space" is read as every space this stylesheet SETS. A margin a user
 * agent supplies by default is not drawn from the scale and cannot be, without
 * a reset this slice was not asked for. Recorded in the slice-8 plan.
 */

const STEPS = ['space-1', 'space-2', 'space-3', 'space-4', 'space-6', 'space-8']

const BASE_UNIT_REM = 0.25

/** A space is on the scale if every length in it is a --space-* token. 0 and
 *  auto carry no size, so neither can put a value outside the scale. */
const isOnTheScale = (value) =>
  value
    .split(/\s+/)
    .every((part) => /^var\(--space-\d+\)$/.test(part) || part === '0' || part === 'auto')

// @covers REQ-PHOTO-018@v1
test('every space in the stylesheet comes from the spacing scale', () => {
  const css = stylesheet()

  const declared = spaces(css)
  assert.ok(declared.length > 0, 'the stylesheet must set spacing somewhere')

  for (const { property, value } of declared) {
    assert.ok(
      isOnTheScale(value),
      `${property}: ${value} is not drawn from the spacing scale`,
    )
  }
})

// @covers REQ-PHOTO-018@v1
test('the spacing scale is readable in one place in the stylesheet', () => {
  const css = stylesheet()

  for (const step of STEPS) {
    assert.ok(token(css, step), `:root must declare --${step}`)
  }
})

// @covers REQ-PHOTO-018@v1
test('the space between adjacent tiles is uniform across the grid', () => {
  const css = stylesheet()

  const grid = ruleFor(css, '.gallery-grid')
  assert.ok(grid, 'gallery.css must style .gallery-grid')
  assert.match(grid, /gap:\s*var\(--space-\d+\)/, 'one gap token governs every gutter')

  const tile = ruleFor(css, '.tile')
  assert.ok(tile)
  assert.doesNotMatch(tile, /margin/, 'a per-tile margin would make spacing uneven')
})

// @covers REQ-PHOTO-018@v1
test('the token sheet states one base unit and fixed multiples of it', () => {
  const css = stylesheet()
  const sheet = tokenSheet()

  assert.ok(sheet.includes('0.25rem'), 'ADR-0001 must state the base unit')
  for (const step of STEPS) {
    assert.ok(sheet.includes(`--${step}`), `ADR-0001 must name --${step}`)
  }

  // Every step is a whole multiple of the base, or it is not a scale.
  for (const step of STEPS) {
    const value = token(css, step)
    const rem = Number.parseFloat(value)
    assert.match(value, /rem$/, `--${step} must be expressed in rem`)

    const multiple = rem / BASE_UNIT_REM
    assert.equal(
      multiple,
      Math.round(multiple),
      `--${step} (${value}) is not a whole multiple of the ${BASE_UNIT_REM}rem base unit`,
    )
  }
})

// @covers REQ-PHOTO-018@v1
test('the grid gap keeps its delivered value as a step of the scale', () => {
  const css = stylesheet()

  // Answer 49: the Grid's existing gap keeps its current value and the scale is
  // built around it. This test fails if anyone retunes the scale and moves it.
  const grid = ruleFor(css, '.gallery-grid')
  const gapToken = /gap:\s*var\(--(space-\d+)\)/.exec(grid)?.[1]
  assert.ok(gapToken, '.gallery-grid must take its gap from the scale')

  assert.equal(
    token(css, gapToken),
    '1rem',
    'the gap between tiles must stay at the 1rem it shipped with',
  )
})
