---
description: "Neural Seam: diagnoses and repairs the environment, then checks that the MCP server is wired."
disable-model-invocation: true
---

# /neural-seam:ns-doctor

Command managed by Neural Seam. Repairs the environment, then checks the wiring that fails **quietly**
on this host: the runtime's MCP server not being there at all.

## Act now

1. Run `neural-seam doctor --fix` in the terminal and show the output. It repairs sign in, language
   servers and the project registration, then re-checks the result.
2. Make sure the binary is current: `neural-seam version`, and `neural-seam upgrade` if a newer release
   exists.
3. If the `neural-seam-runtime` server does not answer, check in this order:
   - `neural-seam version` answers, so the binary is on `PATH`;
   - the plugin is installed **and enabled**, in `/plugin`. A plugin that is registered but disabled
     loads nothing at all, and looks exactly like one that was never installed;
   - the server is listed by `/mcp`.

   With this plugin installed the registration comes from the plugin itself, so no project needs its
   own MCP configuration.
4. **A plugin change may need a reload.** If the plugin was installed, enabled or updated during this
   session, ask the developer to run `/reload-plugins` before concluding anything is broken, and
   `/reload-plugins --force` if it warns that reloading would re-read the conversation. Restarting
   Claude Code is the fallback when the reload does not settle it.
5. As a last resort, when the plugin cannot be used, `neural-seam register` writes the server into the
   project's own MCP configuration. It coexists with the developer's own servers. Offer it; do not run
   it without being asked.
6. Summarise what was fixed and what still needs the developer to act.
