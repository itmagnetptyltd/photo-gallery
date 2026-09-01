import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = () => JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

/**
 * The dependency list the client approved, and what each entry is for.
 *
 * REQ-PHOTO-015 permits exactly three purposes — the web server, SQLite access
 * and image thumbnail generation (ANSWERS.md, question 26). This object is the
 * list, and this test is what enforces it: a new dependency fails here until
 * someone records its purpose, which forces the conversation rather than
 * allowing the list to drift.
 *
 * The web server is deliberately absent. Node's own `node:http` serves that
 * purpose, so no dependency is needed for it.
 */
const APPROVED = {
  'node-sqlite3-wasm': 'SQLite access',
  jimp: 'image thumbnail generation',
}

// @covers REQ-PHOTO-015@v1
test('every declared dependency serves a purpose the client approved', () => {
  const declared = Object.keys(packageJson().dependencies ?? {}).sort()

  assert.deepEqual(
    declared,
    Object.keys(APPROVED).sort(),
    'a dependency outside the approved list, or a missing one',
  )

  for (const [name, purpose] of Object.entries(APPROVED)) {
    assert.ok(
      ['the web server', 'SQLite access', 'image thumbnail generation'].includes(purpose),
      `${name} claims a purpose REQ-PHOTO-015 does not permit: ${purpose}`,
    )
  }
})

// @covers REQ-PHOTO-015@v1
test('no development dependency has crept in', () => {
  // REQ-PHOTO-015 speaks of runtime dependencies. The project has never
  // declared a development one, and this records that as deliberate.
  assert.deepEqual(Object.keys(packageJson().devDependencies ?? {}), [])
  assert.deepEqual(Object.keys(packageJson().optionalDependencies ?? {}), [])
})

// @covers REQ-PHOTO-015@v1
test('SQLite access is genuinely unavailable from the Node standard library', async () => {
  // The justification for node-sqlite3-wasm, proved rather than asserted:
  // node:sqlite arrived in Node 22.5 and this project's floor is Node 20.
  await assert.rejects(
    () => import('node:sqlite'),
    (error) => error.code === 'ERR_UNKNOWN_BUILTIN_MODULE',
    'if node:sqlite is available, this dependency is no longer justified',
  )

  const engines = packageJson().engines.node
  assert.match(engines, /20/, `the floor that justifies this is ${engines}`)
})

// @covers REQ-PHOTO-015@v1
test('image thumbnail generation is not available from the Node standard library', async () => {
  // WEAKER than the SQLite proof above: "not reasonably available" is a
  // judgement, and this can only show Node ships no image codec.
  const { builtinModules } = await import('node:module')

  for (const name of builtinModules) {
    assert.doesNotMatch(
      name,
      /^(image|jpeg|png|canvas|sharp)$/,
      `${name} may make the thumbnail dependency unnecessary`,
    )
  }
})
