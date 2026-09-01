# Plan — REQ-PHOTO-001@v1

Written Sep-01-2026, on branch `feat/photo-grid`. Slice 2 of `.brain/slices.yaml`.

`REQ-PHOTO-001` has no `depends_on`. Slice 1 (Boot) is merged and `verified`, so
`src/server.js` already exists and this plan changes it rather than inventing it.

Upload does not exist until slice 3, and the store does not exist until slice 4.
Photos are therefore **seeded in tests** through a source module this slice
introduces, whose backing slice 4 replaces.

---

## What must be true

Eight acceptance criteria, eight observable behaviours:

1. Three stored Photos produce exactly three Photo tiles on the home page.
2. Tiles are laid out in rows and columns, not as one vertical list of
   full-width images.
3. All Photos appear in one collection; no control selects between named
   collections or multiple galleries.
4. The home page is served with no credentials and presents no sign-in prompt
   or authentication challenge.
5. Three Photos uploaded at different times appear ordered by **Upload date and
   time, most recent first** — not Capture date.
6. When more Photos are held than fit one screen, the initial response renders a
   **bounded subset**; the remainder is reached by pagination or incremental
   loading.
7. With no Photo held, an empty-state message inviting an upload is displayed,
   together with the "+ Upload Photo" control.
8. A Photo that has been removed has no tile.

---

## Approach

Three new modules and one change to the server.

`src/photos.js` becomes the single source the home page reads Photos from. It
exposes `listPhotos({ limit, offset })`, returning newest Upload first, and
`countPhotos()`. Its backing for now is an in-memory array with a seeding
function used only by tests — the slice note in `slices.yaml` says exactly this,
and slice 4 replaces the backing with the real store without changing the
interface the grid depends on.

`src/home-page.js` renders the complete home page HTML from a list of Photos: the
grid when there are Photos, the empty state when there are none. `src/server.js`
keeps routing and gains a route for the stylesheet; it no longer serves a static
`index.html`, so `src/public/index.html` is deleted — the boot plan said
REQ-PHOTO-001 would replace it, and it did its job. `tests/boot.test.js` asserts
a 200 and a non-empty `text/html` body, which server-side rendering still
satisfies; it must stay green.

`src/public/gallery.css` holds the grid layout as a real CSS grid, so criterion 2
is a property of the stylesheet rather than of how a browser happened to reflow.

**Tiles reference image URLs this slice does not serve.** Each tile carries an
`<img>` pointing at the Photo's image path, but the bytes behind it arrive in
slice 4 (Original) and slice 5 (thumbnail Rendition). REQ-PHOTO-002's "no tile
shows a broken or placeholder image" belongs to slice 5 and is deliberately not
claimed here.

| Path | Change |
|---|---|
| `src/photos.js` | new — Photo source, newest Upload first, seedable |
| `src/home-page.js` | new — renders grid and empty state |
| `src/public/gallery.css` | new — CSS grid layout |
| `src/server.js` | changed — render `/`, serve the stylesheet |
| `src/public/index.html` | deleted — superseded by rendering |
| `tests/grid.test.js` | new — the eight tests below |

---

## Test skeleton

`tests/grid.test.js`, run by `node --test`. Every test carries
`// @covers REQ-PHOTO-001@v1`.

```js
test('presents one tile for each stored Photo', ...)
  // seed 3 Photos; GET /; count tiles === 3

test('lays tiles out in rows and columns rather than one vertical list', ...)
  // the grid container carries the CSS grid class
  // gallery.css declares display:grid with more than one column track

test('shows all Photos in one collection with no gallery selector', ...)
  // seed 3; GET /; exactly one grid container in the markup
  // no control for choosing a collection or gallery is present

test('serves the home page without a sign-in prompt', ...)
  // GET / with no credentials → 200
  // markup contains no password field, no sign-in or log-in control

test('orders tiles by Upload date and time, most recent first', ...)
  // seed 3 Photos with distinct uploadedAt, inserted out of order
  // tile order in the markup === Photos sorted by uploadedAt descending
  // seed one whose capturedAt contradicts its uploadedAt; order follows uploadedAt

test('renders a bounded subset when more Photos are held than fit a screen', ...)
  // seed well beyond the page size; GET /
  // tiles rendered === page size, not the total
  // markup offers a route to the remainder

test('shows an empty state with the upload control when no Photo is held', ...)
  // seed none; GET / → 200
  // markup contains the invitation text and the "+ Upload Photo" control
  // no grid container and no tiles

test('does not present a tile for a Photo that has been removed', ...)
  // seed 3, remove 1 from the source; GET /
  // tiles === 2, and the removed Photo's id appears nowhere in the markup
```

Eight tests, eight criteria, one each.

---

## Decisions this forces

1. **Server-side rendering, not a JSON API with a client-side fetch.** This is
   the consequential one. Slice 5 (`REQ-PHOTO-008`) requires a newly uploaded
   Photo to appear *without a page reload*, which needs client-side JavaScript
   and something for it to call. Committing to server-side rendering now means
   slice 5 either adds a JSON route beside the rendered page, or reverses this.
   Worth an ADR before the code, not after.
2. **The page size for the bounded first render.** The client said "pagination or
   incremental loading" and named no number. The constant is ours to choose and
   should be recorded as ours.
3. **Pagination or incremental loading** — the client permitted either, so this
   is a real choice, and criterion 6's "route to the remainder" takes a different
   shape depending on it.
4. **The `src/photos.js` interface.** Slice 4 replaces its backing with the store.
   Whatever shape is agreed here is the shape slice 4 must satisfy, so it is a
   decision about slice 4 made in slice 2.
5. **A test-only seeding seam in production code.** Justified by the slice order,
   but it is still a seam, and it should be removed or made real in slice 4.

---

## What I am unsure about

- **Criterion 7 requires the "+ Upload Photo" control, which `REQ-PHOTO-003`
  owns in slice 3.** The empty state cannot satisfy its own criterion without
  rendering a control another requirement is responsible for. I plan to render it
  **inert** here — present in the markup, doing nothing — and let slice 3 give it
  behaviour. That means for one slice the home page shows a button that does
  nothing when clicked, which is worth knowing before it is demonstrated.
- **Criterion 2 cannot be fully verified without a browser.** The tests assert the
  stylesheet declares a multi-column CSS grid and that the markup uses it. They
  cannot assert what a browser computed. Real verification is visual, and belongs
  to a person or to an E2E run the project does not have yet.
- **No HTML parser is available.** `REQ-PHOTO-015` forbids a dependency that the
  standard library makes unnecessary, so the tests assert against markup with
  string and regular-expression matching. That is more brittle than a DOM query
  and will need care when the markup changes.
- **Criterion 8 says "has been removed" but no requirement describes removal.**
  This is the delete gap from answer 17 that still has no requirement. I read the
  criterion narrowly — the page reflects the Photos currently held — which is
  testable without a delete feature existing. If KCB meant something stronger,
  this test is not it.
- **Tiles will 404 on their images for two slices.** Nothing in `REQ-PHOTO-001`
  requires the bytes to load, but anyone opening the page before slice 5 will see
  empty tiles.

---

## Waiting for approval

**No code has been written.** Approve, correct, or reject the approach —
particularly decision 1, which shapes slice 5. `/tdd REQ-PHOTO-001` comes after
that.
