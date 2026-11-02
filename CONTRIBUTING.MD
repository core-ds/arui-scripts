# Contributing

## Требования окружения

- Node.js `20+` (рекомендуется `22 LTS`)
- Yarn `4.5.3+`

## Быстрый старт

```bash
yarn install --immutable
yarn build
yarn test
yarn lint
```

## Полезные команды разработки

- Собрать все пакеты: `yarn build`
- Прогнать тесты: `yarn test`
- Проверить запуск example: `yarn test:start`
- Проверить линтинг: `yarn lint`
- собрать локально пакет `arui-scripts`: `yarn workspace arui-scripts build`

### Проверка dev-сервера

`yarn test:start` собирает необходимые пакеты и запускает настоящий `yarn start` в example.
Через `ARUI_SCRIPTS_CONFIG` тест задаёт свободные порты клиента/сервера, отдельный каталог
`.build-start-*` и уникальный префикс ресурсов. Обычный example и его `.build` можно продолжать использовать.

Проверка ждёт успешной компиляции клиента, сервера, worker и проверки типов, затем проверяет
SSR HTML через прокси dev-сервера, основной JavaScript и worker по HTTP.
Общий таймаут запуска — 45 секунд; для отладки его можно изменить через `START_SMOKE_TIMEOUT_MS`.
Раннее завершение `start`, ошибка компиляции или таймаут дают ненулевой код выхода и вывод запуска.
При успехе, ошибке и SIGINT/SIGTERM тест завершает свою группу процессов и удаляет временную сборку.

Проверка запускается в pre-commit после lint/build, в pre-push и в CI. Сам запуск сервера не кэшируется Turbo.

Если вы меняете поведение CLI, то необходимо обновить документацию:
- `packages/arui-scripts/docs/commands.md`
- `packages/arui-scripts/docs/cli.md`
- `packages/arui-scripts/README.md`

Если меняется генератор проектов: `packages/create-arui-scripts-app/README.md`.

## Выпуск релизной версии
Данный проект использует [changesets](https://github.com/changesets/changesets/tree/main) для управления релизами.
Каждый пул-реквест, который должен выпустить новый релиз должен содержать файл с описанием изменений в формате changesets.
Для этого нужно выполнить команду `yarn changeset` и ответить на вопросы интерактивного интерфейса (выбор опций делается пробелом).
Файл, который будет сгенерирован, нужно добавить в пул-реквест.

:information_source: При вводе summary в команде `yarn changeset` стоит указывать с пользовательской точки зрения.
Эта информация по итогу попадает в ченжлог.

Примеры хорошего summary:<br/>
:white_check_mark: `Исправление реализации префиксов для css правил в модулях`<br/>
:white_check_mark: `Исправление обработки color-mod функций в css при использовании keepCssVars: false`

Примеры некорректного summary:<br/>
:x: `ignore css order to prevent conflicts`

После мержа пул реквеста в мастер, будет создан пул-реквест с новым релизом. После мержа этого пул-реквеста в мастер, будет создан новый релиз в npm.

## Выпуск snapshot-версии
Snapshot-версия может быть полезна для тестирования изменений перед релизом. Для ее выпуска можно воспользоваться ручным запуском
github action [Create snapshot release of packages](https://github.com/core-ds/arui-scripts/actions?query=workflow%3A%22Create+snapshot+release+of+packages%22). Перед запуском github action необходимо не забыть создать changeset командой `yarn changeset`
