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

**What this plugin installs is content only:** markdown and JSON, with no compiled code and nothing
that executes on its own. What it does is wire Claude Code to software that runs on your machine, so
the security surface it owns is the wiring itself.

The repository additionally contains the checks and CI workflows that gate that content, written in
JavaScript and YAML. They run in CI and on a contributor's machine; they are **not** shipped to users
and are not part of what the plugin installs.

**In scope for this repository:**

- The MCP server registration in `.mcp.json`.
- The lifecycle hooks in `hooks/hooks.json`, and the commands they invoke.
- Instructions in `commands/` that would lead an agent to leak secrets, weaken a permission boundary,
  or take a destructive action without the developer asking for it.
- Anything in this repository or its history that should not be public.

**Out of scope here, but still wanted:** vulnerabilities in the `neural-seam` runtime, the Neural Seam
backend, or the web applications. Report those through the same private channel; they will be routed
to the right component. Vulnerabilities in Claude Code itself belong to Anthropic.

## What the hooks do

Unlike the wiring for some other agent CLIs, this plugin **does** register lifecycle hooks, so it is
worth stating exactly what they run. All three invoke the `neural-seam` binary on your `PATH`, read the
host's hook payload on standard input, and **make no network call of their own**.

| Event | Command | What it does |
| --- | --- | --- |
| `SessionStart` | `neural-seam hook session-start` | Prints a one-line status of the project bound to this directory. Always exits 0. |
| `PreToolUse` | `neural-seam hook pre-tool-use` | Enforces read-only mode while a verification subagent is running, so a review pass cannot rewrite your tree. It blocks only in that case. |
| `Stop` | `neural-seam hook stop` | Decides whether the session is worth curating and, if so, writes a marker file under the runtime's own local directory. Bounded to 5 seconds and always exits 0, so it never delays shutdown. |

None of them is a telemetry hook, and none of them is installed for telemetry. Telemetry, where it is
enabled at all, is a separate opt-in setting of the runtime; see [PRIVACY.md](./PRIVACY.md).

## What this plugin can and cannot do

Worth knowing before assessing a report.

- The plugin **holds no credentials**. It contains no tokens and no endpoints beyond the local
  `neural-seam` binary name. See [PRIVACY.md](./PRIVACY.md) for where credentials are kept.
- Everything the plugin references is the `neural-seam` binary resolved from your `PATH`. **A hostile
  binary earlier in your `PATH` would be invoked instead.** That is a property of `PATH` resolution;
  the mitigation is to install the runtime from the official installer and check `neural-seam
  version`.
- The plugin **installs nothing**. It does not fetch the runtime, does not sign you in, and does not
  bind a project.
- The plugin **starts no work on its own**. Its commands render prompts for you to review.

## Release signing

Release tags are signed with SSH. Verify one yourself:

```sh
git clone https://github.com/NeuralSeam/neural-seam-claude
cd neural-seam-claude
git verify-tag <tag>
```

The public key:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINj1X4nyMhJwo4xO+A/nJzBU/5XWq5A6WT+WIQMGy2aD
```

Fingerprint: `SHA256:j9LD61vbZM+BNx2s+solZAnxdu1kSWEbIP8KE/K+DuA` (ED25519).

To have `git` name the signer instead of only reporting a key, put it in an allowed-signers file:

```sh
echo 'caio.souza.s@gmail.com namespaces="git" ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINj1X4nyMhJwo4xO+A/nJzBU/5XWq5A6WT+WIQMGy2aD' \
  >> ~/.config/git/allowed_signers
git config gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
git verify-tag <tag>
```

`git verify-tag` is the check that does not depend on anyone's interface: it verifies the signature
against the key above, on your machine. GitHub also shows a verification state for a tag, which is
useful but is a property of the account's key registration rather than of the signature, so treat the
local check as the authority.

Only the holder of the private key can produce these signatures, and the private key is never
published.

## Supported versions

Only the latest published version receives fixes. Versions are listed in
[CHANGELOG.md](./CHANGELOG.md), and the combinations that were tested are in
[COMPATIBILITY.md](./COMPATIBILITY.md). To update, run `/plugin marketplace update` in Claude Code,
update the plugin, then `/reload-plugins`.
