arui-scripts
===

[Пользовательская документация](./packages/arui-scripts/README.md)

## Релизы
Данный проект использует [semantic-release](https://semantic-release.gitbook.io/semantic-release/).
~~Релизы из мастера публикуются автоматически. Версия формируется по commit-messages, см [semantic versioning](https://semver.org/).~~

Релизы публикуются руками. Если вам нужно выпустить новую версию библиотеки - обратитесь к @akitov или реализуйте нормальную работу с ci самостоятельно.


~~Для публикации тестовых релизов из веток можно пользоваться ручным запуском
github action [Create new library package](https://github.com/alfa-laboratory/arui-scripts/actions?query=workflow%3A%22Create+new+library+package%22).
Выберите нужную вам ветку и введите название тега для публикации. Релиз автоматически попадет в npm.~~

## Разработка
Проект разбит на три основных пакета:

- [arui-scripts](./packages/arui-scripts/) - непосредственно код конфигураций сборщиков
- [arui-scripts-test](./packages/arui-scripts-test/) - тестовый проект, на котором проводится проверка сборщиковъ
- [alpine-node-nginx](./packages/alpine-node-nginx/) - Базовый образ docker контейнера, на котором будут основываться контейнеры проектов

