/**
 * Builds a real PNG without a dependency, so tests exercise the store with
 * genuine image bytes rather than bytes the implementation produced itself.
 */
import { deflateSync } from 'node:zlib'
import { Jimp } from 'jimp'

/**
 * A JPEG, for REQ-PHOTO-002 criterion 3.
 *
 * Generated with `jimp` — the same library the thumbnail generator uses, so a
 * defect inside jimp could in principle mask itself here. Hand-writing a JPEG
 * encoder for a fixture is not proportionate; the weakness is named rather
 * than hidden.
 */
export const makeJpeg = async (edge = 128) =>
  new Jimp({ width: edge, height: edge, color: 0x3366ccff }).getBuffer('image/jpeg')

const crc32 = (buffer) => {
  let crc = ~0
  for (const byte of buffer) {
    crc ^= byte
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (~crc) >>> 0
}

const chunk = (type, data) => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)

  const typed = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typed))

  return Buffer.concat([length, typed, crc])
}

/** A square RGB PNG of the given edge length, filled with a repeating pattern. */
export const makePng = (edge = 64) => {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(edge, 0)
  header.writeUInt32BE(edge, 4)
  header[8] = 8 // bit depth
  header[9] = 2 // colour type: truecolour
  header[10] = 0 // deflate
  header[11] = 0 // adaptive filtering
  header[12] = 0 // no interlace

  const raw = Buffer.alloc(edge * (1 + edge * 3))
  let at = 0
  for (let y = 0; y < edge; y += 1) {
    raw[at] = 0 // filter type none
    at += 1
    for (let x = 0; x < edge; x += 1) {
      raw[at] = (x * 4) % 256
      raw[at + 1] = (y * 4) % 256
      raw[at + 2] = ((x + y) * 2) % 256
      at += 3
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}
