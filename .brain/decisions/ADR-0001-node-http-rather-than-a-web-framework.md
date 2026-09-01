# ADR-0001 — The web server is `node:http`, not a framework

- **Status:** accepted
- **Date:** 2026-09-01
- **Governs:** src/server.js

## Context

REQ-PHOTO-015 permits a third-party dependency only where it "provides
functionality that is not reasonably available from the Node.js standard
library", and only for the web server, SQLite access or image thumbnail
generation. The client raised dependencies unprompted (ANSWERS.md, question 26),
which suggests they expect to read and maintain the result themselves.

Node ships `node:http`. A web server is therefore *available* from the standard
library, even though a framework would be more comfortable.

## Decision

Routing and request handling use `node:http` directly. No web-server dependency
is declared.

## Alternatives considered

**Express or Fastify.** Both would give routing, body parsing and middleware for
free, and both are what most Node projects reach for. Rejected because
REQ-PHOTO-015's first criterion asks whether the standard library already
provides the functionality, and here it does. Taking the dependency would have
required the client to approve it, and the application is a handful of routes.

## Consequences

- Every route is an explicit `if` on `url.pathname` in one handler. Readable at
  this size; it will not stay readable at thirty routes.
- No body parsing. This is what forced ADR-0006 (raw-body uploads rather than
  `multipart/form-data`), because Node has no multipart parser either.
- No middleware layer, so cross-cutting concerns — logging, rate limiting,
  compression — have nowhere to live but the handler itself.
- The dependency list stays at two entries, which is what makes REQ-PHOTO-015
  cheap to satisfy.
