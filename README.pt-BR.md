# Neural Seam para o Claude Code

Guia em português brasileiro. A documentação canônica é o [README.md](./README.md), em inglês, e é
ele que é atualizado primeiro. Este guia é mais curto, mas é completo o suficiente para você
instalar, conferir, atualizar e remover o plugin sem precisar do texto em inglês.

O plugin oficial do **Neural Seam** para o **Claude Code**. Ele conecta o Claude Code ao Neural Seam
para que a especificação, o backlog, os cards e as convenções por caminho do seu projeto fiquem
disponíveis para o agente enquanto você trabalha, e adiciona 11 comandos `/neural-seam:ns-*` que vão
do login até a implementação de um card.

> **O Neural Seam não fornece modelo e não roda inferência.** Ele coordena o trabalho. O modelo com
> quem você conversa é o que o seu Claude Code já usa, cobrado por quem o fornece. O Neural Seam
> nunca se autentica em um provedor de modelo no seu lugar.

**Este repositório é só a integração com o Claude Code, e é licenciado sob MIT.** O runtime
`neural-seam` é um produto comercial separado, com licença própria, distribuído como binários e
instaladores assinados pelo
[neural-seam-releases](https://github.com/NeuralSeam/neural-seam-releases#readme). O plugin precisa
desse binário no seu `PATH`; ele não o contém, não o instala e não o substitui.

## Pré-requisitos

| Você precisa de | Como obter | Como conferir |
| --- | --- | --- |
| Claude Code | instalador da Anthropic | `claude --version` |
| o binário `neural-seam` no `PATH` | [instalador do Neural Seam](https://github.com/NeuralSeam/neural-seam-releases#download-and-install) | `neural-seam version` |
| conta Neural Seam, com login feito | `neural-seam login` | `neural-seam doctor` |
| projeto vinculado a esta pasta | a configuração do runtime, ou o painel local | `/neural-seam:ns-status` |

As versões em que o plugin foi realmente testado estão em [COMPATIBILITY.md](./COMPATIBILITY.md).

## Instalação

São dois passos, nesta ordem. O verbo de instalação resolve o plugin contra os marketplaces que você
**já registrou**, então o marketplace vem primeiro.

```
/plugin marketplace add NeuralSeam/neural-seam-claude
/plugin install neural-seam@neural-seam
```

`neural-seam@neural-seam` quer dizer: o plugin `neural-seam`, publicado no marketplace `neural-seam`.

### Deixando o plugin ativo

O resumo da instalação diz qual dos dois casos aconteceu:

- **`Plugin is now active.`** Está pronto, não há mais nada a fazer.
- **`Run /reload-plugins to activate.`** Rode esse comando. Se ele avisar que recarregar faria a
  conversa ser lida de novo, rode `/reload-plugins --force`.

Reiniciar o Claude Code tem o mesmo efeito e é a saída quando o reload não resolve. Isso depende da
sua versão do Claude Code; o detalhe está em
[COMPATIBILITY.md](./COMPATIBILITY.md#when-an-install-takes-effect).

### Conferindo a instalação

Com o Claude Code aberto na pasta de um projeto:

1. `/plugin` mostra o `neural-seam` como instalado **e habilitado**. Um plugin registrado mas
   desabilitado não carrega nada, e fica igualzinho a um que nunca foi instalado.
2. `/mcp` mostra o `neural-seam-runtime`.
3. `/neural-seam:ns-status` responde com o estado do projeto.

Se o servidor MCP não aparecer, rode `/neural-seam:ns-doctor`.

## Primeiro uso

```
/neural-seam:ns-start
```

É a resposta inteira para "e agora?". Ele lê o estado e avança um passo: fazer login, criar ou
escolher um projeto, vincular, e parar. Rode de novo para o passo seguinte; repetir só faz o que
ainda falta.

Depois disso:

```
/neural-seam:ns-generate     # gera o backlog
/neural-seam:ns-list         # escolhe um card
/neural-seam:ns-exec <id>    # renderiza o prompt de implementação do card
```

Os dois últimos são o ciclo do dia a dia.

## Comandos

Este host prefixa os comandos de um plugin com `/<plugin>:<comando>`, então `/neural-seam:` faz parte
do nome, não é enfeite.

| Comando | O que faz | Só roda se você digitar |
| --- | --- | --- |
| `/neural-seam:ns-status` | Diz o estado e qual comando vem a seguir. | |
| `/neural-seam:ns-start` | Guiado: lê o estado e avança um passo. | sim |
| `/neural-seam:ns-create` | Ainda não há projeto: mostra o link do assistente de criação. | |
| `/neural-seam:ns-connect [<id>]` | O projeto já existe: vincula a esta pasta. | sim |
| `/neural-seam:ns-clone <id>` | Clona só o código. Idempotente. | sim |
| `/neural-seam:ns-doctor` | Repara o ambiente: login, language servers, registro MCP. | sim |
| `/neural-seam:ns-generate` | Gera os insumos e cria os cards. | sim |
| `/neural-seam:ns-list [status] [kind]` | Lista os cards, agrupados por status. | |
| `/neural-seam:ns-open` | Mostra o link do painel local. | |
| `/neural-seam:ns-exec <id>` | Renderiza o prompt de implementação de um card. | sim |
| `/neural-seam:ns-help` | Índice de todos os comandos acima. | |

### Comando que altera alguma coisa nunca é acionado sozinho

Os seis comandos marcados na tabela declaram `disable-model-invocation: true`, que diz ao Claude Code
para não acioná-los por conta própria. Eles rodam quando **você** os digita, e não porque o modelo
achou que um deles tinha a ver com o assunto da conversa.

Isso cobre todo comando que grava um vínculo, baixa código, repara o ambiente, gera backlog ou começa
uma implementação. Os cinco que apenas leem e reportam continuam disponíveis para o modelo, porque o
pior caso deles é uma chamada desperdiçada.

É uma proteção contra surpresa, não uma fronteira de permissão: depois que você roda um deles, as
ferramentas que ele usa passam pelas mesmas aprovações de sempre.

### O que instalar o plugin acrescenta

Três coisas, e nada além disso:

- o servidor MCP `neural-seam-runtime`, para o agente poder consultar o Neural Seam sobre o seu
  projeto;
- os 11 comandos da tabela acima;
- três hooks de ciclo de vida do Claude Code, que rodam o binário `neural-seam` na sua máquina.

Tudo aponta para o binário `neural-seam` do seu `PATH`. O que os hooks fazem está em
[SECURITY.md](./SECURITY.md#what-the-hooks-do).

**Instalar o plugin não substitui `neural-seam login` nem a configuração do projeto**: autenticação e
vínculo são estado de produto, e ficam com o runtime.

## Atualização

```
/plugin marketplace update
/reload-plugins
```

Depois confira a versão em `/plugin`. O histórico de mudanças está em [CHANGELOG.md](./CHANGELOG.md).

## Remoção

```
/plugin uninstall neural-seam@neural-seam
```

Isso remove os comandos, os hooks e o registro MCP de uma vez só. Para manter instalado mas desligar,
use `/plugin disable neural-seam@neural-seam`. Nos dois casos, rode `/reload-plugins` para valer já
na sessão atual.

Desinstalar o plugin **não** apaga nada do que o runtime guardou: suas credenciais e os arquivos
locais dele continuam lá até você removê-los. Veja [PRIVACY.md](./PRIVACY.md).

## Privacidade e segurança

**O plugin não coleta nem envia nada.** Ele é conteúdo e configuração: comandos, um manifesto, um
registro MCP e três declarações de hook. Não há telemetria nele, nem credencial, nem endpoint de rede
próprio.

O runtime `neural-seam` é um produto separado e move dados, sob a documentação dele.
[PRIVACY.md](./PRIVACY.md) explica a fronteira entre os dois.

## Solução de problemas

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| Nenhum comando `ns-*` aparece | O plugin está instalado mas não foi carregado nesta sessão | `/reload-plugins`; se avisar, `/reload-plugins --force`; reiniciar o Claude Code se nada disso resolver |
| Continua sem os comandos `ns-*` | O plugin está registrado mas **desabilitado** | `/plugin`, habilite, e depois `/reload-plugins` |
| `/mcp` não mostra o `neural-seam-runtime` | O `neural-seam` não está no `PATH`, ou o plugin está desabilitado | `neural-seam version`; se falhar, reinstale o runtime |
| `/plugin` acusa erro de carregamento | O plugin falhou ao carregar | Abra a aba **Errors** do `/plugin` e [abra uma issue](https://github.com/NeuralSeam/neural-seam-claude/issues) com o texto |
| Nada acontece no início da sessão | O plugin carregou, mas o binário está faltando | `neural-seam version` |
| Os comandos aparecem mas estão desatualizados | A sessão ainda roda a versão que carregou na abertura | `/reload-plugins` |
| Sem login, ou projeto não vinculado | É estado do runtime, não do plugin | `/neural-seam:ns-doctor` |
| Qualquer outra coisa | | `/neural-seam:ns-doctor` e depois o [manual do runtime](https://github.com/NeuralSeam/neural-seam-releases/blob/main/USER-MANUAL.md) |

## Onde pedir ajuda

- Dúvidas e bugs deste plugin: [SUPPORT.md](./SUPPORT.md)
- Vulnerabilidade: [SECURITY.md](./SECURITY.md) - não abra issue pública
- Dados: [PRIVACY.md](./PRIVACY.md)
- Versões testadas: [COMPATIBILITY.md](./COMPATIBILITY.md)
- Conta, plano, projeto ou o runtime em si: <https://app.neuralseam.cloud>

## Licença

MIT, veja [LICENSE](./LICENSE). Ela cobre o conteúdo deste repositório, que é a integração com o
Claude Code. Ela **não** cobre o runtime `neural-seam`, que é um produto comercial separado com
licença própria, e não concede direitos sobre o nome nem sobre a marca Neural Seam, veja
[TRADEMARKS.md](./TRADEMARKS.md).
