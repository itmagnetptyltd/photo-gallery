# ADR-0006 — Uploads are sent as a raw body, not `multipart/form-data`

- **Status:** accepted
- **Date:** 2026-09-01
- **Governs:** src/server.js, src/public/upload-modal.js

## Context

REQ-PHOTO-005 requires the server to reject what a bypassed browser check would
allow, so the server must read the uploaded bytes. ADR-0001 left the project
without a framework, and Node's standard library has no `multipart/form-data`
parser.

## Decision

The browser sends the file as the raw request body, with `content-type` carrying
the image type and an `x-filename` header carrying the name.

## Alternatives considered

**`multipart/form-data` with a parser dependency** such as `busboy` or
`formidable`. The conventional shape, and what an HTML form submission would
produce. Rejected because REQ-PHOTO-015 permits dependencies only for the web
server, SQLite access and thumbnail generation — a multipart parser is arguably
"the web server", but the argument is thin, and the client would have had to
approve a fourth purpose for one endpoint that carries one file.

**Hand-writing a multipart parser.** Rejected as more code and more risk than the
problem deserves, for a format built for a case this application does not have —
several fields in one submission.

## Consequences

- One file per request, which happens to match REQ-PHOTO-005 criterion 7
  exactly ("exactly one file can be selected").
- The endpoint cannot be driven by a plain HTML `<form>` — it requires
  JavaScript. Acceptable, because REQ-PHOTO-004 already requires a modal.
- The filename travels in a header, so it is subject to header encoding rules
  rather than multipart's. Non-ASCII filenames are untested.
- Slice 4 stored these bytes without change; if a future requirement needs
  several fields per upload, this decision is what will need reopening.
