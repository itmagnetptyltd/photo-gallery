# ADR-0007 — `POST /uploads` answers with the rendered tile, as HTML

- **Status:** accepted
- **Date:** 2026-09-01
- **Governs:** src/server.js, src/home-page.js, src/public/upload-modal.js

## Context

REQ-PHOTO-008 requires a newly uploaded Photo to appear in the Grid without a
page reload. ADR-0003 put rendering on the server, so the browser has no way to
build a tile — and tile markup is a real thing, not a placeholder: a `<li>` with
a `data-photo-id`, a `<button>` for keyboard activation, and an `<img>` pointing
at the Rendition route.

Something has to produce that markup for the newly created Photo.

## Decision

`POST /uploads` answers `201` with `content-type: text/html` and the rendered
tile as its body. The client inserts it with `insertAdjacentHTML('afterbegin')`.
`renderTile` is exported from `home-page.js` and used by both the Grid and this
response.

## Alternatives considered

**Answer with JSON and build the tile in the browser.** The conventional API
shape. Rejected because tile markup would then exist in two places —
`home-page.js` and `upload-modal.js` — and the two would drift. ADR-0009's tile
button, added two slices later for REQ-PHOTO-009, would have had to be
implemented twice.

**Answer with JSON, then fetch the tile fragment separately.** Keeps one
renderer. Rejected for the extra round trip and the extra route, to no benefit.

## Consequences

- Tile markup has exactly one source. When slice 6 wrapped tile images in a
  button, the live-inserted tile got it for free.
- **The upload endpoint answers with a fragment rather than a representation of
  the resource it created.** Anyone reading it as a REST API will think it is
  wrong. It is not; it is a hypermedia response, and this record is the reason.
- Nothing else can consume the endpoint programmatically without parsing HTML.
  There is no other consumer, and no requirement anticipates one.
