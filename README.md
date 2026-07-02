# neural-seam-claude

Adapter de host **Claude Code** do Neural Seam, entregue como um **plugin** de Claude Code.

## O que o plugin carrega

| Componente | Arquivo | Efeito |
| ---------- | ------- | ------ |
| Registro MCP **global** | `.mcp.json` | Servidor `neural-seam-runtime` via `neural-seam serve --project-from-cwd`. Como o servidor resolve o projeto pelo cwd, **um** registro atende todos os projetos. |
| Hooks de lifecycle | `hooks/hooks.json` | `SessionStart` / `PreToolUse` / `Stop` invocam `neural-seam hook <event>`. |
| Comandos | `commands/ns-*.md` | `/neural-seam:ns-check`, `/neural-seam:ns-doctor`, `/neural-seam:ns-sync`, `/neural-seam:ns-start`. |

## Pre-requisitos (fora do escopo do plugin)

Antes de usar:

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

## Compliance com plugins para claude code

- **P1:** o plugin nao introduz autenticacao Anthropic; so registra MCP + hooks + comandos.
- **P2:** hooks/registro sao os mesmos de sessao dev-iniciada; nao ha submissao remota de inferencia.
- **P4:** extensao explicita, nao imita o cliente oficial (o MCP se identifica como `neural-seam-runtime`).
- **P5:** sem telemetria por default; nenhum hook de telemetria e instalado.

## Licenca

MIT. Ver [`LICENSE`](./LICENSE).
