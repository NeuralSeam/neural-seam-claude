# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Report it privately through GitHub's private vulnerability reporting on this repository:
**Security > Report a vulnerability**
(<https://github.com/NeuralSeam/neural-seam-claude/security/advisories/new>).

If private reporting is unavailable to you, use the in-product support form at
<https://app.neuralseam.cloud> and mark the request as a security issue. Do not include working
exploit code or credentials in that form; say that you have them and we will arrange a private
channel.

Please include, as far as you can:

- what an attacker gains, and what access they need to start;
- the versions involved (this plugin's version, plus `claude --version` and `neural-seam version`);
- the smallest reproduction you have.

We aim to acknowledge a report within **5 business days** and to give you an assessment and a plan
within **15 business days**. Please give us reasonable time to ship a fix before disclosing publicly.
We will credit you in the release notes unless you ask us not to.

## Scope

This repository holds the Claude Code integration: commands, a plugin manifest, an MCP registration
and hook declarations. It contains no compiled code and nothing in it executes on its own. What it
does is wire Claude Code to software already installed on your machine, so the security surface it
owns is the wiring itself.

**In scope here:**

- The MCP server registration in `.mcp.json`.
- The lifecycle hooks in `hooks/hooks.json`, and the commands they invoke.
- Instructions in `commands/` that would lead an agent to leak secrets, weaken a permission boundary,
  or take a destructive action without the developer asking for it.
- Anything in this repository or its history that should not be public.

**Out of scope here, but still wanted:** vulnerabilities in the `neural-seam` runtime, the Neural
Seam backend, or the web applications. Those are separate products; report them through the same
private channel and they will be routed. Vulnerabilities in Claude Code itself belong to Anthropic.

## What the hooks do

This plugin registers three Claude Code lifecycle hooks, so it is worth stating plainly what they
are. All three run the `neural-seam` binary from your `PATH` and **make no network call of their
own**.

| Event | Command | Effect you can observe |
| --- | --- | --- |
| `SessionStart` | `neural-seam hook session-start` | Prints a one-line status of the project bound to this directory. |
| `PreToolUse` | `neural-seam hook pre-tool-use` | Can decline a tool call that would write while a read-only review is in progress. It does not modify your files. |
| `Stop` | `neural-seam hook stop` | Records session state locally. Time-bounded, and does not delay shutdown. |

None of them is a telemetry hook. What the runtime does with what it records is covered by the
runtime's own documentation; see [PRIVACY.md](./PRIVACY.md) for the boundary.

## What this plugin can and cannot do

Worth knowing before assessing a report.

- The plugin **holds no credentials**. It contains no tokens and no endpoints beyond the local
  `neural-seam` binary name.
- Everything it references is the `neural-seam` binary resolved from your `PATH`. **A hostile binary
  earlier in your `PATH` would be invoked instead.** That is a property of `PATH` resolution, not
  something this plugin can check; the mitigation is to install the runtime from the official
  installer and confirm `neural-seam version`.
- The plugin **installs nothing**, does not sign you in, and does not bind a project.
- The plugin **starts no work on its own**. Its commands render prompts for you to review, and every
  command that would change something requires you to type it.

### What the checks in this repository do and do not cover

`scripts/check-bundle.mjs` and the CI workflow check that the published content is well formed: valid
manifests, agreeing versions, command frontmatter, working links, encoding, and a scan for
credential-shaped strings in what a pull request adds.

They are a guard against mistakes, **not** a security control. A pattern scan cannot prove the
absence of a secret, and none of these checks inspect the `neural-seam` binary, which is a separate
product with its own release process.

## Release signing

Release tags are signed with SSH.

**The allowed-signers file is not optional.** Without it, `git verify-tag` reports
`Good "git" signature` for a signature made by any key and exits non-zero, which is easy to misread
as success. Set it up first:

```sh
echo 'release@neuralseam.cloud namespaces="git" ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINj1X4nyMhJwo4xO+A/nJzBU/5XWq5A6WT+WIQMGy2aD' \
  >> ~/.config/git/allowed_signers
git config gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

Then verify:

```sh
git clone https://github.com/NeuralSeam/neural-seam-claude
cd neural-seam-claude
git verify-tag <tag>
```

A verified tag prints `Good "git" signature for release@neuralseam.cloud` **and exits 0**. If you see
`No principal matched`, the signature was not made by the key above; treat the tag as untrusted.

The signing key:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINj1X4nyMhJwo4xO+A/nJzBU/5XWq5A6WT+WIQMGy2aD
```

Fingerprint: `SHA256:j9LD61vbZM+BNx2s+solZAnxdu1kSWEbIP8KE/K+DuA` (ED25519).

Only the holder of the private key can produce these signatures, and the private key is never
published. GitHub also shows a verification badge on a tag; that reflects the account's key
registration rather than the signature itself, so the local check above is the authority.

## Supported versions

Only the latest published version receives fixes. Versions are listed in
[CHANGELOG.md](./CHANGELOG.md), and the combinations that were tested are in
[COMPATIBILITY.md](./COMPATIBILITY.md). To update, run `/plugin marketplace update` in Claude Code,
update the plugin, then `/reload-plugins`.
