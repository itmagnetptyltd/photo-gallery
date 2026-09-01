# ADR-0005 — Files are written first; the metadata row is the commit point

- **Status:** accepted
- **Date:** 2026-09-01
- **Governs:** src/store.js

## Context

REQ-PHOTO-006 criterion 6 and REQ-PHOTO-007 criterion 4 both require that a
failed Upload leave **no Photo record and no partial file**. The client also
asked for files on disk with metadata in SQLite (ANSWERS.md, question 24), so a
Photo is two things that can fail independently — bytes and a row — with no
transaction spanning both.

Something has to be the point at which a Photo becomes real.

## Decision

The Original is written to a temporary file in the same directory, `fsync`ed and
renamed into place; the thumbnail Rendition follows the same path; the metadata
row is inserted **last**. Any failure before the insert unlinks whatever was
written.

## Alternatives considered

**Insert the row first, then write the files.** Simpler to reason about while
writing. Rejected because a crash between the two leaves a row whose files do not
exist — a Photo that appears in the Grid and 404s when its tile loads. That is
visible corruption.

**Store the image bytes in SQLite as a blob**, making the whole save one
transaction and the problem disappear. Rejected because the client explicitly
described files on disk with metadata in SQLite, and that is a description of the
delivered system, not an implementation hint we may reinterpret.

## Consequences

- **A crash can leave a file with no row.** That file is invisible to the
  application and can be collected later. It is the failure mode we chose.
- **A row with no file can never exist.** That is the failure mode we refused.
- `savePhoto` takes an injectable failure hook, which is how REQ-PHOTO-006
  criterion 6 and REQ-PHOTO-007 criterion 4 are tested without filling a disk.
- **The guarantee holds only while the temporary and final paths share a
  filesystem**, because `rename` is atomic only within one. Moving temporary
  files to a system temp directory would silently weaken it while every test
  continued to pass. This is recorded as a constraint, not only here.
- Nothing reclaims orphaned files. No requirement asks for it; if the gallery
  ever runs long enough for that to matter, it is new scope.
