---
description: "Neural Seam: index of every /neural-seam:ns-* command and the usual path through them."
---

# /neural-seam:ns-help

Command managed by Neural Seam. The map of the commands and the usual path through them. **It calls no
tool** - it is a static index. Present the content below, adapting the tone if the developer asked
about a specific case.

## How it works

There is one guided command (`ns-start`), one that only reports (`ns-status`), and individual commands
for when you already know what you want. Running any of them again does only what is left.

- **I do not know what I need** - `/neural-seam:ns-start` walks you through the next step.
- **I just want to know where I am** - `/neural-seam:ns-status`.

Write every command out **with the plugin namespace**, exactly as the tables below spell it. This host
namespaces a plugin's commands as `/<plugin>:<command>`, so `/neural-seam:` is part of the name, not
decoration.

## Getting set up

| Command | What it does |
| ------- | ------------ |
| `/neural-seam:ns-status` | Reports the state and the command that comes next. |
| `/neural-seam:ns-start` | Guided: reads the state and advances one step. |
| `/neural-seam:ns-create` | No project yet: shows the setup wizard link. |
| `/neural-seam:ns-connect [<id>]` | Project already exists: binds it to this directory. |
| `/neural-seam:ns-clone <id>` | Clones the project's code only. Idempotent. |
| `/neural-seam:ns-doctor` | Repairs the environment: sign in, language servers, MCP registration. |

## Day to day

| Command | What it does |
| ------- | ------------ |
| `/neural-seam:ns-generate` | Bootstraps the backlog: generates the artefacts and creates the cards. |
| `/neural-seam:ns-list [status] [kind]` | Lists the cards, grouped by status. |
| `/neural-seam:ns-open` | Shows the local dashboard link. |
| `/neural-seam:ns-exec <id>` | Renders a card's prompt for you to review and implement. |

## The usual path

1. `/neural-seam:ns-start` - sign in, set up and bind, until the state is ready.
2. `/neural-seam:ns-generate` - generate the artefacts and create the first cards.
3. `/neural-seam:ns-list` - pick a card.
4. `/neural-seam:ns-exec <id>` - implement it. Repeat 3 and 4.

Two things live outside the plugin: the `neural-seam` binary on your `PATH`, and `neural-seam login`.
If anything gets stuck, `/neural-seam:ns-doctor`.
