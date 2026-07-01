# Changelog

Todas as mudancas notaveis do plugin `neural-seam-claude`. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/); versionamento SemVer independente.

## [0.1.0] - 2026-07-01

### Added

- Manifesto do plugin (`.claude-plugin/plugin.json`, `name: neural-seam`).
- Marketplace (`.claude-plugin/marketplace.json`, `name: neuralseam`) listando o plugin em `source: "./"`.
- Registro MCP global (`.mcp.json`): servidor `neural-seam-runtime` via `neural-seam serve --project-from-cwd`.
- Hooks de lifecycle (`hooks/hooks.json`): `SessionStart` / `PreToolUse` / `Stop` -> `neural-seam hook <event>`.
- Comandos `/neural-seam:ns-check`, `/neural-seam:ns-doctor`, `/neural-seam:ns-sync`, `/neural-seam:ns-start`.
- README com instalacao (marketplace + `--plugin-dir`), compliance P1-P5 e politica de corte do fallback `materialize`.

Realiza a fronteira `HostTarget` (ADRs `adr-host-adapter-decoupling` e `adr-claude-code-plugin-adapter`).
