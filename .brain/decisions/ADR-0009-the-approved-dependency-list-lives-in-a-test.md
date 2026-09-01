# ADR-0009 — The approved dependency list lives in a test, not in `.brain/`

- **Status:** accepted
- **Date:** 2026-09-01
- **Governs:** tests/dependencies.test.js, package.json

## Context

REQ-PHOTO-015 requires every declared dependency to serve one of three purposes
the client named: the web server, SQLite access, or image thumbnail generation
(ANSWERS.md, question 26). To check that, the approved list has to be written
down somewhere a check can read.

This project keeps agreements in `.brain/`. This one is not kept there.

## Decision

The list lives in `tests/dependencies.test.js` as an object mapping each
dependency to its approved purpose. The test asserts the declared set equals it
exactly.

## Alternatives considered

**A custom key in `package.json`.** Machine-readable and sitting next to the
dependencies themselves. Rejected because npm ignores it and nothing would
enforce it — it would be documentation that happens to live in a manifest.

**A record in `.brain/constraints/`.** The most consistent with how this project
keeps client agreements, and where someone would look for it. Rejected because
the test would then read from `.brain/`, coupling the test suite to the record
and making a brain edit able to turn a failing build green.

## Consequences

- The list is enforced on **every test run**, not reviewed occasionally. Adding a
  dependency fails the build until someone records its purpose, which forces the
  conversation rather than allowing quiet drift. This was demonstrated: adding
  `lodash` failed the suite, and it was reverted.
- Changing the approved list is a code change that appears in a diff a reviewer
  reads.
- **Someone looking for the client's dependency agreement in `.brain/` will not
  find it.** `/librarian` and `/client-report` read the record, not the tests.
  That is the cost of this decision and the reason it is recorded here.
- Only *declared* dependencies are audited. Two direct entries pull in 65
  transitively, and nothing checks those.
