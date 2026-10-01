---
description: "Neural Seam: bootstraps the backlog of a connected project - generates the artefacts and creates the cards, or regenerates a backlog it generated before."
disable-model-invocation: true
---

# /neural-seam:ns-generate

Command managed by Neural Seam. Bootstraps the backlog of a project that is already set up: it
generates the initial artefacts and turns the backlog into cards. When a previous generation left
cards that nobody has started, it can also regenerate: delete those cards and generate a new batch.

**Nothing is generated or deleted until the developer says so.** You present; they decide.

## Act now

1. Optionally confirm the state with `check_setup`. If the project is not ready, hand off to
   `/neural-seam:ns-start`.
2. Look for a backlog generated before. Call the `delete_activities` tool with `tag: "generated"`,
   `status: "BACKLOG"` and `dry_run: true`. A dry run deletes nothing: it only lists the cards that
   match.
   - If the list is empty, go to step 3. The command then behaves exactly as a first generation.
   - If cards are listed, show every one of them (title, id, board, status) without summarising or
     dropping any, and ask whether to **regenerate** (delete those cards and generate a new batch) or
     **keep** them and continue. Do nothing until they choose.
   - If they choose to regenerate, wait for their explicit confirmation of that list, then call
     `delete_activities` again with `dry_run: false` and the `confirm_token` the dry run returned.
     If the tool refuses, present the refusal as it came back and follow what the tool says; do not
     work around it.
   - Only cards tagged `generated` and still in `BACKLOG` are ever in this list. Cards created by
     hand, or already picked up, are never deleted here.
   - If the `delete_activities` tool is not available, the installed runtime predates it. Say so,
     point at `/neural-seam:ns-doctor` to update it, and continue without offering to regenerate.
     Never delete the cards one by one instead.
3. Call the `next_job` tool. It returns the rendered generation `prompt` and the kind of work it
   covers. Present that prompt to the developer and **wait for their confirmation**. Generate nothing
   before it.
   - If the response says work is blocked by prerequisites, show what is blocking and stop.
4. Once the developer confirms, generate what the prompt asks for. **Follow the prompt the runtime
   returned** rather than a recipe in this file: it already carries what this project needs, including
   any extra instruction for a project that had code before it was connected. If it tells you to read
   the existing code first, read it first, and keep the backlog to the real gaps instead of proposing
   work that already exists.
5. Persist the result with the `save_insumos` tool and check what it returns. It creates the backlog
   cards itself, so do not create the same cards again with `create_activity`.
6. Summarise what was deleted (when you regenerated), what was persisted and which cards were created.
   Close with `/neural-seam:ns-list` and `/neural-seam:ns-exec <id>`.

If a call returns an `error` (network or sign in), stop and point at `neural-seam login` or
`/neural-seam:ns-doctor`.
