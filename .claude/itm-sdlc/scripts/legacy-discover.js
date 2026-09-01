#!/usr/bin/env node
"use strict";

/**
 * legacy-discover.js — first-time inventory of an existing (legacy) repo.
 *
 * Detects: toolkit already installed, no REQ- ids yet, and the tree already
 * has source (an adapter matches, or application folders). Writes draft
 * brain files only. Never status `agreed`. Never moves folders.
 *
 * Usage:
 *   node scripts/legacy-discover.js [options]
 *
 * Options:
 *   --project <path>   project root (default: cwd)
 *   --write            write draft brain files (refused if REQs already exist)
 *   --json             machine-readable output
 *   -h, --help
 *
 * Exit codes:
 *   0  reported (and wrote, if --write)
 *   2  could not run, or --write refused
 */

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const yaml = require("js-yaml");

const { detectAdapters, loadAdapters } = require("./lib/adapters");
const {
  DEFAULT_PATTERNS,
  loadRequirementFiles,
  flatten,
} = require("./lib/requirements");

const EXIT_OK = 0;
const EXIT_TOOL = 2;

const SKIP_DIRS = new Set([
  ".git",
  ".claude",
  ".brain",
  ".github",
  ".cursor",
  ".vs",
  ".idea",
  ".agents",
  ".codex",
  "bin",
  "obj",
  "node_modules",
  "dist",
  "coverage",
  "TestResults",
]);

const QUESTION =
  "This area was inferred from the existing codebase, not from a client brief. What must it still do in production?";

function parseArgs(argv) {
  const options = {
    project: process.cwd(),
    write: false,
    json: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") options.help = true;
    else if (arg === "--write") options.write = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--project") {
      i += 1;
      options.project = path.resolve(argv[i] ?? "");
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return options;
}

function loadInstallState(project) {
  const file = path.join(project, ".brain", "install-state.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function hasGit(project) {
  if (fs.existsSync(path.join(project, ".git"))) return true;
  const r = spawnSync(
    "git",
    ["-C", project, "rev-parse", "--is-inside-work-tree"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    },
  );
  return r.status === 0 && String(r.stdout).trim() === "true";
}

function listAreas(project) {
  if (!fs.existsSync(project)) return [];
  return fs
    .readdirSync(project, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() && !SKIP_DIRS.has(e.name) && !e.name.startsWith("."),
    )
    .map((e) => {
      const dir = path.join(project, e.name);
      const names = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
      const signals = names.filter(
        (n) =>
          /\.(csproj|sln|tsx?|jsx?)$/i.test(n) ||
          n === "package.json" ||
          n === "Dockerfile",
      );
      return { name: e.name, signals };
    })
    .filter((a) => a.signals.length > 0 || /^[A-Za-z]{2,12}$/.test(a.name));
}

function existingRequirements(project) {
  const { documents } = loadRequirementFiles(DEFAULT_PATTERNS, project);
  return flatten(documents)
    .map((row) => row.requirement)
    .filter((r) => r && r.id);
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function draftRequirement(module, areaName) {
  const title = `Existing ${areaName} area inferred from the repository — not yet client-agreed`;
  const clipped = title.length > 120 ? title.slice(0, 117) + "..." : title;
  return {
    id: `REQ-${module}-001`,
    title: clipped,
    module,
    priority: "must",
    status: "draft",
    version: 1,
    source: `legacy-discover ${todayUtc()}, inferred from folder ${areaName}/ — not a client brief`,
    rationale:
      "Placeholder so a live system has a draft hook in the brain. The client has not agreed this text.",
    acceptance: [
      {
        given: "The production system as it exists today",
        when: `The ${areaName} area is used`,
        then: "Behaviour matches what is currently shipped, pending the client confirming scope",
      },
    ],
    ambiguities: [QUESTION],
  };
}

function matchArea(module, areas) {
  const want = module.toLowerCase();
  return (
    areas.find((a) => a.name.toLowerCase() === want) ||
    areas.find((a) => a.name.toLowerCase().startsWith(want)) ||
    areas.find((a) => want.startsWith(a.name.toLowerCase()))
  );
}

function buildReport(project) {
  const state = loadInstallState(project);
  const reqs = existingRequirements(project);
  const adapters = detectAdapters(project, loadAdapters()).map((a) => a.id);
  const areas = listAreas(project);
  const git = hasGit(project);
  const modules = Array.isArray(state?.modules) ? state.modules : [];
  const firstTime = reqs.length === 0;
  const legacy = git && (adapters.length > 0 || areas.length > 0);

  let refuse = null;
  if (!state)
    refuse =
      "itm-sdlc is not installed here (.brain/install-state.json missing)";
  else if (!firstTime)
    refuse = `brain already has ${reqs.length} requirement(s) — use /decompose for new asks`;
  else if (!legacy)
    refuse =
      "no git history with source — this does not look like a legacy project";

  return {
    ok: refuse === null,
    refuse,
    firstTime,
    legacy,
    git,
    modules,
    adapters,
    areas,
    requirementCount: reqs.length,
  };
}

function writeBrain(project, report) {
  const date = todayUtc();
  const reqDir = path.join(project, ".brain", "requirements");
  const sessionDir = path.join(project, ".brain", "sessions");
  fs.mkdirSync(reqDir, { recursive: true });
  fs.mkdirSync(sessionDir, { recursive: true });

  const written = [];
  const drafts = [];

  for (const module of report.modules) {
    const area = matchArea(module, report.areas) || {
      name: module,
      signals: [],
    };
    const req = draftRequirement(module, area.name);
    drafts.push(req);
    const file = path.join(reqDir, `${module.toLowerCase()}.yaml`);
    if (fs.existsSync(file) && fs.readFileSync(file, "utf8").includes("REQ-")) {
      continue;
    }
    const body =
      `# Inferred by /legacy-discover on ${date}. All draft. None agreed.\n` +
      yaml.dump([req], { lineWidth: 100 });
    fs.writeFileSync(file, body);
    written.push(path.relative(project, file).replace(/\\/g, "/"));
  }

  const session = path.join(sessionDir, `${date}-legacy-discover.md`);
  const sessionBody = [
    `# Legacy discover — ${date}`,
    "",
    "Inferred from the repository. **Not** a client brief. Nothing here is `agreed`.",
    "",
    `- Adapters: ${report.adapters.join(", ") || "none"}`,
    `- Modules: ${report.modules.join(", ") || "none"}`,
    `- Areas: ${report.areas.map((a) => a.name).join(", ") || "none"}`,
    "",
    "Next: send the questions in `AMBIGUITIES.md` to the client. Then `/resolve-ambiguities`.",
    "Then `/decompose` only the next change — do not invent the rest of production.",
    "",
  ].join("\n");
  fs.writeFileSync(session, sessionBody);
  written.push(path.relative(project, session).replace(/\\/g, "/"));

  const briefPath = path.join(reqDir, "BRIEF.md");
  const briefBit = [
    "",
    `# Source brief — ${date} (legacy-discover)`,
    "",
    "Received: inferred from the existing repository. Not client words.",
    "",
    "> No client brief. The folders and adapters in this repo were inventoried.",
    "",
    "Nothing else was said.",
    "",
  ].join("\n");
  fs.appendFileSync(briefPath, briefBit);
  written.push(".brain/requirements/BRIEF.md");

  const ambPath = path.join(reqDir, "AMBIGUITIES.md");
  const ambBit = [
    "",
    `## ${QUESTION}`,
    "",
    `- **Affects:** ${drafts.map((d) => d.id).join(", ") || "none"}`,
    "- **Raised by:** `/legacy-discover` (inferred from layout, not the client).",
    "- **Question for the client:** For each inferred area, what must still be true in production, and which area do we decompose first?",
    "",
  ].join("\n");
  fs.appendFileSync(ambPath, ambBit);
  written.push(".brain/requirements/AMBIGUITIES.md");

  const ansPath = path.join(reqDir, "ANSWERS.md");
  if (
    !fs.existsSync(ansPath) ||
    !fs.readFileSync(ansPath, "utf8").includes(QUESTION)
  ) {
    const header = fs.existsSync(ansPath)
      ? ""
      : "# Answers\n\nPaste the client's reply under each question. Then `/resolve-ambiguities`.\n";
    fs.appendFileSync(ansPath, `${header}\n## ${QUESTION}\n\n\n`);
    written.push(".brain/requirements/ANSWERS.md");
  }

  return { written, drafts: drafts.map((d) => d.id) };
}

function main(argv) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (err) {
    console.error(err.message);
    process.exitCode = EXIT_TOOL;
    return;
  }

  if (options.help) {
    console.log(`Usage: node scripts/legacy-discover.js [--project <path>] [--write] [--json]

First-time inventory of a live/legacy repo after install.
Writes draft brain files only. Never agrees anything. Never moves source folders.
`);
    return;
  }

  const report = buildReport(options.project);

  if (options.write) {
    if (!report.ok) {
      if (options.json) {
        console.log(JSON.stringify({ ...report, written: [] }, null, 2));
      } else {
        console.error(`legacy-discover: refused — ${report.refuse}`);
      }
      process.exitCode = EXIT_TOOL;
      return;
    }
    const result = writeBrain(options.project, report);
    report.written = result.written;
    report.drafts = result.drafts;
  }

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (!report.ok) {
    console.log(`legacy-discover: ${report.refuse}`);
    process.exitCode = report.refuse.includes("not installed")
      ? EXIT_TOOL
      : EXIT_OK;
    return;
  }

  console.log("itm-sdlc | legacy-discover");
  console.log(`  first-time  ${report.firstTime}`);
  console.log(`  legacy      ${report.legacy}`);
  console.log(`  adapters    ${report.adapters.join(", ") || "none"}`);
  console.log(`  modules     ${report.modules.join(", ") || "none"}`);
  console.log(
    `  areas       ${report.areas.map((a) => a.name).join(", ") || "none"}`,
  );
  if (report.written) {
    console.log(`  wrote       ${report.written.join(", ")}`);
    console.log(
      `  drafts      ${report.drafts.join(", ")}  (all draft — client has not agreed)`,
    );
  } else {
    console.log(
      "  (pass --write to create draft brain files on a record branch)",
    );
  }
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    console.error(err.message || err);
    process.exitCode = EXIT_TOOL;
  }
}

module.exports = { buildReport, writeBrain, parseArgs };
