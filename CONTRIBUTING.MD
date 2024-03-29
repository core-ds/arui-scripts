
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
