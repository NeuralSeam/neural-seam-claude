#!/usr/bin/env node
// Static gate for this plugin. The content it ships is markdown and JSON: nothing compiles it, so
// without these checks the first thing to find a broken file is Claude Code, on a developer's
// machine, usually in silence.
//
// The manifest rules mirror the validator that ships inside the Claude Code CLI
// (`claude plugin validate --strict`). Measured against Claude Code 2.1.263 by feeding it a probe
// manifest and recording what it accepted. Re-check when the CLI releases: this is a copy of
// someone else's contract, and the real one is the CLI's. What this file adds on top are the rules
// the CLI has no opinion about: semver, version lockstep with the changelog, invocation control,
// hardcoded addresses, and card lookups by literal title.
//
// Two measured gaps are why this file exists rather than deferring entirely: the CLI accepts a
// `version` that is not semver, and it only WARNS about a marketplace entry whose version
// disagrees with the plugin manifest. Both ship a broken release quietly.
//
// Every rule here is proved by mutation in `check-bundle.test.mjs`. A rule that cannot be made to
// fail is not a rule.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, ".claude-plugin", "plugin.json");
const MARKETPLACE = path.join(ROOT, ".claude-plugin", "marketplace.json");
const MCP_FILE = path.join(ROOT, ".mcp.json");
const HOOKS_FILE = path.join(ROOT, "hooks", "hooks.json");
const COMMANDS_DIR = path.join(ROOT, "commands");

const errors = [];
const rel = p => path.relative(ROOT, p).split(path.sep).join("/");
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

// Fields the host's validator recognises in a plugin manifest, measured: anything else is
// reported as unknown and ignored at load time. `id`, `category` and `strict` are called out
// separately by the validator as belonging to the marketplace entry, so they are listed here
// as rejected rather than merely unknown.
const MANIFEST_KEYS = new Set(["name", "version", "description", "author", "homepage",
  "repository", "license", "keywords", "displayName", "commands", "agents", "skills",
  "hooks", "mcpServers", "outputStyles"]);
const MARKETPLACE_ONLY_KEYS = new Set(["id", "category", "strict"]);
// Manifest fields naming a file or directory this plugin ships. The validator reports a
// missing target as an error, and a load failure at runtime is silent, so they are checked
// here too.
const CONTENT_PATH_KEYS = ["commands", "agents", "skills", "hooks", "mcpServers", "outputStyles"];

// Content the host loads from its CONVENTIONAL path on its own. Naming it in the manifest as
// well makes the host load the same file twice, and it treats that as fatal for the WHOLE
// plugin, not just for that file.
//
// Measured on Claude Code 2.1.263, and it cost a broken release: declaring
// `"hooks": "./hooks/hooks.json"` shipped a plugin that installs and then reports
// `failed to load - Duplicate hooks file detected`. See COMPATIBILITY.md.
//
// `commands` and `mcpServers` do NOT behave this way. Declaring them is fine, and it is what
// makes the validator walk their contents. So this is a list of one, held as data because the
// next entry would be discovered the same way this one was.
const AUTOLOADED_CONVENTIONAL_PATHS = {
  hooks: "hooks/hooks.json",
};

// Commands that change something: a project binding, a checkout on disk, the developer's
// environment, the backlog, or the source tree. Each must declare `disable-model-invocation: true`
// so it runs when the developer types it rather than when a model judges it relevant.
//
// Read-only commands are deliberately absent: the worst case for one of those is a wasted call,
// and keeping them model-invocable is what makes the plugin useful in conversation.
const EXPLICIT_INVOCATION_ONLY = new Set([
  "ns-clone",
  "ns-connect",
  "ns-doctor",
  "ns-exec",
  "ns-generate",
  "ns-start",
]);

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const IDENTIFIER = /^[A-Za-z0-9_-]+$/;
const YAML_BOOLEAN = /^(true|false)$/;

// The two mojibake signatures, built from code points so this file never has to contain the
// broken bytes itself: the replacement character, and a UTF-8 lead byte read as Latin-1.
const MOJIBAKE = new RegExp(String.fromCharCode(0xFFFD) + "|" + String.fromCharCode(0xC3)
  + "[" + String.fromCharCode(0x80) + "-" + String.fromCharCode(0xBF) + "]");

// The runtime recognises the setup it manages by these values. They are a contract shared with
// its Claude Code adapter: change one side without the other and a project is either wired twice
// or cleaned up wrongly. Asserting them here means a rename cannot land as a silent edit to a
// JSON file.
const MCP_SERVER_NAME = "neural-seam-runtime";
const MCP_SERVER_ARGS = ["serve", "--project-from-cwd"];
const HOOK_EVENTS = { SessionStart: "session-start", PreToolUse: "pre-tool-use", Stop: "stop" };

function readJson(file) {
  if (!fs.existsSync(file)) { fail(rel(file), "missing"); return null; }
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { fail(rel(file), `invalid JSON: ${e.message}`); return null; }
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------- plugin manifest

const manifest = readJson(MANIFEST);
if (manifest) {
  const w = rel(MANIFEST);
  for (const key of Object.keys(manifest)) {
    if (MANIFEST_KEYS.has(key)) continue;
    const hint = MARKETPLACE_ONLY_KEYS.has(key)
      ? " -- it belongs in the marketplace entry; here the host ignores it at load time"
      : " -- the host ignores unrecognized fields at load time, so it does nothing";
    fail(w, `field \`${key}\` is not one the host recognises${hint}`);
  }
  for (const key of ["name", "version", "description"]) {
    if (typeof manifest[key] !== "string" || !manifest[key].trim()) fail(w, `\`${key}\` must be a non-empty string`);
  }
  if (typeof manifest.name === "string" && !IDENTIFIER.test(manifest.name)) {
    fail(w, "`name` may only contain ASCII letters, digits, `_` and `-`");
  }
  // The host does NOT enforce this (measured: a non-semver version validates clean), and the
  // marketplace pins updates by it, so a malformed version ships an update nobody receives.
  if (typeof manifest.version === "string" && !SEMVER.test(manifest.version)) {
    fail(w, `\`version\` must be strict semver (got ${JSON.stringify(manifest.version)})`);
  }
  if (typeof manifest.author !== "object" || manifest.author === null) {
    fail(w, "`author` must be an object");
  } else {
    for (const key of Object.keys(manifest.author)) {
      if (!["name", "email", "url"].includes(key)) fail(w, `\`author.${key}\` is not a field the host recognises`);
    }
    if (!manifest.author.name?.trim()) fail(w, "`author.name` must be a non-empty string");
    if (manifest.author.url && !/^https:\/\/.+/.test(manifest.author.url)) fail(w, "`author.url` must be an absolute https URL");
  }
  for (const key of ["homepage", "repository"]) {
    if (manifest[key] !== undefined && !/^https:\/\/.+/.test(manifest[key])) fail(w, `\`${key}\` must be an absolute https URL`);
  }
  if (manifest.keywords !== undefined
      && (!Array.isArray(manifest.keywords) || !manifest.keywords.every(k => typeof k === "string" && k.trim()))) {
    fail(w, "`keywords` must be an array of non-empty strings");
  }
  for (const key of CONTENT_PATH_KEYS) {
    const value = manifest[key];
    if (value === undefined) continue;
    for (const p of Array.isArray(value) ? value : [value]) {
      if (typeof p !== "string" || !p.trim()) { fail(w, `\`${key}\` must name a path`); continue; }
      if (!fs.existsSync(path.join(ROOT, p))) fail(w, `\`${key}\` points at a missing path: ${p}`);
      const conventional = AUTOLOADED_CONVENTIONAL_PATHS[key];
      if (conventional && p.replace(/^\.\//, "").replace(/\/$/, "") === conventional) {
        fail(w, `\`${key}\` must not be declared: the host already loads \`${conventional}\` on its own, and naming it here loads it twice, which fails the whole plugin at install time`);
      }
    }
  }
  // Declaring them is what makes `claude plugin validate` walk the content, so a command with
  // broken frontmatter is caught by the host's own validator and not only by this file. Only
  // the keys that are not auto-loaded from a conventional path belong here; see
  // AUTOLOADED_CONVENTIONAL_PATHS for the one that is.
  for (const key of ["commands", "mcpServers"]) {
    if (manifest[key] === undefined) fail(w, `\`${key}\` should be declared so the host's validator walks it`);
  }
}

// ---------------------------------------------------------------- marketplace

const market = readJson(MARKETPLACE);
if (market) {
  const w = rel(MARKETPLACE);
  if (!market.name?.trim()) fail(w, "`name` must be a non-empty string");
  else if (!IDENTIFIER.test(market.name)) fail(w, "`name` may only contain ASCII letters, digits, `_` and `-`");
  if (!market.description?.trim()) fail(w, "`description` must be a non-empty string");
  if (typeof market.owner !== "object" || market.owner === null || !market.owner.name?.trim()) {
    fail(w, "`owner.name` must be a non-empty string");
  }
  if (!Array.isArray(market.plugins) || market.plugins.length === 0) {
    fail(w, "`plugins` must be a non-empty array");
  } else {
    for (const [i, entry] of market.plugins.entries()) {
      const at = `plugins[${i}]`;
      if (!entry.name?.trim()) fail(w, `${at}.name must be a non-empty string`);
      if (!entry.source?.trim()) fail(w, `${at}.source is required`);
      else if (!fs.existsSync(path.join(ROOT, entry.source))) fail(w, `${at}.source points at a missing directory`);
      if (!entry.description?.trim()) fail(w, `${at}.description must be a non-empty string`);
      // The runtime derives the install reference from `<plugin>@<marketplace>`, so a rename
      // on one side and not the other breaks detection in silence.
      if (manifest && entry.name && entry.name !== manifest.name) {
        fail(w, `${at}.name is "${entry.name}" but the manifest declares "${manifest.name}"`);
      }
      // The host only WARNS here (measured): at install time the plugin manifest wins and the
      // entry version is ignored, so a disagreement publishes a version nobody meant.
      if (manifest?.version && entry.version && entry.version !== manifest.version) {
        fail(w, `${at}.version is "${entry.version}" but the manifest declares "${manifest.version}"`);
      }
      if (manifest?.version && !entry.version) fail(w, `${at}.version is missing; mirror the manifest's "${manifest.version}"`);
    }
  }
}

// ---------------------------------------------------------------- MCP registration

const mcp = readJson(MCP_FILE);
if (mcp) {
  const w = rel(MCP_FILE);
  for (const key of Object.keys(mcp)) {
    if (key !== "mcpServers") fail(w, `field \`${key}\` is not part of an MCP registration file`);
  }
  const servers = mcp.mcpServers;
  if (typeof servers !== "object" || servers === null) {
    fail(w, "`mcpServers` must be an object");
  } else {
    const primary = servers[MCP_SERVER_NAME];
    if (!primary) {
      fail(w, `must register \`${MCP_SERVER_NAME}\`; the runtime recognises the setup it manages by that key`);
    } else if (JSON.stringify(primary.args) !== JSON.stringify(MCP_SERVER_ARGS)) {
      fail(w, `\`${MCP_SERVER_NAME}\` must start with args ${JSON.stringify(MCP_SERVER_ARGS)}; the server resolves the project from the working directory, which is what lets one registration serve every project`);
    }
    for (const [name, server] of Object.entries(servers)) {
      if (typeof server !== "object" || server === null) { fail(w, `server \`${name}\` must be an object`); continue; }
      if (server.command !== "neural-seam") {
        fail(w, `server \`${name}\` must run the \`neural-seam\` binary from PATH, not ${JSON.stringify(server.command)}`);
      }
    }
  }
}

// ---------------------------------------------------------------- lifecycle hooks

const hooksFile = readJson(HOOKS_FILE);
if (hooksFile) {
  const w = rel(HOOKS_FILE);
  const events = hooksFile.hooks;
  if (typeof events !== "object" || events === null) {
    fail(w, "`hooks` must be an object keyed by lifecycle event");
  } else {
    for (const [event, command] of Object.entries(HOOK_EVENTS)) {
      const matchers = events[event];
      if (!Array.isArray(matchers) || matchers.length === 0) { fail(w, `event \`${event}\` is missing`); continue; }
      const commands = matchers.flatMap(m => (m?.hooks ?? []).map(h => h?.command));
      if (!commands.includes(`neural-seam hook ${command}`)) {
        fail(w, `event \`${event}\` must run \`neural-seam hook ${command}\`; the runtime recognises the hooks it manages by that command`);
      }
    }
    for (const [event, matchers] of Object.entries(events)) {
      for (const h of (Array.isArray(matchers) ? matchers : []).flatMap(m => m?.hooks ?? [])) {
        if (h?.type !== "command") fail(w, `\`${event}\` declares a hook whose type is not \`command\``);
        if (typeof h?.command !== "string" || !h.command.startsWith("neural-seam ")) {
          fail(w, `\`${event}\` declares a hook that does not run the \`neural-seam\` binary`);
        }
      }
    }
  }
}

// ---------------------------------------------------------------- commands

const commandFiles = fs.existsSync(COMMANDS_DIR)
  ? fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".md")).sort()
  : [];
if (commandFiles.length === 0) fail(rel(COMMANDS_DIR), "no commands found");

const commandNames = new Set(commandFiles.map(f => f.replace(/\.md$/, "")));
// A rename that left the list behind would silently drop the protection from the renamed
// command, and the gate would still pass because the old name simply stops being checked.
for (const name of EXPLICIT_INVOCATION_ONLY) {
  if (!commandNames.has(name)) {
    fail("scripts/check-bundle.mjs", `the explicit-invocation list names \`${name}\`, which no longer exists in commands/; update the list in the same change as the rename`);
  }
}

const helpFile = path.join(COMMANDS_DIR, "ns-help.md");
const helpText = fs.existsSync(helpFile) ? fs.readFileSync(helpFile, "utf8") : "";

for (const file of commandFiles) {
  const full = path.join(COMMANDS_DIR, file);
  const w = rel(full);
  const name = file.replace(/\.md$/, "");
  if (!/^ns-[a-z0-9-]+$/.test(name)) fail(w, "command file names are `ns-<something>.md`");
  const body = fs.readFileSync(full, "utf8");
  if (!body.startsWith("---\n")) { fail(w, "must start with YAML frontmatter"); continue; }
  const end = body.indexOf("\n---", 4);
  if (end === -1) { fail(w, "frontmatter is not closed"); continue; }
  const front = body.slice(4, end);
  // Raw, so a value written as a quoted string stays distinguishable from a YAML scalar.
  const raw = key => {
    const m = front.match(new RegExp("^" + key + ":\\s*(.+)$", "m"));
    return m ? m[1].trim() : null;
  };
  const field = key => {
    const v = raw(key);
    return v === null ? null : v.replace(/^["']|["']$/g, "");
  };
  // The description is what a developer reads in the command list, so an empty one makes the
  // command undiscoverable even though it loads.
  if (!field("description")) fail(w, "frontmatter `description` must be non-empty");
  // A command taking arguments without an `argument-hint` gives the developer no idea what to
  // type. `$ARGUMENTS` in the body is the signal that it takes some.
  if (body.includes("$ARGUMENTS") && !field("argument-hint")) {
    fail(w, "uses `$ARGUMENTS` but declares no `argument-hint`");
  }

  // Invocation control. The host reads this as a boolean; a quoted string is a different YAML
  // type, and the difference is invisible in a diff, so it is rejected rather than coerced.
  const invocation = raw("disable-model-invocation");
  if (invocation !== null && !YAML_BOOLEAN.test(invocation)) {
    fail(w, `frontmatter \`disable-model-invocation\` must be the unquoted boolean \`true\` or \`false\`, not ${JSON.stringify(invocation)}`);
  }
  if (EXPLICIT_INVOCATION_ONLY.has(name) && invocation !== "true") {
    fail(w, "changes something on disk or in the project, so it must declare `disable-model-invocation: true`; without it a model can run it without the developer asking");
  }

  // ns-help is the index. A command missing from it exists and is invisible.
  if (name !== "ns-help" && !helpText.includes(name)) {
    fail(rel(helpFile), `does not list \`${name}\`; the index is how a developer finds a command`);
  }
}

// ---------------------------------------------------------------- content rules

// Three sources of truth for one version, so they drift: a bumped manifest with no entry
// ships a version whose changes nobody wrote down, and an entry with no bump ships the
// previous plugin.
if (manifest?.version) {
  const changelogPath = path.join(ROOT, "CHANGELOG.md");
  const changelog = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, "utf8") : "";
  const latest = changelog.match(/^##\s*\[([^\]]+)\]/m)?.[1];
  if (!latest) fail("CHANGELOG.md", "no `## [version]` entry found");
  else if (latest !== manifest.version) {
    fail("CHANGELOG.md", `newest entry is [${latest}] but the manifest declares ${manifest.version}`);
  }
}

const REQUIRED_FILES = ["LICENSE", "README.md", "README.pt-BR.md", "CHANGELOG.md",
  "COMPATIBILITY.md", "SECURITY.md", "SUPPORT.md", "PRIVACY.md", "CONTRIBUTING.md",
  "TRADEMARKS.md", ".github/CODEOWNERS"];
for (const f of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(ROOT, f))) fail(f, "required file is missing");
}

// Line endings are settled by git, not by scanning the working tree. With the policy below in
// place git stores and checks out LF, so a working copy that shows CRLF on Windows is still
// committed as LF; scanning bytes here would fail for every Windows contributor while the
// published file was correct. What can actually regress is the policy going missing.
const ATTRIBUTES = path.join(ROOT, ".gitattributes");
if (!fs.existsSync(ATTRIBUTES)) {
  fail(".gitattributes", "missing; without it line endings follow each contributor's local git config");
} else if (!/^\*\s+text=auto\s+eol=lf\s*$/m.test(fs.readFileSync(ATTRIBUTES, "utf8"))) {
  fail(".gitattributes", "must declare `* text=auto eol=lf`; the CI workflow embeds a shell script, and CRLF there fails on a runner in a way that looks nothing like its cause");
}

const textFiles = walk(ROOT).filter(p => /\.(md|json|ya?ml)$/.test(p) && !rel(p).startsWith("scripts/"));

for (const file of textFiles) {
  const text = fs.readFileSync(file, "utf8");
  const w = rel(file);
  text.split("\n").forEach((line, i) => {
    const at = `${w}:${i + 1}`;
    // The runtime reports every address it serves, and picks its port at startup. A port
    // written here is a guess that goes stale silently, and it is the defect this plugin
    // shipped before.
    if (/127\.0\.0\.1|\blocalhost\b|:70\d\d\b/.test(line)) fail(at, "hardcoded address or port; present what the runtime returns");
    // A card is addressed by the identifier the runtime returns. Its title is a string this
    // plugin does not own and the developer can rewrite at any time. Matches the affirmative
    // instruction only, so prose forbidding the practice still passes.
    if (/(titulo exato|exact title|title is exactly)|card (de titulo|titled|whose title)\s*[:"]|(search|busque|procure|look up)[^.]{0,40}\btitle\b[^.]{0,20}"/i.test(line)) {
      fail(at, "looks like a card lookup by literal title; use the identifier the runtime returns");
    }
    // A command surface belonging to a different agent CLI. These arrive by copying a file from
    // a sibling integration, and they are wrong here whatever they say.
    if (/\bagy plugin\b|\bcodex plugin\b|\bcodex mcp\b|\$neural-seam:ns-/.test(line)) fail(at, "names another agent CLI's command surface");
    if (/(ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|xox[baprs]-[A-Za-z0-9-]{10,}|BEGIN [A-Z ]*PRIVATE KEY/.test(line)) {
      fail(at, "looks like a credential; this repository is public");
    }
    if (MOJIBAKE.test(line)) fail(at, "mojibake: re-save as UTF-8");
  });
  if (text.charCodeAt(0) === 0xfeff) fail(w, "starts with a byte order mark; save without BOM");
}

// Relative markdown links, and the anchors they point at. A broken link in a published
// README is the cheapest possible defect to prevent and the most embarrassing to ship.
const slug = h => h.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
for (const file of textFiles.filter(p => p.endsWith(".md"))) {
  const text = fs.readFileSync(file, "utf8");
  const w = rel(file);
  for (const m of text.matchAll(/\[[^\]]*\]\((\.[^)\s]+)\)/g)) {
    const [target, anchor] = m[1].split("#");
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) { fail(w, `link target does not exist: ${m[1]}`); continue; }
    if (anchor) {
      const headings = fs.readFileSync(resolved, "utf8").match(/^#{1,6}\s+(.+)$/gm) ?? [];
      if (!headings.some(h => slug(h.replace(/^#+\s+/, "")) === anchor)) fail(w, `link anchor not found: ${m[1]}`);
    }
  }
  // Same-file anchors, which drift the moment a heading is renamed.
  const headings = text.match(/^#{1,6}\s+(.+)$/gm) ?? [];
  for (const m of text.matchAll(/\[[^\]]*\]\(#([^)\s]+)\)/g)) {
    if (!headings.some(h => slug(h.replace(/^#+\s+/, "")) === m[1])) fail(w, `link anchor not found: #${m[1]}`);
  }
}

// ---------------------------------------------------------------- report

if (errors.length) {
  console.error(`check-bundle: ${errors.length} problem${errors.length === 1 ? "" : "s"}\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("check-bundle: ok");
