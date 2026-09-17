Команды
===

Команда — это именованный набор опций сборки. Встроенных команд три, остальные объявляются в секции
`commands` конфига: **кастомные сборочные скрипты в проекте не нужны**.

## Встроенные команды

| Команда                 | Что делает                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `docker-build`          | приложение собирается на хосте (`npm run build`), результат кладется в образ           |
| `docker-build:compiled` | зависимости и сборка выполняются внутри образа, слои кешируются                        |
| `archive-build`         | tar-архив с production-сборкой: `buildPath`, `node_modules`, `package.json`, `config`  |

Встроенная команда задает только то, чем отличается от остальных, — все прочее берется из конфига
проекта:

| Команда                 | Задает                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `docker-build`          | `artifact: 'docker'`, `docker.variant: 'runtime'`, `docker.addNodeModulesToDockerIgnore: false`, подмена `Dockerfile`/`start.sh` разрешена |
| `docker-build:compiled` | `artifact: 'docker'`, `docker.variant: 'compiled'`, `docker.addNodeModulesToDockerIgnore: true`, подмена `Dockerfile`/`start.sh` запрещена |
| `archive-build`         | `artifact: 'archive'`                                                                      |

Что из этого следует для остальных настроек (`build.command`, `build.cleanBuildPath` и прочих) —
в [пайплайне сборки](pipeline.md).

Встроенные команды можно донасыщать и переопределять — достаточно объявить команду с тем же именем
в `commands`.

## Свои команды

Команда наследует верхний уровень конфига, поэтому в ней описывается только то, чем она отличается:

```ts
import { defineConfig } from '@alfalab/arui-scripts-artifacts';

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

Объявленные команды попадают в `--help` наравне со встроенными, а опечатка в имени дает подсказку.

## Как складываются настройки

Приоритет по возрастанию:

1. дефолты встроенной команды (если команда встроенная);
2. верхний уровень конфига;
3. секция `commands[<имя команды>]`;
4. [позиционные аргументы CLI](cli.md#позиционные-аргументы) `name=`, `version=`, `registry=`.

Секции (`docker`, `nginx`, `archive`, `build`, `packageManager`, `localFiles`, `templates`,
`overrides`) сливаются по полям, скалярные опции заменяются целиком. Вложенный `nginx.baseConf`
тоже сливается по полям, но `baseConf: false`/`null` — это осмысленное «не генерировать базовый
конфиг», такое значение заменяет секцию целиком.

То же слияние доступно и снаружи — `mergeConfigFiles`, см. [Программное API](api.md). Именно так
`arui-scripts` кладет `arui-scripts-artifacts.ts` проекта поверх своих настроек.
