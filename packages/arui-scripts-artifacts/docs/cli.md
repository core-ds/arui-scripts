CLI
===

После установки пакета команды доступны через `arui-scripts-artifacts <команда>`:

```bash
arui-scripts-artifacts <команда> [--config <путь до конфига>] [name=... version=... registry=...]
```

Обычно команды прописывают в `package.json`:

```json
{
    "scripts": {
        "docker-build": "arui-scripts-artifacts docker-build",
        "docker-build:compiled": "arui-scripts-artifacts docker-build:compiled",
        "archive-build": "arui-scripts-artifacts archive-build"
    }
}
```

## Глобальные флаги

- `arui-scripts-artifacts --help` — список доступных команд: встроенных и объявленных в конфиге
  проекта.
- `arui-scripts-artifacts --version` (`-v`) — версия пакета.
- `arui-scripts-artifacts <команда> --help` — справка по конкретной команде.
- `--config <путь>` (`-c`, а также `--c`) — путь до конфига, см. ниже.

Запуск без команды печатает список доступных.

## Позиционные аргументы

Имя образа формируется как `{docker.registry}/{name}:{version}`. `name` и `version` по умолчанию
берутся из `package.json`, но их можно переопределить прямо в команде — это удобно в CI:

```bash
arui-scripts-artifacts docker-build name=container-name version=0.1-beta
arui-scripts-artifacts docker-build registry=registry.example.com version=$CI_COMMIT_TAG
```

Поддерживаются `name=`, `version=` и `registry=`; они имеют наивысший приоритет — перекрывают и
конфиг, и секцию команды. Неизвестные аргументы игнорируются с предупреждением.

## Конфиг

Конфиг ищется в корне проекта по первому совпадению из списка:

```
arui-scripts-artifacts.ts
arui-scripts-artifacts.mts
arui-scripts-artifacts.cts
arui-scripts-artifacts.js
arui-scripts-artifacts.mjs
arui-scripts-artifacts.cjs
arui-scripts-artifacts.config.ts
arui-scripts-artifacts.config.js
```

Путь можно задать явно — `--c`, `--config` или `-c`, со знаком равенства или отдельным аргументом:

```bash
arui-scripts-artifacts docker-build --c './configs/docker.prod.ts'
arui-scripts-artifacts docker-build --config=./configs/docker.prod.ts version=1.2.3
```

Явно заданный путь обязан существовать: молча проигнорировать опечатку в `--config` хуже, чем упасть.
Если конфига нет вовсе — сборка идет на дефолтах.

Конфиг может быть на TypeScript, ESM или CommonJS — загрузчик (jiti) разбирается сам, регистрировать
`ts-node`/`tsx` в проекте не нужно. Экспортировать можно объект или (в том числе асинхронную)
функцию, возвращающую объект:

```ts
import { defineConfig } from '@alfalab/arui-scripts-artifacts';

export default defineConfig(async () => ({
    docker: { registry: await resolveRegistry() },
}));
```

`defineConfig` ничего не делает в рантайме — он нужен только ради автодополнения и проверки типов.

Полный список настроек — в [Настройках](settings.md), список команд — в [Командах](commands.md).

## Локальные файлы проекта

CLI сам подхватывает лежащие в корне проекта `Dockerfile`, `start.sh`, `nginx.conf` и
`base-nginx.conf` — если они есть, они заменяют сгенерированные шаблоны. Явно заданная секция
[`localFiles`](settings.md#localfiles) имеет приоритет над автодетектом, а `docker-build:compiled`
подмену `Dockerfile` и `start.sh` запрещает — как и в `arui-scripts`.

## Встраивание в свой CLI

Разбор конфига и сборка доступны как обычные функции, поэтому команду можно завернуть в собственный
скрипт или CLI — см. [Программное API](api.md).
