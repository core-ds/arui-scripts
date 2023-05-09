arui-scripts
===

[Пользовательская документация](./packages/arui-scripts/README.md)

## Релизы
Данный проект использует [semantic-release](https://semantic-release.gitbook.io/semantic-release/).
Релизы из мастера публикуются автоматически. Версия формируется по commit-messages, см [semantic versioning](https://semver.org/).

## Выпуск пререлизной версии

Для того, чтобы выпустить прерилизную ветку, нужно выполнить следующие действия:

1. Создать ветку, из которой вы ее будете выпускать.
2. Запушить эту ветку в репозиторий. Если ветка будет не запушена - semantic-release не даст ее зарелизить
3. Выполнить все те же действия, что и для релиза, но последнюю команду заменить на `NPM_CHANNEL="{NAME_OF_YOUR_BRANCH}" yarn semantic-release --no-ci`

Для публикации тестовых релизов из веток можно пользоваться ручным запуском
github action [Create new library package](https://github.com/core-ds/arui-scripts/actions?query=workflow%3A%22Create+new+library+package%22).
Выберите нужную вам ветку и введите название тега для публикации. Релиз автоматически попадет в npm.

## Разработка
Проект разбит на три основных пакета:

- [arui-scripts](./packages/arui-scripts/) - непосредственно код конфигураций сборщиков
- [example](./packages/example/) - тестовый проект, на котором проводится проверка сборщиков
- [alpine-node-nginx](./packages/alpine-node-nginx/) - Базовый образ docker контейнера, на котором будут основываться контейнеры проектов
