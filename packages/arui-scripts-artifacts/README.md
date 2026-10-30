# @alfalab/arui-scripts-artifacts

Самостоятельная сборка артефактов поставки — docker-образа и tar-архива.
Установка `arui-scripts` не требуется. Пакет подходит тем, кому нужна только сборка артефактов;
пользователи `arui-scripts` могут продолжать использовать его команды и настройки.

Пакет устроен как набор чистых функций: конфиг → строка. Никакого глобального состояния, никакой
зависимости от `arui-scripts` — всё, что влияет на результат, приходит явным объектом опций. Из этого
следует главное свойство: **в проекте не нужны кастомные сборочные скрипты**. Всё, включая свои
команды, кастомный nginx и параметры базового nginx, описывается одним файлом `arui-scripts-artifacts.ts`.

## Быстрый старт

```bash
yarn add -D @alfalab/arui-scripts-artifacts
```

`arui-scripts-artifacts.ts` в корне проекта:

```ts
import { defineConfig } from '@alfalab/arui-scripts-artifacts';

export default defineConfig({
    docker: {
        baseImage: 'alfabankui/arui-scripts:24.22.1-slim',
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

Все настройки опциональны. Дефолты рассчитаны на сборку в `.build` со статикой в `assets`
и серверным бандлом `server.js`; для другой структуры задайте соответствующие пути.
Команда сборки по умолчанию — `npm run build`; её можно изменить через `build.command`.
Конфиг `arui-scripts` не читается.

## Документация

- [CLI](docs/cli.md) — запуск, флаги, поиск и формат конфига
- [Команды](docs/commands.md) — встроенные команды и свои сборки в секции `commands`
- [Настройки](docs/settings.md) — полный справочник опций с дефолтами
- [Кастомизация файлов артефакта](docs/templates.md) — `templates`, `overrides`, локальные файлы
- [Пайплайн сборки](docs/pipeline.md) — что и в каком порядке происходит
- [Программное API](docs/api.md) — сборка и разбор конфига из своего кода
- [Миграция с `arui-scripts docker-build`](docs/migration.md) — таблица соответствия настроек
- [Список актуальных версий docker-образов](../alpine-node-nginx/README.md)
- [Документация arui-scripts](../arui-scripts/README.md)
