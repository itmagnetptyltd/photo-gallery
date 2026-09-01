# Ambiguities

Open questions arising from the client brief received **Sep-01-2026 from KCB by
email** (verbatim in `BRIEF.md`). A question here is **open**, and none may be
closed by the delivery team choosing a reading — only the client's answer closes
one, and until it is closed it blocks the requirements listed against it from
moving past `draft`.

**There are no open questions.** All 28 raised against the brief were answered by
KCB on Sep-01-2026. Their words are kept verbatim in `ANSWERS.md`, and each
answer was written into the acceptance criteria of the requirements it affected;
every requirement's `source` names the questions that shaped it.

This file and the `ambiguities` lists in `photo.yaml` are two views of one list.
If they diverge, one of them is wrong. Both are now empty.

**A note on vocabulary.** The brief uses *photo*, *gallery*, *grid*, *thumbnail*,
*popup/modal*, *larger view*, *data store*, *home page* and *users*. The answers
of Sep-01-2026 settled each of them, and `.brain/glossary.md` records what they
now mean. Two proposed terms did not survive: **Owner** and **Capture date** were
answered explicitly out of scope, and no requirement relies on either.

> **Update — Sep-01-2026, second brief.** Everything above describes the **first**
> brief only, and remains true of it: all 28 of its questions are answered and
> closed. The second brief of Sep-01-2026 (BRIEF.md, "Second brief") then raised
> **22 further questions, numbered 29 to 50**, and KCB answered all 22 on
> Sep-01-2026. Their words are verbatim in `ANSWERS.md`, each answer was written
> into the acceptance criteria of the requirements it affected, and every
> `ambiguities` list in `photo.yaml` is now empty. REQ-PHOTO-016 to
> REQ-PHOTO-024 moved `draft` → `agreed` on those answers. **There are again no
> open questions**, against either brief.
>
> Question ids are not reused. The next question raised against this project is
> numbered 51.

---


## Open questions

_(none — all 50 answered Sep-01-2026, see `ANSWERS.md`: questions 1–28 against
the first brief, 29–50 against the second)_

New questions are appended here as they arise. A question that arises against an
`agreed` requirement is a scope matter, not an ambiguity: use `/find-variation`
and, if it is a variation, `/change-record`.

---

# Answered — second brief of Sep-01-2026

Raised against the feedback received **Sep-01-2026 from KCB on the first
delivery** (verbatim in `BRIEF.md`, "Second brief"), captured as `FB-0001` and
scoped by `CHG-0001`. The whole of that brief is quoted once here so the record
of what was asked survives the questions being closed:

> "The gallery works but looks amateur. It needs to look professional: a proper
> type and spacing scale, an app bar with the product name, styled buttons with
> hover and focus states, tiles with rounded corners and a hover state, a
> designed empty state, styled lightbox chrome, and a visible focus ring on
> every interactive element."

No mockup, no reference site, no palette, no typeface, no sizes and no radius
accompanied it, and none of those was filled in by the delivery team. All 22
questions went to the client and all 22 came back answered on Sep-01-2026.

**What the answers settled**, in one line each — the client's own wording is in
`ANSWERS.md`, and the acceptance criteria are in `photo.yaml`:

| # | Settled as |
|---|---|
| 29 | "Professional" means built to an agreed design token sheet; acceptance is one demo against it, and later asks are variations |
| 30 | The delivery team proposes the values, the client approves them in one round, before styling starts |
| 31 | Neutral light palette, one accent for the primary action; dark appearance out of scope |
| 32 | System font stack, nothing downloaded, no font file shipped |
| 33 | The product name is **Photo Gallery**; recorded in `glossary.md` as the Gallery's display name |
| 34 | App bar sits at the top and scrolls away with the content; not fixed |
| 35 | App bar carries the name only; "+ Upload Photo" stays above the Grid |
| 36 | The Larger view's overlay covers the app bar |
| 37 | Hover changes appearance only; keyboard focus gets the same visual weight |
| 38 | No text over a tile on hover — image alone |
| 39 | One corner-radius value, shared by tiles, buttons, modal surface and Larger view controls |
| 40 | "Lightbox" is the Larger view, "chrome" is its close/previous/next; backdrop unchanged |
| 41 | Larger view controls sit on opaque surfaces, icons at ≥ 4.5:1 — a measurement, not a WCAG claim |
| 42 | The upload modal is restyled with everything else |
| 43 | The focus ring ask is **already met**; restyled only. No new requirement, REQ-PHOTO-011 not versioned |
| 44 | The empty state is restyled, nothing added. REQ-PHOTO-001 not versioned |
| 45 | Desktop widths only, as answer 21 already scoped |
| 46 | Presentation only; crop and small-Photo handling untouched. The FB-0001 crop observation stays **escalate** |
| 47 | Signed off by eye at a demo; no browser automation, no new dependency. REQ-PHOTO-016..024 rest at `agreed` and do **not** reach `verified` |
| 48 | A written-down set of steps: named text sizes, and one base spacing unit with fixed multiples |
| 49 | The Grid's gap keeps its current value and becomes one of the scale's steps |
| 50 | Two button variants, primary and secondary; the delete confirmation uses secondary, no destructive variant |

Two of these deserve to be read before the next piece of work is planned.

**Answer 47 is a knowing gap in the evidence rule.** `README.md` says `verified`
requires a test annotating the requirement at its current version. The client has
chosen sign-off by eye and no browser automation, which means these nine
requirements cannot reach `verified` by that rule and will sit at `agreed` with a
recorded demo acceptance instead. That is the client's decision, recorded here so
nobody later reads the missing `verified_by` as an oversight.

**Answer 30 puts a gate in front of the build.** No styling under REQ-PHOTO-017
to REQ-PHOTO-024 is accepted until the client has approved the token sheet. The
sheet is a deliverable in its own right and comes first.
