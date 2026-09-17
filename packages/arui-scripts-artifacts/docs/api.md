Программное API
===

Пакет устроен как набор чистых функций: конфиг → строка. Никакого глобального состояния — всё, что
влияет на результат, приходит явным объектом опций. Поэтому любую часть сборки можно вызвать из
своего скрипта.

## buildArtifact

Тот же пайплайн, что и у CLI: диспетчеризует на `buildDockerImage`/`buildArchive` по полю `artifact`.

```ts
import { buildArtifact } from '@alfalab/arui-scripts-artifacts';

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

Принимает все [настройки](settings.md) плюс два поля, которых нет в конфиге:

- `argv` — аргументы вида `name=... version=... registry=...`, накладываются поверх опций;
- `beforeBuild` — хук `(config) => void | Promise<void>`, вызывается после очистки `buildPath`, но до
  `build.command`. Если приложение собирается хуком, выставьте `build.command: null`.

`buildDockerImage` и `buildArchive` доступны напрямую, если тип артефакта известен заранее.

## Пошаговая сборка

Если нужен контроль над каждым шагом — те же чистые функции по отдельности:

```ts
import {
    exec,
    getBuildParams,
    getDockerBuildCommand,
    prepareFilesForDocker,
    renderTemplates,
    resolveArtifactsConfig,
} from '@alfalab/arui-scripts-artifacts';

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

| Функция                  | Что делает                                                                       |
| ------------------------ | --------------------------------------------------------------------------------- |
| `resolveArtifactsConfig` | донасыщает частичные опции дефолтами, возвращает `ResolvedArtifactsConfig`         |
| `renderTemplates`        | рендерит все файлы артефакта с учетом `templates`/`overrides`                      |
| `prepareFilesForDocker`  | готовит временную директорию и `.dockerignore`, возвращает `restoreDockerIgnore`   |
| `getBuildParams`         | полное имя образа и пути (`getBuildParamsFromArgs` — с учетом аргументов CLI)      |
| `getDockerBuildCommand`  | строка команды `docker build`                                                      |
| `runHostPipeline`        | очистка `buildPath`, сборка приложения, удаление dev-зависимостей                  |
| `exec`                   | запуск команды с прокинутым stdio; кидает `ExecError` с кодом возврата             |

Рендереры отдельных файлов (`renderDockerfile`, `renderDockerfileCompiled`, `renderNginxConf`,
`renderBaseNginxConf`, `renderStartScript`) тоже экспортируются — см.
[Кастомизацию файлов артефакта](templates.md).

## Работа с конфигом

Разбор конфига доступен отдельно — так CLI можно встроить в свой:

```ts
import {
    extractConfigPath,
    resolveCommandOptions,
    resolveConfigFile,
} from '@alfalab/arui-scripts-artifacts';

const argv = process.argv.slice(2);
const configFile = await resolveConfigFile(process.cwd(), extractConfigPath(argv));
const options = resolveCommandOptions('docker-build:server', configFile);
```

| Функция                 | Что делает                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `resolveConfigFile`     | находит и загружает конфиг проекта (TS/ESM/CJS); если конфига нет — `{}`             |
| `findConfigFile` / `loadConfigFile` | те же шаги по отдельности                                               |
| `extractConfigPath`     | достает `--config`/`-c`/`--c` из аргументов до построения CLI                        |
| `resolveCommandOptions` | опции конкретной команды: встроенные дефолты → верхний уровень → `commands[имя]`      |
| `getAvailableCommands`  | список доступных команд — встроенные плюс объявленные в конфиге                      |
| `mergeConfigFiles`      | сливает несколько конфигов по тем же правилам (секции по полям, `commands` по имени)  |
| `createCli`             | собирает commander-CLI по конфигу — по подкоманде на каждую доступную сборку          |
| `defineConfig`          | хелпер типизации конфига, в рантайме ничего не делает                                |

`mergeConfigFiles` нужен тем, кто отдает CLI собственный конфиг (`-c`) и хочет доложить поверх
пользовательский — так делает `arui-scripts`, чтобы `arui-scripts-artifacts.ts` в корне проекта
продолжал работать вместе с настройками из конфига arui-scripts.

## Утилиты

- `getYarnVersion`, `detectUseYarn`, `getInstallProductionCommand`, `getPruningCommand`,
  `getYarnPathFromRc`, `getYarnBinSymlinkCommand` — определение менеджера зависимостей и команды,
  которые из него следуют;
- `dockerVersionSatisfies`, `getPlatformFlag` — проверка версии docker и вычисление `--platform`;
- `shellQuote` — экранирование значения для shell-команды;
- константы имен файлов и дефолтов: `DOCKERFILE_FILENAME`, `DOCKERIGNORE_FILENAME`,
  `NGINX_CONFIG_FILENAME`, `BASE_NGINX_CONFIG_FILENAME`, `START_SCRIPT_FILENAME`,
  `ENV_CONFIG_FILENAME`, `DEFAULT_BASE_DOCKER_IMAGE`, `DELETE_NPM_COMMAND` и соседние.

Типы (`ArtifactsOptions`, `ResolvedArtifactsConfig`, `ArtifactsConfigFile`, `ArtifactTemplates`,
`ArtifactTemplateOverrides`, `TemplateKey` и остальные) экспортируются из корня пакета.
