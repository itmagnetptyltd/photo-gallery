# CHG-0001 — The interface must be attractive and professional, not merely correct

- **Raised:** 2026-09-01
- **Raised by:** client reaction to delivered work — recorded verbatim as FB-0001 (speaker and channel not stated)
- **Affects:** REQ-PHOTO-011 (v1 -> v2, proposed), REQ-PHOTO-001@v1, REQ-PHOTO-002@v1
- **Status:** proposed

## What changed

**The old text.** No requirement asks for the interface to look good. The
client's phrase in the brief of Sep-01-2026 — "a clean and attractive
gallery/grid layout" — was decomposed into structural criteria and the adjective
was carried into none of them. It became ambiguity 23, which the client answered:

> "The delivery team will use a simple modern visual design as the acceptance
> baseline: consistent spacing, clear controls, readable text, responsive grid
> reflow, and no unnecessary visual clutter. The client can accept or request
> changes during the demo."

That answer names five checkable properties, places the judgement with the
delivery team, and makes no aesthetic quality an acceptance criterion.
REQ-PHOTO-011@v1 carries the four criteria that survived — reflow without
horizontal scrolling, the upload control visible, uniform spacing with no
overlap, and keyboard reach.

**The new text.** Not drafted. Whatever replaces or extends REQ-PHOTO-011 must
turn "professional" and "attractive" into criteria with observable outcomes, or
the same gap reopens at the next demo. Drafting it is `/decompose` work once the
commercial position is settled, and it will need the client to answer what
"attractive" means to them in checkable terms — which is the question ambiguity
23 asked and their answer deferred.

## Why

The client's own words, from FB-0001:

> "In a word it is so armature, make it professional make the design attractive"

And their diagnosis of how it happened, which the record confirms:

> "converted 'attractive gallery/grid layout' into structural criteria — grid not
> list, uniform spacing, no metadata text — because 'attractive' isn't
> machine-checkable, and then dropped the adjective. The agent built precisely
> what the criteria said and stopped. There was no criterion telling it to look
> good, so it doesn't."

## Impact

**Coverage finding.** `variation-agent` judged this ask against the agreed text
alone and returned **not-covered**, having searched every requirement whose
subject is presentation — REQ-PHOTO-001@v1 (eight criteria), REQ-PHOTO-002@v1,
REQ-PHOTO-011@v1 — and found no criterion whose outcome is a subjective visual
quality. The client's answer 23 is the strongest evidence: it expressly ends
"The client can accept or request changes during the demo", so raising this is
consistent with what they agreed. Agreeing a route to request changes is not the
same as agreeing a criterion requiring them.

**Dependants — derived from the requirement graph, `/impact-analysis` 2026-09-01.**

Nothing declares `depends_on: REQ-PHOTO-011`, so that requirement has no
dependants of its own. But REQ-PHOTO-001 is in the affected set, and three
requirements rest on it transitively:

| Dependant | Rests on |
|---|---|
| REQ-PHOTO-008 | REQ-PHOTO-001 |
| REQ-PHOTO-009 | REQ-PHOTO-001 |
| REQ-PHOTO-010 | REQ-PHOTO-009 |

REQ-PHOTO-002 also depends on REQ-PHOTO-001 and is already listed as affected.

The graph is sound enough to rely on: 11 of 15 requirements declare a
`depends_on`, and only 4 declare none — so this is a derived answer, not an
inference from the code.

**Tests invalidated — 0 today, 5 if REQ-PHOTO-011 is versioned.**

No version has moved, so nothing is stale yet. If this change is accepted and
REQ-PHOTO-011 goes to v2, five annotations pinned to `@v1` are superseded — they
were written against text that would no longer say the same thing, and gate G3
reports them as stale:

```
tests/responsive.test.js:50    @covers REQ-PHOTO-011@v1
tests/responsive.test.js:70    @covers REQ-PHOTO-011@v1
tests/responsive.test.js:83    @covers REQ-PHOTO-011@v1
tests/responsive.test.js:100   @covers REQ-PHOTO-011@v1
tests/responsive.test.js:131   @covers REQ-PHOTO-011@v1
```

All five are in one file. REQ-PHOTO-001 and REQ-PHOTO-002 are affected but not
versioned by this record, so their annotations stay valid.

**Regression scope — 6 of 11 test files**, being those covering the affected
requirements and their dependants, not the whole suite:

```
tests/responsive.test.js    REQ-PHOTO-011
tests/grid.test.js          REQ-PHOTO-001
tests/store.test.js         REQ-PHOTO-001
tests/tiles.test.js         REQ-PHOTO-002
tests/live-insert.test.js   REQ-PHOTO-008
tests/lightbox.test.js      REQ-PHOTO-009, REQ-PHOTO-010
```

**Estimate: cannot be given.** The new requirement text does not exist, and
"attractive" has no agreed definition to size against. Anything offered now
would be a number attached to an undefined scope. It becomes estimable once the
client answers what attractive means in checkable terms.

**Three passing tests constrain any redesign.** They encode agreed behaviour a
visual change must preserve, or bump:

| Test | Requirement | What it pins |
|---|---|---|
| `tests/responsive.test.js` | REQ-PHOTO-011@v1 | `repeat(auto-fill, minmax(...))`; a single `gap`; no positioned tiles; a `:focus-visible` rule that is not `outline: none` |
| `tests/tiles.test.js` | REQ-PHOTO-002@v1 | a tile carries no text at all once tags are stripped |
| `tests/grid.test.js` | REQ-PHOTO-001@v1 | `.gallery-grid` present with a multi-column track |

If a redesign trips any of these, that is the record saying the change altered
agreed behaviour — and the affected requirement needs a version bump recorded
here, not a test edited to fit.

**Nothing already delivered is invalidated.** All 15 requirements remain
`verified` and every test passes.

**Not covered by any criterion, and therefore unprotected:** tiles being the same
size as one another. No requirement requires it and no test asserts it. It is
true today by construction, and nothing would catch it regressing.

## Commercial position

**Not decided.** Absorbed, varied, deferred or declined is a human's call, and
so is the price. This record states the coverage finding and nothing more.

The delivery-side facts a person needs to make that call:

- No criterion requires the interface to be attractive. The client's own answer
  23 is why.
- The client has not yet been asked what "attractive" means in checkable terms.
  Settling that is the difference between one variation and a recurring one.
- The demo route the client themselves proposed in answer 23 has not happened.
  Nothing in this build has been rendered in a browser by anyone.
