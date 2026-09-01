# FB-0001 — The delivered gallery looks amateur, and "attractive" was lost in decomposition

- **Received:** 2026-09-01
- **From:** not stated — relayed by the developer during the working session
- **Channel:** not stated
- **Anchors:** REQ-PHOTO-001, REQ-PHOTO-002, REQ-PHOTO-011
- **Triage:** proposed — see below; the aesthetic ask is a **variation**, the clipping claim is **not a defect on current evidence**
- **Sentiment:** negative

## What they said

> converted "attractive gallery/grid layout" into structural criteria — grid not
> list, uniform spacing, no metadata text — because "attractive" isn't
> machine-checkable, and then dropped the adjective. The agent built precisely
> what the criteria said and stopped. There was no criterion telling it to look
> good, so it doesn't.
>
> Check defect before variation — this decides who pays. Open it and confirm
> against 002 and 011: are all tiles the same size, is spacing uniform, does the
> "+ Upload Photo" button sit clear? In your screenshot the first tile looks
> clipped differently from the rest. If a criterion genuinely fails, that's a
> defect — you fix it free. Only what no criterion covers is a variation. In a
> word it is so armature, make it professional make the design attractive

## The check they asked for

Run before any interpretation, because it decides defect versus variation.

**Are all tiles the same size?** Yes, by construction. Every tile is a grid cell
of an identical track — `repeat(auto-fill, minmax(12rem, 1fr))` — and `.tile`
sets `aspect-ratio: 1`. Tile boxes cannot differ in size from one another.

**Is spacing uniform?** Yes. A single `gap: var(--gap)` governs every gutter.
There are no per-tile margins, so spacing cannot vary between tiles.

**Does the "+ Upload Photo" control sit clear?** Yes. It is rendered before the
grid, in normal flow, and the grid carries `margin: var(--gap) 0 0`. Nothing is
absolutely positioned, so no overlap is possible.

**"The first tile looks clipped differently from the rest."** Confirmed as real,
and explained — but not by tile geometry. The four stored Photos produce
Renditions of very different shapes:

| Photo | Original | Rendition |
|---|---|---|
| 1d43a4cc | 656×276 | 200×84 |
| 533b277a | 128×128 | 128×128 |
| 756f5420 | 505×348 | 200×138 |
| b93a0653 | 128×128 | 128×128 |

Tiles are square and use `object-fit: cover`. A 200×84 image in a square tile is
cropped hard top and bottom; a 128×128 image is not cropped at all. The tiles are
identical; **the crops differ because the images differ**, which is `cover`
behaving uniformly on non-uniform content.

No criterion governs how much of a Photo a tile may crop, or that crops be
consistent between tiles. REQ-PHOTO-002 criterion 1 requires only that the image
render at the tile's dimensions rather than the Original's, which it does.

`tests/tiles.test.js` and `tests/responsive.test.js` — the tests for
REQ-PHOTO-002 and REQ-PHOTO-011 — pass: 11 of 11.

## What we think it means

Clearly marked as a reading, not as fact.

**The process observation is correct and is the more valuable half.** At
decomposition the client's phrase "clean and attractive gallery/grid layout"
produced structural criteria and the adjective was not carried into any of them.
It became ambiguity 23, which asked who judges "clean, attractive and
user-friendly" and against what evidence. The client's answer of Sep-01-2026 set
a delivery-team baseline and deferred acceptance to a demo, so no acceptance
criterion ever required the result to look good. The build then satisfied every
criterion that existed. That is the mechanism this feedback describes, and it
worked exactly as described.

**On liability, the two halves separate.** The specific defect candidates the
feedback names — tile size, spacing, button clearance — are satisfied, and the
clipping observation is content-driven rather than a criterion failure. The
remaining ask, "make it professional, make the design attractive", is not covered
by any acceptance criterion in the record. On current evidence that makes it a
variation rather than a defect.

**Two caveats on the strength of that finding.** First, every check above is
CSS, markup and image geometry — **no browser has rendered this application in
any check, ever**, because REQ-PHOTO-015 permits no browser-automation
dependency. A visual fault that CSS does not predict would not be caught here.
Second, no screenshot was produced by the delivery agent in this session; the
observation refers to one, and its provenance is unknown to this record.

**A related quality issue, not raised and not a criterion failure:** Renditions
are never enlarged, so a Photo smaller than 200px yields a Rendition smaller than
the tile it must fill, which CSS then upscales. Two of the four stored Photos are
128×128 and will look soft. Recorded here because it will be visible in the same
demo.

## Resolution

Open. Awaiting a human triage decision — classification carries commercial
consequences and has deliberately not been applied.

If confirmed as a variation, the route is `/find-variation` and then
`/change-record` against REQ-PHOTO-011@v1, which is currently `verified`.
Changing what it means requires a new version and a `CHG-` record, not an edit.

Attribution is incomplete: neither the speaker nor the channel was stated. A
feedback record that may become a commercial argument should carry both, and
this one should be completed before it is relied on.
