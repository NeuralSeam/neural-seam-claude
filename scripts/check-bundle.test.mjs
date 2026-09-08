#!/usr/bin/env node
// Mutation proofs for `check-bundle.mjs`.
//
// A gate nobody has seen fail is a gate nobody knows works. Each case below copies the whole
// repository into a temporary directory, breaks exactly one thing there, and asserts that the
// checker rejects it with the message that explains why.
//
// It never touches your working tree: every mutation happens in the copy, and the copy is deleted
// at the end. Run it with `node scripts/check-bundle.test.mjs`.
//
// Adding a rule to the checker means adding a case here. If you cannot make a rule fail, it is not
// a rule.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const read = (dir, f) => fs.readFileSync(path.join(dir, f), "utf8");
const write = (dir, f, text) => fs.writeFileSync(path.join(dir, f), text);
const edit = (dir, f, fn) => write(dir, f, fn(read(dir, f)));

/** Replace `from` with `to`, failing loudly if it is not there exactly once. */
function swap(dir, file, from, to) {
  edit(dir, file, text => {
    const hits = text.split(from).length - 1;
    if (hits !== 1) {
      throw new Error(`${file}: expected 1 occurrence of ${JSON.stringify(from.slice(0, 60))}, found ${hits}`);
    }
    return text.replace(from, to);
  });
}

function copyRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ns-check-bundle-"));
  fs.cpSync(ROOT, dir, {
    recursive: true,
    filter: src => {
      const base = path.basename(src);
      return base !== ".git" && base !== "node_modules";
    },
  });
  return dir;
}

function runChecker(dir) {
  const r = spawnSync(process.execPath, [path.join(dir, "scripts", "check-bundle.mjs")], {
    encoding: "utf8",
  });
  return { code: r.status, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const cases = [];
/** A mutation the checker must REJECT, with the message that says why. */
const mutation = (name, expect, mutate) => cases.push({ name, expect, mutate });
/** A change the checker must ACCEPT. Guards against a rule that fires on legitimate content. */
const accepts = (name, mutate) => cases.push({ name, expect: null, mutate });

// ---------------------------------------------------------------- invocation control

mutation(
  "a command that changes things loses its invocation guard",
  "must declare `disable-model-invocation: true`",
  dir => swap(dir, "commands/ns-exec.md", "\ndisable-model-invocation: true", ""),
);

mutation(
  "the invocation guard is set to false rather than removed",
  "must declare `disable-model-invocation: true`",
  dir => swap(dir, "commands/ns-generate.md", "disable-model-invocation: true", "disable-model-invocation: false"),
);

mutation(
  "the invocation guard is written as a quoted string, not a boolean",
  "must be the unquoted boolean",
  dir => swap(dir, "commands/ns-connect.md", "disable-model-invocation: true", 'disable-model-invocation: "true"'),
);

mutation(
  "a guarded command is renamed and the list is left behind",
  "no longer exists in commands/",
  dir => {
    fs.renameSync(path.join(dir, "commands/ns-clone.md"), path.join(dir, "commands/ns-fetch.md"));
    swap(dir, "commands/ns-help.md", "ns-clone", "ns-fetch");
  },
);

// ---------------------------------------------------------------- manifest

mutation(
  "the hooks path is declared, which loads it twice and kills the whole plugin",
  "must not be declared",
  dir => swap(dir, ".claude-plugin/plugin.json",
    '"commands": "./commands",',
    '"hooks": "./hooks/hooks.json",\n  "commands": "./commands",'),
);

mutation(
  "the version is not strict semver",
  "must be strict semver",
  dir => swap(dir, ".claude-plugin/plugin.json", '"version": "', '"version": "v'),
);

mutation(
  "the marketplace entry disagrees with the plugin manifest",
  "but the manifest declares",
  dir => edit(dir, ".claude-plugin/marketplace.json", t =>
    t.replace(/"version": "[^"]+"/, '"version": "9.9.9"')),
);

mutation(
  "the changelog does not carry the version being shipped",
  "newest entry is",
  // String.replace with a string pattern hits the first occurrence only, which is the newest
  // entry. `swap` is not used here because "## [" appears once per released version.
  dir => edit(dir, "CHANGELOG.md", text =>
    text.replace("## [", "## [9.9.9] - 2099-01-01\n\n### Fixed\n\n- placeholder\n\n## [")),
);

mutation(
  "the manifest stops declaring its content paths, so the validator stops walking them",
  "should be declared so the host's validator walks it",
  dir => swap(dir, ".claude-plugin/plugin.json", '  "commands": "./commands",\n', ""),
);

// ---------------------------------------------------------------- MCP and hooks

mutation(
  "the MCP server is registered under a different key",
  "must register `neural-seam-runtime`",
  dir => swap(dir, ".mcp.json", '"neural-seam-runtime"', '"neural-seam"'),
);

mutation(
  "the MCP server stops resolving the project from the working directory",
  "must start with args",
  dir => swap(dir, ".mcp.json", '"--project-from-cwd"', '"--project", "fixed"'),
);

mutation(
  "the MCP server is pointed at an absolute path instead of the binary on PATH",
  "must run the `neural-seam` binary from PATH",
  dir => swap(dir, ".mcp.json", '"command": "neural-seam"', '"command": "/usr/local/bin/neural-seam"'),
);

mutation(
  "a lifecycle hook event goes missing",
  "event `Stop` is missing",
  dir => edit(dir, "hooks/hooks.json", t => {
    const parsed = JSON.parse(t);
    delete parsed.hooks.Stop;
    return `${JSON.stringify(parsed, null, 2)}\n`;
  }),
);

mutation(
  "a hook is repointed at something other than the runtime binary",
  "does not run the `neural-seam` binary",
  dir => swap(dir, "hooks/hooks.json", '"command": "neural-seam hook stop"', '"command": "curl https://example.com"'),
);

// ---------------------------------------------------------------- command frontmatter

mutation(
  "a command loses its description",
  "`description` must be non-empty",
  dir => edit(dir, "commands/ns-status.md", t => t.replace(/^description: .*$/m, 'description: ""')),
);

mutation(
  "a command takes arguments without telling the developer what to type",
  "declares no `argument-hint`",
  dir => edit(dir, "commands/ns-list.md", t => t.replace(/^argument-hint: .*\n/m, "")),
);

mutation(
  "a command is missing from the index, so nobody can find it",
  "does not list `ns-open`",
  dir => swap(dir, "commands/ns-help.md", "`/neural-seam:ns-open`", "`/neural-seam:ns-dashboard`"),
);

// ---------------------------------------------------------------- content

mutation(
  "an address with a fixed port is written back into the content",
  "hardcoded address or port",
  dir => edit(dir, "commands/ns-open.md", t => `${t}\n\nExample: the dashboard is at 127.0.0.1:7077.\n`),
);

mutation(
  "a card is looked up by its literal title instead of its identifier",
  "card lookup by literal title",
  dir => edit(dir, "commands/ns-list.md", t => `${t}\n\nFind the card titled: "Set up the environment".\n`),
);

mutation(
  "an install verb belonging to a different CLI is copied in",
  "plugin install instruction for a CLI other than",
  dir => edit(dir, "commands/ns-help.md", t => `${t}\n\nOn that other CLI, run somecli plugin install instead.\n`),
);

mutation(
  "a command is written with a sigil this host does not use",
  "sigil this host does not use",
  dir => edit(dir, "commands/ns-help.md", t => `${t}\n\nInvoke it as $neural-seam:ns-status there.\n`),
);

// Cases that must leave the checker PASSING. A rule that fires on legitimate content is as broken
// as one that never fires, and only these cases can catch that.
accepts(
  "the host's own install and invocation forms",
  dir => edit(dir, "commands/ns-help.md", t =>
    `${t}\n\nRun claude plugin install neural-seam@neural-seam, then type /neural-seam:ns-status.\n`),
);

accepts(
  "prose that forbids a practice without performing it",
  dir => edit(dir, "CONTRIBUTING.md", t =>
    `${t}\n\nNever look a card up by its title, and never write a fixed port into a command.\n`),
);

mutation(
  "something shaped like a credential is committed",
  "looks like a credential",
  // Built by concatenation so this file never contains a string that looks like a real token.
  dir => edit(dir, "SUPPORT.md", t => `${t}\n\ntoken: ${"ghp"}_${"A1b2C3d4E5f6G7h8J9k0"}\n`),
);

mutation(
  "a file is saved in the wrong encoding",
  "mojibake",
  // Built from code points, so this file never has to contain the broken bytes itself.
  dir => edit(dir, "SUPPORT.md", t =>
    `${t}\n\n${String.fromCharCode(0xC3)}${String.fromCharCode(0xA7)}\n`),
);

mutation(
  "a relative link points at a file that is not there",
  "link target does not exist",
  dir => edit(dir, "README.md", t => `${t}\n\nSee [the guide](./MISSING-GUIDE.md).\n`),
);

mutation(
  "a link points at a heading that no longer exists",
  "link anchor not found",
  dir => edit(dir, "README.md", t => `${t}\n\nSee [that part](#a-heading-that-does-not-exist).\n`),
);

// ---------------------------------------------------------------- repository shape

mutation(
  "a required file is deleted",
  "required file is missing",
  dir => fs.rmSync(path.join(dir, "COMPATIBILITY.md")),
);

mutation(
  "the line ending policy is removed",
  "without it line endings follow",
  dir => fs.rmSync(path.join(dir, ".gitattributes")),
);

// ---------------------------------------------------------------- run

let passed = 0;
const failures = [];

// Control: the copy must pass before anything is broken. Without this, every case below could be
// "failing" for a reason that has nothing to do with its mutation.
{
  const dir = copyRepo();
  try {
    const { code, out } = runChecker(dir);
    if (code === 0) {
      passed++;
      console.log("  ok   control: an unmutated copy passes");
    } else {
      failures.push(`control: an unmutated copy should pass, but the checker reported:\n${out}`);
      console.log("  FAIL control: an unmutated copy passes");
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

for (const { name, expect, mutate } of cases) {
  const dir = copyRepo();
  const kind = expect === null ? "accepts" : "rejects";
  try {
    mutate(dir);
    const { code, out } = runChecker(dir);
    if (expect === null) {
      if (code === 0) {
        passed++;
        console.log(`  ok   ${kind}: ${name}`);
      } else {
        failures.push(`${name}: the checker REJECTED content it should accept:\n${out}`);
        console.log(`  FAIL ${kind}: ${name}`);
      }
    } else if (code === 0) {
      failures.push(`${name}: the checker PASSED a tree it should have rejected (expected ${JSON.stringify(expect)})`);
      console.log(`  FAIL ${kind}: ${name}`);
    } else if (!out.includes(expect)) {
      failures.push(`${name}: rejected, but not for the stated reason.\n    expected to find: ${JSON.stringify(expect)}\n    got:\n${out}`);
      console.log(`  FAIL ${kind}: ${name}`);
    } else {
      passed++;
      console.log(`  ok   ${kind}: ${name}`);
    }
  } catch (e) {
    failures.push(`${name}: the mutation itself failed to apply: ${e.message}`);
    console.log(`  FAIL ${name}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log("");
if (failures.length) {
  console.error(`check-bundle.test: ${failures.length} of ${cases.length + 1} cases failed\n`);
  for (const f of failures) console.error(`  - ${f}\n`);
  process.exit(1);
}
console.log(`check-bundle.test: ok (${passed} cases)`);
