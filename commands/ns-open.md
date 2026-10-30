---
description: "Neural Seam: shows the link to the dashboard of the Neural Seam web app."
---

# /neural-seam:ns-open

Command managed by Neural Seam. Shows the link to the dashboard of the Neural Seam web app for the
developer to open.

Neural Seam hands over the link and stops there; it does not open a browser for the developer.

## Act now

1. Call the `open_dashboard` tool of the `neural-seam-runtime` MCP server.
2. Present the URL **exactly as returned** and ask the developer to open it. Never build a URL and
   never assume a port.
3. If the call returns an `error`, show it as it came and point at `/neural-seam:ns-doctor`.
4. Close by offering `/neural-seam:ns-list` as the way to see the same cards without leaving the
   terminal.
