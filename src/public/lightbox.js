/**
 * The larger view: one Photo's Original as an overlay over the Grid.
 *
 * Navigation moves over the tiles the Grid currently holds — at most one page
 * of them — and stops at either end. The record licenses no wrapping and no
 * fetching beyond the page.
 */

const dialog = document.querySelector('.lightbox')
const image = dialog.querySelector('.lightbox-image')
const previous = dialog.querySelector('.lightbox-previous')
const next = dialog.querySelector('.lightbox-next')
const close = dialog.querySelector('.lightbox-close')

/** The Photo ids on show, in Grid order, and where we are among them. */
let order = []
let at = 0

const photoIdsOnShow = () =>
  [...document.querySelectorAll('main [data-photo-id]')].map(
    (element) => element.dataset.photoId,
  )

const show = (index) => {
  at = Math.min(Math.max(index, 0), order.length - 1)
  image.src = `/photos/${order[at]}/original`
  previous.disabled = at === 0
  next.disabled = at === order.length - 1
}

// Delegated deliberately. Tiles are inserted after load by the upload flow, and
// the Grid itself may not exist when this runs, so binding per tile would leave
// newly uploaded Photos unopenable.
document.querySelector('main').addEventListener('click', (event) => {
  const tile = event.target.closest('[data-photo-id]')
  if (!tile) return

  order = photoIdsOnShow()
  show(order.indexOf(tile.dataset.photoId))
  dialog.showModal()
})

previous.addEventListener('click', () => show(at - 1))
next.addEventListener('click', () => show(at + 1))
close.addEventListener('click', () => dialog.close())
