/**
 * Wiring for the upload modal. Deliberately thin: every rule lives in
 * upload-rules.js so the browser and the server cannot disagree.
 */
import { validateChosenFile } from '/upload-rules.js'

const modal = document.querySelector('.upload-modal')
const control = document.querySelector('.upload-control')
const fileInput = modal.querySelector('input[type="file"]')
const chosenFile = modal.querySelector('.chosen-file')
const message = modal.querySelector('.upload-message')
const submit = modal.querySelector('.upload-submit')
const close = modal.querySelector('.upload-close')

/** True while a request is in flight; the modal may not be dismissed then. */
let uploading = false

const reset = () => {
  fileInput.value = ''
  chosenFile.textContent = ''
  message.textContent = ''
}

control.addEventListener('click', () => {
  reset()
  modal.showModal()
})

close.addEventListener('click', () => {
  if (!uploading) modal.close()
})

// REQ-PHOTO-004: an Upload in progress may not be cancelled, and Escape or any
// other dismissal must leave the modal open until it completes or fails.
modal.addEventListener('cancel', (event) => {
  if (uploading) event.preventDefault()
})

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0]
  if (!file) {
    reset()
    return
  }

  chosenFile.textContent = file.name
  const check = validateChosenFile({ type: file.type, size: file.size })
  message.textContent = check.accepted ? '' : check.message
})

submit.addEventListener('click', async () => {
  const file = fileInput.files[0]
  if (!file) {
    message.textContent = 'Choose an image first.'
    return
  }

  const check = validateChosenFile({ type: file.type, size: file.size })
  if (!check.accepted) {
    message.textContent = check.message
    return
  }

  uploading = true
  submit.disabled = true
  try {
    const response = await fetch('/uploads', {
      method: 'POST',
      headers: { 'content-type': file.type, 'x-filename': file.name },
      body: file,
    })
    message.textContent = response.ok
      ? 'Accepted.'
      : 'That image could not be uploaded.'
  } catch {
    message.textContent = 'That image could not be uploaded.'
  } finally {
    uploading = false
    submit.disabled = false
  }
})
