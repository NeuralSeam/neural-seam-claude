---
description: "Neural Seam: no project yet. Shows the setup wizard link so you can create one."
---

# /neural-seam:ns-create

Command managed by Neural Seam. The case where **the project does not exist yet**. It takes the
developer to the wizard. It does not create the project for them: creating it is something the
developer does in the browser.

## Act now

1. Call the `check_setup` tool of the `neural-seam-runtime` MCP server.
2. Present the `message` and any setup URL the runtime returned, **exactly as returned**. Never build a
   URL and never assume a port. Ask the developer to open it and create the project there.
3. Explain the step after creating it, because it is the part that surprises people: the browser binds
   nothing here. Once the project exists, the web app shows the `neural-seam connect <projectId>`
   command; running it in **this** directory writes the signed manifest and binds the project to it.
4. If the response says a project already exists, or that this directory is already bound, say so and
   point at `/neural-seam:ns-connect` or `/neural-seam:ns-list` instead of creating anything.
5. Close with the next step: once the project is created and bound, `/neural-seam:ns-status` to confirm, then
   `/neural-seam:ns-generate`.

If the call returns an `error` (network or sign in), point at `neural-seam login` or
`/neural-seam:ns-doctor`.
