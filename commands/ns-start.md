---
description: "Neural Seam: motor guiado - le o estado e avanca 1 passo sensato (anti-burro), chamando as atomicas."
---

# /neural-seam:ns-start

Comando gerenciado pelo Neural Seam. E a **porta da frente guiada**: le o estado do projeto e conduz
voce pelo proximo passo, sem refazer o que ja esta pronto (convergente). Toda inferencia nasce de uma
acao manual do dev (P2): voce apresenta os prompts, o dev decide gerar.

Ele **nao reimplementa** nada - delega as mesmas transicoes atomicas (`ns-create`, `ns-connect`,
`ns-generate`, ...). Rode-o quantas vezes quiser: sempre faz so o delta.

## Fluxo a executar

1. Chame `mcp__neural-seam-runtime__check_setup`.
2. Trate o `status` avancando **um** passo sensato (mesma tabela do `/neural-seam:ns-status`):

   - `needs_login` -> peca `neural-seam login` e pare ate concluir.
   - `needs_setup` -> apresente o `setup_url` (wizard da bridge) e pare; o dev cria o projeto la. Ao criar, o manifesto e gravado no diretorio e o proximo `check_setup` ja vem `ok` (o `project_id` sai do manifesto - o dev nao digita id). Equivale a `/neural-seam:ns-create`.
   - `needs_connect` -> apresente o `connect_url` (UI da bridge, onde o dev escolhe/vincula o projeto) e pare. Equivale a `/neural-seam:ns-connect`.
   - `import_candidate` -> peca `neural-seam import` (mostre `detected_indicators`).
   - `trial_expired` / `unsupported` -> mostre a `message` (+ `upgrade_url` / peca `neural-seam upgrade`) e pare.
   - `ok` -> siga para o passo 3.

3. Com `status = ok`:
   - Se `pending_jobs > 0` (ha backlog a gerar), ofereca rodar `/neural-seam:ns-generate` para gerar os insumos e criar os cards. **Nao submeta a geracao sozinho** - apresente e aguarde o dev confirmar.
   - Caso contrario, o projeto ja esta em regime de trabalho: sugira `/neural-seam:ns-list` (ver cards) e `/neural-seam:ns-exec <id>` (implementar um card).

4. Ao terminar cada passo, diga **"fiz X -> proximo: `/neural-seam:ns-..."`**. Se qualquer tool
   retornar `error` (rede/auth), pare e oriente `neural-seam login` ou `/neural-seam:ns-doctor`.
