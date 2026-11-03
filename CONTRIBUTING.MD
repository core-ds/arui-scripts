# Участие в разработке

Здесь описано, как подготовить окружение, изменить пакет, проверить результат и открыть pull request.
Для подключения arui-scripts к приложению начните с [README](./README.md) и [документации пакета](./packages/arui-scripts/README.md).

## С чего начать

Перед работой посмотрите [Issues](https://github.com/core-ds/arui-scripts/issues) и открытые [pull requests](https://github.com/core-ds/arui-scripts/pulls).
Для ошибки полезно приложить минимальный пример, версии Node.js и arui-scripts, команду запуска и полный текст ошибки.
Крупное изменение публичного API или архитектуры лучше сначала обсудить в issue.

Одному PR должна соответствовать одна задача: так проще проверить поведение и выпустить изменение.

## Окружение

- Рекомендуется Node.js **24.x, начиная с 24.11.1**. Сам arui-scripts поддерживает диапазон `^22.12.0 || ^24.0.0 || >=26.0.0` из [package.json](./packages/arui-scripts/package.json).
- В репозитории закреплен **Yarn 4.13.0** через `packageManager` в [корневом package.json](./package.json) и `yarnPath` в [.yarnrc.yml](./.yarnrc.yml).
- Понадобится Git. Docker нужен для проверки изменений сборки Docker-образов.

CI проверяет Node.js 22, 24 и 26, а совместимость с TypeScript отдельно проверяется на версиях 6 и 7.
Актуальная матрица находится в [test-and-lint.yml](./.github/workflows/test-and-lint.yml).

## Первый запуск

Если у вас нет прав на запись в основной репозиторий, создайте fork и подставьте его URL в команду `git clone`.
Перед началом работы синхронизируйте `master` своего fork с основным репозиторием.

```bash
git clone https://github.com/core-ds/arui-scripts.git
cd arui-scripts
git switch -c feat/my-change

corepack enable
yarn --version
yarn install --immutable
yarn build
```

`corepack enable` включает команды менеджеров пакетов, если Corepack установлен в вашем окружении.
Команда `yarn --version` из корня репозитория должна вывести `4.13.0`.

Все команды ниже выполняются из корня монорепозитория. Зависимости устанавливаются сразу для всех workspaces.
Если вы намеренно меняете зависимости, выполните `yarn install` и включите обновленный `yarn.lock` в PR.

## Где искать код

| Каталог                                                                 | Назначение                                                      |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| [packages/arui-scripts](./packages/arui-scripts/)                       | CLI, конфигурации Rspack, компиляторов и тестов, плагины сборки |
| [packages/create-arui-scripts-app](./packages/create-arui-scripts-app/) | Генератор приложений и шаблоны файлов                           |
| [packages/arui-scripts-artifacts](./packages/arui-scripts-artifacts/)   | Самостоятельная сборка Docker-образов и tar-архивов             |
| [packages/arui-scripts-server](./packages/arui-scripts-server/)         | Серверные утилиты для ресурсов сборки и модулей                 |
| [packages/arui-scripts-modules](./packages/arui-scripts-modules/)       | Загрузка и рендеринг модулей приложения                         |
| [packages/client-event-bus](./packages/client-event-bus/)               | Обмен событиями между частями приложения                        |
| [packages/alpine-node-nginx](./packages/alpine-node-nginx/)             | Базовые Docker-образы                                           |
| [packages/example](./packages/example/)                                 | Приложение для проверки совместной работы пакетов               |
| [packages/example-modules](./packages/example-modules/)                 | Примеры модулей и проверка их сборки                            |

В arui-scripts команды находятся в `src/commands`, настройки сборки в `src/configs`, плагины в `src/plugins`.
Unit-тесты обычно лежат рядом с кодом в каталогах `__tests__`, документация пакета находится в `docs`.

## Разработка и проверка изменений

### Запуск примеров

Пакеты связаны через Yarn workspaces. Приложения-примеры используют собранный код из `build`, поэтому после изменения исходников пакет нужно пересобрать.

Для основного примера:

```bash
yarn build --filter=example...
yarn workspace example start
```

Для примеров модулей в отдельном терминале:

```bash
yarn build --filter=example-modules...
yarn workspace example-modules start
```

Фильтр Turbo с `...` включает зависимости выбранного workspace. Порты и настройки примеров заданы в их `arui-scripts.config.ts`.
Для изменений в сборщике проверьте сценарий на подходящем примере; для исправления ошибки добавьте тест, воспроизводящий ее.

### Полезные команды

| Задача                                                                      | Команда                                        |
| --------------------------------------------------------------------------- | ---------------------------------------------- |
| Собрать все пакеты                                                          | `yarn build`                                   |
| Собрать arui-scripts и его workspace-зависимости                            | `yarn build --filter=arui-scripts...`          |
| Пересобрать только arui-scripts                                             | `yarn workspace arui-scripts build`            |
| Запустить unit-тесты arui-scripts                                           | `yarn workspace arui-scripts test --runInBand` |
| Проверить линтинг arui-scripts                                              | `yarn workspace arui-scripts lint`             |
| Собрать пакеты и приложения, выполнить тесты и проверить артефакты примеров | `yarn test`                                    |
| Проверить линтинг монорепозитория                                           | `yarn lint`                                    |
| Проверить настоящий запуск dev-сервера                                      | `yarn test:start`                              |

Для одного файла тестов можно передать его путь:

```bash
yarn workspace arui-scripts test --runInBand src/configs/util/__tests__/load-config-file.tests.ts
```

Перед открытием PR выполните проверки, которые запускаются в CI:

```bash
yarn test
yarn lint
yarn test:start
```

`yarn test` уже включает сборку пакетов, production-сборки примеров и проверку полученных артефактов.
Корневые команды используют Turbo, который может повторно использовать результаты неизменившихся задач.

### Проверка dev-сервера

`yarn test:start` собирает необходимые пакеты и запускает настоящий `yarn start` в example.
Тест выбирает свободные порты и отдельный каталог `.build-start-*`, дожидается компиляции клиента, сервера, worker и проверки типов.
Затем он проверяет SSR HTML через прокси dev-сервера и доступность JavaScript и worker по HTTP.

При успехе, ошибке или прерывании тест завершает запущенные процессы и удаляет временную сборку.
Обычный каталог `.build` примера можно продолжать использовать. Для теста нужны доступные локальные порты.
Таймаут по умолчанию составляет 45 секунд; его можно изменить, например:

```bash
START_SMOKE_TIMEOUT_MS=90000 yarn test:start
```

### Git hooks и CI

Hooks настраиваются через [lefthook.yml](./lefthook.yml):

- `pre-commit` запускает lint, сборку пакетов и `yarn test:start`, а также проверки подготовленных файлов из arui-presets-lint;
- `commit-msg` проверяет сообщение коммита;
- `pre-push` дополнительно запускает тесты, production-сборки и проверку артефактов примеров.

Если меняется загрузка TypeScript-конфигов, транспиляция или проверка типов, проверьте также job `typescript-compatibility` в CI.
Он запускает [test-typescript.js](./packages/arui-scripts/test-typescript.js) с отдельно установленными версиями TypeScript и проверяет в том числе watch-режим.

### Документация и совместимость

Обновляйте документацию вместе с изменением поведения:

- команды и флаги CLI: [commands.md](./packages/arui-scripts/docs/commands.md), [cli.md](./packages/arui-scripts/docs/cli.md) и [README пакета](./packages/arui-scripts/README.md);
- настройки, presets и overrides: соответствующие разделы [документации arui-scripts](./packages/arui-scripts/docs/);
- генератор: [README генератора](./packages/create-arui-scripts-app/README.md) и его шаблоны;
- остальные пакеты: их README и документация рядом с исходниками.

Для несовместимого изменения опишите, кого оно затрагивает и что нужно поменять при обновлении.
Новые настройки документируйте с типом, значением по умолчанию и примером использования.
Перед коммитом проверьте `git diff`: сборка генератора, например, обновляет `packages/create-arui-scripts-app/src/versions.ts` из версии arui-scripts.

## Changeset

Если изменение должно попасть в новую версию пакета, добавьте changeset:

```bash
yarn changeset
```

Выберите затронутые пакеты пробелом, укажите тип изменения и напишите summary с точки зрения пользователя:

| Тип     | Когда использовать                                   |
| ------- | ---------------------------------------------------- |
| `patch` | Исправление ошибки с сохранением совместимости       |
| `minor` | Новая возможность с сохранением совместимости        |
| `major` | Несовместимое изменение публичного поведения или API |

Например, `Добавлена настройка для выбора каталога сборки` полезнее, чем `refactor config`.
Если потребителю нужны дополнительные действия, опишите их в changeset.

Добавьте сгенерированный `.changeset/*.md` в тот же PR. Один changeset может описывать изменения нескольких пакетов.
Для документации и других изменений, которые не требуют выпуска пакета, changeset не нужен.
Обычный PR содержит исходники, тесты, документацию и changeset; версии пакетов и changelog обновляются в процессе релиза.

## Pull request

Создайте PR в `master` основного репозитория. В описании укажите:

- какую проблему решает изменение и как изменится поведение;
- как его проверить и какие проверки вы уже выполнили;
- ограничения, изменения совместимости и действия при обновлении, если они есть;
- ссылку на issue, если работа связана с ним.

Сообщения коммитов проверяются по Conventional Commits. Scope обязателен, например:

```text
fix(arui-scripts): handle missing entry
feat(scripts-modules): add module option
docs(readme): clarify setup
```

## Выпуск версий

### Стабильный релиз

[Release workflow](./.github/workflows/release.yml) запускается при обновлении `master`.
После мержа PR с changeset бот готовит release PR с версиями пакетов и changelog.
После проверки и мержа release PR workflow публикует пакеты в npm.
Для обычного вклада достаточно подготовить PR с нужным changeset.

### Snapshot для проверки в приложении

Snapshot позволяет установить изменения из ветки в отдельное приложение до стабильного релиза.

1. Добавьте changeset для измененного пакета.
2. Обновите рабочую ветку из `master`, затем закоммитьте и отправьте изменения в GitHub.
3. Откройте [Create snapshot release of packages](https://github.com/core-ds/arui-scripts/actions/workflows/snapshot-release.yml).
4. Нажмите **Run workflow**, выберите свою ветку и задайте `prefix`, например `my-feature`.
5. Дождитесь успешного завершения job. Версии доступны в логах шага `Collect snapshot versions` и в summary запуска. При наличии открытого PR для ветки workflow также оставляет комментарий с версиями.

Для запуска публикации нужны права на workflow и доступные ему секреты `GH_TOKEN` и `NPM_TOKEN`.
Если у вас нет такого доступа, попросите мейнтейнера запустить snapshot для проверки изменений.

#### Как формируется версия

По умолчанию Changesets использует формат `0.0.0-my-feature-<datetime>`.
`prefix` меняет суффикс версии, а npm-тег в текущем workflow всегда **`next`**.
Проверяйте команду публикации в [snapshot-release.yml](./.github/workflows/snapshot-release.yml): значение префикса и тег публикации могут отличаться.

Если в [.changeset/config.json](./.changeset/config.json) включить `snapshot.useCalculatedVersion: true`,
Changesets использует версию с учетом changeset. Например, `26.0.0` и изменение `minor` дадут `26.1.0-my-feature-<datetime>`.
Исходная версия берется из `package.json` выбранной ветки. Обновление ветки из `master` нужно, чтобы snapshot собирался на актуальной базе.

#### Установка и проверка

В проекте-потребителе установите полную версию из успешного запуска workflow.
Замените `VERSION_FROM_WORKFLOW` в команде:

```bash
yarn add --dev --exact arui-scripts@VERSION_FROM_WORKFLOW
```

Это позволяет проверить конкретную сборку: общий тег `next` может быть обновлен другим snapshot-релизом.
Проверьте нужный сценарий локально и в CI проекта-потребителя, затем приложите результаты к PR.

Registry публикации задан в [.yarnrc.yml](./.yarnrc.yml); сейчас это `https://registry.npmjs.org/`.
Публикация в корпоративный registry требует отдельной настройки registry и авторизации.
Сгенерированные snapshot-версии и changelog из запуска workflow не нужно переносить в рабочую ветку или `master`.
