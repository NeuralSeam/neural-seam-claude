---
description: "Neural Seam: binds an existing project to this directory, without cloning any code."
disable-model-invocation: true
argument-hint: "[projectId]"
---

# /neural-seam:ns-connect $ARGUMENTS

Command managed by Neural Seam. The case where **the project already exists** and the developer wants
it bound to this directory. It writes the binding; it does not fetch code. For the code alone, use
`/neural-seam:ns-clone`.

## Act now

1. **Guided path, nothing to type.** Call the `check_setup` tool of the `neural-seam-runtime` MCP
   server. Present the `message` and any URL it returned, **exactly as returned** - never build a URL,
   never assume a port. The developer picks the project there, and the binding is written to this
   directory, so no identifier has to be typed.
2. **Terminal path.** If `$ARGUMENTS` carries an identifier, or the browser is not available, run
   `neural-seam connect <projectId>`. It fetches the signed manifest, verifies the signature, and
   writes the binding into the current directory.
3. **A refusal is a result.** The runtime refuses to bind when this directory is not a clone of the
   project's repository, and it writes nothing. Show the refusal **as it came** and follow it to
   `/neural-seam:ns-clone`. Do not insist, do not work around it, and never report success.
4. If the response says there is no project to bind, point at `/neural-seam:ns-create`. If it says this
   directory is already bound, point at `/neural-seam:ns-list`.
5. Close with the next step: `/neural-seam:ns-status` to confirm, then `/neural-seam:ns-generate`.

If anything fails on sign in or network, show the message and point at `neural-seam login` or
`/neural-seam:ns-doctor`.
