# Photo Gallery

A simple photo gallery that runs on one local development PC.

## Prerequisites

- **Node.js 20 or newer** (a current LTS release). Nothing else.

No database server, container runtime or cloud service is required.

## Install

```
npm install
```

Two dependencies are installed — SQLite access and thumbnail generation, the
purposes `REQ-PHOTO-015` permits. Neither needs a compiler.

## Run

```
npm start
```

Then open <http://127.0.0.1:3000> in a browser on the same PC.

Set `PORT` to serve on a different port:

```
PORT=4000 npm start
```

The server binds to `127.0.0.1` only, so the gallery is reachable from the PC
running it and not from other machines on the network. That is deliberate — see
`REQ-PHOTO-014` in `.brain/requirements/photo.yaml`.

## Where Photos are stored

Uploaded Photos live in  beside the project: the Original and its
thumbnail under  and , and their metadata in
 (SQLite). Set  to put them elsewhere.

Deleting  removes every Photo permanently. It is not committed.

## Where Photos are stored

Uploaded Photos live in `data/` beside the project — the Original and its
thumbnail under `data/originals` and `data/thumbnails`, and their metadata in
`data/photos.db` (SQLite). Set `PHOTO_DATA_DIR` to put them somewhere else.

Deleting `data/` removes every Photo permanently. It is not committed.

## Test

```
npm test
```

## How this project is governed

Requirements, decisions and constraints live in `.brain/`. Read
`.brain/index.md` first, and `.brain/glossary.md` before naming anything.
