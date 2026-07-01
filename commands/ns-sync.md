---
description: "Neural Seam: conecta um projeto existente (connect) e clona o codigo (clone) num passo."
---

# /neural-seam:ns-sync $ARGUMENTS

Comando gerenciado pelo Neural Seam. Referencia um projeto ja existente no Neural Seam para o diretorio local: materializa o manifesto + harness e clona o codigo num unico passo.

`$ARGUMENTS` deve conter o `<projectId>`.

## Acao a executar agora

1. Se `$ARGUMENTS` estiver vazio, peca o `<projectId>` ao desenvolvedor e pare.
2. Rode `neural-seam connect <projectId>`. Esse comando busca o manifesto assinado, verifica a assinatura e materializa o estado de produto (manifesto `.neural-seam/manifest.json`, binding de projeto) no diretorio atual. O registro de host (MCP + hooks + comandos) e provido por este plugin; o `connect` mantem o fallback de materializacao para ambientes sem o plugin.
3. Em seguida, rode `neural-seam clone <projectId>`. Esse comando resolve o repositorio shell do projeto e o clona (com submodules) localmente; e idempotente (faz `git pull` se ja existir).
4. Se qualquer passo falhar por auth/rede, mostre a mensagem do comando e sugira `neural-seam login` ou `/neural-seam:ns-doctor`. Ao terminar, sugira `/neural-seam:ns-start` para iniciar o fluxo de insumos.
