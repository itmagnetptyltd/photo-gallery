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

_(none yet — nothing below has been through the client)_

---

## Proposed terms — NOT AGREED

> **Nothing in this section is settled.** There is no brief, no BRD and no source
> document in this repository; these were drafted from the project name alone.
> Each entry is a **proposal to be confirmed or corrected by the client**. A term
> moves up into *Agreed terms* only after they have said so. Until then no
> requirement may cite one of these as fixed.

**Photo** — a single image held by the system, together with the metadata
captured with it.
- **Not to be confused with:** a *Rendition*. The Photo is the thing; a Rendition
  is one file the system generated from it.
- **Identified by:** proposed — a system-issued photo reference, not the filename.
  Two uploads of the same file are two Photos unless the client says otherwise.

**Rendition** — a derived file produced from a Photo for a particular use:
thumbnail, web-size, full-size.
- **Not to be confused with:** the *Original*, which is the bytes as uploaded and
  is never modified.

**Album** — a named group of Photos, assembled deliberately by an Owner.
- **Not to be confused with:** a *Gallery*. An Album is the grouping; a Gallery is
  where a grouping is shown.
- **Identified by:** proposed — an album reference issued at creation.

**Gallery** — the viewer-facing surface on which one or more Albums are
presented.
- **Note:** the project is itself named "photo-gallery", so this word is already
  overloaded. Confirming or replacing it is the first question below.

**Owner** — the person who uploaded a Photo and controls who may see it.
- **Not to be confused with:** a *Viewer*, who can see a Photo but cannot change
  or reshare it.

**Upload** — the act of a person putting a file into the system.
- **Not to be confused with:** an *Import*, a bulk transfer from another source.
  Whether both exist is unconfirmed.

**Capture date** — when the photograph was taken, per its embedded metadata.
- **Not to be confused with:** the *Upload date*, when the system received it.
  These differ routinely and sorting is meaningless until the client says which
  one they mean by "date".

**Share link** — a URL that grants a non-Owner access to an Album or Photo.

---

## Open questions the client must answer

These are ambiguities, not choices for the delivery team. They are **recorded in
full** in `requirements/AMBIGUITIES.md`, which is the single register — this
section only says where each one went, so the two cannot drift apart.

| Glossary question | Now recorded as |
|---|---|
| Does "gallery" mean the product, or one collection inside it? | Ambiguity 1 |
| Does "photo" include video? | Ambiguity 4 |
| Are two uploads of the same file one Photo or two? | Ambiguity 10 |
| What happens on delete — removed, or recoverable? | Ambiguity 17 |
| When they say "date", Capture date or Upload date? | Ambiguity 14 |
| What visibility states exist? | Ambiguities 2 and 3 |

**Album and Share link were not corroborated.** The brief of Sep-01-2026 never
mentions albums, sharing, sign-in or ownership. Those two proposed terms are
therefore not merely unconfirmed but unsupported by any source document, and no
requirement cites them. Absence of scope is not scope — they stay listed above
only so that a later brief has somewhere to land.

---

## Appears in source documents, not yet defined

Used by the client in the brief of Sep-01-2026 without settling what they mean.
Each has a matching question in `requirements/AMBIGUITIES.md`.

- **gallery** — used for both the application and the grid of photos (ambiguity 1)
- **grid** / **gallery layout** — no column count, breakpoint or ordering given (ambiguities 14, 21)
- **thumbnail** — a generated smaller Rendition, or the Original shown small? (ambiguity 12)
- **larger view** — overlay, separate page, and at what resolution? (ambiguity 19)
- **popup** / **modal** — used interchangeably in one sentence (REQ-PHOTO-004)
- **simple data store** — no durability, location or format given (ambiguities 24, 25)
- **responsive** — no devices, browsers or viewport widths named (ambiguity 21)
- **immediately** — for the uploader only, or for other people already viewing? (ambiguity 18)
- **simple**, **modern**, **clean and attractive**, **user-friendly** — no observable standard, and no named judge (ambiguity 23)
- **unnecessary dependencies** — no definition of necessary, and no approver (ambiguity 26)
- **easy to run on a local development PC** — no step count, no prerequisites (ambiguity 28)
