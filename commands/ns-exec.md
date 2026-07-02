---
description: "Neural Seam: implementa um card - renderiza o prompt do card para o dev revisar e executar (P2)."
---

# /neural-seam:ns-exec $ARGUMENTS

Comando gerenciado pelo Neural Seam. Prepara a implementacao de um card: pede ao backend o Claude job
da atividade e renderiza o **prompt** do `kind`. Compliance P2: o prompt e apresentado para o dev
revisar - **nada e auto-submetido**; a implementacao roda quando o dev confirmar.

`$ARGUMENTS` deve conter o `<activity_id>` do card.

## Acao a executar agora

1. Se `$ARGUMENTS` estiver vazio, **nao erre por falta de id**: chame `/neural-seam:ns-list` primeiro
   e ajude o dev a escolher um card; pare ate ter o `<activity_id>`.
2. Chame `mcp__neural-seam-runtime__exec_activity` com `activity_id = <id>`. Ele retorna
   `activity_id`, `kind`, `job_id`, `prompt` e `status: "ready"`.
3. Apresente o `prompt` ao dev e aguarde a confirmacao. Quando confirmado, execute a implementacao
   seguindo o prompt (edite o codigo, rode a verificacao do app, faca commit conforme as regras do
   projeto).
4. Ao terminar, reporte o resultado e sugira `/neural-seam:ns-list` para ver o que sobrou (e, se fizer
   sentido, `update_activity_status` para transicionar o card).

Se `exec_activity` retornar `error` (rede/auth) ou o projeto nao estiver conectado, oriente
`/neural-seam:ns-status`.
