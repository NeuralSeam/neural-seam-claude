---
description: "Neural Seam: Cenario B - vincula um projeto ja existente a este diretorio (via UI da bridge; id como fallback)."
---

# /neural-seam:ns-connect $ARGUMENTS

Comando gerenciado pelo Neural Seam. Cenario **B - o projeto ja existe** no Neural Seam e voce quer
vincula-lo a este diretorio local. Materializa o manifesto/binding **sem** clonar codigo (para so o
codigo, use `/neural-seam:ns-clone`).

## Acao a executar agora

1. **Caminho guiado (recomendado, sem digitar id):** chame `mcp__neural-seam-runtime__check_setup`.
   - Se `status = needs_connect`, pegue o campo `connect_url` (UI da bridge, ex.:
     `http://127.0.0.1:7077/connect`) e apresente-o: o dev escolhe/vincula o projeto la. Ao vincular, o
     manifesto e gravado neste diretorio e o proximo `check_setup` ja vem `ok` (o `project_id` sai do
     manifesto). Explique que **nao e preciso digitar o id**.
   - Se `status = needs_setup`, nao ha projeto para conectar -> redirecione para `/neural-seam:ns-create`.
   - Se `status = ok`, ja esta vinculado -> sugira `/neural-seam:ns-list`.

2. **Fallback headless (`$ARGUMENTS` traz um `<projectId>`):** rode `neural-seam connect <projectId>`.
   Esse comando busca o manifesto assinado, verifica a assinatura e materializa o binding no diretorio
   atual. Use quando a UI da bridge nao estiver disponivel.

3. Feche com o proximo passo: **apos vincular, rode `/neural-seam:ns-status`**; com `ok`, siga para
   `/neural-seam:ns-generate` (bootstrap) ou `/neural-seam:ns-clone <id>` se ainda faltar o codigo.

Se algo falhar por auth/rede, mostre a mensagem e sugira `neural-seam login` ou `/neural-seam:ns-doctor`.
