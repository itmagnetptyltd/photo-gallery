# ADR-0003 — The home page is rendered on the server

- **Status:** accepted
- **Date:** 2026-09-01
- **Governs:** src/home-page.js, src/server.js, src/public/upload-modal.js, src/public/lightbox.js

## Context

Decided in slice 2, when the Grid was built and no client-side JavaScript existed
yet. REQ-PHOTO-001 requires the home page to present a tile per stored Photo,
newest first, with a bounded first render and an empty state — all of which the
server can do alone.

REQ-PHOTO-008, three slices later, requires a newly uploaded Photo to appear
"without the person reloading the page", which the server cannot do alone.

## Decision

The server renders the complete home page. Client-side JavaScript is added only
where a requirement demands behaviour the server cannot provide — the upload
modal, the live insert, and the larger view.

## Alternatives considered

**A JSON API with client-side rendering.** The page would fetch Photos and build
the Grid in the browser. Rejected in slice 2: it front-loads a client-side
rendering layer for a page that at that point had no interaction at all, and it
would have made the empty state and the bounded first render depend on JavaScript
running successfully.

The cost was known and accepted at the time: slice 5 would have to add a route
for the live insert rather than inherit one. That is what ADR-0007 records.

## Consequences

- The home page works with JavaScript disabled, apart from uploading and the
  larger view.
- Tile markup is produced in exactly one place, `renderTile`, which is what makes
  ADR-0007 possible.
- Every interactive requirement — REQ-PHOTO-003, 004, 005, 008, 009, 010 — needs
  its own client script, and **none of them can be verified by the test suite**,
  because REQ-PHOTO-015 permits no browser automation dependency. That is the
  single largest verification gap in the project and it follows from this
  decision meeting that constraint.
