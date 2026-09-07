---
description: "Neural Seam: lists the project's cards, grouped by status, with the identifier ready to paste."
argument-hint: "[status] [kind]"
---

# /neural-seam:ns-list $ARGUMENTS

Command managed by Neural Seam. Lists the cards of the connected project. Read-only.

`$ARGUMENTS` may carry a status filter and a kind filter.

## Act now

1. Call the `list_activities` tool of the `neural-seam-runtime` MCP server, passing along whichever
   filters `$ARGUMENTS` gave.
2. Present the cards **grouped by status**. For each one show the identifier ready to paste, its kind,
   its title, and what is blocking it when the response says it is blocked.
3. Use the values the response returns. Do not translate an identifier, and do not rename a status or a
   kind the runtime did not return - a value this file has never seen is shown as it came.
4. Close with the next step: `/neural-seam:ns-exec <id>` to implement a card, or `/neural-seam:ns-open`
   to inspect it in the dashboard.

If the call returns an `error`, or the project is not connected, point at `/neural-seam:ns-status`.
