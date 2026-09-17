# @alfalab/arui-scripts-artifacts

Сборка артефактов поставки — docker-образа и tar-архива — для приложений, основанных на `arui-scripts`.

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

Все настройки опциональны: конфиг без единой настройки соберет тот же образ, что и
`arui-scripts docker-build`.

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
