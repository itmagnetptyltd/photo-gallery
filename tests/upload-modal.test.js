import { test } from 'node:test'
import assert from 'node:assert/strict'

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createServer } from '../src/server.js'
import { openStore } from '../src/store.js'
import { useStore, countPhotos } from '../src/photos.js'
import { MAX_UPLOAD_BYTES } from '../src/upload-rules.js'

const startOnEphemeralPort = async () => {
  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  return {
    origin: `http://127.0.0.1:${port}`,
    stop: () => new Promise((resolve) => server.close(resolve)),
  }
}

const withApp = async (run) => {
  const directory = mkdtempSync(join(tmpdir(), 'photo-modal-'))
  const store = openStore({ directory })
  useStore(store)

  const app = await startOnEphemeralPort()
  try {
    return await run(app)
  } finally {
    await app.stop()
    await store.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

const homePage = () => withApp(async (app) => (await fetch(app.origin + '/')).text())

const clientScript = () =>
  withApp(async (app) => (await fetch(app.origin + '/upload-modal.js')).text())

const jpegBytes = () => Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])

const postUpload = (app, { body, filename = 'photo.jpg', type = 'image/jpeg' }) =>
  fetch(app.origin + '/uploads', {
    method: 'POST',
    headers: { 'content-type': type, 'x-filename': filename },
    body,
  })

/* ------------------------------------------------------------------ *
 * Server behaviour — these prove what they claim.
 * ------------------------------------------------------------------ */

// @covers REQ-PHOTO-005@v1
test('server rejects a file bypassing the browser check, on content not name', async () => {
  await withApp(async (app) => {
    const before = countPhotos()
    const response = await postUpload(app, {
      body: Buffer.from('plain text pretending to be a png'),
      filename: 'fake.png',
      type: 'image/png',
    })

    assert.ok(
      response.status >= 400 && response.status < 500,
      `expected a 4xx, got ${response.status}`,
    )
    assert.equal(countPhotos(), before)
  })
})

// @covers REQ-PHOTO-005@v1
test('server rejects a body larger than 10 MB', async () => {
  await withApp(async (app) => {
    const before = countPhotos()
    const oversized = Buffer.concat([
      jpegBytes(),
      Buffer.alloc(MAX_UPLOAD_BYTES + 1 - jpegBytes().length),
    ])
    const response = await postUpload(app, { body: oversized })

    assert.ok(response.status >= 400 && response.status < 500)
    assert.equal(countPhotos(), before)
  })
})

// @covers REQ-PHOTO-005@v1
test('submitting with no file starts no Upload', async () => {
  await withApp(async (app) => {
    const before = countPhotos()
    const response = await postUpload(app, { body: Buffer.alloc(0) })

    assert.ok(response.status >= 400 && response.status < 500)
    assert.equal(countPhotos(), before)
  })
})

/* ------------------------------------------------------------------ *
 * Markup and script source. WEAKER: no browser is driven anywhere in
 * this repository, so these assert shape, not behaviour. Recorded and
 * accepted in the approved plan for this slice.
 * ------------------------------------------------------------------ */

// @covers REQ-PHOTO-003@v1
test('home page carries exactly one "+ Upload Photo" control', async () => {
  const markup = await homePage()

  const controls = [...markup.matchAll(/<button[^>]*>\s*\+ Upload Photo\s*<\/button>/g)]
  assert.equal(controls.length, 1)
})

// @covers REQ-PHOTO-003@v1
test('the control is present with no credentials and no sign-in step', async () => {
  await withApp(async (app) => {
    const response = await fetch(app.origin + '/')
    assert.equal(response.status, 200)

    const markup = await response.text()
    assert.match(markup, /\+ Upload Photo/)
    assert.doesNotMatch(markup, /type="password"/i)
    assert.doesNotMatch(markup, /\bsign[ -]?in\b/i)
  })
})

// @covers REQ-PHOTO-003@v1
test('the control is a real button, keyboard reachable', async () => {
  const markup = await homePage()

  const control = /<button[^>]*class="[^"]*upload-control[^"]*"[^>]*>/.exec(markup)
  assert.ok(control, 'the control must be a <button>, not a div with a handler')
  assert.doesNotMatch(control[0], /tabindex="-1"/)
})

// @covers REQ-PHOTO-004@v1
test('the modal is a dialog opened over the page with the grid behind it', async () => {
  const markup = await homePage()

  assert.match(markup, /<dialog[^>]*class="[^"]*upload-modal[^"]*"/)
  assert.doesNotMatch(
    markup,
    /<dialog[\s\S]*gallery-grid[\s\S]*<\/dialog>/,
    'the grid must sit behind the dialog, not inside it',
  )
  assert.match(await clientScript(), /\.showModal\(\)/)
})

// @covers REQ-PHOTO-004@v1
test('opening the modal navigates nowhere and reloads nothing', async () => {
  const markup = await homePage()
  const script = await clientScript()

  assert.match(markup, /<button[^>]*type="button"[^>]*class="[^"]*upload-control/)
  assert.doesNotMatch(script, /location\s*\.\s*(href|assign|replace)/)
  assert.doesNotMatch(script, /\.submit\(\)/)
})

// @covers REQ-PHOTO-004@v1
test('the modal cannot be dismissed while an Upload is in progress', async () => {
  const script = await clientScript()

  assert.match(script, /addEventListener\(\s*['"]cancel['"]/)
  assert.match(script, /preventDefault\(\)/)
})

// @covers REQ-PHOTO-004@v1
test('the modal uses only what current Chrome, Edge and Firefox all support', async () => {
  // MANUAL: no browser is run by any test here. This asserts only that the
  // implementation stays on the <dialog> baseline all three support.
  const script = await clientScript()

  assert.match(script, /\.showModal\(\)/)
  assert.doesNotMatch(script, /webkit[A-Z]/, 'no vendor-prefixed API')
  assert.doesNotMatch(script, /document\.all/)
})

// @covers REQ-PHOTO-004@v1
test('the file input and submit control are keyboard reachable', async () => {
  const markup = await homePage()

  const fileInput = /<input[^>]*type="file"[^>]*>/.exec(markup)
  assert.ok(fileInput, 'a real <input type="file"> must be present')
  assert.doesNotMatch(fileInput[0], /tabindex="-1"/)

  const submit = /<button[^>]*class="[^"]*upload-submit[^"]*"[^>]*>/.exec(markup)
  assert.ok(submit, 'a real submit <button> must be present')
  assert.doesNotMatch(submit[0], /tabindex="-1"/)
})

// @covers REQ-PHOTO-005@v1
test('the chosen file name is displayed in the modal', async () => {
  const markup = await homePage()
  const script = await clientScript()

  assert.match(markup, /class="[^"]*chosen-file[^"]*"/)
  assert.match(script, /chosen-file/)
  assert.match(script, /\.name\b/)
})

// @covers REQ-PHOTO-005@v1
test('the file chooser offers exactly one file', async () => {
  const markup = await homePage()

  const fileInput = /<input[^>]*type="file"[^>]*>/.exec(markup)[0]
  assert.match(fileInput, /accept="[^"]*image\/jpeg[^"]*"/)
  assert.match(fileInput, /accept="[^"]*image\/png[^"]*"/)
  assert.doesNotMatch(fileInput, /\bmultiple\b/)
})

// @covers REQ-PHOTO-005@v1
test('the browser rejects an unaccepted file before anything is sent', async () => {
  const script = await clientScript()

  assert.match(script, /validateChosenFile/)
  assert.match(
    script,
    /if\s*\(\s*!\s*\w+\.accepted\s*\)[\s\S]{0,200}return/,
    'the client must return before its send path when validation fails',
  )
})
