# arui-scripts

`arui-scripts` собирает клиентскую и серверную части React приложений на Rspack.
В пакете уже есть настройки для разработки, production-сборки и тестов.
Их можно использовать как есть или изменить под проект через конфигурацию, пресеты и overrides.

Можно работать с серверным рендерингом (SSR) или собирать только клиент - без Node.js-сервера.
Для приложений, разделенных на независимо собираемые модули, есть отдельные инструменты загрузки и рендеринга.

## Создать приложение

Для нового проекта подготовьте Node.js **24.x (от 24.11.1) или 26+** и Yarn.
Генератор предложит выбрать SSR или только клиент, транспилятор, тест-раннер и другие настройки:

```bash
npx create-arui-scripts-app my-app --no-install
cd my-app
yarn install
yarn start
```

Чтобы принять настройки по умолчанию без вопросов, добавьте `--yes`.
Все варианты описаны в [документации генератора](./packages/create-arui-scripts-app/README.md).

В созданном приложении:

```bash
yarn start  # Запустить приложение в режиме разработки
yarn build  # Собрать production-версию
yarn test   # Запустить тесты выбранным тест-раннером
```

Если приложение уже есть, начните с [инструкции по подключению arui-scripts](./packages/arui-scripts/README.md#использование).
Сам пакет поддерживает Node.js `^22.12.0 || ^24.0.0 || >=26.0.0`; актуальный диапазон указан в [package.json пакета](./packages/arui-scripts/package.json).
Для новых проектов генератор задает дополнительное требование Node.js `>=24.11.1`.
При обновлении на arui-scripts 26 посмотрите [инструкцию по миграции](./packages/arui-scripts/docs/migration-v26.md).

## Настроить под свой проект

- [Настройки](./packages/arui-scripts/docs/settings.md) - точки входа, порты, транспилятор и остальные опции сборки.
- [Пресеты](./packages/arui-scripts/docs/presets.md) и [overrides](./packages/arui-scripts/docs/overrides.md) - общие настройки для нескольких проектов и изменения конфигурации сборщика.
- [Компиляторы и TypeScript](./packages/arui-scripts/docs/compilers.md) - выбор SWC/Babel, проверка типов и совместимость с TypeScript 7.
- [Client-only](./packages/arui-scripts/docs/client-only.md) - приложение без серверной части.
- [Модули](./packages/arui-scripts/docs/modules.md) - сборка и подключение модулей приложения.
- [Артефакты](./packages/arui-scripts/docs/artifact.md) - подготовка Docker-образа или архива для доставки приложения.

Список команд и их поведение - в [справочнике команд](./packages/arui-scripts/docs/commands.md).
Справку можно посмотреть и в терминале: `yarn arui-scripts --help` или `yarn arui-scripts build --help`.
Для изучения состава бандла и времени сборки есть команда `yarn arui-scripts bundle-analyze`.
Для сравнения клиентских бандлов двух production-сборок используйте [bundle-diff](./packages/arui-scripts/docs/commands.md#bundle-diff).

## Что находится в репозитории

Это монорепозиторий. Помимо самого сборщика, здесь находятся генератор проектов и пакеты, которые используются в приложениях:

- [arui-scripts](./packages/arui-scripts/) - CLI и конфигурации сборки и тестирования.
- [create-arui-scripts-app](./packages/create-arui-scripts-app/) - создание нового приложения.
- [@alfalab/arui-scripts-artifacts](./packages/arui-scripts-artifacts/) - сборка Docker-образов и tar-архивов, генерация Dockerfile и конфигурации nginx.
- [alpine-node-nginx](./packages/alpine-node-nginx/) - базовые Docker-образы с Node.js и nginx.
- [@alfalab/scripts-server](./packages/arui-scripts-server/) - серверные утилиты для работы с ресурсами сборки и модулями.
- [@alfalab/scripts-modules](./packages/arui-scripts-modules/) - загрузка и рендеринг модулей приложения.
- [@alfalab/client-event-bus](./packages/client-event-bus/) - обмен событиями между частями приложения.

[example](./packages/example/) и [example-modules](./packages/example-modules/) - приложения для проверки сборки и работы модулей.
На них можно посмотреть, как пакеты используются вместе.

## Разработка arui-scripts

Для работы с репозиторием рекомендуем Node.js **24.x (от 24.11.1)**.
Версия Yarn закреплена в репозитории: **4.13.0**.

Из корня репозитория:

```bash
yarn install --immutable
yarn test
yarn lint
yarn test:start
```

`yarn test` собирает пакеты и production-версии примеров, запускает тесты и проверяет полученные артефакты.
`yarn test:start` отдельно проверяет настоящий запуск dev-сервера, SSR и доступность ресурсов по HTTP.
Для сборки без тестов есть `yarn build`. Чтобы собрать `arui-scripts` вместе с его workspace-зависимостями, выполните `yarn build --filter=arui-scripts...`.

Первый запуск примеров, структура кода, проверки перед PR, changeset и выпуск snapshot-версии описаны в [CONTRIBUTING.MD](./CONTRIBUTING.MD).
О проблемах можно сообщить в [Issues](https://github.com/core-ds/arui-scripts/issues).
