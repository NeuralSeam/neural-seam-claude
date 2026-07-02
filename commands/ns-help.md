---
description: "Neural Seam: indice de todos os comandos /neural-seam:ns-* e o fluxo tipico de uso."
---

# /neural-seam:ns-help

Comando gerenciado pelo Neural Seam. Mostra o mapa dos comandos e o fluxo tipico. **Nao chama nenhuma
tool** - e um indice estatico. Apresente o conteudo abaixo ao dev, adaptando o tom se ele perguntar por
um caso especifico.

## Como funciona

A superfície tem **um motor guiado** (`ns-start`) + uma **bussola** (`ns-status`) + **atomicas** para
quem sabe o que quer. Todos os comandos sao convergentes: rodar de novo faz so o que falta.

- **Nao sei o que preciso** -> `/neural-seam:ns-start` (te conduz pelo proximo passo).
- **So quero saber onde estou** -> `/neural-seam:ns-status`.

## Fase 1 - Onboarding

| Comando | O que faz |
| ------- | --------- |
| `/neural-seam:ns-status` | Bussola: diz o estado e o proximo comando. |
| `/neural-seam:ns-start` | Motor guiado: le o estado e avanca 1 passo. |
| `/neural-seam:ns-create` | Cenario A (nao tenho projeto): mostra o link do wizard. |
| `/neural-seam:ns-connect [<id>]` | Cenario B (ja criei no wizard): vincula o projeto a este diretorio. |
| `/neural-seam:ns-clone <id>` | Clona so o codigo (idempotente). |
| `/neural-seam:ns-doctor` | Repara o ambiente (auth, language servers, registro MCP). |

## Fase 2 - Loop de trabalho

| Comando | O que faz |
| ------- | --------- |
| `/neural-seam:ns-generate` | Bootstrap do backlog: gera insumos e cria os cards. |
| `/neural-seam:ns-list [status] [kind]` | Lista os cards, agrupados por status. |
| `/neural-seam:ns-open` | Mostra o link do dashboard/bridge local. |
| `/neural-seam:ns-exec <id>` | Renderiza o prompt do card para implementar (P2). |

## Fluxo tipico

1. `/neural-seam:ns-start` -> resolve login/setup/connect ate o estado ficar `ok`.
2. `/neural-seam:ns-generate` -> gera insumos + cria os cards iniciais.
3. `/neural-seam:ns-list` -> escolhe um card.
4. `/neural-seam:ns-exec <id>` -> implementa. Repete 3-4.

Pre-requisitos (fora do plugin): o binario `neural-seam` no PATH e `neural-seam login`. Se algo travar,
`/neural-seam:ns-doctor`.
