# ADR-0001 — The Gallery is built from one design token sheet

- **Status:** accepted
- **Date:** 2026-09-01
- **Approved:** KCB, Sep-01-2026 — the single round of approval answer 30 asks
  for. Approved as proposed, with no value changed.
- **Governs:** src/public/gallery.css, src/home-page.js

## Context

The client's second brief of Sep-01-2026 said the Gallery "looks amateur" and
must "look professional", and named no palette, no typeface, no sizes, no radius,
no reference site and no mockup. That gap is `FB-0001`, and its cause is on the
record: in the first brief the word "attractive" was decomposed into structural
criteria, the adjective survived into none of them, and the build stopped at the
criteria that existed.

Twenty-two questions went to the client rather than being answered internally.
KCB answered all of them on Sep-01-2026 (`requirements/ANSWERS.md`, 29–50). Two
of those answers create this record:

- **Answer 30** — the delivery team proposes the design values and the client
  approves them in one round, before styling is built.
- **Answer 29** — "professional" means built to that approved sheet. Acceptance
  is a single demo against it, and anything asked for afterwards is a variation.

So the values below are not a style preference. They are the acceptance baseline
for REQ-PHOTO-016 through REQ-PHOTO-024, and REQ-PHOTO-016@v1 criterion 4 refuses
any styling built before this record is approved.

Three constraints bound every choice:

- **REQ-PHOTO-015@v1** — no unnecessary dependency. Nothing here may add one.
- **REQ-PHOTO-014@v1** — the application boots and runs offline on a local PC.
- **REQ-PHOTO-011@v1** is `verified`, and `tests/responsive.test.js` pins its
  behaviour. Nothing here may make it red.

## Decision

One sheet of named CSS custom properties, declared once in `:root` in
`src/public/gallery.css`, from which every colour, size and space in the Gallery
is drawn. No component declares a bespoke value.

**Typeface** — a system font stack. No font file ships, and none is downloaded.

```
--font-stack: system-ui, -apple-system, "Segoe UI", sans-serif
```

**Type scale** — five named steps, per answer 48.

| Token | Step | Value | Used for |
|---|---|---|---|
| `--text-app-bar-title` | app bar title | 1.25rem | the app bar's product name |
| `--text-heading` | section heading | 1.125rem | section and dialog headings |
| `--text-body` | body | 1rem | body text, controls |
| `--text-small` | small | 0.875rem | secondary text |
| `--text-caption` | caption | 0.75rem | the smallest supporting text |

The **Step** column carries the names answer 48 gave them, so the sheet lists the
steps in the client's own words and not only as token identifiers.

**Spacing scale** — one base unit of `0.25rem` and a fixed set of multiples, per
answers 48 and 49.

| Token | Value | Multiple |
|---|---|---|
| `--space-1` | 0.25rem | base |
| `--space-2` | 0.5rem | ×2 |
| `--space-3` | 0.75rem | ×3 |
| `--space-4` | 1rem | ×4 — **the Grid gap, unchanged** |
| `--space-6` | 1.5rem | ×6 |
| `--space-8` | 2rem | ×8 |

**Palette** — neutral and light, with a single accent, per answer 31.

| Token | Value | Used for |
|---|---|---|
| `--color-page` | `#f7f8fa` | the page ground |
| `--color-surface` | `#ffffff` | app bar, tiles, modal and control surfaces |
| `--color-text` | `#1f2933` | text |
| `--color-border` | `#b0bec5` | borders and quiet controls |
| `--color-accent` | `#1565c0` | the primary action, and the focus ring |

**Corner radius** — one value, per answer 39.

```
--radius: 0.375rem   /* 6px — the value the upload modal ships with today */
```

It applies to the tiles, the buttons, the upload modal surface and the Larger
view's control surfaces. The app bar spans the window and has no visible corners.

**Focus ring** — the `:focus-visible` outline that already ships, restyled to
this sheet, per answer 43.

```
--focus-ring-width: 3px
--focus-ring-offset: 2px
/* colour: var(--color-accent) */
```

**Button variants** — exactly two, per answer 50.

| Variant | Treatment | Controls |
|---|---|---|
| Primary | `--color-accent` ground, `--color-surface` text | "+ Upload Photo"; the upload modal's confirming action |
| Secondary | `--color-surface` ground, `--color-border` border, `--color-text` text | Cancel; the delete confirmation; the Larger view's close, previous and next |

There is no destructive variant. Answer 50 places the delete confirmation on the
secondary treatment explicitly.

**Contrast.** Three ratios matter, and all are computed from the values above by
the standard relative-luminance formula:

| Pair | Ratio |
|---|---|
| `--color-surface` on `--color-accent` (primary button label) | **5.75:1** |
| `--color-text` on `--color-surface` (text on a white surface) | **14.76:1** |
| `--color-text` on `--color-page` (text on the page ground) | **13.89:1** |

All three clear the 4.5:1 that answer 41 requires of the Larger view's controls.
As answer 41 states, this is a measurement of those controls, not a WCAG
conformance claim for the application — answer 22 still governs that.

### Two values are anchored, not chosen

`--space-4` is `1rem` because the Grid's gap is `1rem` today and answer 49 says
it keeps that value. The base unit was then chosen so the delivered gap falls out
as a clean multiple, rather than the gap being retuned to fit a tidier scale.

`--color-accent` is `#1565c0` because that is already the focus-ring colour in
`gallery.css`. Reusing it means the accent and the focus ring agree without a
second decision, and answer 43's "restyled, not removed" costs nothing.

`--radius` is `6px` for the same reason: it is what the upload modal ships with,
so adopting it rounds three more surfaces without changing the one that already
had corners.

## Alternatives considered

**A webfont — Inter, or similar, from Google Fonts.** It would look more
deliberate than a system stack. Rejected: answer 32 asks for typefaces already on
the person's computer, and either bundling a file or fetching one at page open
would put REQ-PHOTO-014@v1 (runs offline) and REQ-PHOTO-015@v1 (no unnecessary
dependency) in question. A system stack costs nothing and breaks nothing.

**A modular type scale on a 1.25 ratio** — 1rem, 1.25rem, 1.563rem, 1.953rem.
Mathematically tidier and a common default. Rejected: it forces the app bar title
up to 1.563rem, which is larger than the delivered page, and it produces no usable
step between 0.8rem and 1rem for the two smallest sizes. The five hand-picked
steps are anchored on values the application already uses, so the scale can be
adopted without redesigning views this slice is not restyling.

**An 8px (0.5rem) spacing base**, the most common choice. Rejected: `0.75rem`
cannot be expressed as a whole multiple of it, and the gap of `1rem` would be
step 2 of a scale with no room beneath it. A `0.25rem` base gives six steps that
include both, and answer 49 fixes the gap, so the base had to bend to the gap
rather than the reverse.

**Adopting a published token set wholesale** — Tailwind's scale, or Material's.
Rejected: both bring far more tokens than this application has surfaces, and
taking one as a dependency contradicts REQ-PHOTO-015@v1 while taking one by hand
means maintaining a copy nobody approved.

**A dark appearance, or a light/dark pair.** Rejected by answer 31, which puts it
out of scope for this change. It is a variation, not a gap.

**One flat button treatment**, and separately **three variants with a
destructive treatment for delete.** Both were put to the client as question 50
and both were declined: two variants, with delete on the secondary. Building one
treatment now and retrofitting variants later would mean restyling every button
twice, which is why the question was asked before any of them was built.

## Consequences

**Retuning is cheap and total.** Every value lives in one `:root` block, so
changing the accent, the radius or a step changes every place it is used. That is
the property answer 39 asks for explicitly, and it is what makes a demo-driven
review affordable: a change KCB asks for at the demo is usually a one-line edit.

**A bespoke value becomes a review failure, not a style opinion.** REQ-PHOTO-017
criterion 1 and REQ-PHOTO-018 criterion 1 say no size or space may come from
outside the scale, and the slice-8 tests assert it against the stylesheet text. A
component that hard-codes `font-size: 13px` fails the suite rather than passing
unnoticed.

**This sheet is the acceptance baseline.** Once approved, "professional" means
"built to this", and a later aesthetic request is a variation under answer 29 —
`/find-variation`, not a defect. That protection is the reason the sheet is
approved before the build rather than shown alongside it.

**It rules out a dark appearance** until a new ADR supersedes this one. The
tokens are named for their role (`--color-surface`, not `--color-white`), so a
future pair would not need renaming — but the decision would still be a new
record, not an edit to this one.

**It pins the Grid gap.** `--space-4` is load-bearing for REQ-PHOTO-011@v1
criterion 3 and for the gap assertion in `tests/responsive.test.js`. Changing the
base unit or that step is not a styling tweak; it re-baselines a `verified`
requirement and needs `/change-record`.

**Slice 9 is unblocked by the same approval.** The radius, the two variants and
the full palette are recorded here although slice 8 applies only part of them, so
REQ-PHOTO-020 to REQ-PHOTO-024 do not need a second trip to the client.

## How this is approved

Answer 30 asks for one round of approval, and REQ-PHOTO-016@v1 criterion 4 makes
it a gate: no styling under REQ-PHOTO-017 to REQ-PHOTO-024 is accepted until KCB
has recorded approval of this sheet.

On approval, this record's status moves `proposed` → `accepted` in the pull
request that carries it, and `/tdd` becomes runnable for slice 8. If KCB changes
a value, the change is made here before any code is written — that is the whole
point of approving the sheet rather than the stylesheet.

**Approved by KCB on Sep-01-2026**, as proposed and with no value changed. That
satisfies REQ-PHOTO-016@v1 criterion 4, and slice 8 began against this sheet.

From this point the sheet is the acceptance baseline. A later change to any value
here is a variation under answer 29 — `/find-variation` — not a defect, and this
record is superseded by a new ADR rather than edited.
