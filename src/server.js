import { createServer as createHttpServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const HOME_PAGE = join(HERE, 'public', 'index.html')

/**
 * The gallery serves one person on one PC, so it binds to loopback only.
 * Reaching it from another machine is deliberately not possible.
 */
export const HOST = '127.0.0.1'
export const DEFAULT_PORT = 3000

/** Builds the application's HTTP server without binding it to a port. */
export const createServer = () =>
  createHttpServer(async (request, response) => {
    if (request.url !== '/') {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }

    const page = await readFile(HOME_PAGE)
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(page)
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
