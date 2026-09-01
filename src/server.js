import { createServer as createHttpServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { listPhotos, countPhotos, getStore, PAGE_SIZE } from './photos.js'
import { renderHomePage, renderTile } from './home-page.js'
import { MAX_UPLOAD_BYTES, sniffImageType } from './upload-rules.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const STYLESHEET = join(HERE, 'public', 'gallery.css')

/** Files the browser loads directly. Nothing else under src/ is reachable. */
const SCRIPTS = {
  '/upload-modal.js': join(HERE, 'public', 'upload-modal.js'),
  '/upload-rules.js': join(HERE, 'upload-rules.js'),
}

/**
 * The gallery serves one person on one PC, so it binds to loopback only.
 * Reaching it from another machine is deliberately not possible.
 */
export const HOST = '127.0.0.1'
export const DEFAULT_PORT = 3000

const parseOffset = (value) => {
  const offset = Number.parseInt(value ?? '0', 10)
  return Number.isFinite(offset) && offset > 0 ? offset : 0
}

const sendHomePage = (url, response) => {
  const offset = parseOffset(url.searchParams.get('offset'))
  const page = renderHomePage({
    photos: listPhotos({ limit: PAGE_SIZE, offset }),
    total: countPhotos(),
    offset,
    pageSize: PAGE_SIZE,
  })

  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  response.end(page)
}

const sendStylesheet = async (response) => {
  const css = await readFile(STYLESHEET)
  response.writeHead(200, { 'content-type': 'text/css; charset=utf-8' })
  response.end(css)
}

const sendScript = async (path, response) => {
  const script = await readFile(path)
  response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' })
  response.end(script)
}

/** Collects the request body, refusing to hold more than the agreed limit. */
const readBody = (request) =>
  new Promise((resolve, reject) => {
    const chunks = []
    let received = 0
    let tooLarge = false

    request.on('data', (chunk) => {
      received += chunk.length
      if (received > MAX_UPLOAD_BYTES) tooLarge = true
      else chunks.push(chunk)
    })
    request.on('end', () => resolve({ bytes: Buffer.concat(chunks), tooLarge }))
    request.on('error', reject)
  })

const refuse = (response, status, reason) => {
  response.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  response.end(reason)
}

/**
 * Accepts an Upload and stores it. The server re-validates by content because
 * REQ-PHOTO-005 requires rejection of what a bypassed browser check would let
 * through, and REQ-PHOTO-006 makes what survives a Photo.
 */
const receiveUpload = async (request, response) => {
  const { bytes, tooLarge } = await readBody(request)

  if (tooLarge) return refuse(response, 413, 'That image is over the 10 MB limit.')
  if (bytes.length === 0) return refuse(response, 400, 'No image was sent.')
  if (sniffImageType(bytes) === null) {
    return refuse(response, 415, 'That file is not a JPEG or PNG image.')
  }

  let photo
  try {
    photo = await getStore().savePhoto({
      bytes,
      filename: request.headers['x-filename'] ?? 'photo',
      type: sniffImageType(bytes),
    })
  } catch {
    return refuse(response, 500, 'That image could not be stored.')
  }

  // The new Photo's tile, rendered by the same function the Grid uses, so tile
  // markup never exists in two places. The page inserts this without reloading
  // (REQ-PHOTO-008).
  response.writeHead(201, { 'content-type': 'text/html; charset=utf-8' })
  response.end(renderTile(photo))
}

/** Serves a Photo's Rendition. The Original is REQ-PHOTO-009's business. */
const sendThumbnail = async (id, response) => {
  let bytes
  try {
    bytes = await getStore().readThumbnail(id)
  } catch {
    return refuse(response, 404, 'No such photo.')
  }

  response.writeHead(200, { 'content-type': 'image/png' })
  response.end(bytes)
}

/** Builds the application's HTTP server without binding it to a port. */
export const createServer = () =>
  createHttpServer(async (request, response) => {
    const url = new URL(request.url, `http://${HOST}`)

    if (url.pathname === '/') {
      sendHomePage(url, response)
      return
    }

    if (url.pathname === '/gallery.css') {
      await sendStylesheet(response)
      return
    }

    if (SCRIPTS[url.pathname]) {
      await sendScript(SCRIPTS[url.pathname], response)
      return
    }

    if (url.pathname === '/uploads' && request.method === 'POST') {
      await receiveUpload(request, response)
      return
    }

    const thumbnail = /^\/photos\/([^/]+)\/thumbnail$/.exec(url.pathname)
    if (thumbnail) {
      await sendThumbnail(decodeURIComponent(thumbnail[1]), response)
      return
    }

    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  })

/** Starts the application on the loopback interface. */
export const start = (port = Number(process.env.PORT) || DEFAULT_PORT) => {
  const server = createServer()
  server.listen(port, HOST, () => {
    console.log(`Photo Gallery is running at http://${HOST}:${port}`)
  })
  return server
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start()
}
