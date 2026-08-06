# @alfalab/scripts-artifacts

Сборка артефактов поставки — docker-образа и tar-архива — для приложений, основанных на `arui-scripts`.

Пакет устроен как набор чистых функций: конфиг → строка. Никакого глобального состояния, никакой
зависимости от `arui-scripts` — всё, что влияет на результат, приходит явным объектом опций. Из этого
следует главное свойство: **в проекте не нужны кастомные сборочные скрипты**. Всё, включая свои
команды, кастомный nginx и параметры базового nginx, описывается одним файлом `arui-scripts-artifacts.ts`.

## Быстрый старт

```bash
yarn add -D @alfalab/scripts-artifacts
```

`arui-scripts-artifacts.ts` в корне проекта:

```ts
import { defineConfig } from '@alfalab/scripts-artifacts';

export default defineConfig({
    docker: {
        baseImage: 'alfabankui/arui-scripts:24.10.0-slim',
        registry: 'registry.example.com',
    },
    nginx: {
        baseConf: { workerProcesses: 4 },
    },
});
```

`package.json`:

```json
{
    "scripts": {
        "docker-build": "arui-scripts-artifacts docker-build",
        "docker-build:compiled": "arui-scripts-artifacts docker-build:compiled"
    }
}
```

## Структура конфига

Настройки сгруппированы по тому, к чему относятся. На верхнем уровне остается только то, что общее
для всех артефактов, — идентификация и форма самого приложения:

| Секция           | За что отвечает                                                                  |
| ---------------- | -------------------------------------------------------------------------------- |
| _верхний уровень_ | `artifact`, `name`, `version`, `cwd`, `debug`, `clientOnly`, `buildPath`, `serverOutput`, `serverPort`, `assetsPath`, `publicPath` |
| `docker`         | `variant`, `registry`, `baseImage`, `runFromNonRootUser`, `context`, `tempDirName`, `push`, `platform`, `buildArgs`, `addNodeModulesToDockerIgnore` |
| `nginx`          | `port`, `rootPath`, `enablePreviousVersionHeaders`, `baseConf` (http-блок)        |
| `archive`        | `name`, `tempDirName`, `additionalPaths`                                          |
| `build`          | хост-пайплайн: `cleanBuildPath`, `command`, `removeDevDependencies`               |
| `packageManager` | `useYarn`, `yarnVersion`, `installProductionCommand`, `pruneCommand`              |
| `localFiles`     | пути до `dockerfile`/`startScript`/`nginxConf`/`nginxBaseConf` и флаги `allowDockerfile`/`allowStartScript` |
| `templates`, `overrides` | кастомизация шаблонов (см. ниже)                                          |

Все поля опциональны — недостающие донасыщает `resolveArtifactsConfig`. Дефолты совпадают с
историческим поведением `arui-scripts`, поэтому конфиг без единой настройки соберет тот же образ,
что и `arui-scripts docker-build`.

`nginx.baseConf` по умолчанию `null` — базовый конфиг не генерируется и не кладется в артефакт
(используется тот, что лежит в базовом образе). Любой объект включает его; `false`/`null` — выключает.

Код пакета разложен по тем же доменам: `src/docker`, `src/nginx`, `src/archive`, `src/start-script`,
`src/config`, `src/pipeline`, `src/cli`.

## CLI

```bash
arui-scripts-artifacts <команда> [--c <путь до конфига>] [name=... version=... registry=...]
```

Конфиг по умолчанию берется из корня проекта (`arui-scripts-artifacts.ts`, а также `.mts`/`.cts`/`.js`/
`.mjs`/`.cjs`/`.config.ts`). Путь можно задать явно — `--c`, `--config` или `-c`, со знаком равенства
или отдельным аргументом:

```bash
arui-scripts-artifacts docker-build --c './configs/docker.prod.ts'
arui-scripts-artifacts docker-build --config=./configs/docker.prod.ts version=1.2.3
```

Конфиг может быть на TypeScript, ESM или CommonJS — загрузчик разбирается сам, регистрировать
`ts-node`/`tsx` в проекте не нужно. Экспортировать можно объект или (в т.ч. асинхронную) функцию,
возвращающую объект.

### Встроенные команды

| Команда                 | Что делает                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `docker-build`          | приложение собирается на хосте (`npm run build`), результат кладется в образ          |
| `docker-build:compiled` | зависимости и сборка выполняются внутри образа, слои кешируются                       |
| `archive-build`         | tar-архив с production-сборкой: `buildPath`, `node_modules`, `package.json`, `config` |

CLI сам подхватывает лежащие в корне `Dockerfile`, `start.sh`, `nginx.conf` и `base-nginx.conf` —
если они есть, они заменяют сгенерированные шаблоны (для `docker-build:compiled` подмена Dockerfile
и start.sh запрещена, как и в `arui-scripts`).

### Свои команды

Вместо отдельного скрипта — секция `commands`. Команда наследует верхний уровень конфига, поэтому в
ней описывается только то, чем она отличается:

```ts
import { defineConfig } from '@alfalab/scripts-artifacts';

export default defineConfig({
    docker: { baseImage: 'registry.example.com/base:2.0.0' },
    nginx: { baseConf: { workerProcesses: 4 } },

    commands: {
        // серверный образ: свой энтрипоинт и порт, всё остальное — из верхнего уровня
        'docker-build:server': {
            docker: { variant: 'compiled' },
            serverOutput: 'server/index.js',
            // сольется с верхнеуровневой секцией nginx
            nginx: { port: 9090, baseConf: { workerConnections: 100 } },
        },

        // образ только со статикой
        'docker-build:static': {
            clientOnly: true,
            build: { command: 'npm run build:static' },
        },

        // еще один архив — с отдельным именем и своей сборкой
        'archive-build:e2e': {
            artifact: 'archive',
            archive: { name: 'e2e.tar' },
            build: { command: 'npm run build:e2e' },
        },
    },
});
```

```bash
arui-scripts-artifacts docker-build:server
```

Запуск без команды печатает список доступных — встроенные плюс объявленные в конфиге.

Секции (`docker`, `nginx`, `archive`, `build`, `packageManager`, `localFiles`, `templates`,
`overrides`) сливаются по полям, скалярные опции заменяются целиком.

## Кастомизация файлов образа

Каждый файл настраивается на четырех уровнях, по возрастанию приоритета:

1. **Опции** — секции `docker`, `nginx` и верхнеуровневые `clientOnly`, `buildPath`, `serverOutput`,
   `publicPath` и остальные из `ArtifactsOptions`.
2. **`templates`** — полная замена рендерера: `(config) => string`.
3. **`overrides`** — точечная функция поверх сгенерированного: `(generated, config) => string`.
4. **Локальные файлы** — `Dockerfile`, `start.sh`, `nginx.conf`, `base-nginx.conf` в корне проекта.

Ключи шаблонов: `dockerfile`, `dockerfileCompiled`, `nginxConf` (server-блок), `baseNginxConf`
(http-блок), `startScript`.

```ts
import { defineConfig } from '@alfalab/scripts-artifacts';

export default defineConfig({
    // целиком свой server-блок nginx
    templates: {
        nginxConf: (config) => `
client_max_body_size 20m;

server {
    listen ${config.nginx.port};
    location = /health { return 200 ''; }
    location / { proxy_pass http://127.0.0.1:${config.serverPort}; }
}`,
    },

    // или дописать к сгенерированному
    overrides: {
        dockerfile: (generated) => `${generated}\nLABEL team="web"`,
        nginxConf: (generated, config) =>
            config.clientOnly ? generated : `${generated}\n# proxy tuning\n`,
    },
});
```

Рендереры (`renderDockerfile`, `renderDockerfileCompiled`, `renderNginxConf`, `renderBaseNginxConf`,
`renderStartScript`) экспортируются наружу — их можно вызывать и оборачивать из своих шаблонов.

## Программное API

`buildArtifact` — тот же пайплайн, что и у CLI (диспетчеризует на `buildDockerImage`/`buildArchive`
по полю `artifact`):

```ts
import { buildArtifact } from '@alfalab/scripts-artifacts';

await buildArtifact({
    name: 'my-app',
    version: '1.0.0',
    docker: {
        variant: 'compiled',
        registry: 'registry.example.com',
        buildArgs: { COMMIT_SHA: process.env.COMMIT_SHA ?? '' },
    },
});
```

Если нужен контроль над каждым шагом — те же чистые функции по отдельности:

```ts
import {
    exec,
    getBuildParams,
    getDockerBuildCommand,
    prepareFilesForDocker,
    renderTemplates,
    resolveArtifactsConfig,
} from '@alfalab/scripts-artifacts';

const config = resolveArtifactsConfig({
    serverOutput: 'server/index.js',
    docker: { variant: 'compiled' },
});
const templates = renderTemplates({ config });

const { restoreDockerIgnore } = await prepareFilesForDocker({ config, templates });

await exec(getDockerBuildCommand(config));
await restoreDockerIgnore();
await exec(`docker push ${getBuildParams(config).imageFullName}`);
```

Разбор конфига тоже доступен отдельно — так CLI можно встроить в свой:

```ts
import {
    extractConfigPath,
    resolveCommandOptions,
    resolveConfigFile,
} from '@alfalab/scripts-artifacts';

const argv = process.argv.slice(2);
const configFile = await resolveConfigFile(process.cwd(), extractConfigPath(argv));
const options = resolveCommandOptions('docker-build:server', configFile);
```

## Пайплайн сборки

Хост-пайплайн общий для образа и архива, поэтому оба собираются из одного состояния проекта.
Какие шаги выполнятся — зависит от типа артефакта, варианта и опций:

| Шаг                       | Опция                                             | Дефолт `runtime`  | Дефолт `compiled` |
| ------------------------- | ------------------------------------------------- | ----------------- | ----------------- |
| очистка `buildPath`       | `build.cleanBuildPath`                            | `true`            | `false`           |
| хук перед сборкой         | `beforeBuild`                                     | —                 | —                 |
| сборка приложения         | `build.command`                                   | `'npm run build'` | `null`            |
| удаление dev-зависимостей | `build.removeDevDependencies` / `packageManager.pruneCommand` | `true` | `false`   |
| `docker build` / `tar`    | —                                                 | всегда            | всегда            |
| `docker push`             | `docker.push`                                     | `!debug`          | `!debug`          |

Для `artifact: 'archive'` хост-пайплайн включен всегда (внутри tar-а собирать нечего), поэтому
`docker.variant` на него не влияет.

## Миграция с `arui-scripts docker-build`

Поведение и шаблоны совпадают, отличаются имена и расположение настроек:

| arui-scripts                                                 | @alfalab/scripts-artifacts             |
| ------------------------------------------------------------ | -------------------------------------- |
| `configs.dockerRegistry`                                     | `docker.registry`                      |
| `configs.baseDockerImage`                                    | `docker.baseImage`                     |
| `configs.runFromNonRootUser`                                 | `docker.runFromNonRootUser`            |
| `configs.clientServerPort`                                   | `nginx.port`                           |
| `configs.nginxRootPath`                                      | `nginx.rootPath`                       |
| `configs.nginx` (настройки базового конфига)                 | `nginx.baseConf`                       |
| `configs.dictionaryCompression.enablePreviousVersionHeaders` | `nginx.enablePreviousVersionHeaders`   |
| `configs.archiveName`                                        | `archive.name`                         |
| `configs.additionalBuildPath`                                | `archive.additionalPaths`              |
| `configs.removeDevDependenciesDuringDockerBuild`             | `build.removeDevDependencies`          |
| `configs.useYarn`                                            | `packageManager.useYarn`               |
| `configs.localDockerfile` и соседние                         | `localFiles.dockerfile` и соседние     |
| оверрайд `Dockerfile`                                        | `overrides.dockerfile`                 |
| оверрайд `DockerfileCompiled`                                | `overrides.dockerfileCompiled`         |
| оверрайд `nginx` (server-блок)                               | `overrides.nginxConf`                  |
| оверрайд `nginxConf` (базовый http-блок)                     | `overrides.baseNginxConf`              |
| оверрайд `start.sh`                                          | `overrides.startScript`                |

⚠️ В `arui-scripts` имена `nginx` и `nginxConf` исторически перепутаны: `nginx` — это server-блок, а
`nginxConf` — базовый конфиг. Здесь они названы по смыслу, поэтому **`nginxConf` в двух пакетах
означает разные файлы**. Переносить оверрайды по таблице выше, а не по совпадению имен.

`publicPath` по умолчанию — `` `${assetsPath}/` `` (то есть `assets/`), как это считает `arui-scripts`.
Пустой `publicPath` дал бы в nginx-конфиге второй `location /` и nginx не поднялся бы с
`duplicate location "/"`.

### Отличие в `archive-build`

Старый `arui-scripts archive-build` подхватывал локальный `nginx.conf`, но игнорировал локальный
`start.sh`. Здесь локальные файлы обрабатываются единообразно: `start.sh` из корня проекта тоже
используется. Отключается через `localFiles.allowStartScript: false`.
