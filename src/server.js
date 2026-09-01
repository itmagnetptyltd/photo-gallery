import { createServer as createHttpServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { listPhotos, countPhotos, PAGE_SIZE } from './photos.js'
import { renderHomePage } from './home-page.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const STYLESHEET = join(HERE, 'public', 'gallery.css')

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
