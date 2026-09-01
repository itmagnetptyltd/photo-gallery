# ADR-0004 — SQLite comes from a WASM dependency, not from a newer Node

- **Status:** accepted
- **Date:** 2026-09-01
- **Governs:** package.json, src/store.js, tests/dependencies.test.js

## Context

The client asked for Photo metadata in SQLite (ANSWERS.md, question 24) and named
SQLite access as a permitted dependency purpose (question 26). Node ships
`node:sqlite` — but only from version 22.5.

This project's floor is Node 20, and `REQ-PHOTO-013` and `REQ-PHOTO-014` were
already `verified` against it, with `tests/boot.test.js` asserting the running
version satisfies `engines.node`.

## Decision

Declare `node-sqlite3-wasm` as a dependency and keep `engines.node` at
`>=20.0.0`. A WASM build rather than a native one, so no compiler is needed.

## Alternatives considered

**Raise `engines.node` to `>=22.5.0` and use the built-in.** Zero dependencies,
which serves "avoid unnecessary dependencies" best, and Node 22 is a current LTS
so the client's answer 27 would still be satisfied. Rejected because it changes
what two already-`verified` requirements mean — a version bump and a `CHG-`
record on REQ-PHOTO-013 and REQ-PHOTO-014 — and because the floor the client
agreed to is theirs to move, not ours.

**A native SQLite binding such as `better-sqlite3`.** Faster. Rejected because a
native build can require a toolchain, and REQ-PHOTO-014 criterion 2 requires the
application to start on a Windows PC where "nothing else has been prepared".

## Consequences

- Nothing already `verified` changed meaning. No `CHG-` record was needed.
- The application runs on Node 20 through at least Node 24 without a rebuild.
- **The justification is self-invalidating**: `tests/dependencies.test.js`
  imports `node:sqlite` and requires it to fail. Raise the floor past 22.5 and
  that test fails, saying this dependency is no longer justified. It cannot rot
  into a stale comment.
- WASM is slower than a native binding. Irrelevant for one person on one PC;
  it would not be for a shared service.
