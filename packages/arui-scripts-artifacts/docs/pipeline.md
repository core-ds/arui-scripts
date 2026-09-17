Пайплайн сборки
===

Хост-пайплайн общий для docker-образа и tar-архива, поэтому оба собираются из одного и того же
состояния проекта. Какие шаги выполнятся — зависит от типа артефакта, варианта и опций секции
[`build`](settings.md#build).

| Шаг                       | Опция                                                         | Дефолт `runtime`  | Дефолт `compiled` |
| ------------------------- | ------------------------------------------------------------- | ----------------- | ----------------- |
| очистка `buildPath`       | `build.cleanBuildPath`                                        | `true`            | `false`           |
| хук перед сборкой         | `beforeBuild`                                                 | —                 | —                 |
| сборка приложения         | `build.command`                                               | `'npm run build'` | `null`            |
| удаление dev-зависимостей | `build.removeDevDependencies` / `packageManager.pruneCommand` | `true`            | `false`           |
| `docker build` / `tar`    | —                                                             | всегда            | всегда            |
| `docker push`             | `docker.push`                                                 | `!debug`          | `!debug`          |

Для `artifact: 'archive'` хост-пайплайн включен всегда (внутри tar-а собирать нечего), поэтому
`docker.variant` на него не влияет.

`beforeBuild` — хук программного API (см. [Программное API](api.md)), а не настройка конфига. Он
вызывается после очистки `buildPath`, но до `build.command`: если приложение собирается хуком,
выставьте `build.command: null`.

## docker-образ

1. Рендерятся шаблоны — с учетом [`templates` и `overrides`](templates.md).
2. Создается временная директория [`docker.tempDirName`](settings.md#dockertempdirname) (по умолчанию
   `.docker-build`), в нее кладутся `Dockerfile`, `nginx.conf`, при включенном `nginx.baseConf` —
   `base-nginx.conf`, и `start.sh` (с правами `0555`). [Локальные файлы](templates.md#локальные-файлы)
   проекта, если разрешены, побеждают сгенерированные.
3. При `docker.addNodeModulesToDockerIgnore` в `.dockerignore` дописывается `node_modules` — на время
   сборки; после нее файл возвращается в исходное состояние (а если его не было — удаляется).
4. Прогоняется хост-пайплайн из таблицы выше.
5. Запускается `docker build` с флагом [`--platform`](settings.md#dockerplatform),
   `--build-arg` для путей до сгенерированных файлов и с
   [`docker.buildArgs`](settings.md#dockerbuildargs).
6. Временная директория удаляется, `.dockerignore` восстанавливается, и при `docker.push`
   выполняется `docker push`.

При ошибке на любом шаге временная директория и `.dockerignore` тоже приводятся в порядок, а сама
ошибка пробрасывается наружу; стек печатается только в режиме [`debug`](settings.md#debug).

### Варианты образа

- **`runtime`** — приложение собирается на хосте, в образ кладется результат сборки. Быстрее на
  машине разработчика, не требует зависимостей внутри образа.
- **`compiled`** — в образ копируются `package.json`, лок-файл и (для yarn 2+) `.yarnrc.yml` с
  `.yarn`, внутри ставятся production-зависимости, и только потом добавляется остальной проект. Слой
  с зависимостями кешируется между сборками, поэтому вариант выгоден в CI/CD.

## tar-архив

1. Рендерятся шаблоны, создается временная директория
   [`archive.tempDirName`](settings.md#archivetempdirname) (по умолчанию `.archive-build`), в нее
   кладутся `nginx.conf` и `start.sh`.
2. Прогоняется тот же хост-пайплайн.
3. В директорию копируются `buildPath`, `node_modules`, `package.json` и
   [`archive.additionalPaths`](settings.md#archiveadditionalpaths) (по умолчанию `config`).
4. Содержимое пакуется в [`archive.name`](settings.md#archivename) (по умолчанию `build.tar`),
   временная директория удаляется.

Dockerfile для архива не рендерится, а `docker`-секция не используется.
