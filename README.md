# neural-seam-claude

Adapter de host **Claude Code** do Neural Seam, entregue como um **plugin** de Claude Code.

Realiza a fronteira `HostTarget` decidida nos ADRs `adr-host-adapter-decoupling` e
`adr-claude-code-plugin-adapter` (ambos Aceitos em 2026-07-01): o conhecimento de formatos `.claude/`
sai do core Go (`src/runtime/internal/materialize`) e passa a viver neste pacote de host. O runtime
continua host-neutro (servidor MCP stdio + bridge HTTP) e **nao** depende deste plugin.

## O que o plugin carrega

| Componente | Arquivo | Efeito |
| ---------- | ------- | ------ |
| Registro MCP **global** | `.mcp.json` | Servidor `neural-seam-runtime` via `neural-seam serve --project-from-cwd`. Como o servidor resolve o projeto pelo cwd, **um** registro atende todos os projetos. |
| Hooks de lifecycle | `hooks/hooks.json` | `SessionStart` / `PreToolUse` / `Stop` invocam `neural-seam hook <event>`. |
| Comandos | `commands/ns-*.md` | `/neural-seam:ns-check`, `/neural-seam:ns-doctor`, `/neural-seam:ns-sync`, `/neural-seam:ns-start`. |

## Pre-requisitos (fora do escopo do plugin)

O plugin **nao** empacota o binario Go (`bin/`) nem substitui a autenticacao. Antes de usar:

1. **Instale o runtime** (`neural-seam` no PATH) pelo instalador/one-liner. O `.mcp.json` e os hooks
   deste plugin chamam `neural-seam` diretamente no PATH.
2. **Autentique e conecte** um projeto: `neural-seam login` (device flow) + `neural-seam connect
   <projectId>`. Auth device-flow, manifesto assinado (`.neural-seam/manifest.json`) e binding de
   projeto sao **estado de produto**, nao config de host, e continuam a cargo do CLI.

## Instalacao

### Via marketplace (recomendado)

```
/plugin marketplace add NeuralSeam/neural-seam-claude
/plugin install neural-seam@neuralseam
```

Updates chegam quando o campo `version` do plugin e bumpado (o marketplace pina por `version`/SHA).
Atualize a copia local do catalogo com `/plugin marketplace update`.

### Local (desenvolvimento/teste)

```
claude --plugin-dir ./neural-seam-claude
```

`/help` deve listar `/neural-seam:ns-*`; o servidor MCP `neural-seam-runtime` aparece e responde
`check_setup` / `initial_instructions`.

## Compliance (P1-P5)

- **P1:** o plugin nao introduz autenticacao Anthropic; so registra MCP + hooks + comandos.
- **P2:** hooks/registro sao os mesmos de sessao dev-iniciada; nao ha submissao remota de inferencia.
- **P4:** extensao explicita, nao imita o cliente oficial (o MCP se identifica como `neural-seam-runtime`).
- **P5:** sem telemetria por default; nenhum hook de telemetria e instalado.

Ver `atividades-analise-projeto/00-proposta/concluido/adr-anthropic-compliance-principles.md`.

## Politica de corte do fallback `materialize`

Enquanto este plugin nao estabiliza, o runtime **mantem** a materializacao por-projeto do harness
Claude Code (`.mcp.json`, hooks em `.claude/settings.json`, stubs e o bloco em `CLAUDE.md`) como
caminho default, atras da fronteira `HostTarget` (opcao C de transicao do ADR). Isso garante que
`neural-seam connect`/`register` continuem produzindo um harness funcional com zero dependencia externa.

**Corte:** remover o fallback de materializacao de host-config (passando a gate na presenca do plugin)
quando `neural-seam-claude` estiver publicado numa marketplace e pinado por `version`/SHA.

- **Alvo:** runtime `v0.3.0` **ou** `2026-09-30`, o que vier primeiro (espelha o TODO em
  `src/runtime/internal/materialize/target.go`).
- **Permanece por-projeto apos o corte:** o estado de produto (manifesto assinado, AppHost,
  skills de conventions + `routes.json` e o hook `conventions-advisory` data-driven). O plugin cobre
  apenas o **host-config**.
- **Rastreado por:** este card (`atividades-desenvolvimento/01-novas-funcionalidades/runtime/neural-seam-claude-plugin.md`)
  e o par `extract-hosttarget-boundary`.

## Licenca

MIT. Ver [`LICENSE`](./LICENSE). Herdeiro enxuto do Serena MCP (MIT) via `src/runtime`.
