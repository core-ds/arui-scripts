arui-scripts
===

[Пользовательская документация](./packages/arui-scripts/README.md)

## Релизы
Данный проект использует [changesets](https://github.com/changesets/changesets/tree/main) для управления релизами.
Каждый пул-реквест, который должен выпустить новый релиз должен содержать файл с описанием изменений в формате changesets.
Для этого нужно выполнить команду `yarn changeset` и ответить на вопросы интерактивного интерфейса (выбор опций делается пробелом).
Файл, который будет сгенерирован, нужно добавить в пул-реквест.

После мержа пул реквеста в мастер, будет создан пул-реквест с новым релизом. После мержа этого пул-реквеста в мастер, будет создан новый релиз в npm.

## Выпуск snapshot-версии
Snapshot версия может быть полезна для тестирования изменений перед релизом. Для ее выпуска можно воспользоваться ручным запуском
github action [Create snapshot release of packages](https://github.com/core-ds/arui-scripts/actions?query=workflow%3A%22Create+snapshot+release+of+packages%22)

Данный проект использует [semantic-release](https://semantic-release.gitbook.io/semantic-release/).
Релизы из мастера публикуются автоматически. Версия формируется по commit-messages, см [semantic versioning](https://semver.org/).

## Разработка
Проект разбит на три основных пакета:

- [arui-scripts](./packages/arui-scripts/) - непосредственно код конфигураций сборщиков
- [arui-scripts-test](./packages/arui-scripts-test/) - тестовый проект, на котором проводится проверка сборщиковъ
- [alpine-node-nginx](./packages/alpine-node-nginx/) - Базовый образ docker контейнера, на котором будут основываться контейнеры проектов
