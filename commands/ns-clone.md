---
description: "Neural Seam: clona so o codigo do projeto (idempotente); ortogonal ao connect."
---

# /neural-seam:ns-clone $ARGUMENTS

Comando gerenciado pelo Neural Seam. Busca **so o codigo** do projeto - preocupacao separada do vinculo
(`/neural-seam:ns-connect`). Idempotente: se o repositorio ja existir, faz `git pull` em vez de
re-clonar.

`$ARGUMENTS` deve conter o `<projectId>`.

## Acao a executar agora

1. Se `$ARGUMENTS` estiver vazio, peca o `<projectId>` (ou rode `/neural-seam:ns-status` para
   descobrir o estado) e pare.
2. Rode `neural-seam clone <projectId>`. Esse comando resolve o repositorio shell do projeto e o clona
   (com submodules) localmente. **Se o diretorio ja existir com o remote correto, ele nao re-clona -
   faz `git pull`** e reporta que o codigo ja estava presente.
3. Se falhar por auth/rede, mostre a mensagem e sugira `neural-seam login` ou `/neural-seam:ns-doctor`.
4. Ao terminar, sugira `/neural-seam:ns-status` e, se `ok`, `/neural-seam:ns-list`.
