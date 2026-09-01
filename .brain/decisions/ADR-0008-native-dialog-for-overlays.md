# ADR-0008 — Overlays are native `<dialog>` elements

- **Status:** accepted
- **Date:** 2026-09-01
- **Governs:** src/home-page.js, src/public/upload-modal.js, src/public/lightbox.js, src/public/gallery.css

## Context

Two requirements ask for something drawn in front of the page: REQ-PHOTO-004 (the
upload modal, over the Grid, without navigating) and REQ-PHOTO-009 (the larger
view, as an overlay, address unchanged). REQ-PHOTO-010 additionally requires
Escape to close the larger view.

The client named current Chrome, Edge and Firefox on desktop (ANSWERS.md,
question 21). `<dialog>` and `showModal()` are supported in all three.

## Decision

Both overlays are `<dialog>` elements opened with `showModal()`.

## Alternatives considered

**A hand-built overlay** — a positioned `<div>`, a backdrop, a focus trap, an
Escape key handler and `aria-modal`. Rejected because every one of those is a
thing to get wrong, and the platform already does them. In particular
REQ-PHOTO-010 criterion 3 (Escape closes the larger view) is satisfied by
`<dialog>` itself rather than by a key handler that could be missed — and given
that no browser runs in this project's tests, a criterion met by the platform is
worth more than one met by untested code.

## Consequences

- REQ-PHOTO-010 criterion 3 needs no implementation, only a decision not to
  block the `cancel` event.
- REQ-PHOTO-004 criterion 3 — the modal cannot be dismissed mid-Upload — is
  implemented by preventing `cancel`, which is the same platform hook seen from
  the other side.
- Backdrop, stacking and focus containment come from the browser.
- **Two dialogs now exist on the page and nothing prevents both being open at
  once.** No requirement names it; a person cannot currently reach that state,
  because the Grid is behind the upload modal.
- The application will not work in a browser without `<dialog>`. That is inside
  what the client agreed.
