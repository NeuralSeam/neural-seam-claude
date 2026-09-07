---
description: "Neural Seam: clones the project's code only. Idempotent, and separate from binding."
disable-model-invocation: true
argument-hint: "<projectId>"
---

# /neural-seam:ns-clone $ARGUMENTS

Command managed by Neural Seam. Fetches **the code only** - a separate concern from binding
(`/neural-seam:ns-connect`). Idempotent: an existing checkout is updated rather than cloned again.

The developer supplies the project identifier in `$ARGUMENTS`. If they do not have it,
`/neural-seam:ns-status` reports it; never invent one.

## Act now

1. If `$ARGUMENTS` is empty, ask for the identifier, or run `/neural-seam:ns-status` to find it, and
   stop until you have it.
2. Run `neural-seam clone <projectId>` in the terminal. It resolves the project's repository and clones
   it locally, submodules included. If the directory already exists with the right remote, it updates
   the checkout instead of cloning again and says so.
3. **Say where the code landed, and what that means.** The clone creates a **subdirectory**. Binding
   from the current session would write the manifest next to the code rather than with it, because the
   runtime resolves the project from the working directory. So tell the developer to reopen the session
   inside the cloned subdirectory before running `/neural-seam:ns-connect`.
4. Close with the next step: reopen the session in the subdirectory, then `/neural-seam:ns-status`.

If the command fails on sign in or network, show the message and point at `neural-seam login` or
`/neural-seam:ns-doctor`.
