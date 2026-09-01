import { Jimp } from 'jimp'

/**
 * The widest a Rendition may be. The Grid's tiles are 12rem at their narrowest
 * (see gallery.css), so this covers them without serving the Original.
 */
export const THUMBNAIL_EDGE = 200

/**
 * Builds a Rendition from an Original. Never enlarges: a Photo already smaller
 * than the edge is re-encoded at its own size rather than upscaled.
 */
export const makeThumbnail = async (bytes) => {
  const image = await Jimp.read(bytes)
  const width = Math.min(THUMBNAIL_EDGE, image.width)

  return image.resize({ w: width }).getBuffer('image/png')
}
