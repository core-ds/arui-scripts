Миграция с `arui-scripts docker-build`
===

Поведение и шаблоны совпадают — отрендеренные Dockerfile, nginx-конфиги и `start.sh` те же самые.
Отличаются имена и расположение настроек: вместо плоского конфига `arui-scripts` они разложены по
секциям в `arui-scripts-artifacts.ts`.

Переход на этот пакет добровольный: он нужен, если требуется сборка артефактов без остальных
возможностей `arui-scripts`. Настройки и оверрайды сборки в `arui-scripts` поддерживаются;
переносить их при использовании его команд не нужно. У пакетов независимые конфиги.

## Таблица соответствия

| arui-scripts                                                 | @alfalab/arui-scripts-artifacts        |
| ------------------------------------------------------------ | -------------------------------------- |
| `configs.dockerRegistry`                                     | `docker.registry`                      |
| `configs.baseDockerImage`                                    | `docker.baseImage`                     |
| `configs.runFromNonRootUser`                                 | `docker.runFromNonRootUser`            |
| `configs.deleteNpm`                                          | `docker.deleteNpm`                     |
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

## Как выглядит перенос

Было, в `package.json` или конфиге `arui-scripts`:

```json
{
    "aruiScripts": {
        "dockerRegistry": "registry.example.com",
        "baseDockerImage": "alfabankui/arui-scripts:24.22.1-slim",
        "nginx": { "workerProcesses": 4 },
        "archiveName": "e2e.tar"
    }
}
```

Стало, в `arui-scripts-artifacts.ts`:

```ts
import { defineConfig } from '@alfalab/arui-scripts-artifacts';

export default defineConfig({
    docker: {
        registry: 'registry.example.com',
        baseImage: 'alfabankui/arui-scripts:24.22.1-slim',
    },
    nginx: { baseConf: { workerProcesses: 4 } },
    archive: { name: 'e2e.tar' },
});
```

Оверрайды из `arui-scripts.overrides.ts` переезжают в секции
[`templates`/`overrides`](templates.md) того же файла.

После переноса настроек переключите команды в `package.json` на CLI этого пакета:

```json
{
    "scripts": {
        "docker-build": "arui-scripts-artifacts docker-build",
        "docker-build:compiled": "arui-scripts-artifacts docker-build:compiled",
        "archive-build": "arui-scripts-artifacts archive-build"
    }
}
```

Команды `arui-scripts` не загружают `arui-scripts-artifacts.ts`. Если оба инструмента
используются в одном проекте, каждый читает свой конфиг.

Если вы уже перенесли настройки по прежним рекомендациям, но продолжаете запускать команды
`arui-scripts`, верните настройки в его конфиг и оверрайды — в `arui-scripts.overrides.ts`.
Подробнее — [миграция на arui-scripts 26](../../arui-scripts/docs/migration-v26.md).

## publicPath

`publicPath` по умолчанию — `` `${assetsPath}/` `` (то есть `assets/`), как это считает
`arui-scripts`. Пустой `publicPath` дал бы в nginx-конфиге второй `location /`, и nginx не поднялся
бы с `duplicate location "/"`.

## Отличие в `archive-build`

Старый `arui-scripts archive-build` подхватывал локальный `nginx.conf`, но игнорировал локальный
`start.sh`. Здесь локальные файлы обрабатываются единообразно: `start.sh` из корня проекта тоже
используется. Отключается через `localFiles.allowStartScript: false`.
