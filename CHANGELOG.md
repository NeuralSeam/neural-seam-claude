# Changelog

Notable changes to the Neural Seam plugin for Claude Code. Format based on
[Keep a Changelog](https://keepachangelog.com/); independent SemVer.

Entries are newest first and record what you can notice when you install or update: new behaviour,
fixes, security changes, compatibility changes, and anything you have to do by hand.

## [0.5.3] - 2026-09-08

Documentation only. No change to the commands, the MCP registration or the hooks.

### Changed

- **The runtime's own documentation is now linked directly**, rather than described here. Privacy,
  security, support, the user manual and the licence for the `neural-seam` runtime live with the
  runtime: [privacy](https://github.com/NeuralSeam/neural-seam-releases/blob/main/PRIVACY.md), [security](https://github.com/NeuralSeam/neural-seam-releases/blob/main/SECURITY.md), [support](https://github.com/NeuralSeam/neural-seam-releases/blob/main/SUPPORT.md),
  [user manual](https://github.com/NeuralSeam/neural-seam-releases/blob/main/USER-MANUAL.md), [licence](https://github.com/NeuralSeam/neural-seam-releases/blob/main/LICENSE.md).
- **[COMPATIBILITY.md](./COMPATIBILITY.md) now records a published runtime.** Plugin 0.5.3 was tested
  against Claude Code 2.1.263 and `neural-seam` 0.16.1 on Windows 11, using the published binary
  checked against the release's own checksums. The previous warning about testing against a
  development build is gone because it no longer applies.

- **The documentation now states plainly that the `neural-seam` runtime is a separate commercial
  product**, distributed as signed binaries from its own repository, and that the MIT licence here
  covers the Claude Code integration in this repository and nothing else.
- **[PRIVACY.md](./PRIVACY.md) no longer restates the runtime's data handling.** It says what the
  plugin does, which is collect nothing and store nothing, and points at the runtime's own
  documentation for how the runtime processes, stores and deletes data.
- The README is shorter and organised around using the plugin. Detail about how the plugin and the
  runtime divide the work between them has been removed; it belongs in the runtime's documentation,
  not in an integration's README.
- [COMPATIBILITY.md](./COMPATIBILITY.md) keeps the tested matrix and the two Claude Code behaviours
  that affect you, without the history of how they were found.

### Fixed

- **The release verification instructions were incomplete in a way that mattered.**
  [SECURITY.md](./SECURITY.md#release-signing) told you to run `git verify-tag` and treated the
  allowed-signers file as an optional extra for naming the signer. Without that file the command
  prints `Good "git" signature` for a signature made by **any** key and exits non-zero, which reads
  like success. Setting up allowed-signers is now the first step, and the expected output is stated.
- The signing identity published for verification is now `release@neuralseam.cloud` rather than a
  personal address. **The key itself has not changed**, and tags signed before this release continue
  to verify with it.

## [0.5.2] - 2026-09-07

### Security

- **Commands that change something are no longer invoked for you.** `ns-clone`, `ns-connect`,
  `ns-doctor`, `ns-exec`, `ns-generate` and `ns-start` now declare `disable-model-invocation: true`,
  so they run when you type them rather than because a model judged one relevant. That covers every
  command that writes a binding, fetches code, repairs your environment, generates a backlog or
  starts implementation work.

  The five read-only commands are unchanged and stay available to the model. Nothing you could do
  before, you cannot do now.

### Fixed

- **The install and reload instructions were wrong.** They said a plugin only takes effect in the
  next session and that you must restart Claude Code. Current versions can activate a plugin during
  the install, and `/reload-plugins` applies a change to the session you are in. Restarting is now
  described as the fallback.
- **Compatibility no longer claims more than was tested.** The previous release said the plugin
  worked with any published release of the runtime, which had not been verified.
- The per-path conventions advisory was described as something the host could not support. It is
  simply not part of this plugin, and is handled by the runtime.

### Added

- [COMPATIBILITY.md](./COMPATIBILITY.md), listing the versions this has been run against.
- A CodeQL workflow, and mutation tests for the repository's own checks.

### Changed

- [README.pt-BR.md](./README.pt-BR.md) rewritten in proper Brazilian Portuguese, with the accents it
  was missing. It now covers installing, checking, updating and removing the plugin without needing
  the English text.

## [0.5.1] - 2026-09-07

### Fixed

- **0.5.0 installed and then failed to load. Update to this version.** `/plugin` reported
  `failed to load`, with no commands and no MCP server. The cause, and the check that now prevents
  it, are in
  [COMPATIBILITY.md](./COMPATIBILITY.md#the-hooks-file-must-not-be-declared-in-the-manifest).

  The hooks themselves never changed and still load, from the same file, at the same events.

## [0.5.0] - 2026-09-06

The repository is now written for someone outside the team, and the commands stopped keeping their
own copy of the product's flow.

### Changed

- **All 11 commands rewritten in English, as thin wrappers over the runtime.** Each one presents the
  state and message the runtime returns, instead of deciding from a table kept in the command file.
  A state the file has never seen is handled like any other, so the plugin no longer has to be
  released for the runtime to teach you a new step.
- **Documentation is now in English**, with [README.pt-BR.md](./README.pt-BR.md) as a short
  Portuguese guide.

### Fixed

- **No hardcoded addresses.** Three commands printed an example dashboard URL with a fixed port. The
  runtime picks its port at startup, so anyone who trusted the example opened a page that was not
  there. The commands now show only the URL the runtime returned.
- **No card lookup by literal title.** A card is addressed by the identifier the runtime returns; a
  title can be rewritten at any time, and the lookup silently stopped matching when it was.

### Added

- Security, privacy, support, contributing and trademark policies, issue and pull request templates,
  and a CI check that runs on every pull request.

## [0.4.0] - 2026-09-02

Closes the first-run hole where a developer bound a project in the wrong folder.

### Added

- `ns-start` handles the case where the project exists in Neural Seam but this folder is not its
  repository: it offers the clone first.
- After a clone the code lands in a subdirectory, and the session has to be reopened **inside** it
  before binding. The guided command now explains that instead of letting you bind in the wrong
  place.

### Changed

- `ns-status` reports the same new state and points at the clone.

## [0.3.1] - 2026-07-24

### Changed

- README wording about how the plugin and the runtime divide the work. No behaviour change.

## [0.3.0] - 2026-07-24

### Changed

- **Breaking, for installation:** the marketplace is now called `neural-seam` (it was `neuralseam`),
  so the install reference is `/plugin install neural-seam@neural-seam`. If you added the old
  catalog, run `/plugin marketplace update`, or add the marketplace again.
- With the plugin installed, the runtime no longer writes the same setup into each project as well.
  Without the plugin it writes it as before.

## [0.2.0] - 2026-07-02

Redesign of the command surface: one guided command, one read-only compass, and individual commands.

### Added

- `ns-create`, `ns-connect`, `ns-clone`, `ns-generate`, `ns-list`, `ns-open`, `ns-exec`, `ns-help`.

### Changed

- `ns-check` renamed to `ns-status`.
- `ns-start` became a thin guided engine that advances one step and hands off, instead of doing the
  backlog generation itself.

### Removed

- `ns-sync`, which welded binding and cloning into one step. Use `ns-connect` and `ns-clone`, or let
  `ns-start` sequence them.

## [0.1.0] - 2026-07-01

First release of the Claude Code plugin.

### Added

- Plugin and marketplace manifests, the `neural-seam-runtime` MCP registration, the three lifecycle
  hooks, and the commands `ns-check`, `ns-doctor`, `ns-sync` and `ns-start`.
