/**
 * What may be uploaded.
 *
 * Imported by both the browser and the server, so REQ-PHOTO-005's browser-side
 * check and its server-side check enforce one rule rather than two that can
 * drift apart.
 */

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

/** The client agreed 10 MB per Photo on Sep-01-2026 (ANSWERS.md, question 5). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const MEGABYTES = MAX_UPLOAD_BYTES / (1024 * 1024)

/** The leading bytes that identify a format, whatever the file is called. */
const SIGNATURES = [
  { type: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { type: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
]

const startsWith = (buffer, bytes) =>
  buffer.length >= bytes.length && bytes.every((b, i) => buffer[i] === b)

/**
 * What the browser can check before sending anything: the type the file system
 * reported, and its size.
 */
export const validateChosenFile = ({ type, size }) => {
  if (!ACCEPTED_TYPES.includes(type)) {
    return { accepted: false, message: 'Choose a JPEG or PNG image.' }
  }

  if (size > MAX_UPLOAD_BYTES) {
    return { accepted: false, message: `Choose an image under ${MEGABYTES} MB.` }
  }

  return { accepted: true, message: '' }
}

/**
 * What only the server can check: the bytes themselves. A file named .png and
 * declared image/png is still not a PNG if it does not begin like one.
 */
export const sniffImageType = (bytes) => {
  const found = SIGNATURES.find((signature) => startsWith(bytes, signature.bytes))
  return found ? found.type : null
}
