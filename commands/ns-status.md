---
description: "Neural Seam: read-only compass. Reports where the project stands and which command comes next."
---

# /neural-seam:ns-status

Command managed by Neural Seam. It **reports and stops**: no binding, no writing, no working around a
refusal. It is the compass.

## Act now

1. Call the `check_setup` tool of the `neural-seam-runtime` MCP server, with no arguments.
2. Report **from the response**, not from a table in this file:
   - present the `message` the runtime returned, and any URL it carries, **exactly as returned**.
     Never build a URL and never assume a port.
   - when the response points at a step the developer takes (signing in, creating or picking a project
     in the browser, running a command in the terminal), name that step and stop.
   - when the step matches one of the commands in `/neural-seam:ns-help`, name that command too.
3. If the runtime refused to bind because this directory is not a clone of the project's repository,
   show the refusal **as it came** and point at `/neural-seam:ns-clone`. A refusal is a result, not an
   error to route around.
4. If the call returns an `error` (network or sign in), say so and point at `/neural-seam:ns-doctor`
   instead of carrying on.

To be walked through the next step instead of only being told it, use `/neural-seam:ns-start`.

## What this command does not do

- It keeps **no table of states and transitions**. The runtime owns the product's flow and returns a
  message written for the developer; this command presents it. A state this file has never seen is
  handled like any other.
- It changes nothing: no binding, no card moved, no card closed.
- It builds no URLs and assumes no port.
