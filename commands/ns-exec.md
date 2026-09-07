---
description: "Neural Seam: prepares a card for implementation by rendering its prompt for you to review."
disable-model-invocation: true
argument-hint: "<cardId>"
---

# /neural-seam:ns-exec $ARGUMENTS

Command managed by Neural Seam. Prepares a card for implementation: it asks the runtime for the card's
job and renders the prompt.

**The prompt is rendered for the developer to review. Nothing is submitted on its own**; the work runs
when they say so.

`$ARGUMENTS` carries the card's identifier. It is the only address a card has here, and it comes from
the runtime - never guess one, and never look a card up by its title.

## Act now

1. If `$ARGUMENTS` is empty, **do not fail for the want of one**: run `/neural-seam:ns-list` first,
   help the developer pick a card, and stop until you have it.
2. Call the `exec_activity` tool of the `neural-seam-runtime` MCP server with that identifier. It
   returns the card's kind, its job and the rendered `prompt`.
3. Present the prompt and wait for confirmation. Once confirmed, carry out the work the prompt
   describes: edit the code, run the project's own verification, and commit the way the project asks.
4. When you are done, report the result and offer `/neural-seam:ns-list` to see what is left. Moving
   the card is the developer's call - offer it, using the `update_activity_status` tool, rather than
   deciding the work is finished yourself.

If the call returns an `error`, or the project is not connected, point at `/neural-seam:ns-status`.
