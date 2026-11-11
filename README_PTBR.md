# Git graph

Adaptação local do [dsh-git-graph](https://github.com/1841220388zzzcccxxx-star/dsh-git-graph), distribuída sob a licença MIT original.

## Instalação pelo GitHub

```sh
dsh plugin --profile web add github:EdgarSantiago/dsh-git-graph
# No aplicativo Desktop, use o perfil desktop:
dsh plugin --profile desktop add github:EdgarSantiago/dsh-git-graph
```

Pacote: `@edgarsantiago/dsh-git-graph`. Distribuição somente pelo GitHub nesta versão, sem publicação no npm. O tópico `dsh-plugin` permite descoberta pelo site; o Plugin Hub dentro do DSH exige também um pacote npm. A listagem depende da varredura/revisão do catálogo e não é imediata nem garantida. Veja as [regras oficiais do catálogo comunitário](https://dsh-plugin.org/submit).

## Uso

Abra a aba **Git graph** na conversa do Harness. Desde a versão **0.14.4**, a interface, as datas e os metadados do plugin ficam somente em inglês, independentemente do idioma do Harness. O seletor de idioma foi removido e escolhas antigas salvas no navegador são ignoradas. Mensagens de commits, nomes de branches e arquivos permanecem como estão no repositório. Os identificadores técnicos antigos são mantidos por compatibilidade, sem alterar repositórios lembrados por workspace.

- Histórico com linhas de ancestralidade, busca, paginação e filtro por branch local, remota ou tag.
- Repositórios detectados automaticamente na raiz e em até dois níveis de subpastas do workspace da conversa, inclusive com o Agent inativo. O registro nativo de workspaces tem prioridade sobre a pasta antiga da sessão. **Open repository** usa o seletor nativo; **Find repositories** e **Refresh** refazem a descoberta.
- Alterações separadas em preparados, não preparados e não rastreados; diferenças por arquivo, histórico do arquivo e seleção em lote.
- Preparação, retirada da preparação, restauração, ignorar arquivos, commits, fetch, pull, push, branches e tags. Toda operação de escrita pede confirmação na interface.
- Detalhes do commit e comparação: marque **Compare** em um commit e clique em outro.
- Tema herdado do Harness, sem iframe e sem React duplicado.

## Segurança e limitações

O servidor exige a autenticação do Harness. Operações de escrita exigem POST de mesma origem. Comandos usam argumentos fixos, caminhos literais e validações de repositório e symlinks.

A ferramenta `git_graph_operation` oferece ao Agent o mesmo executor de operações, limitada ao repositório da pasta de trabalho atual; requer aprovação explícita a cada chamada.

As oito decorações animadas e a autoatualização do original não são incluídas. A autoatualização foi desativada para não substituir esta adaptação por arquivos do upstream. O filtro mostra uma branch por vez. Não há polling automático; use **Refresh** após alterações externas. O grafo exibe até oito trilhas visuais e carrega 200 commits por página.

Mensagens de commit, nomes de arquivo, branches e saídas técnicas do Git permanecem no idioma original. Os controles do plugin ficam somente em inglês; não há seletor de idioma.

## Isolamento por workspace (0.14.3)

A lista e a seleção não são mais globais. Cada workspace tem sua própria memória de pastas abertas e repositório escolhido. O cache global antigo não é importado, pois misturava projetos diferentes.

Um workspace com duas pastas, cada uma contendo `.git`, lista os dois repositórios automaticamente. A busca também encontra repositórios internos quando a própria raiz já tem Git; não para no primeiro resultado e não sobe para o Git de uma pasta ancestral fora do workspace. Limites: dois níveis, 300 diretórios e 20 resultados por varredura; pastas pesadas/ocultas e symlinks externos são ignorados. Arquivos `.git` de worktrees são aceitos.

O workspace associado à sessão é consultado no registro nativo do Harness. Seu identificador, caminho canônico confirmado e sessão acompanham todas as leituras e operações. Trocar de workspace desmonta a visão anterior, cancela requisições e limpa grafo, arquivos, comparação e confirmações. Respostas atrasadas não podem preencher outro projeto; uma operação com contexto antigo é recusada antes de executar Git.

Uma pasta externa só entra na lista daquele workspace após **Open repository**, por escolha explícita. Não vira opção dos demais workspaces. A raiz consultada fica visível abaixo do seletor. Se o workspace não tiver Git, o painel permanece vazio em vez de escolher outro projeto como fallback.

## Ciclo de vida e erros

A rota e a ferramenta pertencem a efeitos descartáveis, com rollback em falhas de ativação. O endpoint `/git-graph-bilingual/api` é mantido por compatibilidade, não por suporte a múltiplos idiomas. Falhas ao ler o índice/status do Git retornam erro explícito, nunca um estado falso de árvore limpa.

## Desenvolvimento

Compatibilidade declarada: DSH **0.2.2-rc.1**, versão disponível durante a implementação. Não há dependências em produção nem script de build. Os testes usam o SDK do Cordis como dependência de desenvolvimento.

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run check
pnpm test
```

A instalação é feita pelo gerenciador de plugins do Harness, apontando para este diretório. Alterações posteriores dos módulos Host/Client podem exigir reinstalação e reinício; não há promessa de atualização automática sem o watcher de desenvolvimento do Harness.

Validação automatizada cobre o backend com repositórios temporários isolados, autenticação/origem, traversal, symlinks, commits/diffs e a aprovação da ferramenta. A validação visual em navegador precisa ser realizada no Harness conectado.
