Миграция с `arui-scripts docker-build`
===

Поведение и шаблоны совпадают — отрендеренные Dockerfile, nginx-конфиги и `start.sh` те же самые.
Отличаются имена и расположение настроек: вместо плоского конфига `arui-scripts` они разложены по
секциям в `arui-scripts-artifacts.ts`.

Настройки сборки артефактов в конфиге `arui-scripts` продолжают работать, но объявлены устаревшими:
команды сборки печатают предупреждение со ссылкой на замену, а в следующей мажорной версии они будут
удалены.

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
        "baseDockerImage": "alfabankui/arui-scripts:24.10.0-slim",
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
        baseImage: 'alfabankui/arui-scripts:24.10.0-slim',
    },
    nginx: { baseConf: { workerProcesses: 4 } },
    archive: { name: 'e2e.tar' },
});
```

Оверрайды из `arui-scripts.overrides.ts` переезжают в секции
[`templates`/`overrides`](templates.md) того же файла.

Конфиг можно завести, не переключая команды: `arui-scripts docker-build` находит
`arui-scripts-artifacts.ts` по обычным правилам и кладет его поверх настроек из конфига
`arui-scripts`. Заводить его по-прежнему не обязательно.

## publicPath

`publicPath` по умолчанию — `` `${assetsPath}/` `` (то есть `assets/`), как это считает
`arui-scripts`. Пустой `publicPath` дал бы в nginx-конфиге второй `location /`, и nginx не поднялся
бы с `duplicate location "/"`.

## Отличие в `archive-build`

Старый `arui-scripts archive-build` подхватывал локальный `nginx.conf`, но игнорировал локальный
`start.sh`. Здесь локальные файлы обрабатываются единообразно: `start.sh` из корня проекта тоже
используется. Отключается через `localFiles.allowStartScript: false`.
