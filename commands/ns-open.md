---
description: "Neural Seam: shows the local dashboard link, already scoped to the project bound here."
---

# /neural-seam:ns-open

Command managed by Neural Seam. Shows the local dashboard link for the developer to open. The runtime
serves it from the current directory, so it opens already scoped to the project bound here and carries
no identifier in the URL.

Neural Seam hands over the link and stops there; it does not open a browser for the developer.

## Act now

1. Call the `open_dashboard` tool of the `neural-seam-runtime` MCP server.
2. Present the URL **exactly as returned** and ask the developer to open it. Never build a URL and
   never assume a port.
3. If the response says nothing is serving locally, say so and suggest starting the runtime, or the
   tray app if the developer uses it. If that does not help, `/neural-seam:ns-doctor`.
4. Close by offering `/neural-seam:ns-list` as the way to see the same cards without leaving the
   terminal.
