/**
 * Renders the home page: the Grid when Photos are held, the empty state when
 * none are.
 *
 * The "+ Upload Photo" control is rendered inert. REQ-PHOTO-001's empty state
 * requires it to be present, but REQ-PHOTO-003 and REQ-PHOTO-004 own what it
 * does, and they arrive in slice 3.
 */

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const uploadControl = () =>
  '<button type="button" class="upload-control">+ Upload Photo</button>'

const tile = (photo) => `
        <li class="tile" data-photo-id="${escapeHtml(photo.id)}">
          <img src="${escapeHtml(photo.imageUrl)}" alt="" />
        </li>`

const emptyState = () => `
      <p class="empty-state">Nothing here yet. Add your first photo.</p>
      ${uploadControl()}`

const grid = (photos, { total, offset, pageSize }) => {
  const next = offset + pageSize
  const more =
    next < total
      ? `\n      <a class="more" href="/?offset=${next}">Show more photos</a>`
      : ''

  return `
      ${uploadControl()}
      <ul class="gallery-grid">${photos.map(tile).join('')}
      </ul>${more}`
}

/** The complete home page document. */
export const renderHomePage = ({ photos, total, offset, pageSize }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Photo Gallery</title>
    <link rel="stylesheet" href="/gallery.css" />
  </head>
  <body>
    <h1>Photo Gallery</h1>
    <main>${photos.length === 0 ? emptyState() : grid(photos, { total, offset, pageSize })}
    </main>
  </body>
</html>
`
