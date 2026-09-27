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
- Проверить линтинг: `yarn lint`
- собрать локально пакет `arui-scripts`: `yarn workspace arui-scripts build`

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

## Coverage arui-scripts

Запуск юнит-тестов с отчётом: `yarn workspace arui-scripts test:coverage`.
Перед первым запуском выполните `yarn install --immutable && yarn build` для сборки внутренних workspace-зависимостей.

В расчёт входят все `src/**/*.{ts,js}`, включая не импортированные тестами файлы. Исключены только тесты и декларации типов. HTML-отчёт находится в `packages/arui-scripts/coverage/index.html`, машинные отчёты — `coverage-summary.json`, `coverage-final.json` и `lcov.info` в той же папке. Отчёты не коммитятся.

Минимальный общий порог — **80% отдельно для lines, statements, functions и branches**. Команда `test:coverage` завершается с ошибкой, если любой показатель ниже порога. В CI эта проверка выполняется на Node.js 22; HTML и LCOV доступны в артефакте `arui-scripts-coverage` (14 дней).

Для проверки независимости тестов от порядка запуска: `yarn workspace arui-scripts test --runInBand --randomize --seed=928`.

Область тестирования и оставшиеся пробелы описаны в [testing.md](packages/arui-scripts/docs/testing.md).
