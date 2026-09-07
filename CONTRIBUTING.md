# Contributing

Thanks for looking. This repository is small and unusually constrained, so it is worth two minutes to
read what it is before proposing a change.

## What this repository is

A **host adapter**, shipped as a Claude Code plugin. The repository root is both the plugin and the
marketplace that publishes it: `.claude-plugin/plugin.json` is the plugin manifest and
`.claude-plugin/marketplace.json` is the catalog entry, with `source: "./"` pointing back at the same
directory. That is what makes `/plugin marketplace add NeuralSeam/neural-seam-claude` followed by
`/plugin install neural-seam@neural-seam` work from this repository alone.

**What the plugin ships** is content only: markdown and JSON, and none of it compiles. **The
repository around it** also holds the checks that gate that content (`scripts/`, JavaScript) and the
CI workflows that run them (`.github/workflows/`, YAML). Those never reach a user's machine.

Nothing compiles the content, so without those checks the first thing to discover a broken file is
Claude Code, on a developer's machine, usually in silence. That is why `scripts/check-bundle.mjs`
exists, why `scripts/check-bundle.test.mjs` proves each of its rules by mutation, and why CI runs both
on every pull request.

It is also deliberately **thin**. Product logic lives in the `neural-seam` runtime and the backend, not
here. A change that teaches this plugin a rule the runtime should own will be declined, however well it
is written, because the same rule would then have to be re-implemented for every other host.

## What belongs here, and what does not

**Yes:**

- Fixing a command, a description or a documented fact that is wrong or out of date.
- Something that is genuinely specific to Claude Code: its command namespace, its manifest, its hook
  events, its marketplace layout.
- Documentation: clarity, accuracy, translation of the short Portuguese guide.

**No:**

- Hardcoded ports, URLs, environment names or card titles. The runtime reports these; read them from
  it. A card is addressed by the identifier the runtime returns, never by its title: a title is a
  string this plugin does not own and the developer can rewrite at will.
- Duplicating the product's flow. The runtime returns the state and a message written for the
  developer; present that. A table of states and transitions kept here is a second implementation,
  and it is the one nobody updates.
- Literals belonging to another agent CLI. This plugin names no other host's commands or marketplaces.
- Bundling the `neural-seam` binary, or anything that installs, replaces or works around
  `neural-seam login` / `connect`.
- Anything that makes Claude Code look like it is doing something the developer did not start, or that
  presents this plugin as part of the official client rather than an extension of it.

## Ground rules for content

- **Claims are measured, not assumed.** This plugin's documentation states host behaviour with the
  Claude Code version it was measured on and how. If you assert what the host does, say how you know.
  "It should work like X" belongs in an issue, not in the README.
- **A comment or a sentence that a change made false is part of that change.** Fix it in the same
  commit.
- **Every command needs well formed YAML frontmatter** with a non-empty `description`. It is what the
  developer reads in the command list, so write it for that. Add `argument-hint` when the command takes
  arguments.
- **Write for someone outside the team.** Everything here is read by people who do not work on Neural
  Seam: describe what the plugin does and how to use it, not how it came to be decided. Design
  discussion, planning and anything that only makes sense with internal context belongs elsewhere,
  including in a pull request description.
- **The version is declared twice and must agree**: `.claude-plugin/plugin.json` and the marketplace
  entry in `.claude-plugin/marketplace.json`. At install time the plugin manifest wins and the entry is
  silently ignored, so a disagreement ships a version nobody meant. The changelog is the third place,
  and `scripts/check-bundle.mjs` fails when any of the three drift.

## Making a change

1. Open an issue first for anything behavioural. For a typo or a broken link, just send the pull
   request.
2. Run the checks locally:

   ```sh
   node scripts/check-bundle.mjs        # the gate
   node scripts/check-bundle.test.mjs   # proves the gate still fails when it should
   ```

   The second one mutates a **copy** of the repository in a temporary directory, never your working
   tree. A rule that cannot be made to fail is not a rule, so a new check comes with a new mutation
   case.

3. Run the host's own validator, which is what actually decides whether the manifests load:

   ```sh
   claude plugin validate . --strict
   claude plugin validate .claude-plugin/plugin.json --strict
   ```

   The first validates the marketplace, including that its entry version matches the plugin manifest.
   The second validates the plugin manifest and walks the content paths it declares, so the commands
   are checked too. `--strict` turns warnings into failures, which is what you want before publishing.

4. Test it for real when you have touched a command, a hook or the MCP registration:

   ```sh
   claude --plugin-dir .
   ```

   Then check `/plugin`, `/mcp` and the command you changed. **After every edit, run
   `/reload-plugins`** (and `/reload-plugins --force` if it warns that reloading would re-read the
   conversation). Without it you are exercising the state the session loaded at launch, not your
   change.

5. One logical change per commit, with a `type(scope): imperative subject` message
   (`fix(commands): ...`, `docs: ...`).
6. Add a `CHANGELOG.md` entry whenever the published content changes meaning. Say what changed and why,
   and include the evidence if the reason is a measurement.

## Review

Maintainers are listed in [.github/CODEOWNERS](./.github/CODEOWNERS). This plugin is kept in lockstep
with the `neural-seam` runtime's Claude Code host adapter, so a change to its wiring may need a matching
runtime change before it can be merged. If that applies to your pull request, we will say so on the
pull request rather than leaving it open without explanation.

The wiring in question is the identity the runtime uses to recognise what it manages: the plugin name,
the marketplace name, the MCP server key and its arguments, and the hook commands and their timeout.
Change one side without the other and the runtime either wires a project twice or cleans up the wrong
thing.

## How this plugin relates to the runtime

Useful when judging whether a change belongs here at all.

- **The plugin wires the host.** The format carries an MCP registration, lifecycle hooks and commands,
  so the plugin carries all three, and with it installed the runtime stops writing them per project.
- **The plugin carries no product state.** Signing in, the signed manifest and the project binding stay
  with the runtime, because they belong to a project rather than to a host.

So installing the plugin does **not** replace `neural-seam connect`.

## Before a release

Some of what this repository claims can only be checked by running Claude Code, and a public runner
cannot install and drive it reproducibly. So these are **not** in CI, and they are **mandatory before
tagging**. Run them on a machine with `claude` installed and record the versions.

```sh
node scripts/check-bundle.mjs             # the static gates CI also runs
node scripts/check-bundle.test.mjs        # the mutation proofs for those gates
claude plugin validate . --strict         # the host's own validator
claude plugin validate .claude-plugin/plugin.json --strict
claude --version                          # record it; the claims below are version specific
neural-seam version                       # record it too
```

Then update [COMPATIBILITY.md](./COMPATIBILITY.md) with the versions you actually ran. A row there is
a record of a test that happened, so do not widen one into a range.

### Install it for real. Nothing else finds this class of bug

**This step is not optional, and it is the one that has already caught a broken release.** 0.5.0
installed and then failed to load, and every cheaper check said it was fine: the validator passed,
loading from a local directory worked, and `claude plugin details` printed the full inventory. Only
installing it the way a user does surfaced the error.

Use a throwaway configuration directory so your own is untouched:

```sh
export CLAUDE_CONFIG_DIR="$(mktemp -d)"
claude plugin marketplace add NeuralSeam/neural-seam-claude   # or a local path, to test before publishing
claude plugin install neural-seam@neural-seam
claude plugin list --json
```

Remove that directory when you are done. Because it came from `mktemp -d`, deleting it cannot touch
your own configuration.

**Read `claude plugin list` and confirm the status is not `failed to load`.** It is the only command
that reports a load error; `claude plugin details` renders the inventory either way. `claude plugin
list --json` gives the full text of any error, which the table truncates.

Then, in a session with the plugin loaded:

1. **The commands are there.** All 11 `/neural-seam:ns-*` entries appear, each with the description
   from its frontmatter.
2. **The MCP server is wired by the plugin.** `/mcp` shows `neural-seam-runtime` and it answers.
3. **The hooks fire.** A session start prints the runtime's status line.
4. **The runtime contract the commands rely on.** The commands present the state and message that
   `check_setup` returns and the prompts that `next_job` and `exec_activity` return. Confirm against
   the **published** runtime, not a development build, and do not document a behaviour that only a
   development build has.
5. **A command that changes something is not invoked on its own.** Every command that writes, clones,
   repairs or generates carries `disable-model-invocation: true`, so it runs when the developer types
   it and not when a model decides it is relevant. `scripts/check-bundle.mjs` fails if one loses the
   flag; confirm in a session that the read-only commands still work and that nothing mutable fires
   unasked.

Then tag the release as `neural-seam-claude-v<version>`, signed, matching the version in both manifests
and the newest changelog entry.

Record the results in the changelog entry when a claim in the documentation depends on them.

By contributing, you agree that your contribution is licensed under the repository's
[MIT license](./LICENSE).
