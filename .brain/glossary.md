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
- **Display name:** "Photo Gallery", shown in the App bar. Settled by answer 33
  of Sep-01-2026. The Gallery has no identifier but does have a name people read.
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
- **Client synonym:** *lightbox*. Settled by answer 40 of Sep-01-2026. The client
  says lightbox; requirements, code and tests say Larger view.
- **Chrome:** its close, previous and next controls — and only those. The
  darkened backdrop behind the Photo is not part of the chrome.

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

## Design terms

Introduced by the **second brief of Sep-01-2026** and settled by KCB's answers of
the same date (`requirements/ANSWERS.md`, questions 29–50). None of these was
defined by the delivery team.

**Token sheet** — the one page setting out every design value the Gallery is
built from: the palette, typeface stack, text-size scale, spacing scale, corner
radius, focus ring and button variants.
- **Note:** the delivery team proposes it, the client approves it in one round,
  and only then is styling built. No styling under REQ-PHOTO-017 to
  REQ-PHOTO-024 is accepted ahead of that approval.
- **Note:** it is also the standard "professional" is judged against. Anything
  asked for after the sheet is approved is a variation, not a defect.

**Type scale** — the finite, named set of text sizes every piece of text is drawn
from: app bar title, section heading, body, small, caption.
- **Not to be confused with:** mere consistency. The steps are written down on the
  token sheet and named in the stylesheet, so the list can be read and checked.

**Spacing scale** — a single base unit and a fixed set of multiples of it, from
which every space between and around elements is taken.
- **Note:** the Grid's existing gap keeps its value and is adopted as one of the
  steps. The scale is built around it, not over it.

**App bar** — the region at the top of the home page carrying the Gallery's
display name, "Photo Gallery", and nothing else.
- **Note:** it scrolls away with the content. It is not fixed, and the Larger
  view's overlay covers it.
- **Not to be confused with:** a toolbar. The "+ Upload Photo" control does not
  live here; it stays above the Grid.

**Button variant** — one of exactly two defined button treatments.
- **Primary** — the accent colour, used for "+ Upload Photo" and the confirming
  action in the upload modal. The accent appears nowhere else.
- **Secondary** — a quiet neutral surface with a border, used for Cancel, the
  delete confirmation, and the Larger view's close, previous and next.
- **Note:** there is no third variant. Destructive actions do not look different.

**Hover state** — a change of appearance alone when a pointer rests on a control
or tile. Buttons shift background and border; tiles lift slightly and gain a
border tint.
- **Note:** nothing is *revealed* on hover that is not otherwise shown, so people
  using touch or the keyboard alone lose nothing and no second design is needed.
- **Note:** keyboard focus carries the same visual weight as hover.

**Corner radius** — one shared value, rounding the tiles, the buttons, the upload
modal surface and the Larger view's control surfaces.
- **Note:** because it is one value, the amount of rounding changes in one place.
  The app bar spans the window and has no visible corners to round.

**Focus ring** — the `:focus-visible` outline that already ships under
REQ-PHOTO-011@v1, drawn in the token sheet's colour and width.
- **Note:** this was an ask in the second brief that was **already met**. It is
  restyled, never removed, and REQ-PHOTO-011 is not versioned for it.

---

## Appears in source documents, not yet defined

_(none — the first brief's terms were settled on Sep-01-2026, and the second
brief's were settled the same day by answers 29–50.)_

A term arriving here again means a brief has used a word the record cannot
define. It is a question for the client, never a gap for the delivery team to
fill: that is what produced FB-0001.
