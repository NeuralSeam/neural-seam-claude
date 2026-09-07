# Neural Seam para o Claude Code

Guia em português brasileiro. A documentação canônica é o [README.md](./README.md), em inglês, e é ele
que é atualizado primeiro. Este guia é mais curto, mas é completo o suficiente para você instalar,
conferir, atualizar e remover o plugin sem precisar do texto em inglês.

O plugin oficial do **Neural Seam** para o **Claude Code**. Instalar registra o servidor MCP
`neural-seam-runtime`, ativa três hooks de ciclo de vida e adiciona os 11 comandos
`/neural-seam:ns-*`. Tudo o que ele configura aponta para o binário `neural-seam` no seu `PATH`.

> **O Neural Seam não fornece modelo e não roda inferência.** Ele coordena o trabalho: a especificação,
> o glossário, o backlog, os cards e as convenções por caminho do seu projeto vivem no Neural Seam e
> são entregues ao seu agente por MCP. O modelo com quem você conversa é o que o seu Claude Code já
> usa, cobrado por quem o fornece. O Neural Seam nunca se autentica em um provedor de modelo no seu
> lugar.

## Pré-requisitos

| Você precisa de | Como obter | Como conferir |
| --- | --- | --- |
| Claude Code | instalador da Anthropic | `claude --version` |
| o binário `neural-seam` no `PATH` | [instalador do Neural Seam](https://github.com/NeuralSeam/neural-seam-releases#download-and-install) | `neural-seam version` |
| conta Neural Seam, com login feito | `neural-seam login` (device flow) | `neural-seam doctor` |
| projeto vinculado a esta pasta | `neural-seam connect <projectId>`, ou o painel local | `/neural-seam:ns-status` |

As versões em que o plugin foi realmente testado estão em [COMPATIBILITY.md](./COMPATIBILITY.md).

## Instalação

São dois passos, nesta ordem. O verbo de instalação resolve o plugin contra os marketplaces que você
**já registrou**, então o marketplace vem primeiro.

```
/plugin marketplace add NeuralSeam/neural-seam-claude
/plugin install neural-seam@neural-seam
```

`neural-seam@neural-seam` quer dizer: o plugin `neural-seam`, publicado no marketplace `neural-seam`.
É a mesma referência que o runtime mostra quando avisa que o plugin está faltando, então as duas nunca
divergem.

### Deixando o plugin ativo

O resumo da instalação diz qual dos dois casos aconteceu:

- **`Plugin is now active.`** Está pronto, não há mais nada a fazer.
- **`Run /reload-plugins to activate.`** Rode esse comando. Se ele avisar que recarregar faria a
  conversa ser lida de novo, rode `/reload-plugins --force`.

Reiniciar o Claude Code tem o mesmo efeito e é a saída quando o reload não resolve.

Esse comportamento depende da sua versão do Claude Code: versões mais antigas nunca ativavam uma
instalação na própria sessão em que ela foi feita. O detalhe está em
[COMPATIBILITY.md](./COMPATIBILITY.md#when-an-install-takes-effect).

### Conferindo a instalação

Com o Claude Code aberto na pasta de um projeto:

1. `/plugin` mostra o `neural-seam` como instalado **e habilitado**. Um plugin registrado mas
   desabilitado não carrega nada, e fica igualzinho a um que nunca foi instalado.
2. `/mcp` mostra o `neural-seam-runtime`.
3. `/neural-seam:ns-status` responde com o estado do projeto.

Se o servidor MCP não aparecer, rode `/neural-seam:ns-doctor`.

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
use `/plugin disable neural-seam@neural-seam`. Nos dois casos, rode `/reload-plugins` para valer já na
sessão atual.

Desinstalar o plugin **não** apaga nada do que o runtime `neural-seam` gravou: suas credenciais, a
pasta `~/.neural-seam/` e os arquivos por projeto continuam lá até você removê-los.
[PRIVACY.md](./PRIVACY.md#deleting-your-data) lista cada lugar e como limpar.

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

## O que o plugin configura

| Componente | Arquivo | Efeito |
| --- | --- | --- |
| Registro MCP | `.mcp.json` | `neural-seam-runtime`, iniciado como `neural-seam serve --project-from-cwd`. O servidor resolve o projeto pelo diretório de trabalho, então **um** registro serve todos os projetos. |
| Hooks de ciclo de vida | `hooks/hooks.json` | `SessionStart`, `PreToolUse` e `Stop` rodam `neural-seam hook <evento>`. O que cada um faz está em [SECURITY.md](./SECURITY.md#what-the-hooks-do). |
| Comandos | `commands/ns-*.md` | Os 11 comandos da tabela acima. |

### Com o plugin instalado, o `neural-seam connect` grava menos

A mesma configuração pode vir de dois lugares: deste plugin, uma vez, para todos os projetos; ou do
runtime, gravando dentro de cada projeto que ele conecta. Os dois gravando dariam dois registros MCP e
dois hooks de sessão, então só um deles grava.

| Situação | O que o `neural-seam connect` faz |
| --- | --- |
| Plugin instalado | Pula o registro MCP, os hooks e os comandos, e remove o que uma configuração por projeto anterior deixou para trás. Continua gravando os arquivos do seu projeto: o manifesto assinado, a memória de projeto e os stubs. |
| Plugin ausente | Grava tudo dentro do projeto, e orienta você a instalar o plugin. |

Vale saber:

- **`neural-seam connect --host-wiring plugin|local|auto`** deixa você decidir em vez de depender da
  detecção. `local` força os arquivos por projeto, que é o que você quer em uma máquina onde não dá
  para instalar plugins; `plugin` força o modo enxuto.
- **Na dúvida, o runtime grava os arquivos.** Uma detecção que falha te deixa com um projeto
  funcionando, não com um projeto sem configuração.
- **A limpeza só remove o que ela mesma gravou.** Seus hooks, seus servidores MCP e seus arquivos
  ficam intactos.

**Instalar o plugin não substitui `neural-seam login` nem `neural-seam connect`**: autenticação,
manifesto assinado e vínculo do projeto são estado de produto, não de host.

### O que não vem nesta versão

Esta versão não inclui o aviso opcional de convenções por caminho, que aponta um arquivo-fonte recém
criado para as convenções que valem naquele caminho. Esse comportamento hoje é gerenciado pelo runtime
`neural-seam` projeto a projeto, então você o tem em um projeto que o runtime configurou diretamente.
O resto (servidor MCP, hooks e comandos) funciona igual nos dois casos.

## Solução de problemas

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| Nenhum comando `ns-*` aparece | O plugin está instalado mas não foi carregado nesta sessão | `/reload-plugins`; se avisar, `/reload-plugins --force`; reiniciar o Claude Code se nada disso resolver |
| Continua sem os comandos `ns-*` | O plugin está registrado mas **desabilitado** | `/plugin`, habilite, e depois `/reload-plugins` |
| `/mcp` não mostra o `neural-seam-runtime` | O `neural-seam` não está no `PATH`, ou o plugin está desabilitado | `neural-seam version`; se falhar, reinstale o runtime |
| `/plugin` acusa erro de carregamento | O plugin falhou ao carregar | Abra a aba **Errors** do `/plugin` e [abra uma issue](https://github.com/NeuralSeam/neural-seam-claude/issues) com o texto |
| Nada acontece no início da sessão | O plugin carregou, mas o binário está faltando | `neural-seam version` |
| `/neural-seam:ns-status` diz que você não está autenticado | Sessão expirada, ou substituída por um login mais novo | `neural-seam login` |
| Vinculou o projeto e o manifesto foi parar na pasta errada | Você vinculou antes de reabrir a sessão dentro da subpasta clonada | Reabra a sessão na pasta clonada e vincule de novo |
| Duas mensagens de sessão, ou o servidor listado duas vezes | O projeto ainda tem configuração por projeto de antes do plugin | Rode `neural-seam connect` de novo; ele remove o que gravou |
| Os comandos aparecem mas estão desatualizados | A sessão ainda roda a versão que carregou na abertura | `/reload-plugins` |
| Qualquer outra coisa | | `/neural-seam:ns-doctor` |

## Privacidade e segurança

**O plugin em si não coleta nem envia nada.** O que ele instala é Markdown e JSON, sem endpoint de
rede, sem analytics e sem credencial.

O runtime `neural-seam` para o qual ele aponta move dados, e nem tudo é opcional: o login, a
identificação da sua máquina no login e os dados de coordenação do seu projeto são enviados havendo
telemetria ou não. A telemetria em si é opt-in e vem desligada. Seu código-fonte é lido localmente.

O quadro completo, incluindo como apagar cada base separadamente, está em [PRIVACY.md](./PRIVACY.md).

## Onde pedir ajuda

- Dúvidas e bugs deste plugin: [SUPPORT.md](./SUPPORT.md)
- Vulnerabilidade: [SECURITY.md](./SECURITY.md) - não abra issue pública
- Dados: [PRIVACY.md](./PRIVACY.md)
- Versões testadas: [COMPATIBILITY.md](./COMPATIBILITY.md)
- Conta, plano ou projeto: <https://app.neuralseam.cloud>

## Licença

MIT, veja [LICENSE](./LICENSE). A licença cobre o conteúdo deste repositório; ela não concede direitos
sobre o nome nem sobre a marca Neural Seam, veja [TRADEMARKS.md](./TRADEMARKS.md).
