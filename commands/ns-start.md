---
description: "Neural Seam: orquestra o inicio do projeto (check -> login/connect/setup -> insumos -> cards)."
---

# /neural-seam:ns-start $ARGUMENTS

Comando gerenciado pelo Neural Seam. Orquestra o inicio de um projeto, do diagnostico ate transformar o backlog em cards. Toda inferencia nasce de uma acao manual do desenvolvedor (P2): voce apresenta os prompts, o desenvolvedor decide gerar.

## Fluxo a executar

### 1. Diagnostico e preparacao

1. Chame `mcp__neural-seam-runtime__check_setup`.
2. Trate o `status` (a logica e a mesma de `/neural-seam:ns-check`):
   - `needs_login` -> peca `neural-seam login` e pare ate concluir.
   - `needs_setup` (sem projeto) -> guie a criacao pelo wizard da bridge (`setup_url`); ou, se o desenvolvedor ja tem um projeto no Neural Seam, rode `/neural-seam:ns-sync <projectId>`.
   - `needs_connect` -> rode `/neural-seam:ns-sync <projectId>` para o projeto existente.
   - `import_candidate` -> peca `neural-seam import`.
   - `trial_expired` / `unsupported` -> mostre a `message` e pare.
   - `ok` -> siga para o passo 2.

### 2. Geracao de insumos (apenas com status `ok`)

Siga o runbook `docs/flows/e2e-insumo-generation.md`:

1. Chame `mcp__neural-seam-runtime__next_job`. Ele consome o job pendente `claude.generate-insumos` e retorna `prompt` (o prompt de geracao renderizado) + `action_kind`. Apresente o `prompt` ao desenvolvedor; **nao submeta nada automaticamente**.
2. Quando o desenvolvedor confirmar, gere os insumos: a spec do projeto, os docs de discovery (glossario, historias de usuario, modelo de dominio) e o backlog.
3. Persista com `mcp__neural-seam-runtime__save_insumos`, passando os campos gerados (`spec`, `glossary`, `user_stories`, `domain_model`, `backlog`). A tool escreve os artifacts no backend e copias em disco; confira o JSON de retorno.

### 3. Backlog em cards

Para cada item do backlog gerado, chame `mcp__neural-seam-runtime__create_activity` com `kind` (um de TECH, FEATURE, IMPROVE, BUG, VERIFY), `title` e `description`. Guarde o `id` retornado de cada card.

Ao final, resuma ao desenvolvedor: insumos persistidos e cards criados. Se qualquer tool retornar `error` (rede/auth), pare e oriente `neural-seam login` ou `/neural-seam:ns-doctor` em vez de seguir adiante.
