## What changes for someone using the plugin

<!-- One or two sentences, written for a user rather than a maintainer. "No user-visible change" is a
fine answer for a docs-only fix. -->

## Why

<!-- If the reason is a measurement, say what you ran and which versions you ran it against. -->

## Checks

- [ ] `node scripts/check-bundle.mjs` passes
- [ ] `node scripts/check-bundle.test.mjs` passes, and a new rule came with a new mutation case
- [ ] `claude plugin validate . --strict` and `claude plugin validate .claude-plugin/plugin.json --strict` pass
- [ ] Tried in a real session (`claude --plugin-dir .` then `/reload-plugins`), if a command, a hook or the MCP registration changed
- [ ] Any command that changes something still declares `disable-model-invocation: true`
- [ ] `CHANGELOG.md` updated, if the published content changed meaning
- [ ] `COMPATIBILITY.md` updated, if this was tested against versions not already listed
- [ ] The version agrees in `plugin.json`, the marketplace entry and the changelog, if it was bumped

## Does this need a matching runtime change?

<!-- The plugin name, the marketplace name, the MCP server key and its arguments, and the hook
commands are how the neural-seam runtime recognises the setup it manages. Changing one side alone
makes it wire a project twice or clean up the wrong thing. -->
