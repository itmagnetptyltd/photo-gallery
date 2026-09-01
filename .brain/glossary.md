# Glossary

Terms are **fixed** on this project. Use these words, spelled this way, and no
synonyms — in requirements, in code, in tests, in conversation with the client.

A term used in a requirement but not defined here is an **ambiguity**, not a
decision anyone may make on the client's behalf. Record it and ask.

---

## Why this file exists

A client described one thing three ways in a single meeting:

> "When a **job** comes in we assign it to a crew."
> "Each **engagement** has a start date and a purchase order."
> "The customer can cancel a **booking** up to 24 hours before."

Three words. The team built:

- a `Job` table for scheduling,
- an `Engagement` record for billing, because it "obviously" carried the PO,
- a `Booking` API for the customer-facing app.

They were the same entity. It was discovered in UAT, when cancelling a booking
left the job scheduled and the engagement billable. The fix touched three
schemas, two APIs and a migration — about three weeks — and none of it was
visible as a defect until real users produced all three views of one record.

**The cost was not the rework. It was that nobody could see it coming**, because
each team was individually consistent and the disagreement lived in the gaps
between them.

Pinning one word at discovery would have cost five minutes.

---

## How to write an entry

**Term** — what it means here, in one sentence. Then, where it matters:
- **Not to be confused with:** the near-synonym people reach for, and how it differs
- **Also called:** what the client says, when it differs from the agreed term
- **Identified by:** what makes two of these the same one

Define the term the *client's business* uses, not the one the database uses. If
they diverge, that divergence is itself worth writing down.

---

## Agreed terms

Settled by KCB's answers of Sep-01-2026 (`requirements/ANSWERS.md`). These words,
spelled this way, in requirements, code, tests and conversation.

**Gallery** — the whole application, together with the single collection of
Photos it holds.
- **Identified by:** nothing. There is exactly one, so it is never referred to by
  name or id.
- **Note:** there are no named collections and no second Gallery. "Gallery" and
  "the application" are the same thing.

**Photo** — one still image held by the Gallery, created by one Upload.
- **Not to be confused with:** the *Original* or a *Rendition*, which are the
  files a Photo is made of.
- **Identified by:** the Upload that created it. Uploading the same file twice
  creates two Photos, not one.

**Original** — the image file exactly as the person chose it, stored unchanged.
- **Identified by:** its Photo. One Photo, one Original.
- **Note:** shown in the larger view. There is no download control.

**Rendition** — a smaller image file the application generates from an Original.
- **Note:** at present there is exactly one kind, the thumbnail used in the grid.

**Upload** — one person putting one image file into the Gallery, from the modal.
- **Note:** one file per Upload. An Upload that fails creates no Photo and leaves
  no partial file.

**Grid** — the layout of Photo tiles on the home page, newest Upload first.

**Larger view** — the overlay on the home page that shows one Photo's Original
sized to the viewport.
- **Not to be confused with:** a separate page. It is an overlay; the address
  does not change.

---

## Deliberately out of scope

Recorded so their absence is known, not overlooked. Each was proposed, put to the
client, and answered out of scope on Sep-01-2026.

- **Owner** — there is no owner and no sign-in. Every Photo is visible to anyone
  who can reach the application.
- **Capture date** — ordering uses Upload date. Capture date is not read.
- **Album**, **Share link** — never mentioned by the client, and answer 1 confirms
  there are no named collections. Neither term is in use.

Any of these arriving later is a variation, not a gap: `/find-variation`.

---

## Appears in source documents, not yet defined

The first brief's terms were all settled on Sep-01-2026. The **second brief of
Sep-01-2026** then introduced these, and none is defined by anything in the
record. Each has a matching question in `requirements/AMBIGUITIES.md`.

- **professional** / **amateur** — the judgement the whole brief rests on, with
  no stated standard and no reference the client pointed at
- **type scale** — no typeface, no sizes, no ratio given
- **spacing scale** — the Grid already uses one `gap`; whether this means a
  documented scale or different values is unstated
- **app bar** — no content beyond "the product name", no position, no behaviour
  on scroll
- **the product name** — the page says "Photo Gallery"; whether that is the name
  has never been confirmed
- **styled** (buttons, lightbox chrome) — no palette, no shape, no weight
- **hover state** — what changes on hover is not said, and hover does not exist
  on touch input
- **rounded corners** — no radius
- **designed empty state** — the empty state already exists and carries an
  invitation and the upload control; what "designed" adds is unstated
- **lightbox chrome** — presumably the close, previous and next controls, but
  "chrome" was never defined
- **focus ring** — a `:focus-visible` outline already ships under
  REQ-PHOTO-011@v1; whether this ask is already satisfied is a question for the
  client, not for us to close
