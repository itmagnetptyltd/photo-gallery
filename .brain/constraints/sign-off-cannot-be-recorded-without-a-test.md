# The requirement lifecycle cannot record a client sign-off that no test backs

- **Discovered:** 2026-09-01
- **Review by:** 2027-03-01
- **Source:** `.claude/itm-sdlc/schema/requirement.schema.json` line 53;
  `validate-requirements.js` → `checkVerifiedHasEvidence`;
  `scripts/lib/requirements.js` → `STATUS_ORDER`. Confirmed by reading all
  three and by evaluating the order at the console on 2026-09-01.
- **Affects:** `.brain/requirements/photo.yaml` (REQ-PHOTO-016 to
  REQ-PHOTO-024), and any future requirement whose acceptance is a human
  judgement rather than an assertion.

## The constraint

The lifecycle is `draft → agreed → in_progress → verified → signed_off`,
forward-only, with no skipped steps. The schema states the gate precisely:

> "'agreed' and beyond require zero open ambiguities; **'verified' and beyond
> require at least one `verified_by` entry**."

`checkVerifiedHasEvidence` enforces it with `statusAtLeast(status, 'verified')`,
and `signed_off` sits *above* `verified` in `STATUS_ORDER`. So the gate applies
to `signed_off` as well:

```
STATUS_ORDER.indexOf('signed_off') >= STATUS_ORDER.indexOf('verified')  // true
```

**Therefore a requirement cannot reach `signed_off` without a test annotating it
at its current version.** There is no state meaning "a person accepted this, and
no test can assert it".

This collides directly with KCB's answer 47 of Sep-01-2026, which chose sign-off
by eye:

> "The look is signed off by eye, by the client, at an agreed demo against the
> approved token sheet... It is accepted that on the evidence rule in
> `requirements/README.md`, REQ-PHOTO-016 to REQ-PHOTO-024 rest at `agreed` with
> a recorded demo acceptance and do not reach `verified`."

Two things in that answer cannot both hold:

1. **"Rest at `agreed`" was already unreachable** the moment slice 8 was built.
   `/tdd` must move a requirement to `in_progress` before the first test is
   written — that transition is what makes gate G3 demand the `@covers`
   annotations. Backwards movement is refused. REQ-PHOTO-017, REQ-PHOTO-018 and
   REQ-PHOTO-019 are at `in_progress` now and cannot return.
2. **"Do not reach `verified`" forecloses `signed_off`.** Since `signed_off`
   demands `verified_by`, a requirement that never reaches `verified` can never
   record the client's acceptance either. Answer 47 asks for an acceptance the
   record has no way to write down.

**REQ-PHOTO-016 is the sharpest case.** Its acceptance is explicitly a human
verdict — "the client reviews those four views" — so on the plain reading no
test can ever annotate it, and it can never be closed. It would sit at `agreed`
or `in_progress` permanently, indistinguishable from abandoned work.

## How we know

Read, not assumed. The schema's own description states the rule for "'verified'
and beyond". `checkVerifiedHasEvidence` skips any requirement below `verified`
and errors on an empty `verified_by` for everything at or above it. `STATUS_ORDER`
places `signed_off` last, so "at or above `verified`" includes it. The order was
evaluated directly rather than inferred from the array literal.

Separately, `advance-status.js --to verified --dry-run` on 2026-09-01 reported
that REQ-PHOTO-017, 018 and 019 would all move, with `verified_by` resolving to
`tests/type-scale.test.js`, `tests/spacing-scale.test.js` and
`tests/app-bar.test.js`. The mechanical gate is satisfied; it is answer 47 that
refuses, not the tooling.

## What we do about it

**Nothing has been recorded.** REQ-PHOTO-017, REQ-PHOTO-018 and REQ-PHOTO-019
remain at `in_progress`, which is the only state that neither contradicts answer
47 nor asserts evidence the client declined. This is a holding position, not a
resolution: a reader six months from now would take `in_progress` to mean the
slice was abandoned, which is why this file exists.

**The resolution is the client's, not ours.** Choosing a reading here is exactly
the failure `FB-0001` records, so the collision goes back to KCB as a scope
matter — REQ-PHOTO-016 is `agreed`, so this is `/find-variation` and then
`/change-record`, not a new ambiguity.

The reading we would recommend, and the one to put to them:

> `verified` is a mechanical statement — "a test annotates this requirement at
> its current version" — and never a claim that the Gallery looks good. On that
> reading REQ-PHOTO-017 to REQ-PHOTO-024 may take `verified` honestly, because
> tests do annotate them, while the aesthetic judgement stays where the client
> put it: entirely inside REQ-PHOTO-016, decided by eye at the demo.
>
> REQ-PHOTO-016 then earns its own `verified_by` from a test asserting that a
> recorded verdict exists and is either an acceptance or a written list of
> changes — which is what its criterion 1 already requires. The test would assert
> that the verdict was recorded, never that the verdict was favourable.

That keeps answer 47's substance — no browser automation, no dependency, the
look judged by a person — while making the client's acceptance something the
record can actually hold. It does contradict answer 47's literal words, which is
why it is a variation for KCB to accept or refuse rather than a correction we
may apply.

**Until they answer, no requirement in this group moves.**

## If this constraint is lifted

If the toolkit later gains a status for human acceptance without test evidence,
or relaxes the `verified_by` gate for `signed_off`, this file should be deleted
and anything built around it noted in `rejected/`.
