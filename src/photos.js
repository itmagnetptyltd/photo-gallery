/**
 * The Photos the Gallery holds.
 *
 * The backing here is in memory and seeded by tests, because the Upload arrives
 * in slice 3 and the store in slice 4. Slice 4 replaces what is behind
 * `listPhotos` and `countPhotos` without changing either signature.
 */

/** How many tiles the first render may contain. */
export const PAGE_SIZE = 24

let photos = []

/** Replaces the held Photos. Test seam until the store exists. */
export const seedPhotos = (next) => {
  photos = [...next]
}

const newestUploadFirst = (a, b) =>
  new Date(b.uploadedAt) - new Date(a.uploadedAt)

/** Photos newest Upload first, bounded to one page. */
export const listPhotos = ({ limit = PAGE_SIZE, offset = 0 } = {}) =>
  [...photos].sort(newestUploadFirst).slice(offset, offset + limit)

/** How many Photos are held in total. */
export const countPhotos = () => photos.length
