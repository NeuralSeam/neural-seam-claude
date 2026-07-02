---
description: "Neural Seam: mostra o link do dashboard/bridge local (SPA ja escopada ao projeto do diretorio)."
---

# /neural-seam:ns-open

Comando gerenciado pelo Neural Seam. Mostra o link do dashboard da bridge local para voce abrir no
navegador. Como a bridge e servida pelo runtime a partir do diretorio atual (`serve
--project-from-cwd`), a SPA ja abre **escopada ao projeto vinculado a este diretorio** - nao ha id na
URL. Por compliance (P4), o runtime nao abre o browser por voce; ele so entrega o link.

## Acao a executar agora

1. Chame `mcp__neural-seam-runtime__open_dashboard`. Ele retorna o texto com a URL da bridge local
   (ex.: `http://127.0.0.1:7077`).
2. Apresente a URL e peca ao dev para abri-la no navegador.
3. Se a resposta indicar que **nao ha bridge local rodando**, oriente subir o runtime/bridge (ou o app
   de bandeja `neural-seam tray`) e, se preciso, `/neural-seam:ns-doctor`.
4. Feche sugerindo `/neural-seam:ns-list` (ver cards no terminal) como alternativa.
