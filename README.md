arui-scripts
===

[Пользовательская документация](./packages/arui-scripts/README.md)

## Релизы
Данный проект использует [semantic-release](https://semantic-release.gitbook.io/semantic-release/).
Релизы из мастера публикуются автоматически. Версия формируется по commit-messages, см [semantic versioning](https://semver.org/).

#### Краткий пересказ про содержимое коммитов
+ Какие типы существуют и что они означают?
  - `feat` - фича
  - `fix` - исправление бага
  - `docs` - документация
  - `style` - стайл гайд
  - `refactor` - рефакторинг
  - `test` - добавление тестов
  - `perf` - работы с производительностью
  - `chore` - общие работы (изменения в package.json, .npmrc и т.д.)
+ Какие типы выпускают новый тэг?
  - `fix` выпустит patch-версию
  ```sh
  fix(pencil): stop graphite breaking when too much pressure applied
  ```
  - `feat` выпустит minor-версию
  ```sh
  feat(pencil): add graphiteWidth option
  ```
  - `BREAKING CHANGE` в body-содержании коммита выпустит major-версию
  ```sh
  perf(pencil): remove graphiteWidth option

  BREAKING CHANGE: The graphiteWidth option has been removed.
  ```

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
- [arui-scripts-test](./packages/arui-scripts-test/) - тестовый проект, на котором проводится проверка сборщиковъ
- [alpine-node-nginx](./packages/alpine-node-nginx/) - Базовый образ docker контейнера, на котором будут основываться контейнеры проектов
