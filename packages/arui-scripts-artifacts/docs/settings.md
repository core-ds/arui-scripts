Настройки
===

Все настройки живут в конфиге `arui-scripts-artifacts.ts` в корне проекта (см. [CLI](cli.md)):

```ts
import { defineConfig } from '@alfalab/arui-scripts-artifacts';

export default defineConfig({
    // верхний уровень — то, что общее для всех артефактов
    clientOnly: false,
    buildPath: '.build',

    // секции — то, что относится к конкретной части сборки
    docker: { registry: 'registry.example.com' },
    nginx: { port: 8080 },
});
```

Все поля опциональны: недостающие донасыщает `resolveArtifactsConfig`. Дефолты совпадают с
историческим поведением `arui-scripts`, поэтому конфиг без единой настройки соберет тот же образ,
что и `arui-scripts docker-build`.

Настройки сгруппированы по тому, к чему относятся. На верхнем уровне остается только то, что общее
для всех артефактов, — идентификация и форма самого приложения:

| Секция                   | За что отвечает                                                        |
| ------------------------ | ---------------------------------------------------------------------- |
| _верхний уровень_        | что и откуда собираем: `artifact`, `name`, `version`, `cwd`, `debug`, `clientOnly`, `buildPath`, `serverOutput`, `serverPort`, `assetsPath`, `publicPath` |
| [`docker`](#docker)      | docker-образ: базовый образ, registry, параметры `docker build`         |
| [`nginx`](#nginx)        | server-блок и базовый http-блок nginx                                   |
| [`archive`](#archive)    | tar-архив                                                               |
| [`build`](#build)        | хост-пайплайн: что выполняется на машине сборки перед упаковкой         |
| [`packageManager`](#packagemanager) | как ставятся и чистятся зависимости                          |
| [`localFiles`](#localfiles) | файлы проекта, замещающие сгенерированные шаблоны                    |
| `templates`, `overrides` | [кастомизация шаблонов](templates.md)                                   |
| `commands`               | [свои команды сборки](commands.md#свои-команды)                         |

Код пакета разложен по тем же доменам: `src/docker`, `src/nginx`, `src/archive`, `src/start-script`,
`src/config`, `src/pipeline`, `src/cli`.

## Верхний уровень

#### artifact
Что собирать: `'docker'` (по умолчанию) или `'archive'` — tar-архив с production-сборкой.
Секция `docker` при `artifact: 'archive'` не используется, и наоборот.

#### name
Имя образа/приложения. По умолчанию берется из `package.json` в `cwd`.
Переопределяется аргументом командной строки `name=...`.

#### version
Версия, она же тег образа. По умолчанию берется из `package.json` в `cwd`.
Переопределяется аргументом командной строки `version=...`.

Полное имя образа собирается как `{docker.registry}/{name}:{version}`.

#### cwd
Рабочая директория проекта. По умолчанию `process.cwd()`. Относительно нее резолвятся `package.json`,
`buildPath`, локальные файлы и временные директории.

#### debug
Режим отладки: образ не пушится (`docker.push` по умолчанию равен `!debug`), а при ошибке печатается
стек. По умолчанию `false`.

#### clientOnly
Собирается только клиентская часть — в образе поднимается nginx без nodejs-сервера. Влияет на
Dockerfile, nginx-конфиг и start.sh. По умолчанию `false`.
Подробнее про режим — в [документации arui-scripts](../../arui-scripts/docs/client-only.md).

#### buildPath
Путь к директории со сборкой приложения относительно корня проекта. По умолчанию `.build`.

#### serverOutput
Путь к серверному бандлу относительно `buildPath` — именно его запускает `start.sh`.
По умолчанию `server.js`.

#### serverPort
Порт, на котором поднимается nodejs-сервер приложения; на него nginx проксирует все, что не статика.
По умолчанию `3000`.

#### assetsPath
Директория со статикой внутри `buildPath`. По умолчанию `assets`. Из нее выводится дефолт
`publicPath`.

#### publicPath
Публичный префикс путей до статики — используется в `location`-блоках nginx-конфига.
По умолчанию `` `${assetsPath}/` `` (то есть `assets/`), как это считает `arui-scripts`.

⚠️ Пустой `publicPath` дал бы в nginx-конфиге второй `location /`, и nginx не поднялся бы с
`duplicate location "/"`, поэтому переопределять его стоит осознанно.

## docker

Настройки docker-образа. Не используются при `artifact: 'archive'`.

#### docker.variant
Вариант сборки: `'runtime'` (по умолчанию) — приложение собирается на хосте и результат кладется в
образ; `'compiled'` — зависимости и сборка выполняются внутри образа, слои кешируются.
От варианта зависят дефолты секции [`build`](#build).

Встроенные команды задают его сами: `docker-build` — `runtime`, `docker-build:compiled` — `compiled`.

#### docker.registry
Docker registry, к которому будет добавлено имя образа (`registry/name:version`). По умолчанию `''`
— то есть публичный registry. Переопределяется аргументом командной строки `registry=...`.

#### docker.baseImage
Базовый docker-образ (`FROM`). По умолчанию `alfabankui/arui-scripts:24.10.0-slim` — см.
[список актуальных версий](../../alpine-node-nginx/README.md).

#### docker.runFromNonRootUser
Запускать ли процессы в образе от пользователя `nginx`, а не от root. По умолчанию `true`.

#### docker.context
Контекст сборки docker — последний аргумент `docker build`. По умолчанию `'.'`.

#### docker.tempDirName
Имя временной директории, в которую складываются сгенерированные файлы (Dockerfile, nginx-конфиги,
start.sh) перед запуском `docker build`. По умолчанию `.docker-build`. Директория удаляется после
сборки.

#### docker.push
Выполнять ли `docker push` после сборки. По умолчанию `!debug`, то есть пушим всегда, кроме
режима отладки.

#### docker.platform
Управление флагом `--platform` в команде `docker build`:

- `'auto'` (по умолчанию) — историческое поведение: флаг (`linux/x86_64`) подставляется, только если
  версия docker его поддерживает (>= 20.10.21). Нужно на маках с m1, где без флага docker пытается
  вытянуть базовый образ под свою платформу;
- `false` — никогда не добавлять флаг;
- строка (например `'linux/amd64'`) — всегда использовать указанную платформу.

#### docker.buildArgs
Дополнительные `--build-arg` для `docker build`, объект `{ ИМЯ: значение }`. По умолчанию `{}`.

```ts
docker: { buildArgs: { COMMIT_SHA: process.env.COMMIT_SHA ?? '' } }
```

#### docker.addNodeModulesToDockerIgnore
Дописывать ли `node_modules` в `.dockerignore` на время сборки — нужно для compiled-образа, где
зависимости ставятся внутри. После сборки файл возвращается в исходное состояние.
По умолчанию `false`; `docker-build:compiled` включает его сам.

#### docker.deleteNpm
Удалять ли npm и связанные библиотеки (`/usr/local/bin/npm`, `/usr/local/bin/npx`,
`/usr/local/lib/node_modules/npm`) из итогового образа. Полезно, чтобы неиспользуемые пакеты не
всплывали в security-сканерах. По умолчанию `false`.

## nginx

Настройки и server-блока, который генерируется всегда, и базового http-блока.

#### nginx.port
Порт, который nginx слушает внутри контейнера. По умолчанию `8080`.

#### nginx.rootPath
Корень, из которого nginx раздает статику. По умолчанию `/src` — статика ищется в
`${rootPath}/${buildPath}`.

#### nginx.enablePreviousVersionHeaders
Добавлять ли заголовки для предыдущей версии словаря brotli (`brotli_auto_dictionary on`).
По умолчанию `false`. Подробнее — в
[документации по словарю сжатия](../../arui-scripts/docs/compression-dictionary.md).

#### nginx.baseConf
Базовый конфиг nginx (http-блок, `/etc/nginx/nginx.conf`). По умолчанию `null` — базовый конфиг не
генерируется и не кладется в артефакт, используется тот, что лежит в базовом образе.

Любой объект включает его, `false`/`null` — выключает. Незаданные поля донасыщаются дефолтами:

| Поле                 | Дефолт    |
| -------------------- | --------- |
| `workerProcesses`    | `2`       |
| `workerRlimitNoFile` | `20000`   |
| `workerConnections`  | `19000`   |
| `eventsUse`          | `'epoll'` |
| `daemon`             | `'off'`   |

```ts
nginx: { baseConf: { workerProcesses: 4 } }
```

## archive

Настройки tar-архива. Не используются при `artifact: 'docker'`.

#### archive.name
Имя итогового tar-архива. По умолчанию `build.tar`.

#### archive.tempDirName
Имя временной директории, в которой собирается содержимое архива. По умолчанию `.archive-build`.

#### archive.additionalPaths
Дополнительные директории проекта, которые кладутся в архив рядом со сборкой. По умолчанию
`['config']`. Что попадает в архив помимо них — в [пайплайне сборки](pipeline.md#tar-архив).

## build

Хост-пайплайн: что выполняется на машине сборки перед упаковкой артефакта. Дефолты зависят от того,
собирается ли приложение на хосте (`runtime` и любой архив) или внутри образа (`compiled`) — см.
[пайплайн сборки](pipeline.md).

#### build.cleanBuildPath
Удалять ли `buildPath` перед сборкой приложения. По умолчанию `true` для `runtime` и архива,
`false` для `compiled`.

#### build.command
Команда сборки приложения на хосте. `null`/`false` — не собирать. По умолчанию `'npm run build'` для
`runtime` и архива, `null` для `compiled` (там сборка идет внутри образа).

#### build.removeDevDependencies
Удалять ли dev-зависимости ([`packageManager.pruneCommand`](#packagemanagerprunecommand)) перед
упаковкой. По умолчанию `true` для `runtime` и архива, `false` для `compiled`.

## packageManager

Менеджер зависимостей: как ставить production-зависимости и как выкидывать dev-зависимости.
Все поля вычисляются автоматически — задавать их нужно, только если автоопределение не подходит
(например, на машине сборки нет yarn, а команды нужны yarn-овые).

#### packageManager.useYarn
Использовать ли yarn, если он доступен. По умолчанию — по наличию `yarn.lock` в `cwd`.

#### packageManager.yarnVersion
Версия yarn: `'1'`, `'2+'` или `'unavailable'`. По умолчанию определяется автоматически по `yarn -v`
(с учетом `useYarn`).

#### packageManager.installProductionCommand
Команда установки production-зависимостей внутри образа (для `compiled`). По умолчанию выводится из
`yarnVersion`:

| `yarnVersion`   | Команда                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| `'1'`           | `yarn install --production --ignore-optional --frozen-lockfile --ignore-scripts --prefer-offline` |
| `'2+'`          | `yarn workspaces focus --production --all`                                                    |
| `'unavailable'` | `npm install --production`                                                                    |

#### packageManager.pruneCommand
Команда очистки dev-зависимостей на хосте перед упаковкой артефакта. По умолчанию выводится из
`yarnVersion` (для `unavailable` — `npm prune --production`), а в режиме `clientOnly` заменяется на
заглушку: чистить нечего, `node_modules` в артефакт не попадает.

#### packageManager.yarnBinSymlinkCommand
Команда создания symlink на бинарник yarn внутри образа (для `compiled`). По умолчанию
подставляется для yarn 2+ с `yarnPath` в `.yarnrc.yml` — чтобы `yarn` был доступен в PATH внутри
образа, где он не установлен глобально. Иначе — пустая строка.

## localFiles

Файлы проекта, которые используются вместо сгенерированных шаблонов. CLI сам находит лежащие в корне
проекта `Dockerfile`, `start.sh`, `nginx.conf` и `base-nginx.conf`; явно заданные пути имеют
приоритет над автодетектом. Подробнее — в [кастомизации шаблонов](templates.md#локальные-файлы).

#### localFiles.dockerfile
Путь до своего `Dockerfile`. По умолчанию `null` (автодетект в корне проекта).

#### localFiles.startScript
Путь до своего `start.sh`. По умолчанию `null`.

#### localFiles.nginxConf
Путь до своего server-блока (`nginx.conf`). По умолчанию `null`.

#### localFiles.nginxBaseConf
Путь до своего базового http-блока (`base-nginx.conf`). Используется, только если включен
[`nginx.baseConf`](#nginxbaseconf). По умолчанию `null`.

#### localFiles.allowDockerfile
Разрешена ли подмена Dockerfile локальным файлом. По умолчанию `true`; `docker-build:compiled`
выключает — образ собирает зависимости сам, и чужой Dockerfile это ломает.

#### localFiles.allowStartScript
Разрешена ли подмена `start.sh` локальным файлом. По умолчанию `true`, у `docker-build:compiled` —
`false`.
