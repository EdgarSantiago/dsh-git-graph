window.__ModuleLoader__.load({
  id: '@edgarsantiago/dsh-git-graph',
  factory: (require) => {
    const React = require('react');
    const {createElement: h, useState, useEffect, useRef, useSyncExternalStore} = React;
    const en = {
      title:'Git graph', workspace:'Workspace', workspaceChanged:'The workspace changed. Refresh the repository list before continuing.', refresh:'Refresh', open:'Open repository', search:'Search commits', branches:'Branches', all:'All branches',
      history:'History', changes:'Changes', staged:'Staged', unstaged:'Unstaged', untracked:'Untracked', clean:'Working tree clean',
      loading:'Loading…', empty:'No Git repository selected', emptyHelp:'Open a repository or find repositories in this session’s workspace.',
      discover:'Find repositories', loadMore:'Load more', commits:'commits', files:'files', details:'Commit details', close:'Close',
      author:'Author', date:'Date', parents:'Parents', copy:'Copy hash', copied:'Copied', diff:'Diff', noDiff:'No textual diff (unchanged or binary file).',
      stage:'Stage', unstage:'Unstage', restore:'Restore', stageAll:'Stage all', unstageAll:'Unstage all', commit:'Commit',
      message:'Commit message', commitAll:'Stage all files before committing', cancel:'Cancel', confirm:'Confirm',
      confirmTitle:'Confirm Git operation', destructive:'This operation may discard local changes. Review the repository and files before continuing.',
      fetch:'Fetch', pull:'Pull', push:'Push', checkout:'Switch branch', deleteBranch:'Delete branch', branch:'Create branch', tag:'Create tag',
      deleteTag:'Delete tag', renameTag:'Rename tag', name:'Name', newName:'New name', compare:'Compare', compareHelp:'Select a base commit, then another commit to compare.',
      selected:'Selected', clear:'Clear selection', ignore:'Ignore', fileHistory:'File history', error:'Operation failed',
      noCommits:'No commits match this filter.', success:'Operation completed',
      binary:'Binary file', truncated:'Output truncated', noFiles:'No changed files', remote:'Remote', local:'Local', tags:'Tags',
      repo:'Repository',
      confirmBody:'Run this operation in the selected repository?', base:'Comparison base', suggest:'Suggest message',
      suggestNote:'Local heuristic, not AI-generated.', file:'File', commitSelected:'Commit selected',
      openRemote:'Open remote commit', noRemote:'No supported HTTPS remote URL.',
      failureHelp:'Check the path, Git permissions and repository state, then refresh.',
      commitColumn:'Commit', hash:'Hash', graph:'Graph', noUnstaged:'No unstaged or untracked changes', noStaged:'No staged changes', nothingToCommit:'No changes to commit',
      navigate:'Navigate', searchShortcut:'Search', detailsShortcut:'Details', closeShortcut:'Close',
    };
    // Keep dictionaries inside the single ModuleLoader artifact: no build or runtime imports.
    const dictionaries = {en,
      pt: {
        title:'Grafo Git', workspace:'Espaço de trabalho', workspaceChanged:'O workspace mudou. Atualize a lista de repositórios antes de continuar.', refresh:'Atualizar', open:'Abrir repositório', search:'Pesquisar commits', branches:'Branches', all:'Todas as branches',
        history:'Histórico', changes:'Alterações', staged:'Preparados', unstaged:'Não preparados', untracked:'Não rastreados', clean:'Árvore de trabalho limpa',
        loading:'Carregando…', empty:'Nenhum repositório Git selecionado', emptyHelp:'Abra um repositório ou busque repositórios no workspace desta sessão.',
        discover:'Buscar repositórios', loadMore:'Carregar mais', commits:'commits', files:'arquivos', details:'Detalhes do commit', close:'Fechar',
        author:'Autor', date:'Data', parents:'Commits pais', copy:'Copiar hash', copied:'Copiado', diff:'Diferenças', noDiff:'Sem diferenças textuais (arquivo inalterado ou binário).',
        stage:'Preparar', unstage:'Despreparar', restore:'Restaurar', stageAll:'Preparar tudo', unstageAll:'Despreparar tudo', commit:'Criar commit',
        message:'Mensagem do commit', commitAll:'Preparar todos os arquivos antes do commit', cancel:'Cancelar', confirm:'Confirmar',
        confirmTitle:'Confirmar operação Git', destructive:'Esta operação pode descartar alterações locais. Revise o repositório e os arquivos antes de continuar.',
        fetch:'Buscar remotos', pull:'Puxar alterações', push:'Enviar alterações', checkout:'Trocar branch', deleteBranch:'Excluir branch', branch:'Criar branch', tag:'Criar tag',
        deleteTag:'Excluir tag', renameTag:'Renomear tag', name:'Nome', newName:'Novo nome', compare:'Comparar', compareHelp:'Selecione um commit base e depois outro para comparar.',
        selected:'Selecionados', clear:'Limpar seleção', ignore:'Ignorar', fileHistory:'Histórico do arquivo', error:'Falha na operação',
        noCommits:'Nenhum commit corresponde a este filtro.', success:'Operação concluída', binary:'Arquivo binário', truncated:'Saída truncada', noFiles:'Nenhum arquivo alterado', remote:'Remotas', local:'Locais', tags:'Tags', repo:'Repositório',
        confirmBody:'Executar esta operação no repositório selecionado?', base:'Base da comparação', suggest:'Sugerir mensagem', suggestNote:'Heurística local, não gerada por IA.', file:'Arquivo', commitSelected:'Criar commit dos selecionados', openRemote:'Abrir commit remoto', noRemote:'Nenhuma URL remota HTTPS compatível.',
        failureHelp:'Verifique o caminho, as permissões do Git e o estado do repositório; depois atualize.', commitColumn:'Commit', hash:'Hash', graph:'Grafo', noUnstaged:'Sem alterações não preparadas ou não rastreadas', noStaged:'Sem alterações preparadas', nothingToCommit:'Sem alterações para criar commit', navigate:'Navegar', searchShortcut:'Pesquisar', detailsShortcut:'Detalhes', closeShortcut:'Fechar',
      },
      zh: {
        title:'Git 图谱', workspace:'工作区', workspaceChanged:'工作区已更改。请刷新仓库列表后再继续。', refresh:'刷新', open:'打开仓库', search:'搜索提交', branches:'分支', all:'所有分支',
        history:'历史记录', changes:'更改', staged:'已暂存', unstaged:'未暂存', untracked:'未跟踪', clean:'工作区干净', loading:'加载中…', empty:'未选择 Git 仓库', emptyHelp:'打开仓库或在此会话的工作区中查找仓库。',
        discover:'查找仓库', loadMore:'加载更多', commits:'次提交', files:'文件', details:'提交详情', close:'关闭', author:'作者', date:'日期', parents:'父提交', copy:'复制哈希', copied:'已复制', diff:'差异', noDiff:'无文本差异（文件未更改或为二进制文件）。',
        stage:'暂存', unstage:'取消暂存', restore:'还原', stageAll:'全部暂存', unstageAll:'全部取消暂存', commit:'提交', message:'提交信息', commitAll:'提交前暂存所有文件', cancel:'取消', confirm:'确认', confirmTitle:'确认 Git 操作', destructive:'此操作可能丢弃本地更改。请在继续前检查仓库和文件。',
        fetch:'获取', pull:'拉取', push:'推送', checkout:'切换分支', deleteBranch:'删除分支', branch:'创建分支', tag:'创建标签', deleteTag:'删除标签', renameTag:'重命名标签', name:'名称', newName:'新名称', compare:'比较', compareHelp:'选择基准提交，然后选择另一个提交进行比较。',
        selected:'已选择', clear:'清除选择', ignore:'忽略', fileHistory:'文件历史', error:'操作失败', noCommits:'没有符合此筛选条件的提交。', success:'操作完成', binary:'二进制文件', truncated:'输出已截断', noFiles:'没有更改的文件', remote:'远程', local:'本地', tags:'标签', repo:'仓库',
        confirmBody:'在所选仓库中执行此操作？', base:'比较基准', suggest:'建议提交信息', suggestNote:'本地启发式规则，非 AI 生成。', file:'文件', commitSelected:'提交所选文件', openRemote:'打开远程提交', noRemote:'没有支持的 HTTPS 远程地址。', failureHelp:'请检查路径、Git 权限和仓库状态，然后刷新。',
        commitColumn:'提交', hash:'哈希', graph:'图谱', noUnstaged:'没有未暂存或未跟踪的更改', noStaged:'没有已暂存的更改', nothingToCommit:'没有可提交的更改', navigate:'导航', searchShortcut:'搜索', detailsShortcut:'详情', closeShortcut:'关闭',
      },
      ja: {
        title:'Git グラフ', workspace:'ワークスペース', workspaceChanged:'ワークスペースが変更されました。続行する前にリポジトリ一覧を更新してください。', refresh:'更新', open:'リポジトリを開く', search:'コミットを検索', branches:'ブランチ', all:'すべてのブランチ',
        history:'履歴', changes:'変更', staged:'ステージ済み', unstaged:'未ステージ', untracked:'未追跡', clean:'作業ツリーに変更はありません', loading:'読み込み中…', empty:'Git リポジトリが選択されていません', emptyHelp:'リポジトリを開くか、このセッションのワークスペースで検索してください。',
        discover:'リポジトリを検索', loadMore:'さらに読み込む', commits:'コミット', files:'ファイル', details:'コミットの詳細', close:'閉じる', author:'作成者', date:'日付', parents:'親コミット', copy:'ハッシュをコピー', copied:'コピーしました', diff:'差分', noDiff:'テキスト差分はありません（変更なし、またはバイナリファイル）。',
        stage:'ステージ', unstage:'ステージ解除', restore:'復元', stageAll:'すべてステージ', unstageAll:'すべてステージ解除', commit:'コミット', message:'コミットメッセージ', commitAll:'コミット前にすべてのファイルをステージする', cancel:'キャンセル', confirm:'確認', confirmTitle:'Git 操作の確認', destructive:'この操作はローカルの変更を破棄する可能性があります。続行前にリポジトリとファイルを確認してください。',
        fetch:'フェッチ', pull:'プル', push:'プッシュ', checkout:'ブランチを切り替え', deleteBranch:'ブランチを削除', branch:'ブランチを作成', tag:'タグを作成', deleteTag:'タグを削除', renameTag:'タグ名を変更', name:'名前', newName:'新しい名前', compare:'比較', compareHelp:'基準コミットを選び、比較する別のコミットを選んでください。',
        selected:'選択済み', clear:'選択を解除', ignore:'無視', fileHistory:'ファイルの履歴', error:'操作に失敗しました', noCommits:'この条件に一致するコミットはありません。', success:'操作が完了しました', binary:'バイナリファイル', truncated:'出力は切り詰められています', noFiles:'変更されたファイルはありません', remote:'リモート', local:'ローカル', tags:'タグ', repo:'リポジトリ',
        confirmBody:'選択したリポジトリでこの操作を実行しますか？', base:'比較の基準', suggest:'メッセージを提案', suggestNote:'ローカルのヒューリスティック。AI による生成ではありません。', file:'ファイル', commitSelected:'選択したファイルをコミット', openRemote:'リモートのコミットを開く', noRemote:'対応する HTTPS リモート URL がありません。', failureHelp:'パス、Git の権限、リポジトリの状態を確認してから更新してください。',
        commitColumn:'コミット', hash:'ハッシュ', graph:'グラフ', noUnstaged:'未ステージまたは未追跡の変更はありません', noStaged:'ステージ済みの変更はありません', nothingToCommit:'コミットする変更はありません', navigate:'移動', searchShortcut:'検索', detailsShortcut:'詳細', closeShortcut:'閉じる',
      },
      es: {
        title:'Grafo Git', workspace:'Espacio de trabajo', workspaceChanged:'El espacio de trabajo cambió. Actualiza la lista de repositorios antes de continuar.', refresh:'Actualizar', open:'Abrir repositorio', search:'Buscar commits', branches:'Ramas', all:'Todas las ramas',
        history:'Historial', changes:'Cambios', staged:'Preparados', unstaged:'Sin preparar', untracked:'Sin seguimiento', clean:'Árbol de trabajo limpio', loading:'Cargando…', empty:'Ningún repositorio Git seleccionado', emptyHelp:'Abre un repositorio o busca repositorios en el espacio de trabajo de esta sesión.',
        discover:'Buscar repositorios', loadMore:'Cargar más', commits:'commits', files:'archivos', details:'Detalles del commit', close:'Cerrar', author:'Autor', date:'Fecha', parents:'Commits padre', copy:'Copiar hash', copied:'Copiado', diff:'Diferencias', noDiff:'Sin diferencias de texto (archivo sin cambios o binario).',
        stage:'Preparar', unstage:'Quitar de preparación', restore:'Restaurar', stageAll:'Preparar todo', unstageAll:'Quitar todo de preparación', commit:'Crear commit', message:'Mensaje del commit', commitAll:'Preparar todos los archivos antes del commit', cancel:'Cancelar', confirm:'Confirmar', confirmTitle:'Confirmar operación Git', destructive:'Esta operación puede descartar cambios locales. Revisa el repositorio y los archivos antes de continuar.',
        fetch:'Obtener remotos', pull:'Traer cambios', push:'Enviar cambios', checkout:'Cambiar de rama', deleteBranch:'Eliminar rama', branch:'Crear rama', tag:'Crear etiqueta', deleteTag:'Eliminar etiqueta', renameTag:'Renombrar etiqueta', name:'Nombre', newName:'Nuevo nombre', compare:'Comparar', compareHelp:'Selecciona un commit base y luego otro para comparar.',
        selected:'Seleccionados', clear:'Limpiar selección', ignore:'Ignorar', fileHistory:'Historial del archivo', error:'La operación falló', noCommits:'Ningún commit coincide con este filtro.', success:'Operación completada', binary:'Archivo binario', truncated:'Salida truncada', noFiles:'No hay archivos modificados', remote:'Remotas', local:'Locales', tags:'Etiquetas', repo:'Repositorio',
        confirmBody:'¿Ejecutar esta operación en el repositorio seleccionado?', base:'Base de comparación', suggest:'Sugerir mensaje', suggestNote:'Heurística local, no generada por IA.', file:'Archivo', commitSelected:'Crear commit de seleccionados', openRemote:'Abrir commit remoto', noRemote:'No hay una URL remota HTTPS compatible.', failureHelp:'Comprueba la ruta, los permisos de Git y el estado del repositorio; luego actualiza.',
        commitColumn:'Commit', hash:'Hash', graph:'Grafo', noUnstaged:'No hay cambios sin preparar ni sin seguimiento', noStaged:'No hay cambios preparados', nothingToCommit:'No hay cambios para crear un commit', navigate:'Navegar', searchShortcut:'Buscar', detailsShortcut:'Detalles', closeShortcut:'Cerrar',
      },
      fr: {
        title:'Graphe Git', workspace:'Espace de travail', workspaceChanged:'L’espace de travail a changé. Actualisez la liste des dépôts avant de continuer.', refresh:'Actualiser', open:'Ouvrir un dépôt', search:'Rechercher des commits', branches:'Branches', all:'Toutes les branches',
        history:'Historique', changes:'Modifications', staged:'Indexées', unstaged:'Non indexées', untracked:'Non suivies', clean:'Arbre de travail propre', loading:'Chargement…', empty:'Aucun dépôt Git sélectionné', emptyHelp:'Ouvrez un dépôt ou recherchez des dépôts dans l’espace de travail de cette session.',
        discover:'Rechercher des dépôts', loadMore:'Charger plus', commits:'commits', files:'fichiers', details:'Détails du commit', close:'Fermer', author:'Auteur', date:'Date', parents:'Commits parents', copy:'Copier le hash', copied:'Copié', diff:'Différences', noDiff:'Aucune différence textuelle (fichier inchangé ou binaire).',
        stage:'Indexer', unstage:'Désindexer', restore:'Restaurer', stageAll:'Tout indexer', unstageAll:'Tout désindexer', commit:'Créer un commit', message:'Message du commit', commitAll:'Indexer tous les fichiers avant le commit', cancel:'Annuler', confirm:'Confirmer', confirmTitle:'Confirmer l’opération Git', destructive:'Cette opération peut supprimer des modifications locales. Vérifiez le dépôt et les fichiers avant de continuer.',
        fetch:'Récupérer', pull:'Tirer les modifications', push:'Pousser les modifications', checkout:'Changer de branche', deleteBranch:'Supprimer la branche', branch:'Créer une branche', tag:'Créer une étiquette', deleteTag:'Supprimer l’étiquette', renameTag:'Renommer l’étiquette', name:'Nom', newName:'Nouveau nom', compare:'Comparer', compareHelp:'Sélectionnez un commit de base, puis un autre commit à comparer.',
        selected:'Sélectionnés', clear:'Effacer la sélection', ignore:'Ignorer', fileHistory:'Historique du fichier', error:'Échec de l’opération', noCommits:'Aucun commit ne correspond à ce filtre.', success:'Opération terminée', binary:'Fichier binaire', truncated:'Sortie tronquée', noFiles:'Aucun fichier modifié', remote:'Distantes', local:'Locales', tags:'Étiquettes', repo:'Dépôt',
        confirmBody:'Exécuter cette opération dans le dépôt sélectionné ?', base:'Base de comparaison', suggest:'Suggérer un message', suggestNote:'Heuristique locale, sans génération par IA.', file:'Fichier', commitSelected:'Créer un commit des fichiers sélectionnés', openRemote:'Ouvrir le commit distant', noRemote:'Aucune URL distante HTTPS prise en charge.', failureHelp:'Vérifiez le chemin, les autorisations Git et l’état du dépôt, puis actualisez.',
        commitColumn:'Commit', hash:'Hash', graph:'Graphe', noUnstaged:'Aucune modification non indexée ou non suivie', noStaged:'Aucune modification indexée', nothingToCommit:'Aucune modification à committer', navigate:'Naviguer', searchShortcut:'Rechercher', detailsShortcut:'Détails', closeShortcut:'Fermer',
      },
      de: {
        title:'Git-Graph', workspace:'Arbeitsbereich', workspaceChanged:'Der Arbeitsbereich wurde geändert. Aktualisieren Sie die Repository-Liste, bevor Sie fortfahren.', refresh:'Aktualisieren', open:'Repository öffnen', search:'Commits suchen', branches:'Branches', all:'Alle Branches',
        history:'Verlauf', changes:'Änderungen', staged:'Vorgemerkt', unstaged:'Nicht vorgemerkt', untracked:'Unversioniert', clean:'Arbeitsverzeichnis sauber', loading:'Wird geladen…', empty:'Kein Git-Repository ausgewählt', emptyHelp:'Öffnen Sie ein Repository oder suchen Sie im Arbeitsbereich dieser Sitzung danach.',
        discover:'Repositories suchen', loadMore:'Mehr laden', commits:'Commits', files:'Dateien', details:'Commit-Details', close:'Schließen', author:'Autor', date:'Datum', parents:'Eltern-Commits', copy:'Hash kopieren', copied:'Kopiert', diff:'Unterschiede', noDiff:'Keine Textunterschiede (unveränderte Datei oder Binärdatei).',
        stage:'Vormerken', unstage:'Vormerkung aufheben', restore:'Wiederherstellen', stageAll:'Alles vormerken', unstageAll:'Alle Vormerkungen aufheben', commit:'Commit erstellen', message:'Commit-Nachricht', commitAll:'Alle Dateien vor dem Commit vormerken', cancel:'Abbrechen', confirm:'Bestätigen', confirmTitle:'Git-Operation bestätigen', destructive:'Diese Operation kann lokale Änderungen verwerfen. Prüfen Sie Repository und Dateien, bevor Sie fortfahren.',
        fetch:'Abrufen', pull:'Änderungen holen', push:'Änderungen senden', checkout:'Branch wechseln', deleteBranch:'Branch löschen', branch:'Branch erstellen', tag:'Tag erstellen', deleteTag:'Tag löschen', renameTag:'Tag umbenennen', name:'Name', newName:'Neuer Name', compare:'Vergleichen', compareHelp:'Wählen Sie einen Basis-Commit und danach einen weiteren zum Vergleichen.',
        selected:'Ausgewählt', clear:'Auswahl aufheben', ignore:'Ignorieren', fileHistory:'Dateiverlauf', error:'Operation fehlgeschlagen', noCommits:'Keine Commits entsprechen diesem Filter.', success:'Operation abgeschlossen', binary:'Binärdatei', truncated:'Ausgabe gekürzt', noFiles:'Keine geänderten Dateien', remote:'Remote', local:'Lokal', tags:'Tags', repo:'Repository',
        confirmBody:'Diese Operation im ausgewählten Repository ausführen?', base:'Vergleichsbasis', suggest:'Nachricht vorschlagen', suggestNote:'Lokale Heuristik, nicht KI-generiert.', file:'Datei', commitSelected:'Ausgewählte Dateien committen', openRemote:'Remote-Commit öffnen', noRemote:'Keine unterstützte HTTPS-Remote-URL.', failureHelp:'Prüfen Sie Pfad, Git-Berechtigungen und Repository-Zustand und aktualisieren Sie dann.',
        commitColumn:'Commit', hash:'Hash', graph:'Graph', noUnstaged:'Keine nicht vorgemerkten oder unversionierten Änderungen', noStaged:'Keine vorgemerkten Änderungen', nothingToCommit:'Keine Änderungen zum Committen', navigate:'Navigieren', searchShortcut:'Suchen', detailsShortcut:'Details', closeShortcut:'Schließen',
      },
      ru: {
        title:'Граф Git', workspace:'Рабочая область', workspaceChanged:'Рабочая область изменилась. Обновите список репозиториев перед продолжением.', refresh:'Обновить', open:'Открыть репозиторий', search:'Поиск коммитов', branches:'Ветки', all:'Все ветки',
        history:'История', changes:'Изменения', staged:'Индексированные', unstaged:'Неиндексированные', untracked:'Неотслеживаемые', clean:'Рабочее дерево чистое', loading:'Загрузка…', empty:'Репозиторий Git не выбран', emptyHelp:'Откройте репозиторий или найдите его в рабочей области этой сессии.',
        discover:'Найти репозитории', loadMore:'Загрузить ещё', commits:'коммитов', files:'файлы', details:'Сведения о коммите', close:'Закрыть', author:'Автор', date:'Дата', parents:'Родительские коммиты', copy:'Копировать хеш', copied:'Скопировано', diff:'Различия', noDiff:'Нет текстовых различий (файл не изменён или двоичный).',
        stage:'Индексировать', unstage:'Убрать из индекса', restore:'Восстановить', stageAll:'Индексировать всё', unstageAll:'Убрать всё из индекса', commit:'Создать коммит', message:'Сообщение коммита', commitAll:'Индексировать все файлы перед коммитом', cancel:'Отмена', confirm:'Подтвердить', confirmTitle:'Подтвердить операцию Git', destructive:'Эта операция может отменить локальные изменения. Проверьте репозиторий и файлы перед продолжением.',
        fetch:'Получить', pull:'Загрузить изменения', push:'Отправить изменения', checkout:'Переключить ветку', deleteBranch:'Удалить ветку', branch:'Создать ветку', tag:'Создать тег', deleteTag:'Удалить тег', renameTag:'Переименовать тег', name:'Имя', newName:'Новое имя', compare:'Сравнить', compareHelp:'Выберите базовый коммит, затем другой для сравнения.',
        selected:'Выбрано', clear:'Снять выделение', ignore:'Игнорировать', fileHistory:'История файла', error:'Ошибка операции', noCommits:'Нет коммитов, соответствующих фильтру.', success:'Операция завершена', binary:'Двоичный файл', truncated:'Вывод сокращён', noFiles:'Нет изменённых файлов', remote:'Удалённые', local:'Локальные', tags:'Теги', repo:'Репозиторий',
        confirmBody:'Выполнить эту операцию в выбранном репозитории?', base:'База сравнения', suggest:'Предложить сообщение', suggestNote:'Локальная эвристика, не генерация ИИ.', file:'Файл', commitSelected:'Создать коммит выбранных файлов', openRemote:'Открыть удалённый коммит', noRemote:'Нет поддерживаемого удалённого HTTPS URL.', failureHelp:'Проверьте путь, права Git и состояние репозитория, затем обновите.',
        commitColumn:'Коммит', hash:'Хеш', graph:'Граф', noUnstaged:'Нет неиндексированных или неотслеживаемых изменений', noStaged:'Нет индексированных изменений', nothingToCommit:'Нет изменений для коммита', navigate:'Навигация', searchShortcut:'Поиск', detailsShortcut:'Сведения', closeShortcut:'Закрыть',
      },
    };
    function normalizeLocale(value) {
      const language=typeof value==='string'?value.trim().toLowerCase().split('-')[0]:'';
      return Object.hasOwn(dictionaries,language)?language:'en';
    }
    dictionaries['pt-BR']=dictionaries.pt;
    function localeTag(locale) { const language=normalizeLocale(locale);return language==='pt'?'pt-BR':language; }
    function formatDate(value,locale) {
      try{return new Intl.DateTimeFormat(localeTag(locale),{year:'2-digit',month:'short',day:'2-digit'}).format(new Date(value));}catch{return value;}
    }
    const actionLabels = {stage:'stage','stage-all':'stageAll',unstage:'unstage','unstage-all':'unstageAll',discard:'restore','discard-all':'restore',ignore:'ignore',commit:'commit',fetch:'fetch',pull:'pull',push:'push',checkout:'checkout','delete-branch':'deleteBranch',branch:'branch',tag:'tag','tag-delete':'deleteTag','tag-rename':'renameTag'};
    const parameterLabels = {file:'file',files:'files',name:'name',newname:'newName',hash:'hash',message:'message',all:'commitAll'};
    function operationSummary(action,params,tr) {
      return [tr(actionLabels[action]||'confirmTitle'),...Object.entries(params).map(([key,value])=>tr(parameterLabels[key]||key)+': '+(Array.isArray(value)?value.join('\n'):value))].join('\n');
    }
    function errorNotice(error) {
      const changed=['workspace-mismatch','repo-not-in-workspace'].includes(error.code);
      const detail=error.detail?[error.code,error.detail].filter(Boolean).join(': '):error.localeKey?undefined:error.message||error.code;
      return {error:true,key:changed?'workspaceChanged':error.localeKey||'failureHelp',detail};
    }
    function noticeText(notice,tr) { return [notice.key?tr(notice.key):'',notice.detail].filter(Boolean).join('\n'); }
    const css = `
      .ggb{height:100%;min-height:0;display:flex;flex-direction:column;position:relative;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:1.5}
      .ggb *{box-sizing:border-box}.ggb button,.ggb input,.ggb select,.ggb textarea{font:inherit;color:inherit;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:6px;padding:6px 9px;max-width:100%}
      .ggb button{cursor:pointer;white-space:nowrap}.ggb button:hover{background:var(--dsw-alias-bg-layer-2)}.ggb :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
      .ggb .ggb-primary{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}.ggb .ggb-danger{color:var(--dsw-alias-state-error-primary)}
      .ggb-toolbar{display:flex;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--dsw-alias-border-l1)}.ggb-toolbar strong{margin-right:6px}.ggb-repo{flex:1;min-width:140px}
      .ggb-muted{color:var(--dsw-alias-label-secondary)}.ggb-status{display:flex;align-items:center;border-bottom:1px solid var(--dsw-alias-border-l1);flex-wrap:wrap}.ggb-notice{padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);overflow-wrap:anywhere}.ggb-error{color:var(--dsw-alias-state-error-primary)}
      .ggb-main{display:flex;flex:1;min-height:0}.ggb-sidebar{flex-shrink:0;border-right:1px solid var(--dsw-alias-border-l1);overflow:auto}.ggb-sidebar h3{text-transform:uppercase;color:var(--dsw-alias-label-secondary)}.ggb-sidebar label{display:flex;align-items:center;overflow-wrap:anywhere}.ggb-sidebar input{flex-shrink:0}.ggb-sidebar button{margin:3px 0}
      .ggb-content{flex:1;min-width:0}.ggb-work{border:1px solid var(--dsw-alias-border-l1);overflow:hidden}.ggb-work h4{margin:0;color:var(--dsw-alias-label-secondary)}
      .ggb-file{display:flex;gap:8px;align-items:center;border-top:1px solid var(--dsw-alias-border-l1)}.ggb-file .ggb-path{flex:1;text-align:left;white-space:normal;overflow-wrap:anywhere;border:0;background:transparent}.ggb-code{font:12px ui-monospace,monospace;color:var(--dsw-alias-label-secondary)}.ggb-add{color:var(--dsw-alias-state-success-primary)}.ggb-del{color:var(--dsw-alias-state-error-primary)}
      .ggb-log{width:100%;border-collapse:collapse;table-layout:fixed}.ggb-log td{border-bottom:1px solid var(--dsw-alias-border-l1);vertical-align:middle}.ggb-log tbody tr{cursor:pointer}.ggb-log svg{display:block;overflow:visible}.ggb-subject{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ggb-ref{padding:1px 5px;margin-right:5px;border-radius:4px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}.ggb-log .ggb-author{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .ggb-empty{padding:48px 20px;text-align:center}.ggb-empty h2{font-size:18px}.ggb-empty p{color:var(--dsw-alias-label-secondary);max-width:460px;margin:12px auto 20px}.ggb-empty button{margin:4px}
      .ggb-detail{width:42%;min-width:280px;max-width:700px;overflow:auto;border-left:1px solid var(--dsw-alias-border-l1);padding:12px;background:var(--dsw-alias-bg-layer-1)}.ggb-detail h3{margin:8px 0}.ggb-detail dl{font-size:12px}.ggb-detail dt{color:var(--dsw-alias-label-secondary);margin-top:8px}.ggb-detail dd{margin:0;overflow-wrap:anywhere}.ggb-detail .ggb-file{padding:5px 0}.ggb-diff{font:12px/1.6 ui-monospace,monospace;overflow:auto;white-space:pre;tab-size:4;margin:10px 0;background:var(--dsw-alias-bg-base);padding:10px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;max-height:65vh}.ggb-diff span{display:block;min-height:1.6em}.ggb-hunk{color:var(--dsw-alias-brand-primary)}
      .ggb-modal{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:20px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 75%,transparent)}.ggb-dialog{width:500px;max-width:100%;max-height:90%;overflow:auto;padding:20px;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 10px 40px color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent)}.ggb-dialog h3{margin-top:0}.ggb-dialog label{display:block;margin:12px 0}.ggb-dialog input:not([type=checkbox]),.ggb-dialog textarea{width:100%;display:block;margin-top:6px}.ggb-dialog footer{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.ggb-dialog pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px ui-monospace,monospace}.ggb-wrap{display:flex;gap:6px;flex-wrap:wrap}.ggb-pathline{overflow-wrap:anywhere;font:12px ui-monospace,monospace}
      /* Compact workbench surfaces; only host theme tokens drive UI colors. */
      .ggb{min-width:0;container-type:inline-size;container-name:gitgraph;--ggb-edge:color-mix(in srgb,var(--dsw-alias-border-l1) 65%,transparent);--ggb-selected:color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,var(--dsw-alias-bg-base));--ggb-hover:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent)}
      .ggb button,.ggb input,.ggb select{min-height:32px;border-color:var(--ggb-edge);border-radius:7px}.ggb button{display:inline-flex;align-items:center;justify-content:center;gap:6px}.ggb button:hover:not(:disabled){background:var(--ggb-hover)}.ggb button:disabled{opacity:.38;cursor:not-allowed;background:var(--dsw-alias-bg-layer-1)}.ggb input[type=radio],.ggb input[type=checkbox]{min-height:0;accent-color:var(--dsw-alias-brand-primary)}
      .ggb button.ggb-primary:not(:disabled){background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}.ggb button.ggb-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}.ggb .ggb-more{display:flex;width:max-content;margin:12px auto!important}
      .ggb-icon{width:15px;height:15px;flex:none;vertical-align:middle;pointer-events:none}.ggb-toolbar{padding:8px 12px;gap:6px;border-color:var(--ggb-edge)}.ggb-toolbar strong{font-size:14px}.ggb-repo{max-width:440px}.ggb-search{position:relative;display:flex;align-items:center;flex:1;max-width:330px;min-width:150px}.ggb-search>.ggb-icon{position:absolute;left:10px;color:var(--dsw-alias-label-secondary)}.ggb-search input{width:100%;padding-left:33px}.ggb-compact-filter{display:none;align-items:center;gap:6px;flex-wrap:wrap;max-width:100%}.ggb-branch-picker{max-width:180px}.ggb-workspace{padding:4px 12px;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ggb-status{padding:5px 12px;gap:14px;border-color:var(--ggb-edge);font-size:11px}.ggb-status>span{display:inline-flex;align-items:center;gap:5px}.ggb-head{color:var(--dsw-alias-label-primary);font-weight:500}
      .ggb-sidebar{width:190px;padding:10px 8px;background:var(--dsw-specific-sidebar-fill);border-color:var(--ggb-edge)}.ggb-sidebar h3{margin:16px 10px 5px;font-size:10px;letter-spacing:.09em}.ggb-sidebar label{position:relative;min-height:32px;padding:6px 9px;margin:2px 0;border:1px solid transparent;border-radius:7px;gap:8px;cursor:pointer}.ggb-sidebar label:hover{background:var(--ggb-hover)}.ggb-sidebar label[data-selected=true]{background:var(--ggb-selected);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 28%,transparent);box-shadow:inset 3px 0 var(--dsw-alias-brand-primary);font-weight:600}.ggb-sidebar label>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ggb-sidebar .ggb-wrap{padding:2px 8px 6px}.ggb-sidebar .ggb-wrap button{font-size:11px;max-width:100%;white-space:normal}.ggb-sidebar input{margin:0;width:13px;height:13px}
      .ggb-content{display:flex;flex-direction:column;min-height:0;overflow:hidden;container-type:inline-size;container-name:githistory}.ggb-scroll{flex:1;min-height:0;overflow:auto;scroll-padding-top:34px}.ggb-work{margin:8px 12px 6px;border-color:var(--ggb-edge);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}.ggb-workbar{min-height:38px;padding:4px 8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ggb-work-title{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;flex:none}.ggb .ggb-work-toggle{padding:2px 3px;min-height:28px;border:0;background:transparent}.ggb-clean-label{display:inline-flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);font-size:12px;min-width:0}.ggb-clean-label>.ggb-icon{color:var(--dsw-alias-state-success-primary)}.ggb-count{font-size:10px;font-weight:500;min-width:19px;text-align:center;padding:0 5px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}.ggb-work-actions{margin-left:auto;display:flex;align-items:center;gap:6px;flex-wrap:wrap}.ggb-work-actions button{min-height:26px;font-size:11px;padding:3px 7px}.ggb-work-body{border-top:1px solid var(--ggb-edge)}.ggb-work h4{padding:5px 10px;font-size:11px;background:var(--dsw-alias-bg-base)}.ggb-file{border-color:var(--ggb-edge);font-size:12px;padding:4px 10px}.ggb-file button{min-height:28px}.ggb-file .ggb-path{justify-content:flex-start}
      .ggb-log{font-size:13px}.ggb-log thead{position:sticky;top:0;z-index:2;background:var(--dsw-alias-bg-base)}.ggb-log th{padding:7px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);border-bottom:1px solid var(--ggb-edge);white-space:nowrap}.ggb-log td{height:48px;padding:4px 10px;border-color:var(--ggb-edge)}.ggb-log tbody tr:hover{background:var(--ggb-hover)}.ggb-log tbody tr[aria-selected=true]{background:var(--ggb-selected);box-shadow:inset 3px 0 var(--dsw-alias-brand-primary)}.ggb-log tbody tr:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.ggb-log .ggb-graphcell{padding:0}.ggb-log .ggb-hash{width:86px;font-variant-numeric:tabular-nums}.ggb-log .ggb-author{width:124px;color:var(--dsw-alias-label-primary)}.ggb-log .ggb-date{width:100px;white-space:nowrap;font-size:12px;font-variant-numeric:tabular-nums}.ggb-ref-list{display:flex;gap:4px;max-height:17px;overflow:hidden;margin-bottom:2px}.ggb-ref{margin:0;max-width:180px;overflow:hidden;text-overflow:ellipsis;flex-shrink:0;font-size:10px;line-height:14px;border-color:var(--ggb-edge);font-weight:500}.ggb-ref[data-head=true]{color:var(--dsw-alias-brand-primary);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 40%,transparent);background:var(--ggb-selected)}.ggb-subject-text{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ggb-log tr[aria-selected=true] .ggb-subject-text{font-weight:500}
      .ggb-footer{display:flex;align-items:center;gap:14px;flex-wrap:wrap;flex:none;padding:6px 12px;border-top:1px solid var(--ggb-edge);font-size:10px;color:var(--dsw-alias-label-secondary)}.ggb-footer>span{display:inline-flex;align-items:center;gap:4px}.ggb-footer kbd{font:10px ui-monospace,monospace;padding:0 3px;line-height:16px;border:1px solid var(--ggb-edge);border-radius:3px}.ggb-sr{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.ggb-detail{border-color:var(--ggb-edge)}
      .ggb-log td.ggb-graphcell{border-bottom:0}.ggb-current-branch::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-brand-primary);margin-right:7px;vertical-align:middle}
      @container githistory (max-width:650px){.ggb-log .ggb-author{display:none}}@container githistory (max-width:480px){.ggb-log .ggb-date{display:none}}
      @container gitgraph (max-width:900px){.ggb-sidebar{width:155px}.ggb-log .ggb-author{width:105px}.ggb-detail{position:absolute;inset:0 0 0 auto;width:min(640px,85%);max-width:none;z-index:10;box-shadow:-8px 0 24px color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}}
      @container gitgraph (max-width:700px){.ggb-log .ggb-author{display:none}.ggb-sidebar{width:140px}.ggb-workspace{font-size:10px}}
      @container gitgraph (max-width:580px){.ggb-sidebar{display:none}.ggb-compact-filter{display:flex}.ggb-log .ggb-date{display:none}.ggb-detail{inset:0;width:100%;min-width:0}.ggb-toolbar{padding:7px 9px}.ggb-work{margin:6px 8px}.ggb-workbar{gap:5px}.ggb-clean-label{font-size:11px}.ggb-footer{gap:8px}.ggb-toolbar strong{font-size:13px}}
    `;
    const palette = ['#58a6ff','#bc8cff','#3fb950','#f0883e','#ff7b72','#d2a8ff','#79c0ff','#e3b341']; // graph artwork only
    const iconPaths = {
      search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
      fetch:'M12 3v12m-5-5 5 5 5-5M4 19h16',pull:'M12 3v14m-5-5 5 5 5-5M5 21h14',push:'M12 18V4m-5 5 5-5 5 5M5 21h14',
      stageAll:'m12 3 10 5-10 5L2 8l10-5m-10 9 10 5 10-5M2 16l10 5 10-5',unstageAll:'M5 12h14',commit:'m5 12 4 4L19 6',
      branch:'M6 3v12m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6m0-12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4M18 7v3c0 4-12 1-12 5',
      check:'m7 12 3 3 7-7M22 12a10 10 0 1 1-4-8',chevron:'m8 5 7 7-7 7',down:'m5 9 7 7 7-7',
      open:'M3 7h6l2 2h10l-3 11H3V7m0 0V4h6l2 3',discover:'M4 4h6m-6 0v6m16-6h-6m6 0v6M4 20h6m-6 0v-6m16 6h-6m6 0v-6',refresh:'M20 8a8 8 0 1 0 0 8M20 3v5h-5',
      close:'m6 6 12 12M18 6 6 18',copy:'M9 9h12v12H9V9M15 5V2H2v13h3',stage:'M12 5v14M5 12h14',unstage:'M5 12h14',restore:'M4 10h10a6 6 0 0 1 0 12M4 10l5-5m-5 5 5 5',
    };
    function icon(name) {
      return iconPaths[name]?h('svg',{className:'ggb-icon',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,'aria-hidden':true,focusable:false},h('path',{d:iconPaths[name],strokeLinecap:'round',strokeLinejoin:'round'})):null;
    }
    function actionDisabled(key,{ready,busy,discovering,work={},disabled=false}) {
      if(disabled||busy||discovering)return true;
      if(!ready&&!['open','discover','refresh','close','clear','cancel'].includes(key))return true;
      const staged=work.staged?.length||0, unstaged=(work.unstaged?.length||0)+(work.untracked?.length||0);
      return key==='stageAll'?unstaged===0:key==='unstageAll'?staged===0:key==='commit'?staged+unstaged===0:false;
    }
    function graphColumnWidth(rows) {
      const max=rows.reduce((n,row)=>Math.max(n,row.col,...row.edges.flat()),0);
      return Math.min(108,Math.max(36,20+12*Math.min(7,max)));
    }
    function workspaceForSession(snapshot, sessionId) {
      return (snapshot.items || []).find(workspace => (workspace.sessionIds || []).includes(sessionId)) || null;
    }
    function workspaceStorageKey(ws) { return typeof ws==='string'&&ws ? 'ggb-workspace-v1:'+encodeURIComponent(ws) : null; }
    function readWorkspaceState(storage, ws) {
      try {const key=workspaceStorageKey(ws);if(!key)return {repos:[],selected:''};const value=JSON.parse(storage.getItem(key)||'null');return {repos:Array.isArray(value?.repos)?[...new Set(value.repos.filter(path=>typeof path==='string'&&path.trim()))].slice(0,40):[],selected:typeof value?.selected==='string'?value.selected:''};}catch{return {repos:[],selected:''};}
    }
    function writeWorkspaceState(storage, ws, value) {
      try {const key=workspaceStorageKey(ws);if(key)storage.setItem(key,JSON.stringify(value));}catch{/* Storage is optional; discovery still works. */}
    }
    function chooseWorkspaceRepo(repos, current, remembered, preferred) { return [current,remembered,preferred,repos[0]].find(value=>value&&repos.includes(value))||''; }
    function createScopedRequest(request, scope, getOwner, getWorkspace, getRepo) {
      const aborted=()=>Object.assign(new Error('request-superseded'),{name:'AbortError'});
      return async(op,params={},signal)=>{
        const owner=getOwner();const current=()=>owner&&getOwner()===owner&&!owner.signal.aborted&&!signal?.aborted&&(!params.repo||!getRepo||getRepo()===params.repo);
        if(!current())throw aborted();
        try {const result=await request(op,{...params,...scope,scope:['repos','findrepos'].includes(op)?undefined:getWorkspace()},signal||owner.signal);if(!current())throw aborted();return result;}
        catch(error){if(!current())throw aborted();throw error;}
      };
    }
    const emptyGraph=()=>({repo:'',commits:[],branches:[],total:0,head:'',work:{staged:[],unstaged:[],untracked:[]}});
    function layoutGraph(commits) {
      let lanes = [];
      return commits.map(c => {
        let col = lanes.indexOf(c.hash);
        if(col < 0) {col = lanes.indexOf(null); if(col < 0) col = lanes.length; lanes[col] = c.hash;}
        const before = lanes.slice(); lanes[col] = null;
        (c.parents || []).forEach((p,i) => {
          if(lanes.includes(p)) return;
          if(i === 0 && lanes[col] === null) lanes[col] = p;
          else {let free = lanes.indexOf(null); if(free < 0) free = lanes.length; lanes[free] = p;}
        });
        const edges = [];
        before.forEach((hash,i) => {if(hash && i !== col) edges.push([i,i]);});
        (c.parents || []).forEach(p => edges.push([col,lanes.indexOf(p)]));
        while(lanes.length && lanes[lanes.length-1] === null) lanes.pop();
        return {col,edges};
      });
    }
    async function api(op, params={}, signal) {
      const q = new URLSearchParams({op});
      Object.entries(params).forEach(([k,v]) => {if(v == null) return; (Array.isArray(v)?v:[v]).forEach(x=>q.append(k,String(x)));});
      const post = ['gitop','addrepo','reveal'].includes(op);
      const res = await fetch('/git-graph-bilingual/api?'+q, {method:post?'POST':'GET', credentials:'same-origin',signal, ...(post?{headers:{'content-type':'application/json'},body:'{}'}:{})});
      const data = await res.json(); if(!res.ok || !data.ok) throw Object.assign(Error([data.error || String(res.status),data.detail].filter(Boolean).join(': ')),{code:data.error,detail:data.detail}); return data;
    }
    function apply(ctx) {
      const requestApi=api;
      // Own only this namespace; never write Harness language preferences.
      const namespace='@edgarsantiago/dsh-git-graph';
      for(const [language,dictionary] of Object.entries(dictionaries))ctx.effect(()=>ctx.locale.register(namespace,language,dictionary));
      const tr=ctx.locale.bind(namespace);
      const subscribeLocale=notify=>ctx.locale.subscribe(notify);
      const getLocale=()=>ctx.locale.getLocale();
      function ScopedView(props) {
        const workspace=props.useWorkspaces(snapshot=>workspaceForSession(snapshot,props.sessionId));
        const sessionCwd=props.useSessions(snapshot=>snapshot.byId[props.sessionId]?.cwd||'');
        const path=workspace?.path||sessionCwd,workspaceId=workspace?.workspaceId||'';
        return h(View,{...props,workspacePath:path,workspaceId,key:JSON.stringify([props.sessionId,workspaceId,path])});
      }
      function View(props) {
        const locale=useSyncExternalStore(subscribeLocale,getLocale,getLocale).active;
        const [repos,setRepos]=useState([]), [repo,setRepo]=useState(''), [graphData,setGraphData]=useState(emptyGraph);
        const graphReady=!!repo&&graphData.repo===repo;
        const {commits,branches,total,head,work}=graphReady?graphData:emptyGraph();
        const [filter,setFilter]=useState(''), [query,setQuery]=useState(''), [busy,setBusy]=useState(false), [discovering,setDiscovering]=useState(false), [notice,setNotice]=useState(null);
        const [detail,setRawDetail]=useState(null), [patch,setRawPatch]=useState(null), [modal,setModal]=useState(null), [selected,setSelected]=useState(new Set()), [savedBase,setBase]=useState(null), [activeHash,setActiveHash]=useState(''), [workOpen,setWorkOpen]=useState(true);
        const base=savedBase?.repo===repo?savedBase:null;
        const request = useRef(0), discoveryRequest=useRef(0), detailRequest=useRef(0), mounted=useRef(true), searchRef=useRef(null);
        const cwd=props.workspacePath, workspace=useRef(''), liveRepo=useRef(repo);liveRepo.current=repo;
        const controller=useRef(null), detailController=useRef(null), lifetime=useRef(null);
        const api=createScopedRequest(requestApi,{sid:props.sessionId,ws:cwd,workspaceId:props.workspaceId||undefined},()=>lifetime.current,()=>workspace.current||undefined,()=>liveRepo.current);
        useEffect(()=>{mounted.current=true;lifetime.current=new AbortController();return()=>{mounted.current=false;lifetime.current.abort();request.current++;discoveryRequest.current++;detailRequest.current++;controller.current?.abort();detailController.current?.abort();};},[]);
        function setDetail(value){setRawDetail(value?{...value,repo}:null);}
        function setPatch(value){setRawPatch(value?{...value,repo}:null);}
        function fail(e){if(!mounted.current||e.name==='AbortError')return;const changed=['workspace-mismatch','repo-not-in-workspace'].includes(e.code);if(changed){setRepo('');setRepos([]);setGraphData(emptyGraph());setModal(null);setDetail(null);setPatch(null);setSelected(new Set());}setNotice(errorNotice(e));}
        function stored(ws=workspace.current){try{return readWorkspaceState(localStorage,ws);}catch{return {repos:[],selected:''};}}
        function remember(ws,value){try{writeWorkspaceState(localStorage,ws,value);}catch{}}
        function chooseRepo(value){if(!repos.includes(value))return;discoveryRequest.current++;setNotice(null);setRepo(value);remember(workspace.current,{...stored(),selected:value});}
        async function discover(scan=false,signal) {
          const generation=++discoveryRequest.current;setDiscovering(true);
          try {
            const data=await api(scan?'findrepos':'repos',{},signal);
            if(signal?.aborted || !mounted.current || generation!==discoveryRequest.current)return;
            if(workspace.current&&workspace.current!==data.ws){setRepo('');setRepos([]);setGraphData(emptyGraph());setModal(null);setDetail(null);setPatch(null);setSelected(new Set());}
            workspace.current=data.ws||'';
            const saved=stored(),list=[...new Set(data.repos||[])],manual=[];
            for(const path of saved.repos){
              try{const added=await api('addrepo',{path},signal);manual.push(added.repo);if(!list.includes(added.repo))list.push(added.repo);}
              catch(e){if(e.name==='AbortError'||['workspace-mismatch','request-rejected'].includes(e.code))throw e;}
            }
            if(signal?.aborted || !mounted.current || generation!==discoveryRequest.current)return;
            const current=chooseWorkspaceRepo(list,repo,saved.selected,data.current);
            setNotice(null);setRepos(list);setRepo(current);remember(workspace.current,{repos:manual,selected:current});
            if(current&&current===repo)await reload();
          }catch(e){if(generation===discoveryRequest.current)fail(e);}
          finally{if(mounted.current&&generation===discoveryRequest.current)setDiscovering(false);}
        }
        useEffect(()=>{const ac=new AbortController();void discover(false,ac.signal);return()=>{ac.abort();discoveryRequest.current++;};},[]);
        async function reload(append=false) {
          if(!repo||!mounted.current) return;
          controller.current?.abort(); const ac = new AbortController();controller.current=ac;const generation=++request.current;
          setBusy(true);setNotice(null);
          try {
            const [g,b,w]=await Promise.all([api('graph',{repo,limit:200,skip:append?commits.length:0},ac.signal),api('branches',{repo},ac.signal),api('workstatus',{repo},ac.signal)]);
            if(!mounted.current || generation !== request.current || liveRepo.current!==repo) return;
            setGraphData(prev=>{const prior=append&&prev.repo===repo?prev.commits:[];return {repo,commits:append?[...prior,...g.commits.filter(c=>!prior.some(x=>x.hash===c.hash))]:g.commits,total:g.total,head:g.head,branches:b.branches,work:w};});setSelected(new Set());
          }catch(e){if(generation===request.current&&liveRepo.current===repo)fail(e);}finally{if(mounted.current && generation===request.current && liveRepo.current===repo)setBusy(false);}
        }
        useEffect(()=>{setFilter('');setBase(null);setDetail(null);setPatch(null);setModal(null);setSelected(new Set());setActiveHash('');setWorkOpen(true);if(repo)void reload();else{setGraphData(emptyGraph());setBusy(false);}return()=>{request.current++;controller.current?.abort();detailController.current?.abort();detailRequest.current++;};},[repo]);
        const btn=(key,onClick,extra={})=>{
          const disabled=actionDisabled(key,{ready:graphReady,busy,discovering,work,disabled:extra.disabled});
          const reason=key==='stageAll'?'noUnstaged':key==='unstageAll'?'noStaged':key==='commit'?'nothingToCommit':null;
          return h('button',{...extra,type:'button',onClick,disabled,title:extra.title||(disabled&&reason&&graphReady&&!busy&&!discovering?tr(reason):undefined)},icon(key),tr(key));
        };
        async function openRepo() {
          const owner=lifetime.current;
          try {const path=await ctx.uiWorkspace.pickDirectory();if(owner!==lifetime.current||owner?.signal.aborted||!mounted.current)return;if(path)await addRepo(path);} catch(e){fail(e);}
        }
        async function addRepo(path) {
          const generation=++discoveryRequest.current;
          const d=await api('addrepo',{path});
          if(!mounted.current || generation!==discoveryRequest.current)return;
          if(d.ws)workspace.current=d.ws;
          const saved=stored();remember(workspace.current,{repos:[...new Set([...saved.repos,d.repo])],selected:d.repo});setNotice(null);
          setRepos(prev=>[...new Set([...prev,d.repo])]);setRepo(d.repo);if(repo===d.repo)void reload();
        }
        async function execute(m) {
          if(!mounted.current||m.repo!==liveRepo.current||!graphReady)return;
          setBusy(true);setNotice(null);
          try{await api('gitop',{repo:m.repo,action:m.action,...m.params});setModal(null);setDetail(null);setPatch(null);await reload();if(mounted.current&&m.repo===liveRepo.current)setNotice({key:'success'});}
          catch(e){fail(e);}finally{if(mounted.current&&m.repo===liveRepo.current)setBusy(false);}
        }
        function op(action,params={}) {setModal({action,params,repo,kind:'confirm'});}
        function create(action,params={}){setModal({action,params,repo,kind:'form',value:'',all:false});}
        async function showCommit(c) {
          if(base && base.hash!==c.hash) {
            const gen=++detailRequest.current;setDetail({title:base.hash.slice(0,7)+' → '+c.hash.slice(0,7),loading:true});setPatch(null);
            try{const d=await api('diff',{repo,from:base.hash,to:c.hash});if(gen===detailRequest.current&&mounted.current)setDetail({title:base.hash.slice(0,7)+' → '+c.hash.slice(0,7),diff:d.diff});}catch(e){fail(e);}return;
          }
          detailController.current?.abort();const ac=new AbortController();detailController.current=ac;const gen=++detailRequest.current;
          setDetail({commit:c,loading:true});setPatch(null);
          try{const d=await api('show',{repo,hash:c.hash},ac.signal);if(gen===detailRequest.current&&mounted.current)setDetail({commit:c,...d});}catch(e){fail(e);}
        }
        async function showFile(f,group) {
          const gen=++detailRequest.current;setDetail({title:f.path,loading:true});setPatch(null);
          try{const d=await api('workfile',{repo,file:f.path,old:f.oldPath,staged:group==='staged'?'1':group==='untracked'?'untracked':'0'});if(gen===detailRequest.current&&mounted.current)setDetail({title:f.path,file:f.path,...d});}catch(e){fail(e);}
        }
        async function fileHistory(file) {
          const gen=++detailRequest.current;setPatch(null);setDetail({title:file,loading:true});
          try{const d=await api('filelog',{repo,file});if(gen===detailRequest.current&&mounted.current)setDetail({title:file,file,log:d.commits});}catch(e){fail(e);}
        }
        async function fileDiff(file,hash) {
          const gen=++detailRequest.current;setPatch({loading:true});
          try{const d=await api('filediff',{repo,file,hash});if(gen===detailRequest.current&&mounted.current)setPatch(d);}catch(e){fail(e);}
        }
        const visible = (()=>{
          let reachable=null;
          if(filter){const start=branches.find(b=>b.refname===filter)?.sha; reachable=new Set();const map=new Map(commits.map(c=>[c.hash,c]));const stack=start?[start]:[];while(stack.length){const hash=stack.pop();if(reachable.has(hash))continue;reachable.add(hash);(map.get(hash)?.parents||[]).forEach(p=>stack.push(p));}}
          const term=query.toLocaleLowerCase();return commits.filter(c=>(!reachable||reachable.has(c.hash))&&(!term||[c.subject,c.author,c.hash,c.email].some(v=>String(v||'').toLocaleLowerCase().includes(term))));
        })();
        const graph=layoutGraph(commits), graphMap=new Map(commits.map((c,i)=>[c.hash,graph[i]])), graphWidth=graphColumnWidth(graph);
        const active=visible.findIndex(c=>c.hash===activeHash);
        function keyboard(e){
          if(e.key==='Escape'){setModal(null);setDetail(null);setPatch(null);detailRequest.current++;return;}
          if((e.ctrlKey||e.metaKey)&&e.key==='f'){e.preventDefault();searchRef.current?.focus();return;}
          if(/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)||e.target.closest('button')||modal)return;
          if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const next=Math.max(0,Math.min(visible.length-1,active+(e.key==='ArrowDown'?1:-1)));setActiveHash(visible[next]?.hash||'');const row=e.currentTarget.querySelector(`[data-commit-index="${next}"]`);row?.focus({preventScroll:true});row?.scrollIntoView({block:'nearest'});}
          if(e.key==='Enter'&&visible[active])showCommit(visible[active]);
        }
        function diffView(d){
          if(!d)return null;if(d.loading)return h('p',null,tr('loading'));
          const text=d.diff??d.content??'';
          return h(React.Fragment,null,d.binary&&h('p',null,tr('binary')),d.truncated&&h('p',{className:'ggb-muted'},tr('truncated')),h('pre',{className:'ggb-diff'},text?text.split('\n').map((line,i)=>h('span',{key:i,className:line.startsWith('+')&&!line.startsWith('+++')?'ggb-add':line.startsWith('-')&&!line.startsWith('---')?'ggb-del':line.startsWith('@@')?'ggb-hunk':''},line||' ')):tr('noDiff')));
        }
        const date=s=>formatDate(s,locale);
        function logRow(c,i){const g=graphMap.get(c.hash)||{col:0,edges:[]};const step=12,x=v=>8+(v%8)*step;
          const refs=branches.filter(b=>b.sha===c.hash);
          return h('tr',{key:c.hash,tabIndex:active===i||(active<0&&i===0)?0:-1,'aria-selected':active===i,'data-commit-index':i,onFocus:()=>setActiveHash(c.hash),onClick:()=>{setActiveHash(c.hash);showCommit(c);},onKeyDown:e=>{if(e.key==='Enter'){e.stopPropagation();showCommit(c);}}},
            h('td',{className:'ggb-graphcell',style:{width:graphWidth},'aria-hidden':true},h('svg',{width:graphWidth,height:48,viewBox:`0 0 ${graphWidth} 48`},g.edges.map(([a,b],j)=>h('path',{key:j,d:(a===b&&a!==g.col?`M ${x(a)} 0 L ${x(a)} 24 `:'')+`M ${x(a)} 24 C ${x(a)} 36 ${x(b)} 36 ${x(b)} 48`,stroke:palette[a%palette.length],fill:'none',strokeWidth:1.7})),h('path',{d:`M ${x(g.col)} 0 L ${x(g.col)} 24`,stroke:palette[g.col%palette.length],strokeWidth:1.7}),h('circle',{cx:x(g.col),cy:24,r:active===i?5:4,fill:palette[g.col%palette.length]}))),
            h('td',{className:'ggb-subject',title:c.subject},refs.length>0&&h('span',{className:'ggb-ref-list'},refs.map(b=>h('span',{className:'ggb-ref',key:b.refname,'data-head':!!b.head,title:b.refname},b.name))),h('span',{className:'ggb-subject-text'},c.subject)),
            h('td',{className:'ggb-hash ggb-code'},c.hash.slice(0,7)),h('td',{className:'ggb-author ggb-muted',title:c.author},c.author),h('td',{className:'ggb-date ggb-muted'},date(c.date)));
        }
        function groupView(key){const files=work[key]||[];return files.length>0&&h('section',{key},h('h4',null,tr(key)+' · '+files.length),files.map(f=>{
          const id=key+'\0'+f.path;return h('div',{className:'ggb-file',key:id},h('input',{type:'checkbox','aria-label':tr('selected')+': '+f.path,checked:selected.has(id),onChange:e=>setSelected(prev=>{const n=new Set(prev);e.target.checked?n.add(id):n.delete(id);return n;})}),h('span',{className:'ggb-code'},f.code||'?'),h('button',{className:'ggb-path',onClick:()=>showFile(f,key)},f.oldPath?f.oldPath+' → '+f.path:f.path),h('span',{className:'ggb-add'},f.added?`+${f.added}`:''),h('span',{className:'ggb-del'},f.deleted?`−${f.deleted}`:''),btn(key==='staged'?'unstage':'stage',()=>op(key==='staged'?'unstage':'stage',{file:f.path})),key!=='untracked'&&btn('restore',()=>op('discard',{file:f.path}),{className:'ggb-danger'}));
        }));}
        const selectedFiles=graphReady?[...new Set([...selected].map(id=>id.split('\0')[1]))]:[];
        const count=work.staged.length+work.unstaged.length+work.untracked.length;
        function refActions(b){if(!b)return null;return h(React.Fragment,null,
          b.kind==='local'&&!b.head&&btn('checkout',()=>op('checkout',{name:b.name})),
          b.kind==='local'&&!b.head&&btn('deleteBranch',()=>op('delete-branch',{name:b.name}),{className:'ggb-danger'}),
          b.kind==='tag'&&btn('deleteTag',()=>op('tag-delete',{name:b.name}),{className:'ggb-danger'}),
          b.kind==='tag'&&btn('renameTag',()=>create('tag-rename',{name:b.name,hash:b.sha})));
        }
        function workPanel(){
          const heading=h(React.Fragment,null,tr('changes'),h('span',{className:'ggb-count'},graphReady?count:'—'));
          return h('section',{className:'ggb-work','aria-label':tr('changes')},
            h('div',{className:'ggb-workbar'},
              count>0?h('button',{type:'button',className:'ggb-work-title ggb-work-toggle','aria-expanded':workOpen,onClick:()=>setWorkOpen(!workOpen)},icon(workOpen?'down':'chevron'),heading):h('div',{className:'ggb-work-title'},heading),
              !count&&h('span',{className:'ggb-clean-label'},icon(graphReady?'check':'refresh'),tr(graphReady?'clean':'loading')),
              h('div',{className:'ggb-work-actions'},btn('unstageAll',()=>op('unstage-all')),selectedFiles.length>0&&h(React.Fragment,null,h('span',{className:'ggb-muted'},tr('selected')+': '+selectedFiles.length),btn('stage',()=>op('stage',{file:selectedFiles})),btn('unstage',()=>op('unstage',{file:selectedFiles})),btn('restore',()=>op('discard',{file:selectedFiles}),{className:'ggb-danger'}),btn('ignore',()=>op('ignore',{file:selectedFiles})),btn('commitSelected',()=>create('commit',{file:selectedFiles})),btn('clear',()=>setSelected(new Set()))))),
            count>0&&workOpen&&h('div',{className:'ggb-work-body'},['staged','unstaged','untracked'].map(groupView)));
        }
        function shortcuts(){return h('footer',{className:'ggb-footer'},
          h('span',null,h('kbd',null,'↑'),h('kbd',null,'↓'),tr('navigate')),
          h('span',null,h('kbd',null,'Enter'),tr('detailsShortcut')),
          h('span',null,h('kbd',null,'Ctrl/⌘ F'),tr('searchShortcut')),
          h('span',null,h('kbd',null,'Esc'),tr('closeShortcut')));
        }
        function detailsView(){if(!detail||detail.repo!==repo)return null;const c=detail.commit;return h('aside',{className:'ggb-detail','aria-label':tr('details')},
          btn('close',()=>{setDetail(null);setPatch(null);detailRequest.current++;}),h('h3',null,detail.title||c?.subject||tr('details')),
          detail.loading?h('p',null,tr('loading')):h(React.Fragment,null,
            c&&h(React.Fragment,null,h('dl',null,h('dt',null,'SHA'),h('dd',{className:'ggb-code'},c.hash),h('dt',null,tr('author')),h('dd',null,c.author+' <'+c.email+'>'),h('dt',null,tr('date')),h('dd',null,date(c.date)),h('dt',null,tr('parents')),h('dd',{className:'ggb-code'},(c.parents||[]).join('\n'))),h('pre',{className:'ggb-diff'},[c.subject,detail.body].filter(Boolean).join('\n\n')),h('div',{className:'ggb-wrap'},
              btn('copy',()=>navigator.clipboard.writeText(c.hash).then(()=>setNotice({key:'copied'})).catch(fail)),
              btn('compare',()=>{setBase({...c,repo});setNotice({key:'compareHelp'});}),btn('branch',()=>create('branch',{hash:c.hash})),btn('tag',()=>create('tag',{hash:c.hash})),
              btn('openRemote',async()=>{try{const d=await api('remoteinfo',{repo});if(!/^https:\/\//.test(d.web||''))throw Object.assign(Error('no-supported-remote'),{localeKey:'noRemote'});window.open(d.web+'/commit/'+c.hash,'_blank','noopener,noreferrer');}catch(e){fail(e);}}))),
            detail.file&&btn('fileHistory',()=>fileHistory(detail.file)),
            detail.log&&h('div',null,detail.log.map(c=>h('div',{key:c.hash},h('button',{onClick:()=>showCommit(c)},c.hash.slice(0,7)+' '+c.subject)))),
            c&&h('div',null,h('h4',null,tr('files')),!(detail.files||[]).length&&h('p',null,tr('noFiles')),(detail.files||[]).map(f=>{const path=typeof f==='string'?f:f.path;return h('div',{className:'ggb-file',key:path},h('button',{className:'ggb-path',onClick:()=>fileDiff(path,c.hash)},path),btn('fileHistory',()=>fileHistory(path)));})),
            (detail.diff!==undefined||detail.content!==undefined||detail.binary)&&diffView(detail),patch?.repo===repo&&diffView(patch)));
        }
        return h('div',{className:'ggb',lang:localeTag(locale),onKeyDown:keyboard,tabIndex:-1},h('style',null,css),
          h('header',{className:'ggb-toolbar'},h('strong',null,tr('title')),h('select',{className:'ggb-repo',value:repo,disabled:busy||discovering,'aria-label':tr('repo'),onChange:e=>chooseRepo(e.target.value)},!repo&&h('option',{value:''},tr('empty')),repos.map(r=>h('option',{key:r,value:r},r))),btn('open',openRepo),btn('discover',()=>void discover(true)),btn('refresh',()=>void discover(true),{disabled:busy||discovering})),
          h('div',{className:'ggb-workspace ggb-muted',title:workspace.current||cwd},tr('workspace'),': ',workspace.current||cwd||'—',discovering&&h('span',{role:'status'},' · ',tr('loading'))),
          notice&&h('div',{className:'ggb-notice'+(notice.error?' ggb-error':''),role:notice.error?'alert':'status'},notice.error?tr('error')+': ':'',noticeText(notice,tr)),
          repo&&h('div',{className:'ggb-toolbar'},h('div',{className:'ggb-search'},icon('search'),h('input',{ref:searchRef,type:'search',placeholder:tr('search'),'aria-label':tr('search'),value:query,onChange:e=>setQuery(e.target.value)})),h('div',{className:'ggb-compact-filter'},h('select',{className:'ggb-branch-picker',value:filter,'aria-label':tr('branches'),onChange:e=>setFilter(e.target.value)},h('option',{value:''},tr('all')),['local','remote','tag'].map(kind=>h('optgroup',{key:kind,label:tr(kind==='tag'?'tags':kind)},branches.filter(b=>b.kind===kind).map(b=>h('option',{key:b.refname,value:b.refname},b.name))))),refActions(branches.find(b=>b.refname===filter))),btn('fetch',()=>op('fetch')),btn('pull',()=>op('pull')),btn('push',()=>op('push')),btn('stageAll',()=>op('stage-all')),btn('commit',()=>create('commit'))),
          repo&&h('div',{className:'ggb-status ggb-muted'},h('span',{className:'ggb-head'},icon('branch'),head||'—'),h('span',null,commits.length+' / '+total+' '+tr('commits')),h('span',null,graphReady?(count?count+' '+tr('changes'):tr('clean')):tr('loading')),busy&&h('span',{role:'status'},tr('loading')),base&&h(React.Fragment,null,h('span',null,tr('base')+': '+base.hash.slice(0,7)),btn('clear',()=>setBase(null)))),
          !repo?h('div',{className:'ggb-empty'},h('h2',null,tr('empty')),h('p',null,tr('emptyHelp')),btn('open',openRepo),btn('discover',()=>void discover(true))):h('div',{className:'ggb-main'},
            h('aside',{className:'ggb-sidebar','aria-label':tr('branches')},h('label',{'data-selected':!filter},h('input',{type:'radio',name:'ggb-branch-'+props.sessionId,checked:!filter,onChange:()=>setFilter('')}),icon('branch'),h('span',null,tr('all'))),['local','remote','tag'].map(kind=>h('section',{key:kind},h('h3',null,tr(kind==='tag'?'tags':kind)),branches.filter(b=>b.kind===kind).map(b=>h('div',{key:b.refname},h('label',{'data-selected':filter===b.refname},h('input',{type:'radio',name:'ggb-branch-'+props.sessionId,checked:filter===b.refname,onChange:()=>setFilter(b.refname)}),h('span',{title:b.refname,className:b.head?'ggb-current-branch':undefined},b.name)),filter===b.refname&&h('div',{className:'ggb-wrap'},refActions(b))))))),
            h('main',{className:'ggb-content'},h('div',{className:'ggb-scroll'},workPanel(),
              h('table',{className:'ggb-log',role:'grid','aria-label':tr('history'),'aria-busy':busy},
                h('thead',null,h('tr',null,h('th',{className:'ggb-graphcell',style:{width:graphWidth},scope:'col'},h('span',{className:'ggb-sr'},tr('graph'))),h('th',{scope:'col'},tr('commitColumn')),h('th',{className:'ggb-hash',scope:'col'},tr('hash')),h('th',{className:'ggb-author',scope:'col'},tr('author')),h('th',{className:'ggb-date',scope:'col'},tr('date')))),
                h('tbody',null,visible.map(logRow))),!visible.length&&!busy&&h('p',{className:'ggb-empty'},tr('noCommits')),commits.length<total&&btn('loadMore',()=>reload(true),{className:'ggb-more'})),shortcuts()),detailsView()),
          modal?.repo===repo&&h(Modal,{key:modal.action,modal,tr,busy,onCancel:()=>setModal(null),onChange:setModal,onSubmit:execute,notice,setNotice}));
      }
      function Modal({modal:m,tr,busy,onCancel,onChange,onSubmit,notice,setNotice}) {
        const ref=useRef(null),previous=useRef(null);
        useEffect(()=>{previous.current=document.activeElement;ref.current?.focus();return()=>previous.current?.focus?.();},[]);
        const field=m.action==='commit'?'message':m.action==='tag-rename'?'newName':'name';
        function submit(e){e.preventDefault();const params={...m.params};if(m.kind==='form'){params[field==='newName'?'newname':field]=m.value;if(m.action==='commit'&&m.all)params.all='1';}onSubmit({...m,params});}
        function trap(e){if(e.key==='Escape'){e.stopPropagation();if(!busy)onCancel();}if(e.key==='Tab'){const nodes=[...ref.current.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled)')];if(!nodes.length){e.preventDefault();return;}const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
        return h('div',{className:'ggb-modal'},h('form',{className:'ggb-dialog',role:'dialog','aria-modal':true,'aria-labelledby':'ggb-dialog-title',ref,tabIndex:-1,onSubmit:submit,onKeyDown:trap},
          h('h3',{id:'ggb-dialog-title'},tr(m.action==='commit'?'commit':m.action==='branch'?'branch':m.action==='tag'?'tag':m.action==='tag-rename'?'renameTag':'confirmTitle')),
          h('p',null,tr(['discard','discard-all','checkout'].includes(m.action)?'destructive':'confirmBody')),h('p',{className:'ggb-pathline'},m.repo),h('pre',null,operationSummary(m.action,m.params,tr)),
          m.kind==='form'&&h(React.Fragment,null,h('label',null,tr(field),h(m.action==='commit'?'textarea':'input',{required:true,value:m.value,rows:m.action==='commit'?4:undefined,onChange:e=>onChange({...m,value:e.target.value})})),m.action==='commit'&&!m.params.file&&h('label',null,h('input',{type:'checkbox',checked:m.all,onChange:e=>onChange({...m,all:e.target.checked})}),' '+tr('commitAll'))),
          notice?.error&&h('p',{className:'ggb-error',role:'alert'},tr('error')+': '+noticeText(notice,tr)),h('footer',null,h('button',{type:'button',disabled:busy,onClick:onCancel},tr('cancel')),h('button',{type:'submit',disabled:busy,className:'ggb-primary'},tr(busy?'loading':'confirm')))));
      }
      ctx.slots.inject('conversation.view',()=>ctx.slots.register({name:'conversation.view',id:'git-graph-bilingual',order:20,label:()=>tr('title')},ScopedView));
    }
    return {apply,inject:['slots','uiWorkspace','locale']};
  }
});
