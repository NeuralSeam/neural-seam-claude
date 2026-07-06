---
description: "Neural Seam: bussola read-only - diz o estado do projeto (check_setup) e o proximo comando."
---

# /neural-seam:ns-status

Comando gerenciado pelo Neural Seam. **Nao executa acao de mudanca** (P2): so consulta o estado e te
diz exatamente qual comando vem a seguir. E a bussola do fluxo.

## Acao a executar agora

1. Chame a MCP tool `mcp__neural-seam-runtime__check_setup` (sem argumentos). O retorno e JSON com o
   campo `status`.
2. De acordo com `status`, reporte o estado e **o comando exato para colar**, e pare:

   - **`needs_login`** -> rode `neural-seam login` no terminal (device flow). Depois `/neural-seam:ns-status`.
   - **`needs_setup`** -> ainda nao ha projeto. Cenario greenfield: `/neural-seam:ns-create` (ele mostra o `setup_url` do wizard).
   - **`needs_connect`** -> ja existe projeto no Neural Seam para vincular a este diretorio: `/neural-seam:ns-connect` (ele abre o `connect_url` da bridge).
   - **`import_candidate`** -> projeto brownfield: `neural-seam import` (mostre `detected_indicators`, se vier).
   - **`trial_expired`** -> mostre `message` e a URL de `upgrade_url`.
   - **`unsupported`** -> manifesto novo demais: `neural-seam upgrade`, depois `/neural-seam:ns-status`.
   - **`ok`** -> ambiente pronto. Mostre `project_name`. Se `pending_jobs > 0`, sugira `/neural-seam:ns-generate` (bootstrap do backlog). Caso contrario, sugira `/neural-seam:ns-list` (ver os cards) ou `/neural-seam:ns-open` (abrir o dashboard).

3. Se o `check_setup` retornar um campo `error` (rede/auth), sinalize o erro e oriente
   `/neural-seam:ns-doctor`, em vez de seguir adiante.

Para ser conduzido pelo proximo passo automaticamente (em vez de so ser informado), use
`/neural-seam:ns-start`.
