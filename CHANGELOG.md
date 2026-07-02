# Changelog

Todas as mudancas notaveis do plugin `neural-seam-claude`. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/); versionamento SemVer independente.

## [0.2.0] - 2026-07-02

Redesenho da superfície de comandos como maquina de estados + atomicas + loop de trabalho. ADR:
`atividades-analise-projeto/00-proposta/plugin/adr-superficie-comandos-plugin-claude.md`.

### Added

- `/neural-seam:ns-create` - Cenario A (greenfield): mostra o `setup_url` do wizard da bridge.
- `/neural-seam:ns-connect [<id>]` - Cenario B: vincula um projeto existente (via `connect_url` da bridge; `<id>` como fallback headless). So o binding, sem clonar.
- `/neural-seam:ns-clone <id>` - clona so o codigo (idempotente); ortogonal ao connect.
- `/neural-seam:ns-generate` - bootstrap do backlog (insumos + cards), extraido do antigo `ns-start`.
- `/neural-seam:ns-list [status] [kind]` - lista os cards agrupados por status.
- `/neural-seam:ns-open` - mostra o link do dashboard/bridge local (`open_dashboard`).
- `/neural-seam:ns-exec <id>` - renderiza o prompt do card para implementar (P2, nunca auto-submete).
- `/neural-seam:ns-help` - indice de todos os comandos + fluxo tipico.

### Changed

- `/neural-seam:ns-check` -> **renomeado** para `/neural-seam:ns-status` (bussola read-only).
- `/neural-seam:ns-start` - agora e um motor guiado **fino**: le o estado e avanca 1 passo, delegando
  as atomicas (nao embute mais geracao de insumos/cards, que foi para `ns-generate`).

### Removed

- `/neural-seam:ns-sync` - o welding `connect` + `clone` num passo. Substituido por
  `/neural-seam:ns-connect` + `/neural-seam:ns-clone`, orquestrados pelo `ns-start`.

### Notes

- **Corte do fallback `materialize`:** este release posiciona o plugin como fonte **unica** de
  host-config. O gate real no runtime (`src/runtime/internal/materialize/target.go`) e o
  descarregamento das copias materializadas nos projetos-alvo sao rastreados como cards proprios.

## [0.1.0] - 2026-07-01

### Added

- Manifesto do plugin (`.claude-plugin/plugin.json`, `name: neural-seam`).
- Marketplace (`.claude-plugin/marketplace.json`, `name: neuralseam`) listando o plugin em `source: "./"`.
- Registro MCP global (`.mcp.json`): servidor `neural-seam-runtime` via `neural-seam serve --project-from-cwd`.
- Hooks de lifecycle (`hooks/hooks.json`): `SessionStart` / `PreToolUse` / `Stop` -> `neural-seam hook <event>`.
- Comandos `/neural-seam:ns-check`, `/neural-seam:ns-doctor`, `/neural-seam:ns-sync`, `/neural-seam:ns-start`.
- README com instalacao (marketplace + `--plugin-dir`), compliance P1-P5 e politica de corte do fallback `materialize`.

Realiza a fronteira `HostTarget` (ADRs `adr-host-adapter-decoupling` e `adr-claude-code-plugin-adapter`).
