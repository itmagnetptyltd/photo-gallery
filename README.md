# Photo Gallery

A simple photo gallery that runs on one local development PC.

## Prerequisites

- **Node.js 20 or newer** (a current LTS release). Nothing else.

No database server, container runtime or cloud service is required.

## Install

```
npm install
```

There are no runtime dependencies, so this completes without downloading
anything. It is still the documented install step.

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

## Test

```
npm test
```

## How this project is governed

Requirements, decisions and constraints live in `.brain/`. Read
`.brain/index.md` first, and `.brain/glossary.md` before naming anything.
