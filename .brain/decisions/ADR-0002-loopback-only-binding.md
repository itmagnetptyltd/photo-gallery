# ADR-0002 — The server binds to loopback only

- **Status:** accepted
- **Date:** 2026-09-01
- **Governs:** src/server.js, README.md

## Context

Asked whether the application serves one person or several, the client answered
that it "is intended for use on one local development PC by one person" and that
"multi-user concurrent access is out of scope" (ANSWERS.md, question 3).

REQ-PHOTO-014's third criterion turns that into a requirement: the application
serves one person on that PC, and no capability for several people at once is
required.

## Decision

`server.listen(port, '127.0.0.1')`. The application is not reachable from any
other machine.

## Alternatives considered

**Binding `0.0.0.0`.** The usual default, and it would let the client view the
gallery from a phone on the same network. Rejected because it makes
REQ-PHOTO-014 criterion 3 unfalsifiable — a server reachable from another
machine cannot be said to serve one person on one PC — and because there is no
authentication (ANSWERS.md, question 2), so binding wider would expose every
Photo to everyone on the network.

## Consequences

- The gallery **cannot be viewed from a phone, tablet or another computer.** If
  the client ever wants that, this decision is what blocks it, and it should be
  reopened together with question 2, not quietly changed.
- No authentication is needed, because nothing outside the machine can reach it.
- A test can assert the bound address, which is what makes REQ-PHOTO-014
  criterion 3 checkable at all.
