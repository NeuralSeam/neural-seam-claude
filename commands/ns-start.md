---
description: "Neural Seam: guided onboarding. Reads the project state and advances one step at a time."
disable-model-invocation: true
---

# /neural-seam:ns-start

Command managed by Neural Seam. The guided front door: it asks the runtime where the project stands
and helps the developer take the next step. Run it as often as you like - it only ever does what is
left.

It reimplements nothing the runtime owns. Binding the directory is the one step it carries out
itself, because `/neural-seam:ns-connect` can only be run by the developer: pointing at it from here
would leave the directory unbound. Every other step names the individual command the developer could
have run themselves (`/neural-seam:ns-create`, `/neural-seam:ns-generate`, and so on).

## Act now

1. Call the `check_setup` tool of the `neural-seam-runtime` MCP server.
2. Take the next step **from the response**, not from a script in this file:
   - present the `message` the runtime returned, and any URL it carries, **exactly as returned**.
     Never build a URL and never assume a port.
   - when the step belongs to the developer (signing in, creating or picking a project in the browser,
     running a command in the terminal), hand it over and **stop there**. Wait for the developer's
     explicit confirmation before going further.
   - when the step matches one of the commands in `/neural-seam:ns-help`, name that command.
3. **When the response says this directory is not bound yet, bind it here.** Do not name
   `/neural-seam:ns-connect` and stop.
   - **Guided path:** present the `message` and URL from `check_setup` exactly as returned. The
     developer picks the project there and the runtime writes the binding. Wait for their
     confirmation.
   - **Terminal path:** when the developer already gave a project identifier, or the browser is not
     available, ask for explicit confirmation and then run `neural-seam connect <projectId>`. It
     fetches the signed manifest, verifies the signature and writes the binding into the current
     directory. Present its output as it came.
   - Then call `check_setup` again and confirm from the response that the directory is bound. Never
     report the binding from the command having run.
4. If the runtime refuses to bind because this directory is not a clone of the project's repository,
   show the refusal **as it came** and follow it to `/neural-seam:ns-clone`. Never carry on as though
   the binding had happened: a swallowed refusal reproduces the same problem wearing different clothes.
5. After a clone, the code lands in a **subdirectory**. The developer has to reopen the session inside
   that subdirectory before binding, because the runtime resolves the project from the working
   directory. Say so, and stop until they confirm.
6. After the developer confirms a step is done, call `check_setup` again and repeat from 2.
7. Once the state is ready: if the response says there is work waiting, offer
   `/neural-seam:ns-generate` to bootstrap the backlog. Otherwise suggest `/neural-seam:ns-list` to see
   the cards and `/neural-seam:ns-exec <id>` to implement one. Offer it - do not start a generation
   yourself.
8. Close each step in one line: **"did X -> next: ..."**.

If a call returns an `error` (network or sign in), stop and point at `neural-seam login` or
`/neural-seam:ns-doctor`.

## What this command does not do

- It keeps **no table of states and transitions**. The runtime owns the product's flow and returns a
  message written for the developer; this command presents it. A state this file has never seen is
  handled like any other.
- It does not decide that a piece of work is finished. Moving or closing a card is the developer's
  call, made from `/neural-seam:ns-list` using the identifier the runtime returned.
- It builds no URLs and assumes no port.
- It writes nothing without the developer. The binding is written by the runtime, after the developer
  picked the project or confirmed the terminal command. Every model call here follows something the
  developer asked for, in the session they opened.
