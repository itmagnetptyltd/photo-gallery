import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  MAX_UPLOAD_BYTES,
  validateChosenFile,
  sniffImageType,
} from '../src/upload-rules.js'

const jpegBytes = () => Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
const pngBytes = () =>
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

// @covers REQ-PHOTO-005@v1
test('rejects a file that is neither JPEG nor PNG, naming the accepted formats', () => {
  const result = validateChosenFile({
    name: 'notes.pdf',
    type: 'application/pdf',
    size: 1000,
  })

  assert.equal(result.accepted, false)
  assert.match(result.message, /JPEG/)
  assert.match(result.message, /PNG/)
})

// @covers REQ-PHOTO-005@v1
test('accepts a JPEG and accepts a PNG', () => {
  for (const type of ['image/jpeg', 'image/png']) {
    const result = validateChosenFile({ name: `photo.x`, type, size: 1000 })
    assert.equal(result.accepted, true, `${type} must be accepted`)
  }
})

// @covers REQ-PHOTO-005@v1
test('rejects a file larger than 10 MB and states the limit', () => {
  const tooBig = validateChosenFile({
    name: 'huge.jpg',
    type: 'image/jpeg',
    size: MAX_UPLOAD_BYTES + 1,
  })
  assert.equal(tooBig.accepted, false)
  assert.match(tooBig.message, /10\s?MB/i)

  const atLimit = validateChosenFile({
    name: 'exact.jpg',
    type: 'image/jpeg',
    size: MAX_UPLOAD_BYTES,
  })
  assert.equal(atLimit.accepted, true, 'the limit itself must not be rejected')
  assert.equal(MAX_UPLOAD_BYTES, 10 * 1024 * 1024)
})

// @covers REQ-PHOTO-005@v1
test('rejects a non-image whose name and type claim it is an image', () => {
  assert.equal(sniffImageType(Buffer.from('this is not an image at all')), null)
  assert.equal(sniffImageType(jpegBytes()), 'image/jpeg')
  assert.equal(sniffImageType(pngBytes()), 'image/png')
})
