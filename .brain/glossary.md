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

These are ambiguities, not choices for the delivery team. Each needs a matching
entry in `requirements/AMBIGUITIES.md` before any requirement that depends on it
can reach `agreed`.

1. **Does "gallery" mean the product, or one collection inside it?** The name
   suggests both readings. Every other term depends on this one.
2. **Can one Photo belong to more than one Album?** Determines whether the
   relationship is a hierarchy or a many-to-many, and it is expensive to reverse.
3. **Does "photo" include video?** If yes, "Photo" is the wrong word entirely and
   should be settled now rather than after the schema exists.
4. **What happens on delete — removed, or recoverable?** If there is a recovery
   period, "deleted" is a state and needs its own term.
5. **What visibility states exist for an Album?** Public, private and link-only
   are three different products; the client has named none of them.
6. **When they say "date", do they mean Capture date or Upload date?**

---

## Appears in source documents, not yet defined

No client source document has been supplied to this repository. When a brief,
BRD or meeting note arrives, run `/decompose` and record undefined terms here.

- _(none yet — no source documents exist)_
