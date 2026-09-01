# Ambiguities

Open questions arising from the client brief received **Sep-01-2026 from KCB by
email** (verbatim in `BRIEF.md`). Every question here is **open**. None may be
closed by the delivery team choosing a reading — only the client's answer closes
one, and until it is closed it blocks the requirements listed against it from
moving past `draft`.

This file and the `ambiguities` lists in `photo.yaml` are two views of one list.
If they diverge, one of them is wrong.

**A note on vocabulary.** The brief uses *photo*, *gallery*, *grid*, *thumbnail*,
*popup/modal*, *larger view*, *data store*, *home page* and *users*. Of these,
only *photo*, *gallery* and (indirectly) *thumbnail* correspond to anything in
`.brain/glossary.md`, and **no glossary term on this project has been agreed
yet** — every entry there is marked *proposed*. The requirements use the glossary
spellings (Photo, Upload, Original, Rendition, Gallery, Owner, Capture date,
Upload date) so that there is one word per concept, not because those words are
settled.

---

## 1. Does "gallery" mean the whole application, or one named collection of Photos inside it?

- **Affects:** REQ-PHOTO-001
- **The brief says:** "Create a simple and modern Photo Gallery application using
  Node.js. The home page should display all uploaded photos in a clean and
  attractive gallery/grid layout" — and later, "the new photo should be added to
  the gallery".
- **Which could mean:**
  - (a) "Gallery" is the product's name. There is exactly one collection, and
    "added to the gallery" means "added to the one and only set of Photos".
  - (b) "Gallery" is a collection within the product — the first of several the
    client eventually expects, with the home page showing one of them.
- **Why it cannot be decided here:** reading (b) puts a grouping between the
  person and their Photos and needs a name, a way of choosing one, and a rule for
  whether a Photo can be in two. Reading (a) has none of that. Retro-fitting (b)
  onto a store built for (a) means changing how every Photo is addressed and
  migrating the data already in it. `.brain/glossary.md` records this same
  question as its first open item, and every other term depends on it.

## 2. Is there any concept of an Owner or of signing in at all, or is every Photo visible to anyone who can reach the application?

- **Affects:** REQ-PHOTO-001, REQ-PHOTO-003, REQ-PHOTO-006, REQ-PHOTO-009,
  REQ-PHOTO-012
- **The brief says:** "where **users** can choose an image from their computer and
  upload it" and "so **the user** can see it properly". The brief never mentions
  accounts, sign-in, permissions, privacy or ownership anywhere.
- **Which could mean:**
  - (a) "User" is a figure of speech for whoever is sitting at the PC. There are
    no accounts; anyone who can open the page sees and uploads everything.
  - (b) There are distinct people, each seeing their own Photos, which requires
    identity, sign-in and a rule about who may see whose Photos.
- **Why it cannot be decided here:** this is a security boundary, and it is the
  single most expensive thing on this list to add later. Under (b) every read and
  every Upload must be attributed and checked, the store gains an Owner on every
  Photo, and existing Photos must be assigned to someone during migration. Under
  (a) none of that exists. Building (a) and being told later it was (b) means the
  Photos already uploaded have no defensible owner.

## 3. Is the application only ever used by one person on one PC, or must it serve several people at the same time?

- **Affects:** REQ-PHOTO-008, REQ-PHOTO-014
- **The brief says:** "easy to run on a local development PC", but also "where
  **users** can choose an image from their computer".
- **Which could mean:**
  - (a) One person, one machine, one browser tab. Concurrency never arises.
  - (b) A machine on a local network that several people reach from their own
    computers, so two Uploads can be in flight at once.
- **Why it cannot be decided here:** (b) makes concurrent writes to the store,
  simultaneous Uploads of the same filename, and one person's grid going stale
  into real cases that must be specified and tested. (a) makes all of them
  impossible. This also changes the answer to question 18.

## 4. Does "photo" cover still images only, and which file formats must be accepted?

- **Affects:** REQ-PHOTO-002, REQ-PHOTO-005, REQ-PHOTO-006
- **The brief says:** "users can choose an **image** from their computer and upload
  it". No format, and no mention of video.
- **Which could mean:**
  - (a) Ordinary web still formats only — JPEG and PNG.
  - (b) Anything a camera or phone produces, including HEIC and RAW, which no
    browser displays without conversion.
  - (c) Also animated GIF, or video, in which case "thumbnail", "larger view" and
    the word "Photo" itself all mean something different.
- **Why it cannot be decided here:** each additional format is a different
  acceptance rule and, for HEIC and RAW, a conversion step with its own failure
  mode. A person whose phone produces HEIC will consider an application that
  rejects their photographs broken, and will say so after delivery, not before.
  `.brain/glossary.md` records the video half of this question separately.

## 5. What is the largest file a person may upload, and what must they see when they exceed it?

- **Affects:** REQ-PHOTO-005, REQ-PHOTO-006, REQ-PHOTO-007
- **The brief says:** "choose an image from their computer and upload it". No size
  is mentioned.
- **Which could mean:**
  - (a) There is a stated limit, refused clearly before the file is sent.
  - (b) There is no limit, and a 200 MB file is a legitimate Upload the interface
    must cope with, including showing progress.
- **Why it cannot be decided here:** an unstated limit becomes an accidental one —
  whatever the first component in the path happens to enforce — and surfaces to
  the person as an unexplained failure. It also decides whether Upload progress
  and resumption are in scope at all.

## 6. What must happen when a person chooses a file that is not an accepted image, and must that be detected before the file is transferred?

- **Affects:** REQ-PHOTO-005, REQ-PHOTO-006, REQ-PHOTO-007
- **The brief says:** "choose an image from their computer and upload it".
- **Which could mean:**
  - (a) The file chooser only offers image files, and nothing further is checked.
  - (b) The file is checked on arrival by its actual content, and a file merely
    named `.jpg` is refused.
  - (c) Both, with a visible message naming the reason.
- **Why it cannot be decided here:** (a) alone means any file at all can be stored
  and served back to a browser by an application that claims it holds images —
  which is a security question, not a validation preference. (a) and (b) also
  fail at different moments, so the person sees a different thing in each.

## 7. May more than one Photo be uploaded in a single use of the modal?

- **Affects:** REQ-PHOTO-005, REQ-PHOTO-006
- **The brief says:** "opens a popup/modal where users can choose **an image** from
  their computer and upload it" — singular — and "**the new photo** should be added
  to the gallery" — also singular.
- **Which could mean:**
  - (a) Exactly one file per use of the modal.
  - (b) The singular is loose phrasing and selecting several files at once is
    expected, as most people expect of an upload dialog.
- **Why it cannot be decided here:** (b) changes what the modal shows during the
  Upload, what "the Upload failed" means when three of five succeeded, and what
  appears in the grid afterwards. It is the difference between one result and a
  per-file result list.

## 8. May an Upload in progress be cancelled, and what must happen if the modal is closed before the Upload completes?

- **Affects:** REQ-PHOTO-004, REQ-PHOTO-006, REQ-PHOTO-007
- **The brief says:** "a button on the home page that opens a popup/modal where
  users can choose an image from their computer and upload it". Nothing about
  closing it.
- **Which could mean:**
  - (a) Closing the modal abandons the Upload, and no Photo is created.
  - (b) Closing the modal is only closing a window; the Upload continues and the
    Photo appears when it finishes.
  - (c) The modal cannot be closed while an Upload is running.
- **Why it cannot be decided here:** (a) and (b) leave the store in different
  states after the identical action, and (a) requires a rule for cleaning up a
  half-written file. A person who closes the modal and finds the Photo there
  anyway — or doesn't — will regard whichever they did not expect as a defect.

## 9. What must the person see when an Upload fails part-way, and must a failed Upload leave nothing behind?

- **Affects:** REQ-PHOTO-006, REQ-PHOTO-007
- **The brief says:** "After uploading, the new photo should be added to the
  gallery and immediately displayed in the grid." The brief describes only the
  successful path; it says nothing about failure.
- **Which could mean:**
  - (a) Any failure leaves nothing at all — no record, no partial file — and the
    person is told in the modal so they can retry.
  - (b) A partially received file is kept and shown, possibly as a truncated
    image.
  - (c) The failure is silent and the person discovers it by not seeing the
    Photo.
- **Why it cannot be decided here:** (a) requires the write to be all-or-nothing,
  which is a property of the store and cannot be bolted on afterwards. This is
  the requirement whose source is weakest — REQ-PHOTO-007 exists because the
  failure path is unavoidable, not because the client described it, and it should
  be reviewed with them explicitly.

## 10. Are two Uploads of the same image file two Photos or one?

- **Affects:** REQ-PHOTO-006
- **The brief says:** "After uploading, the new photo should be added to the
  gallery".
- **Which could mean:**
  - (a) Every Upload creates a Photo. Uploading the same file twice gives two
    tiles in the grid.
  - (b) The same image is recognised and either refused or shown once.
- **Why it cannot be decided here:** (b) requires content comparison on every
  Upload and a decision about what the person is told when their Upload is
  quietly discarded. `.brain/glossary.md` proposes (a) but explicitly marks it
  unconfirmed, and it cannot be changed later without deciding what to do with
  the duplicates already stored.

## 11. Must the Original be retained unchanged after Upload, and must anyone be able to retrieve it?

- **Affects:** REQ-PHOTO-006, REQ-PHOTO-009, REQ-PHOTO-012
- **The brief says:** "with each photo shown as a thumbnail" and "Clicking any
  photo should open it in a larger view so the user can see it properly".
- **Which could mean:**
  - (a) The bytes as uploaded are kept forever, untouched, and can be downloaded.
  - (b) The system keeps only what it needs to display — a web-sized version —
    and the Original is discarded after processing.
  - (c) The Original is kept but never offered to the person.
- **Why it cannot be decided here:** (b) is irreversible. If the client later
  wants the full-resolution photograph — to print, to export, to move to another
  system — it no longer exists for anything already uploaded. It also decides how
  much storage the client needs, which connects to question 25.

## 12. Is the thumbnail a separate smaller Rendition produced by the system, or the Original delivered whole and shown at a reduced size?

- **Affects:** REQ-PHOTO-002
- **The brief says:** "with each photo shown as a thumbnail".
- **Which could mean:**
  - (a) The system generates a small file per Photo and the grid loads those.
  - (b) The grid loads the uploaded file and displays it small.
- **Why it cannot be decided here:** under (b) a page of 40 phone photographs
  transfers hundreds of megabytes to draw a grid of small squares — visibly slow
  on the first load, and worse on a phone. Under (a) there is a generated file per
  Photo, which must be created on Upload, stored, and regenerated if it is ever
  lost. The client's "avoid unnecessary dependencies" pulls one way here and their
  "responsive" pulls the other, which is exactly why they should choose.

## 13. What information about a Photo, if any, must be shown beside it in the grid or in the larger view?

- **Affects:** REQ-PHOTO-002, REQ-PHOTO-006, REQ-PHOTO-009
- **The brief says:** "each photo shown as a thumbnail" and "open it in a larger
  view so the user can see it properly". No caption, title, date or filename is
  mentioned.
- **Which could mean:**
  - (a) Images only. Nothing else is stored or shown.
  - (b) The filename is shown, which means it must be kept.
  - (c) Capture date, dimensions or a caption are shown, which means metadata must
    be read from the file at Upload — or typed by the person, which adds a field
    to the modal.
- **Why it cannot be decided here:** (c) adds fields to what is stored, and
  metadata not captured at Upload cannot be recovered later for Photos already
  uploaded. It also decides whether the modal has one control or several. Note
  that `.brain/glossary.md` defines a Photo as the image *together with the
  metadata captured with it*, without saying what that metadata is.

## 14. In what order must Photos appear in the grid, and when the client says "date" do they mean Capture date or Upload date?

- **Affects:** REQ-PHOTO-001, REQ-PHOTO-008
- **The brief says:** "The home page should display all uploaded photos in a clean
  and attractive gallery/grid layout". No order is given.
- **Which could mean:**
  - (a) Newest Upload first, so a new Photo appears at the top-left.
  - (b) Oldest first, so a new Photo appears at the end and may be off-screen.
  - (c) By Capture date from the file's own metadata, which routinely differs from
    Upload date and is missing entirely from some files.
- **Why it cannot be decided here:** the order decides where a newly uploaded
  Photo lands, and therefore whether "immediately displayed in the grid" is
  visible to the person at all. (c) additionally requires a rule for files with no
  capture metadata. `.brain/glossary.md` records the Capture-date-versus-Upload-
  date question in its own list.

## 15. What must happen when there are more Photos than fit on one screen — does "all uploaded photos" still mean all of them at 10,000?

- **Affects:** REQ-PHOTO-001, REQ-PHOTO-002
- **The brief says:** "The home page should display **all** uploaded photos".
- **Which could mean:**
  - (a) Literally all of them on one page, however many there are.
  - (b) A first page-worth, with more loaded as the person scrolls or pages.
  - (c) "All" was written imagining a few dozen, and the client has no view on
    thousands because they have not pictured it.
- **Why it cannot be decided here:** (a) at 10,000 Photos is an unusable page and
  the failure appears only once real volumes exist, typically after acceptance.
  (b) changes the shape of how Photos are requested, which is not a change that
  can be made quietly later. The client is the only one who knows how many
  photographs they actually have.

## 16. What must the home page show when no Photo has been uploaded yet?

- **Affects:** REQ-PHOTO-001
- **The brief says:** "The home page should display all uploaded photos in a clean
  and attractive gallery/grid layout". The empty case is not mentioned.
- **Which could mean:**
  - (a) An empty grid with the "+ Upload Photo" control and nothing else.
  - (b) A message telling the person there is nothing yet and inviting them to
    upload.
  - (c) An error or blank page, which is what will happen if nobody specifies it.
- **Why it cannot be decided here:** this is the very first thing the client will
  see when they open the delivered application, before they have uploaded
  anything. It is also the state most likely to be judged against "clean and
  user-friendly" — see question 23.

## 17. Must an existing Photo ever be removed or renamed by anyone, and if it is removed, is it recoverable?

- **Affects:** REQ-PHOTO-001, REQ-PHOTO-012
- **The brief says:** nothing. The brief describes uploading and viewing only:
  "the new photo should be added to the gallery" and "Clicking any photo should
  open it in a larger view". Removal is never mentioned.
- **Which could mean:**
  - (a) Photos are never removed. The Gallery only grows.
  - (b) Removal is expected and was simply not written down, in which case: who
    may remove, and is a removed Photo gone or recoverable?
- **Why it cannot be decided here:** (b) is a scope addition, not a detail — it
  needs a control, a confirmation, a rule about who may do it, and, if recovery is
  wanted, a "removed" state carried by every Photo from the first day. Adding that
  state after Photos exist is a migration. `.brain/glossary.md` records the
  removed-or-recoverable half of this question in its own list.

## 18. Does "immediately displayed" apply only to the person who uploaded the Photo, or must an already-open grid belonging to someone else update too?

- **Affects:** REQ-PHOTO-008
- **The brief says:** "After uploading, the new photo should be added to the
  gallery and **immediately displayed** in the grid."
- **Which could mean:**
  - (a) The uploader's own page shows the new Photo without being reloaded.
    Anyone else sees it next time they load the page.
  - (b) Every open grid updates, wherever it is, which requires the server to push
    changes to browsers that did nothing.
- **Why it cannot be decided here:** (b) is a live-updating application and a
  materially different thing to build and test from (a). The answer also depends
  on question 3 — if only one person ever uses it, (b) is meaningless.

## 19. What does "a larger view" mean — an overlay on the home page or a separate page — and at what resolution is the Photo shown?

- **Affects:** REQ-PHOTO-009, REQ-PHOTO-010
- **The brief says:** "Clicking any photo should open it in a larger view so the
  user can see it properly."
- **Which could mean:**
  - (a) An overlay above the dimmed grid, dismissed to return to exactly where the
    person was.
  - (b) A page of its own with its own address, which can be linked to, bookmarked
    and shared, and which the browser's back button leaves.
  - (c) The image opened at full resolution, which may be far larger than the
    screen and need panning and zooming.
- **Why it cannot be decided here:** (b) gives every Photo an address of its own,
  which interacts directly with question 2 — an addressable Photo is one that can
  be reached without going through the grid. "Properly" in the client's sentence
  is doing a great deal of work and means nothing checkable on its own.

## 20. Must the larger view offer navigation to the next and previous Photo, and how must it be dismissed?

- **Affects:** REQ-PHOTO-009, REQ-PHOTO-010
- **The brief says:** "Clicking any photo should open it in a larger view so the
  user can see it properly." Nothing about moving between Photos, and nothing
  about closing.
- **Which could mean:**
  - (a) One Photo at a time; the person closes it and clicks another.
  - (b) Next/previous controls, so the larger view is a way of browsing the whole
    Gallery rather than one image — which then needs the same ordering answer as
    question 14, and a rule for the first and last Photo.
- **Why it cannot be decided here:** (b) is how most people expect a photo viewer
  to behave and its absence will be reported as a defect; its presence is
  additional scope the client has not asked for and has not been priced. The
  dismissal method (a close control, the Escape key, clicking the backdrop, the
  back button) is what REQ-PHOTO-010 currently leaves open.

## 21. Which devices, browsers and viewport widths must the interface support?

- **Affects:** REQ-PHOTO-004, REQ-PHOTO-009, REQ-PHOTO-011
- **The brief says:** "The application should be simple, **responsive**, easy to run
  on a local development PC".
- **Which could mean:**
  - (a) The desktop window is resizable and the grid reflows. Phones are out of
    scope, consistent with "run on a local development PC".
  - (b) Phones and tablets are in scope, which brings touch interaction, the file
    chooser behaving differently, and a modal on a 360px screen.
  - (c) "Responsive" was meant as "feels fast", which is a different property
    altogether and would be measured differently.
- **Why it cannot be decided here:** (b) roughly doubles what must be tested and
  changes the modal and the larger view specifically. There is also no browser
  list at all: "responsive" cannot be verified without knowing the narrowest
  width and the oldest browser that must work.

## 22. What must be operable without a mouse, and against which accessibility standard, if any, will the interface be judged?

- **Affects:** REQ-PHOTO-003, REQ-PHOTO-004, REQ-PHOTO-009, REQ-PHOTO-010,
  REQ-PHOTO-011
- **The brief says:** "**Clicking** any photo should open it in a larger view" and
  "provide a clean and user-friendly interface". Accessibility, keyboard use and
  screen readers are not mentioned.
- **Which could mean:**
  - (a) Mouse only. "Clicking" is meant literally and nothing else is required.
  - (b) Everything reachable by keyboard — tab to a Photo, Enter to open, Escape
    to close, focus returned to the tile afterwards.
  - (c) A named standard such as WCAG 2.2 AA, which brings alternative text for
    every image, contrast requirements and focus management in the modal.
- **Why it cannot be decided here:** (c) has obligations that reach into every
  requirement here and is far cheaper to build in than to retro-fit. It may also
  be a legal requirement for the client depending on who uses the application —
  which only they know.

## 23. Who decides whether the interface is "clean", "attractive" and "user-friendly", and what evidence would make it acceptable or unacceptable?

- **Affects:** REQ-PHOTO-001, REQ-PHOTO-002, REQ-PHOTO-011
- **The brief says:** "a **clean and attractive** gallery/grid layout", "simple and
  **modern**", "provide a **clean and user-friendly** interface".
- **Which could mean:**
  - (a) One named person's judgement on sight, accepted or rejected as a whole.
  - (b) A reference the client already has in mind — an application they like, a
    brand palette, a design they will supply.
  - (c) A checkable list they would accept as a proxy: consistent spacing, a
    single typeface, no layout shift while images load.
- **Why it cannot be decided here:** these words are the acceptance criteria for
  the entire interface and none of them can be tested. Under (a) the work can be
  rejected after it is finished for reasons nobody could have written down in
  advance, and there is no defensible position from which to argue. Under (b) the
  reference costs the client one sentence now.

## 24. Must uploaded Photos still be in the Gallery after the application is stopped and started again?

- **Affects:** REQ-PHOTO-008, REQ-PHOTO-012
- **The brief says:** "use a **simple data store**".
- **Which could mean:**
  - (a) Photos are on disk and survive restarting the application, restarting the
    PC, and reinstalling the application over the top.
  - (b) "Simple" is the priority and holding Photos in memory for the session is
    acceptable for a local development tool.
- **Why it cannot be decided here:** under (b) closing the terminal destroys the
  client's photographs, which they may not discover until it happens. It also sets
  what "a simple data store" is allowed to be, and whether upgrading the
  application must preserve what is already there.

## 25. Is there a limit on total storage, and what must happen when it is reached?

- **Affects:** REQ-PHOTO-006, REQ-PHOTO-012
- **The brief says:** "The home page should display **all** uploaded photos" and
  "use a simple data store". No limit is mentioned.
- **Which could mean:**
  - (a) No limit is enforced; Uploads keep succeeding until the disk fills, at
    which point behaviour is whatever it happens to be.
  - (b) A stated ceiling, refused cleanly with a message when it is reached.
- **Why it cannot be decided here:** under (a) the first symptom of a full disk is
  a failed Upload, and — depending on question 9 — possibly a half-written file
  and a Photo record that points at nothing. The client is also the only one who
  knows whether this is for 200 photographs or 200,000.

## 26. What counts as an "unnecessary" dependency, and who approves the dependency list?

- **Affects:** REQ-PHOTO-015
- **The brief says:** "avoid unnecessary dependencies".
- **Which could mean:**
  - (a) Nothing beyond what the Node.js runtime itself provides.
  - (b) A small, well-known set is fine; the client is objecting to sprawl, not to
    libraries.
  - (c) The client has a specific concern — licensing, security review, long-term
    maintenance by their own staff — that names which dependencies are the
    problem.
- **Why it cannot be decided here:** under (a) several other answers become much
  more expensive — image resizing for question 12 in particular. This
  requirement cannot be verified at all without a list the client has seen and
  accepted, and disagreement about it will surface as a rejection at delivery.
  Note that the concrete choice of libraries is a decision for `.brain/decisions/`
  once this question is answered; only the constraint belongs here.

## 27. Which Node.js versions and which operating systems must the application run on?

- **Affects:** REQ-PHOTO-013, REQ-PHOTO-014
- **The brief says:** "Create a simple and modern Photo Gallery application **using
  Node.js**" and "easy to run on a local development PC".
- **Which could mean:**
  - (a) The current long-term-support release of Node.js on Windows only — "PC"
    read literally.
  - (b) Any recent Node.js on Windows, macOS or Linux.
- **Why it cannot be decided here:** the supported range decides which language
  features and which libraries are available, and it is what the "it doesn't run
  on my machine" conversation will be settled against. File path handling and the
  local file chooser also differ by operating system.

## 28. What does "easy to run on a local development PC" mean in checkable terms — how many steps, and what may a person be expected to install first?

- **Affects:** REQ-PHOTO-014
- **The brief says:** "**easy to run** on a local development PC".
- **Which could mean:**
  - (a) One command from a clean checkout, with Node.js already installed and
    nothing else.
  - (b) Install dependencies, then run — two commands and a documented
    prerequisite list.
  - (c) A person who is not a developer can start it by double-clicking something.
- **Why it cannot be decided here:** (c) is a different deliverable — packaging,
  not a development server — and would be discovered only when the client tries to
  start it. This is also the acceptance test for the whole "local development PC"
  sentence, and "easy" cannot be tested as written.
