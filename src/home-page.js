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

/**
 * A tile. The image is wrapped in a button so a focused tile opens on Enter
 * and Space without re-implementing either (REQ-PHOTO-009). The tile carries
 * no text, so REQ-PHOTO-002's "image alone" still holds.
 */
export const renderTile = (photo) => `
        <li class="tile" data-photo-id="${escapeHtml(photo.id)}">
          <button type="button" class="tile-open">
            <img src="${escapeHtml(photo.thumbnailUrl)}" alt="" />
          </button>
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
      <ul class="gallery-grid">${photos.map(renderTile).join('')}
      </ul>${more}`
}

const uploadModal = () => `
    <dialog class="upload-modal">
      <h2>Upload a photo</h2>
      <input type="file" class="upload-file" accept="image/jpeg,image/png" />
      <p class="chosen-file"></p>
      <p class="upload-message" role="status"></p>
      <button type="button" class="upload-submit">Upload</button>
      <button type="button" class="upload-close">Cancel</button>
    </dialog>`

/**
 * The larger view. Empty until a tile is activated — the script fills the
 * image from the Photo's Original.
 */
const largerView = () => `
    <dialog class="lightbox">
      <img class="lightbox-image" alt="" />
      <button type="button" class="lightbox-previous">Previous</button>
      <button type="button" class="lightbox-next">Next</button>
      <button type="button" class="lightbox-close">Close</button>
    </dialog>`

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
    </main>${uploadModal()}${largerView()}
    <script type="module" src="/upload-modal.js"></script>
    <script type="module" src="/lightbox.js"></script>
  </body>
</html>
`
