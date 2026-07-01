---
description: "Neural Seam: diagnostica o estado do setup (check_setup) e indica o proximo passo."
---

# /neural-seam:ns-check

Comando gerenciado pelo Neural Seam. Verifica o estado do projeto e traduz o resultado no proximo passo concreto. Nao submete inferencia (P2): apenas consulta o estado e orienta.

## Acao a executar agora

1. Chame a MCP tool `mcp__neural-seam-runtime__check_setup` (sem argumentos). O retorno e JSON com o campo `status`.
2. De acordo com `status`, oriente o desenvolvedor e pare:

   - **`needs_login`** -> peca para rodar `neural-seam login` no terminal (device flow). Depois rode `/neural-seam:ns-check` de novo.
   - **`needs_setup`** -> abra o wizard de criacao de projeto na bridge: use o `setup_url` retornado (ex.: `http://127.0.0.1:7077/setup`). Apos criar o projeto, rode `/neural-seam:ns-check`.
   - **`needs_connect`** -> existem projetos no Neural Seam para conectar a este diretorio. Pergunte o `<projectId>` e rode `/neural-seam:ns-sync <projectId>`.
   - **`import_candidate`** -> e um projeto brownfield. Peca para rodar `neural-seam import` (mostre tambem `detected_indicators`, se vier).
   - **`trial_expired`** -> o trial acabou. Mostre a `message` e abra a URL de upgrade do campo `upgrade_url`.
   - **`unsupported`** -> o manifesto usa um schema novo demais. Peca `neural-seam upgrade` e rode `/neural-seam:ns-check`.
   - **`ok`** -> o ambiente esta pronto. Mostre `project_name` e, se o campo `pending_jobs` vier > 0, avise que ha jobs pendentes e sugira `/neural-seam:ns-start` para gerar os insumos iniciais.

3. Se o `check_setup` retornar um campo `error` (rede/auth), sinalize o erro ao desenvolvedor com a instrucao para rodar `neural-seam doctor --fix` (`/neural-seam:ns-doctor`), em vez de seguir adiante.
