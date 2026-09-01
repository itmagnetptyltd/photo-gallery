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
> **22 further questions, numbered 29 to 50, and all of them are open.** They are
> recorded in the dated section at the foot of this file, and each appears in the
> `ambiguities` list of every requirement it blocks. The two views have not
> diverged; they are simply no longer empty.

---


## Open questions

_(none — all 28 answered Sep-01-2026, see `ANSWERS.md`)_

New questions are appended here as they arise. A question that arises against an
`agreed` requirement is a scope matter, not an ambiguity: use `/find-variation`
and, if it is a variation, `/change-record`.

---

# Open questions — second brief of Sep-01-2026

Raised against the feedback received **Sep-01-2026 from KCB on the first
delivery** (verbatim in `BRIEF.md`, "Second brief"), captured as `FB-0001` and
scoped by `CHG-0001`. The whole of that brief is quoted once here so every
question below can be located in it:

> "The gallery works but looks amateur. It needs to look professional: a proper
> type and spacing scale, an app bar with the product name, styled buttons with
> hover and focus states, tiles with rounded corners and a hover state, a
> designed empty state, styled lightbox chrome, and a visible focus ring on
> every interactive element."

No mockup, no reference site, no palette, no typeface, no sizes and no radius
accompanied it. **Every one of those is a question below, not a gap for the
delivery team to fill.** FB-0001 records what happened the last time an aesthetic
word was turned into structural criteria without the client being asked; these 22
questions exist so that does not happen twice.

Questions 43 and 44 are different in kind from the rest: they report that an ask
in the brief **appears already delivered**, and ask the client what more they
want rather than proposing to build it again.

---

## 29. Who judges "professional", and against what?

- **Blocks:** REQ-PHOTO-016
- **The brief says:** "The gallery works but looks amateur. It needs to look
  professional" (BRIEF.md, second brief, Sep-01-2026).
- **Which could mean:**
  - (a) The client has a standard in mind — a site, a product or a screenshot
    they consider professional — and the Gallery is to be judged against it.
  - (b) The delivery team exercises its own judgement and the client accepts or
    rejects the result at a demo, which is exactly the arrangement answer 23 of
    the first brief set up.
- **Question for the client:** Is there a website, product or screenshot you
  consider professional that we should be judged against, or do you want to judge
  the result yourself at a demo?
- **Why it cannot be closed by choosing:** Reading (b) is what produced FB-0001.
  Choosing it again would recreate the identical failure, at our cost or yours
  depending on a commercial decision that has not been made.
- **Why it matters:** (a) makes the work estimable and gives one acceptance
  event. (b) makes it open-ended: every review can ask for more, and CHG-0001
  records that no estimate can be given until this is settled.

## 30. Who supplies the design values — you or us?

- **Blocks:** REQ-PHOTO-016, REQ-PHOTO-017, REQ-PHOTO-018, REQ-PHOTO-019,
  REQ-PHOTO-020, REQ-PHOTO-021, REQ-PHOTO-022, REQ-PHOTO-023, REQ-PHOTO-024
- **The brief says:** "a proper type and spacing scale ... styled buttons ...
  tiles with rounded corners" (BRIEF.md, second brief, Sep-01-2026).
- **Which could mean:**
  - (a) You will give us the palette, typeface, text sizes, spacing steps and
    corner radius, and we apply exactly those.
  - (b) We choose them and you review the result.
- **Question for the client:** Will you send us the colours, typeface, sizes,
  spacing and corner radius to use, or should we propose a set for you to
  approve before we build?
- **Why it cannot be closed by choosing:** Every value is absent from the brief.
  Any number we pick is our taste presented as your requirement, and the record
  would show it as agreed when it never was.
- **Why it matters:** This is the difference between one round of work and an
  unbounded number. Nine of the nine new requirements are unbuildable until it is
  answered, because each one refers to a defined value that does not yet exist.

## 31. Is there a palette, and is it light or dark?

- **Blocks:** REQ-PHOTO-016, REQ-PHOTO-019, REQ-PHOTO-020, REQ-PHOTO-024
- **The brief says:** "It needs to look professional ... styled buttons ...
  styled lightbox chrome" (BRIEF.md, second brief, Sep-01-2026).
- **Which could mean:**
  - (a) There is a brand or product palette the Gallery must use.
  - (b) There is none, and any coherent set of colours is acceptable.
  - (c) Both a light and a dark appearance are wanted, switched by the person or
    by their operating system.
- **Question for the client:** Do you have brand colours we must use, and do you
  want a light appearance, a dark one, or both?
- **Why it cannot be closed by choosing:** "Styled" names no colour at all, and
  colour is the first thing anyone reacts to at a demo.
- **Why it matters:** (c) roughly doubles the styling surface and means every
  later colour decision must be made twice. Retrofitting it after (a) or (b) is
  built means revisiting every styled element.

## 32. Which typeface, and may it be fetched over the network?

- **Blocks:** REQ-PHOTO-017
- **The brief says:** "a proper type and spacing scale" (BRIEF.md, second brief,
  Sep-01-2026).
- **Which could mean:**
  - (a) A named typeface must be used, shipped with the application as a font
    file.
  - (b) A named typeface must be used, loaded from a font service at run time.
  - (c) Whatever typefaces the person's own computer already has are acceptable.
- **Question for the client:** Is there a typeface the Gallery must use, and are
  you content for it to be downloaded from the internet each time the page opens?
- **Why it cannot be closed by choosing:** No typeface is named, and the brief
  says nothing about where one would come from.
- **Why it matters:** (b) makes a locally-run application depend on an internet
  connection and an external service, which sits against REQ-PHOTO-014@v1
  ("no ... cloud service required") and adds a dependency of a purpose
  REQ-PHOTO-015@v1 does not list. Either would need those verified requirements
  revisited through `/change-record`.

## 33. What is "the product name"?

- **Blocks:** REQ-PHOTO-019
- **The brief says:** "an app bar with the product name" (BRIEF.md, second
  brief, Sep-01-2026).
- **Which could mean:**
  - (a) The name is "Photo Gallery", the words already on the page.
  - (b) The product has a real name, not yet told to us, that should appear
    instead.
- **Question for the client:** What exactly should the app bar say — is "Photo
  Gallery" the product's name, or does it have another one?
- **Why it cannot be closed by choosing:** `.brain/glossary.md` settled on
  Sep-01-2026 that the Gallery "is never referred to by name or id". The brief
  now asks for a name in the interface, which the agreed vocabulary says does not
  exist. That contradiction is yours to resolve, not ours.
- **Why it matters:** The name is the single most visible piece of text in the
  application and appears on every view. Getting it wrong is visible to everyone
  who ever opens it, and it may also mean the glossary entry for Gallery needs
  amending.

## 34. Where does the app bar sit, and what does it do when the page scrolls?

- **Blocks:** REQ-PHOTO-019
- **The brief says:** "an app bar with the product name" (BRIEF.md, second
  brief, Sep-01-2026).
- **Which could mean:**
  - (a) It sits at the top of the page and scrolls away with the content.
  - (b) It stays fixed at the top and the Grid scrolls underneath it.
- **Question for the client:** When someone scrolls down a long Grid, should the
  bar with the product name stay on screen or scroll away?
- **Why it cannot be closed by choosing:** The brief describes the bar's contents
  and nothing else about it.
- **Why it matters:** (b) permanently removes a strip of the viewport from the
  Grid and must be accounted for by every view, including the Larger view. It is
  not a value that can be flipped later without re-checking the layout against
  REQ-PHOTO-011@v1.

## 35. Does the "+ Upload Photo" control move into the app bar?

- **Blocks:** REQ-PHOTO-019
- **The brief says:** "an app bar with the product name" (BRIEF.md, second
  brief, Sep-01-2026).
- **Which could mean:**
  - (a) The app bar carries only the product name, and the "+ Upload Photo"
    control stays where it is today, above the Grid.
  - (b) The "+ Upload Photo" control belongs in the app bar, as is common in
    applications with one.
- **Question for the client:** Should the "+ Upload Photo" button move up into
  the new bar, or stay where it is above the photos?
- **Why it cannot be closed by choosing:** The brief lists only the product name
  as the bar's content, but does not say the bar carries nothing else.
- **Why it matters:** REQ-PHOTO-003@v1 and REQ-PHOTO-011@v1 criterion 2 are
  `verified` and describe where that control is. Moving it changes what those
  agreed requirements say, which is a version bump and a `/change-record`, not a
  styling change.

## 36. Is the app bar in front of the Larger view, or behind it?

- **Blocks:** REQ-PHOTO-019, REQ-PHOTO-024
- **The brief says:** "an app bar with the product name ... styled lightbox
  chrome" (BRIEF.md, second brief, Sep-01-2026).
- **Which could mean:**
  - (a) When a Photo is open in the Larger view, the app bar is covered by the
    overlay, so the Photo has the whole viewport.
  - (b) The app bar stays visible in front of the overlay.
- **Question for the client:** When a photo is opened full size, should the bar
  with the product name still be visible on top of it?
- **Why it cannot be closed by choosing:** The brief treats the app bar and the
  Larger view as two separate asks and never relates them.
- **Why it matters:** (b) reduces the space available to the Original, which
  REQ-PHOTO-009@v1 requires to be "sized to fit within the available viewport",
  and puts the app bar and the close control in the same region of the screen.

## 37. What changes on hover, and what do touch and keyboard users get instead?

- **Blocks:** REQ-PHOTO-021, REQ-PHOTO-023
- **The brief says:** "styled buttons with hover and focus states, tiles with
  rounded corners and a hover state" (BRIEF.md, second brief, Sep-01-2026).
- **Which could mean:**
  - (a) A small change of appearance only — the element looks slightly different
    while the pointer is over it.
  - (b) A more substantial change that reveals something not otherwise shown,
    such as an action or a label.
- **Question for the client:** When someone points at a button or a photo, what
  should change — just its appearance, or should something new appear?
- **Why it cannot be closed by choosing:** "A hover state" names the trigger and
  not the effect.
- **Why it matters:** Hover does not exist on a touch screen and does not exist
  for someone using the keyboard alone. Under (b) those people lose whatever the
  hover reveals, which means a second design for them; under (a) they lose
  nothing. The two have very different costs and different accessibility
  consequences.

## 38. May a tile's hover state show text?

- **Blocks:** REQ-PHOTO-023
- **The brief says:** "tiles with rounded corners and a hover state" (BRIEF.md,
  second brief, Sep-01-2026).
- **Which could mean:**
  - (a) The tile changes appearance only, and still shows the image alone.
  - (b) Hovering reveals text over the image, such as a filename, a date or a
    caption.
- **Question for the client:** When someone points at a photo, may words appear
  over it — a filename or a date — or should it stay just the picture?
- **Why it cannot be closed by choosing:** The brief says "a hover state" and
  stops there.
- **Why it matters:** REQ-PHOTO-002@v1 criterion 5 is `verified` and requires the
  tile to present "the image alone, with no filename, size, date or other
  metadata text", and `tests/tiles.test.js` asserts a tile carries no text at
  all. Reading (b) contradicts an agreed, tested requirement and would need
  REQ-PHOTO-002 versioned through `/change-record`.

## 39. Which elements have rounded corners besides the tiles?

- **Blocks:** REQ-PHOTO-020, REQ-PHOTO-022, REQ-PHOTO-024
- **The brief says:** "tiles with rounded corners" (BRIEF.md, second brief,
  Sep-01-2026).
- **Which could mean:**
  - (a) Only the Photo tiles are rounded; buttons, the upload modal, the app bar
    and the Larger view keep square corners.
  - (b) Rounding is a property of the whole design and applies to the buttons,
    the modal and the Larger view too, with the tiles named only as an example.
- **Question for the client:** Should the rounded corners apply only to the
  photos, or to the buttons and the popup as well?
- **Why it cannot be closed by choosing:** Only tiles are named, but the brief is
  a list of examples rather than an exhaustive specification.
- **Why it matters:** Under (b) the radius becomes a shared value used in a dozen
  places, and changing it later changes them all together; under (a) it is one
  local value. Deciding afterwards means revisiting every styled element.

## 40. Is "lightbox" the Larger view, and what is its "chrome"?

- **Blocks:** REQ-PHOTO-024
- **The brief says:** "styled lightbox chrome" (BRIEF.md, second brief,
  Sep-01-2026).
- **Which could mean:**
  - (a) "Lightbox" is the Larger view, and "chrome" is its close, previous and
    next controls.
  - (b) "Chrome" also covers the darkened backdrop behind the Original, and
    perhaps a frame or surface around the Photo itself.
- **Question for the client:** By "lightbox chrome" do you mean the close, back
  and forward buttons, or also the dark background behind the photo?
- **Why it cannot be closed by choosing:** Neither "lightbox" nor "chrome"
  appears in `.brain/glossary.md`, which fixes the agreed word for this as
  **Larger view**. REQ-PHOTO-024 has been written on reading (a) and says so in
  its `source`; that reading is our assumption declared as a question, not an
  answer.
- **Why it matters:** The backdrop determines how the Photo itself reads, and it
  is the largest coloured area in the application. If it is in scope, it is part
  of the palette question; if not, it stays as delivered.

## 41. Must the Larger view's controls stay legible over any Photo?

- **Blocks:** REQ-PHOTO-024
- **The brief says:** "styled lightbox chrome" (BRIEF.md, second brief,
  Sep-01-2026).
- **Which could mean:**
  - (a) The controls are simply styled, and a very light or busy Photo behind one
    is accepted.
  - (b) The controls must remain clearly visible whatever Photo is open, which
    requires them to sit on their own surface or otherwise be separated from the
    image.
- **Question for the client:** If someone opens a very light photo, must the
  close button still be clearly visible against it?
- **Why it cannot be closed by choosing:** The Original's content is unbounded —
  any pixel behind a control may be any colour — and the brief sets no standard.
- **Why it matters:** (b) is a testable rule only if you name the standard it is
  measured against, such as a minimum contrast level. Without one, "clearly
  visible" is another word like "professional" that no test can check and that
  can be reopened at every review.

## 42. Is the upload modal part of this restyle?

- **Blocks:** REQ-PHOTO-016, REQ-PHOTO-020
- **The brief says:** the second brief lists "an app bar ... styled buttons ...
  tiles ... a designed empty state, styled lightbox chrome" and does not mention
  the upload popup (BRIEF.md, second brief, Sep-01-2026).
- **Which could mean:**
  - (a) The list is exhaustive and the upload modal is out of scope for now.
  - (b) The list is illustrative, and the modal is expected to be restyled with
    everything else because it is part of the same application.
- **Question for the client:** Should the upload popup be restyled too, or is it
  outside what you are asking for at this point?
- **Why it cannot be closed by choosing:** The modal is one of only four views in
  the application, and its omission from the list is as likely to be an oversight
  as a decision.
- **Why it matters:** It changes the size of the work and, more importantly, what
  is shown at the review under question 29. A modal left as it is, next to a
  restyled home page, will read as unfinished.

## 43. The focus ring already ships — what more do you want?

- **Blocks:** REQ-PHOTO-016, REQ-PHOTO-021
- **The brief says:** "styled buttons with hover and focus states ... and a
  visible focus ring on every interactive element" (BRIEF.md, second brief,
  Sep-01-2026).
- **What is already delivered:** a `:focus-visible` outline ships today, and
  `tests/responsive.test.js` asserts under `REQ-PHOTO-011@v1` that the rule
  exists and does not remove the outline. REQ-PHOTO-011@v1 criterion 4 requires
  every control to be reachable and activatable from the keyboard, and is
  `verified`.
- **Which could mean:**
  - (a) The ask is already met, and it was listed because the client could not
    tell from looking whether it was there.
  - (b) The ring that ships is not visible enough, or not present on some
    element, and something specific is wanted instead.
  - (c) The client wants the ring to become an agreed criterion in its own right,
    so that it is protected rather than merely present — today no criterion
    requires a *visible* indicator, only keyboard reach.
- **Question for the client:** A focus outline is already in the delivered
  application — can you tell us what is missing or wrong with it, or is this
  point already satisfied?
- **Why it cannot be closed by choosing:** No new requirement has been written
  for this, deliberately. Writing one would duplicate a `verified` requirement
  and fork the record.
- **Why it matters:** Under (c) the fix is a version bump of REQ-PHOTO-011 —
  a `/change-record` action, not a decomposition one — which supersedes five
  `@v1` test annotations in `tests/responsive.test.js`, as CHG-0001 sets out.
  Under (a) there is no work at all.

## 44. The empty state already exists — what does "designed" add?

- **Blocks:** REQ-PHOTO-016
- **The brief says:** "a designed empty state" (BRIEF.md, second brief,
  Sep-01-2026).
- **What is already delivered:** REQ-PHOTO-001@v1 criterion 7 is `verified` and
  requires that, when no Photo is held, "an empty-state message inviting the
  person to upload a Photo is displayed, together with the '+ Upload Photo'
  control".
- **Which could mean:**
  - (a) The empty state is only to be restyled with the rest of the application —
    the same words, the same control, the new type, spacing and button
    treatment — and nothing about it changes structurally.
  - (b) Something is to be added to it that is not there now, such as an
    illustration, a heading, or different wording.
- **Question for the client:** The empty screen already invites you to upload and
  shows the upload button — what would you like it to say or show that it does
  not today?
- **Why it cannot be closed by choosing:** No new requirement has been written
  for this, deliberately, because under reading (a) it is fully covered by
  REQ-PHOTO-001@v1 plus REQ-PHOTO-017, REQ-PHOTO-018 and REQ-PHOTO-020.
- **Why it matters:** Under (b) new content is needed — wording you have to
  supply, and possibly an image asset that would be the first non-Photo image in
  the application — and REQ-PHOTO-001 may need versioning through
  `/change-record`, which touches a `verified` requirement three others depend
  on.

## 45. Does "professional" extend to small screens?

- **Blocks:** REQ-PHOTO-016, REQ-PHOTO-019
- **The brief says:** "It needs to look professional" (BRIEF.md, second brief,
  Sep-01-2026).
- **Which could mean:**
  - (a) It applies at the desktop widths the first brief scoped — REQ-PHOTO-011's
    criteria all say "a common desktop viewport width" — and phones are not
    considered.
  - (b) It applies everywhere the application can be opened, including a phone.
- **Question for the client:** Will you be looking at this on a phone as well as
  a computer, and must it look right there too?
- **Why it cannot be closed by choosing:** The first brief said "responsive", and
  the answers of Sep-01-2026 scoped acceptance to desktop widths. The second
  brief says neither.
- **Why it matters:** (b) means the app bar, the type scale, the spacing scale
  and the Larger view each need a second layout, and it makes hover — question
  37 — largely irrelevant on the very device being judged.

## 46. Does this include how tiles crop photos, and blurry small photos?

- **Blocks:** REQ-PHOTO-016, REQ-PHOTO-022
- **The brief says:** "The gallery works but looks amateur ... tiles with rounded
  corners and a hover state" (BRIEF.md, second brief, Sep-01-2026).
- **Which could mean:**
  - (a) The ask is presentation only — corners and hover — and how much of a
    Photo a square tile crops is unchanged.
  - (b) The "amateur" judgement includes the uneven crops FB-0001 describes, and
    the softness of Photos smaller than their tile, and both are expected to be
    fixed as part of looking professional.
- **Question for the client:** Part of what looks wrong may be that tall or wide
  photos are cropped hard to fit square tiles, and small photos are stretched —
  do you want those changed too?
- **Why it cannot be closed by choosing:** FB-0001 records the crop observation
  as **escalate**, expressly not settled, because the record cannot tell a defect
  from a variation here. That classification decides who pays, and it is a human
  and commercial call.
- **Why it matters:** (b) changes the Grid's geometry and possibly how Renditions
  are generated, which reaches REQ-PHOTO-002@v1 and REQ-PHOTO-006@v1 — both
  `verified` — and is a substantially larger piece of work than styling.

## 47. How is any of this to be checked, given nothing has ever been rendered?

- **Blocks:** REQ-PHOTO-016
- **The brief says:** "It needs to look professional" (BRIEF.md, second brief,
  Sep-01-2026).
- **Which could mean:**
  - (a) These requirements are checked by a person looking at the running
    application at an agreed review, and no automated test is expected.
  - (b) They are to be checked automatically, which means driving a real browser.
- **Question for the client:** Are you content for the look to be signed off by
  eye at a demo, or do you want automated checks that a real browser is producing
  the agreed result?
- **Why it cannot be closed by choosing:** FB-0001 states plainly that "no
  browser has rendered this application in any check, ever", because
  REQ-PHOTO-015@v1 — `verified` — admits dependencies only for the web server,
  SQLite access and thumbnail generation, and browser automation is none of
  those.
- **Why it matters:** (b) requires a new dependency of a purpose REQ-PHOTO-015@v1
  excludes, so it cannot be done without versioning that requirement through
  `/change-record`. (a) leaves every visual requirement here unverifiable by test
  and therefore unable to reach `verified` on the evidence rule in
  `requirements/README.md` — which is a fact about the record you should know
  before you choose it.

## 48. Does "scale" mean a written-down set of steps, or just consistency?

- **Blocks:** REQ-PHOTO-017, REQ-PHOTO-018
- **The brief says:** "a proper type and spacing scale" (BRIEF.md, second brief,
  Sep-01-2026).
- **Which could mean:**
  - (a) A finite, documented set of steps — a specific list of text sizes and a
    specific list of spacing values — that every element must be drawn from, and
    which anyone can read and check.
  - (b) Loosely, that sizes and spacing should look consistent, with no list
    written down anywhere.
- **Question for the client:** Do you want a written list of the exact text sizes
  and spacing values in use, which we can be held to, or just a result that looks
  consistent?
- **Why it cannot be closed by choosing:** "Proper" is doing all the work in that
  sentence and it is not defined.
- **Why it matters:** Only (a) can be checked by anything other than an opinion.
  REQ-PHOTO-017 and REQ-PHOTO-018 are written on reading (a) precisely because
  reading (b) yields no observable criterion at all — if you mean (b), those two
  requirements have no acceptance criteria and should say so.

## 49. May the spacing scale change the gap between tiles?

- **Blocks:** REQ-PHOTO-018
- **The brief says:** "a proper type and spacing scale" (BRIEF.md, second brief,
  Sep-01-2026).
- **Which could mean:**
  - (a) The Grid's existing single, uniform gap is one of the scale's steps and
    keeps its current value.
  - (b) The gap is re-set to whatever step the new scale dictates, changing the
    Grid's appearance and how many tiles fit a row.
- **Question for the client:** May the space between photos change, or should the
  Grid keep looking exactly as it does now?
- **Why it cannot be closed by choosing:** A scale that may not touch the largest
  repeated space in the application is barely a scale, but the current spacing is
  agreed behaviour.
- **Why it matters:** REQ-PHOTO-011@v1 criterion 3 is `verified` and requires
  uniform spacing between tiles, and `tests/responsive.test.js` pins a single
  `gap`. Reading (b) preserves uniformity but changes the value, which is a
  visible change to delivered, agreed behaviour and should be your call rather
  than a side effect of ours.

## 50. One button treatment, or several?

- **Blocks:** REQ-PHOTO-020, REQ-PHOTO-024
- **The brief says:** "styled buttons with hover and focus states" (BRIEF.md,
  second brief, Sep-01-2026).
- **Which could mean:**
  - (a) Every button in the application looks the same.
  - (b) There are named variants — for example a prominent one for "+ Upload
    Photo" and a quieter one for cancelling or closing — and each control is
    assigned to one.
- **Question for the client:** Should every button look the same, or should
  "+ Upload Photo" stand out more than, say, the cancel and close buttons?
- **Why it cannot be closed by choosing:** "Styled buttons" is plural and names
  no distinction, but the application has buttons of visibly different weight —
  an upload action, a submit, a cancel, a close, and previous and next.
- **Why it matters:** Under (b) each control must be assigned to a variant, and
  that assignment is a decision about what you want people to do — which is
  yours, not ours. Retrofitting variants after building one flat treatment means
  restyling every button a second time.
