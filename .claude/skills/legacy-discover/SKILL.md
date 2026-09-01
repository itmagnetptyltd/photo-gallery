---
name: legacy-discover
description: First install on an existing production repo. Inventory the tree and write draft brain files only. Use after install.js when the project already has code and no REQ- ids yet. Never agrees anything. Never moves folders into src/.
allowed-tools: Read, Grep, Glob, Write, Bash
---

# legacy-discover

For a **live / year-old** repo the first time itm-sdlc is installed. It does
**not** reverse-engineer every API into agreed requirements. It inventories
what is on disk and writes **draft** hooks plus questions. The client still
has to answer before anything is `agreed`.

**Never** move `CRM/`, `Web/`, or anything else into `src/`.

---

## Before running a vendored script

```bash
[ -f .claude/itm-sdlc/scripts/legacy-discover.js ] || echo "vendored toolkit predates legacy-discover.js - re-run install.js"
```

If `.claude/itm-sdlc/node_modules/` is missing:

```bash
cd .claude/itm-sdlc && npm ci --omit=dev --no-audit --no-fund
```

Then return to the project root.

---

## 1. Record branch

```bash
git checkout -b brain/legacy-discover
```

Do not run `--write` on `main`.

## 2. Inventory, then write drafts

```bash
node .claude/itm-sdlc/scripts/legacy-discover.js --project . --json
node .claude/itm-sdlc/scripts/legacy-discover.js --project . --write
```

`--write` is refused if any `REQ-` already exists (not first time) or the
tree is not a git repo with source.

## 3. What it wrote

- One **draft** `REQ-<MODULE>-001` per install module, inferred from a folder
- `AMBIGUITIES.md` / `ANSWERS.md` — the same question: what must still be true?
- `BRIEF.md` appendix — inferred, not client words
- `.brain/sessions/<date>-legacy-discover.md`

**Status stays `draft`.** Do not run `/resolve-ambiguities` until the client
has pasted answers. Do not `/tdd` these IDs until they are `agreed`.

## 4. PR

This is a **record** PR. `/pr-prepare` as chore or with no behaviour Covers.
Human reviews. Merge. Then the next **real** change uses `/decompose` on that
ask only — do not invent the rest of production.

---

## Rules

- **Inferred is not agreed.** An agent must not close the open question.
- **Do not emit one requirement per controller or endpoint.** That is a guess
  factory. One draft hook per declared module is the cap.
- **Do not restructure the repo.**
