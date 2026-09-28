# arui-scripts

`arui-scripts` собирает клиентскую и серверную части React приложений на Rspack.
В пакете уже есть настройки для разработки, production-сборки и тестов.
Их можно использовать как есть или изменить под проект через конфигурацию, пресеты и overrides.

Можно работать с серверным рендерингом (SSR) или собирать только клиент - без Node.js-сервера.
Для приложений, разделенных на независимо собираемые модули, есть отдельные инструменты загрузки и рендеринга.

## Создать приложение

Для нового проекта подготовьте Node.js **24.11.1 или новее** и Yarn.
Генератор предложит выбрать SSR или только клиент, транспилятор, test раннер и другие настройки:

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

Если приложение уже есть, начните с [инструкции по подключению arui-scripts](./packages/arui-scripts/README.md#использование). Сам пакет поддерживает Node.js `^20.19.0 || >=22.12.0`; требование Node.js `>=24.11.1` относится к новым проектам, создаваемым генератором.

## Настроить под свой проект

- [Настройки](./packages/arui-scripts/docs/settings.md) - точки входа, порты, транспилятор и остальные опции сборки.
- [Пресеты](./packages/arui-scripts/docs/presets.md) и [overrides](./packages/arui-scripts/docs/overrides.md) - общие настройки для нескольких проектов и изменения конфигурации сборщика.
- [Client-only](./packages/arui-scripts/docs/client-only.md) - приложение без серверной части.
- [Модули](./packages/arui-scripts/docs/modules.md) - сборка и подключение модулей приложения.
- [Артефакты](./packages/arui-scripts/docs/artifact.md) - подготовка Docker-образа или архива для доставки приложения.

Список команд и их поведение - в [справочнике команд](./packages/arui-scripts/docs/commands.md).
Справку можно посмотреть и в терминале: `yarn arui-scripts --help` или `yarn arui-scripts build --help`.
Для изучения состава бандла и времени сборки есть команда `yarn arui-scripts bundle-analyze`.

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

Для работы с репозиторием рекомендуем Node.js 24.11.1 или новее, чтобы использовать то же окружение, что и в новых приложениях.

Из корня репозитория:

```bash
yarn install --immutable
yarn build
yarn test
yarn lint
```

`yarn build` собирает пакеты, а `yarn test` также запускает сборку и проверки примеров.
Чтобы собрать только `arui-scripts`, выполните `yarn workspace arui-scripts build`.

Как подготовить изменения, добавить changeset и выпустить версию - в [CONTRIBUTING.MD](./CONTRIBUTING.MD).
О проблемах можно сообщить в [Issues](https://github.com/core-ds/arui-scripts/issues).
