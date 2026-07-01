---
description: "Neural Seam: roda `neural-seam doctor --fix` e confere o registro do MCP no .mcp.json."
---

# /neural-seam:ns-doctor

Comando gerenciado pelo Neural Seam. Diagnostica e remedia o ambiente, depois confere se o runtime Go esta registrado como servidor MCP.

## Acao a executar agora

1. Rode no terminal `neural-seam doctor --fix`. Esse comando remedia auth (device flow), language servers e o registro do projeto, e re-verifica o resultado. Mostre a saida ao desenvolvedor.
2. Confira o registro do MCP:
   - Com o plugin `neural-seam` instalado, o servidor `neural-seam-runtime` e registrado **globalmente** pelo `.mcp.json` do plugin (`neural-seam serve --project-from-cwd`); um projeto nao precisa de `.mcp.json` local.
   - Se o projeto ainda tiver um `.mcp.json` local materializado pelo fallback, ele deve conter a entrada `neural-seam-runtime` (o runtime Go) e **nao** a entrada legada Python `neural-seam` apontando para o plugin antigo.
   - O binario chamado deve estar atualizado (rode `neural-seam version` e, se houver release mais novo, `neural-seam upgrade`).
3. Se o servidor `neural-seam-runtime` nao aparecer no Claude Code, confira que o binario `neural-seam` esta no PATH e que o plugin esta habilitado (`/plugin`); como fallback, rode `neural-seam register` no diretorio do projeto para (re)escrever a entrada gerenciada no `.mcp.json` local (coexiste com servidores do usuario).
4. Resuma para o desenvolvedor o que foi corrigido e o que ainda precisa de acao manual.
