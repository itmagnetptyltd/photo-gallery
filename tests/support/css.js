/**
 * Reading the stylesheet as text.
 *
 * CSS-LEVEL, like tests/responsive.test.js. REQ-PHOTO-015@v1 permits no browser
 * automation dependency, so nothing here renders a page. These helpers let a
 * test assert the declarations that produce the required behaviour; a
 * stylesheet that reads correctly and paints wrongly would still pass. Answer
 * 47 of Sep-01-2026 accepts exactly that trade.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

export const stylesheet = () =>
  readFileSync(join(ROOT, 'src', 'public', 'gallery.css'), 'utf8')

export const tokenSheet = () =>
  readFileSync(join(ROOT, '.brain', 'decisions', 'ADR-0001-design-token-sheet.md'), 'utf8')

/** The rule body for a selector, or null. */
export const ruleFor = (css, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`${escaped}\\s*\\{[^}]*\\}`).exec(css)?.[0] ?? null
}

/** The stylesheet with its :root block removed, so token declarations are not
 *  mistaken for uses of a raw value. */
export const withoutRoot = (css) => css.replace(/:root\s*\{[^}]*\}/g, '')

/** The value of a custom property declared in :root, or null. */
export const token = (css, name) => {
  const root = ruleFor(css, ':root') ?? ''
  return new RegExp(`--${name}\\s*:\\s*([^;]+);`).exec(root)?.[1].trim() ?? null
}

/** Every font-size declared outside :root, as { selectorish, value }. */
export const fontSizes = (css) =>
  [...withoutRoot(css).matchAll(/(?<![-\w])font-size\s*:\s*([^;}]+)/g)].map((m) => m[1].trim())

const SPACING_PROPERTY =
  /(?<![-\w])((?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left))?)\s*:\s*([^;}]+)/g

/** Every space declared outside :root, as { property, value }. */
export const spaces = (css) =>
  [...withoutRoot(css).matchAll(SPACING_PROPERTY)].map((m) => ({
    property: m[1],
    value: m[2].trim(),
  }))

/** Files under src/ whose extension matches, searched recursively. */
export const filesUnderSrc = (extensions) => {
  const found = []
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (extensions.some((extension) => entry.name.toLowerCase().endsWith(extension)))
        found.push(path)
    }
  }
  walk(join(ROOT, 'src'))
  return found
}
