---
description: "Neural Seam: lista as atividades/cards do projeto, agrupadas por status, com o id pronto para colar."
---

# /neural-seam:ns-list $ARGUMENTS

Comando gerenciado pelo Neural Seam. Lista os cards (atividades) do projeto conectado. Read-only.

`$ARGUMENTS` (opcional) pode conter filtros: um `status` (ex.: `BACKLOG`, `IN_PROGRESS`, `BLOCKED`,
`DONE`) e/ou um `kind` (`TECH`, `FEATURE`, `IMPROVE`, `BUG`, `VERIFY`).

## Acao a executar agora

1. Chame `mcp__neural-seam-runtime__list_activities`. Se `$ARGUMENTS` trouxer filtros, repasse-os como
   `status` / `kind`.
2. Apresente os cards **agrupados por status** (a fazer / em progresso / bloqueado / concluido). Para
   cada card, mostre: o `id` (pronto para colar), o `kind`, o `title` e, se `is_blocked`, o
   `blocked_by`.
3. Feche indicando o proximo passo: **`/neural-seam:ns-exec <id>`** para implementar um card, ou
   `/neural-seam:ns-open` para inspecionar no dashboard.

Se `list_activities` retornar `error` (rede/auth) ou o projeto nao estiver conectado, oriente
`/neural-seam:ns-status`.
