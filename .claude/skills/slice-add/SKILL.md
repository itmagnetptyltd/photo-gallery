---
name: slice-add
description: Add a slice to the task sequence so new requirements have a place in the build order. Use after /decompose has allocated ids for new scope, and on a first plan.
allowed-tools: Read, Grep, Glob, Bash
---

# slice-add

`.brain/slices.yaml` says which requirements are built together, and in what
order. `/decompose` allocates ids; nothing else puts them in the sequence, so
without this they sit outside the plan and `/dashboard` reports them as
unplanned forever.

**Invoke with what the slice is**, e.g.
`/slice-add Visual design covering REQ-PHOTO-016 to REQ-PHOTO-022`.

---

## Before running a vendored script

Every command below runs a script from `.claude/itm-sdlc/scripts/`, vendored
into this project by the installer. **A project installed from an older toolkit
will not have it.**

```bash
[ -f .claude/itm-sdlc/scripts/add-slice.js ] || echo "vendored toolkit predates add-slice.js - re-run install.js"
```

If it is missing, say exactly that and stop. It must never reach the developer
as a raw Node `MODULE_NOT_FOUND` stack trace (PF-016).

---

## 1. Read the sequence that already exists

```bash
node .claude/itm-sdlc/scripts/add-slice.js --list
node .claude/itm-sdlc/scripts/add-slice.js --unplanned
```

`--unplanned` is the one that matters here: it names the requirements with no
place in the build order. Those are what you are adding a slice for. If it says
every requirement is in a slice, **stop and say so** — there is nothing to add,
and a slice invented anyway would only duplicate one that exists.

## 2. Propose the grouping, and stop

**This is a judgement, and it is not yours to make alone.** Propose it and wait.

Group by **what can be demonstrated**, not by what reads tidily:

- One slice is one branch, one `/feature-plan`, one `/tdd`, one pull request.
- A slice should end with something a person can be shown working. "The upload
  modal opens, validates and rejects" is a slice. "All the CSS" is not.
- Requirements that only make sense together belong together. A store and the
  proof it survives a restart are one slice, not two.
- Say what the slice can demonstrate, in one sentence. If you cannot, the
  grouping is wrong.

Read each requirement's `depends_on` before proposing. A requirement whose
dependency is unplanned, or planned later, **cannot** go in this slice — the
script refuses it, and correctly.

Show the developer:

| | |
|---|---|
| name | what the slice delivers |
| covers | the ids, and why those ids together |
| branch | the branch it will be built on |
| why | the one sentence from above |

**Wait for approval.** Do not run the next step until the developer has agreed
to the grouping.

## 3. Add it

One command per slice, in the order they will be built:

```bash
node .claude/itm-sdlc/scripts/add-slice.js \
  --name "Visual design" \
  --branch feat/photo-visual-design \
  --why "Type and spacing scale, app bar, buttons, tiles, empty state, focus rings" \
  --covers REQ-PHOTO-016,REQ-PHOTO-017,REQ-PHOTO-018
```

Add `--dry-run` first if the grouping is large enough that being wrong is
expensive.

**If the script refuses, report what it said and stop.** A refusal means an id
is not in the record, is already in another slice, or depends on something
scheduled later. None of those is fixed by trying again — the grouping or the
requirement record has to change first.

**Never edit `.brain/slices.yaml` by hand.** The script applies checks a hand
edit does not: it is the same reason `/tdd` calls `advance-status.js` rather
than editing a status.

## 4. Show the result

```bash
node .claude/itm-sdlc/scripts/add-slice.js --list
node .claude/itm-sdlc/scripts/dashboard.js
```

State plainly which slices were added and what each reads. A new slice over
`draft` requirements reads **Blocked**, and that is correct — `/tdd` refuses a
draft. Say so rather than letting it look like a fault.

---

## Rules

- **The grouping is the developer's decision.** Propose, wait, then write.
- **A slice must be demonstrable.** If you cannot say what someone would be
  shown at the end of it, it is not a slice.
- **Dependencies decide the order, not the id numbers.** Requirement ids carry
  the client's order; the sequence carries ours.
- **A refusal is information.** Report it and stop; do not work around it.
- **`.brain/` reaches `main` through a reviewed pull request.** Work on a branch.
