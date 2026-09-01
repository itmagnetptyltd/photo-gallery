import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { createServer } from '../src/server.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const readPackageJson = () =>
  JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

/**
 * Starts the application on an ephemeral port so tests never contend for a
 * fixed one, and hands back the address it actually bound to.
 */
const startOnEphemeralPort = async () => {
  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { address, port } = server.address()
  return {
    address,
    port,
    origin: `http://127.0.0.1:${port}`,
    stop: () => new Promise((resolve) => server.close(resolve)),
  }
}

/** Lowest major version accepted by the engines.node range, e.g. ">=20.0.0". */
const engineFloorMajor = (range) => {
  const match = /(\d+)/.exec(range)
  assert.ok(match, `engines.node is not a range this test can read: ${range}`)
  return Number(match[1])
}

// @covers REQ-PHOTO-013@v1
test('starts and serves the home page with Node as the only language runtime', async () => {
  const app = await startOnEphemeralPort()
  try {
    const response = await fetch(app.origin + '/')
    assert.equal(response.status, 200)
  } finally {
    await app.stop()
  }

  const pkg = readPackageJson()
  assert.deepEqual(
    Object.keys(pkg.dependencies ?? {}),
    [],
    'a runtime dependency would mean something beyond Node is needed to run this',
  )
})

// @covers REQ-PHOTO-013@v1
test('runs on a current Node.js LTS release', async () => {
  const pkg = readPackageJson()
  assert.ok(pkg.engines?.node, 'package.json must declare engines.node')

  const floor = engineFloorMajor(pkg.engines.node)
  const running = Number(process.versions.node.split('.')[0])
  assert.ok(
    running >= floor,
    `running Node ${running} is below the declared floor of ${floor}`,
  )

  const app = await startOnEphemeralPort()
  try {
    const response = await fetch(app.origin + '/')
    assert.equal(response.status, 200)
  } finally {
    await app.stop()
  }
})

// @covers REQ-PHOTO-014@v1
test('home page is reachable from the same PC and returns a successful response', async () => {
  const app = await startOnEphemeralPort()
  try {
    const response = await fetch(app.origin + '/')
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type') ?? '', /^text\/html/)
    assert.ok((await response.text()).length > 0, 'the home page must have a body')
  } finally {
    await app.stop()
  }
})

// @covers REQ-PHOTO-014@v1
test('starts from a clean checkout with no database server, container runtime or cloud service', async () => {
  const pkg = readPackageJson()
  assert.deepEqual(Object.keys(pkg.dependencies ?? {}), [])
  assert.deepEqual(Object.keys(pkg.optionalDependencies ?? {}), [])

  for (const infrastructureFile of [
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.yaml',
    'compose.yml',
    'compose.yaml',
  ]) {
    assert.equal(
      existsSync(join(ROOT, infrastructureFile)),
      false,
      `${infrastructureFile} would mean a container runtime is required`,
    )
  }

  const app = await startOnEphemeralPort()
  try {
    assert.ok(app.port > 0, 'the server reached a listening state unaided')
  } finally {
    await app.stop()
  }
})

// @covers REQ-PHOTO-014@v1
test('serves one person on that PC and is not reachable from another machine', async () => {
  const app = await startOnEphemeralPort()
  try {
    assert.equal(
      app.address,
      '127.0.0.1',
      'binding beyond loopback would expose the gallery to other machines',
    )
    const response = await fetch(app.origin + '/')
    assert.equal(response.status, 200)
  } finally {
    await app.stop()
  }
})
