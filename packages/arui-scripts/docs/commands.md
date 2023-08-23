Доступные команды
===

### start
Запускает dev-сервер для клиентского кода и серверный код в watch-режиме.

**Как запустить?**
```bash
arui-scripts start
```

### start:prod
Запускает dev-сервер для клиентского кода и серверный код в watch-режиме. При этом использует production-конфигурацию для webpack.
Может быть полезна для сбора метрик производительности.

**Как запустить?**
```bash
arui-scripts start:prod
```

### build
Собирает клиентский и серверный код в production-режиме.

**Как запустить?**
```bash
arui-scripts build
```

### test
Команда `arui-scripts test` внутри запускает jest с дополнительной конфигурацией.

Конфигурация включает в себя:
- Использование `jest-snapshot-serializer-class-name-to-string` для правильной работы с `cn`
- Замену всех импортов css файлов на пустые файлы
- Компиляцию .js/.jsx файлов используя babel
- Компиляцию .ts/.tsx файлов используя tsc
- Замену импортов остальных типов файлов на импорт строк с названием файла

По умолчанию под маску для поиска тестов попадают все файлы `*test*.(js|jsx|ts|tsx)`, `*spec*.((js|jsx|ts|tsx))`, `*/__test__/*.(js|jsx|ts|tsx)`.

Вы можете переопределять любые настройки jest в `package.json`, [документация](https://facebook.github.io/jest/docs/en/configuration.html).

Если какие либо из ваших инструментов (например VSСode или WebStorm) не могут запустить тесты поскольку не находят конфигурацию, вы можете так же указать `arui-scripts` как preset для jest.
Таким образом будет работать как запуск тестов через arui-script, так и любые сторонние инструменты, запускающие jest.

_package.json_
```json
{
    "jest": {
        "preset": "arui-scripts"
    }
}
```

**Как запустить?**
```bash
arui-scripts test
```

### docker-build
Собирает клиентский и серверный код в production-режиме, создает docker-образ и пушит его в docker-репозиторий.

**Как запустить?**
```bash
arui-scripts docker-build
```

Имя контейнера определяется как `{configs.dockerRegistry}/{name}:{version}`. Переменные `name` и `version` по умолчанию берутся из package.json,
но вы так же можете переопределить их из командной строки, например
`arui-scripts docker-build name=container-name version=0.1-beta`.

Команда предполагает наличие установленных `node_modules` перед сборкой, в процессе работы же очищает дев зависимости используя `yarn` или `npm`.
yarn будет использоваться когда в рутовой папке проекта есть `yarn.lock` и `yarn` доступен в системе.
Если вы используете yarn 2, для выполнения команды очистки используется плагин [workspace-tools](https://github.com/yarnpkg/berry/blob/HEAD/packages/plugin-workspace-tools/README.md), поэтому он должен быть установлен и указан в `.yarnrc.yml` вашего проекта.

Итоговый контейнер будет содержать `nginx` и скрипт для запуска `nginx` одновременно с `nodejs` сервером.

В итоге, для корректного запуска вашего докер-контейнера вам надо будет выполнить команду

```bash
docker run -p 8080:8080 container-name:version ./start.sh
```

### docker-build:compiled

Команда `arui-scripts docker-build:compiled` во многом аналогична `docker-build`, но вместо сборки проекта использует уже скомпилированный в папку `.build` код.
При этом в контейнер будут устанавливаться только production зависимости.
Команду предполагается использовать в CI/CD, когда проект собирается в отдельном шаге и результат сборки уже доступен.
За счет того, что в контейнер папки node_modules не копируются, а устанавливаются только production зависимости, скорость сборки контейнера значительно увеличивается.
В процессе сборки так же будет модифицироваться файл `.dockerignore` для того чтобы гарантировано исключить папку `node_modules` из контекста сборки докера.

`arui-scripts docker-build:compiled` имеет те же опции, что и `arui-scripts docker-build`.
Dockerfile при этом будет сгенерирован автоматически, но вы можете переопределить его используя механизм [overrides](overrides.md).
Локальный `Dockerfile` в корне проекта в данном случае полностью игнорируется.

**Как запустить?**
```bash
arui-scripts docker-build:compiled
```

### archive-build

Собирает архив с production сборкой.

Этот вариант может быть полезен если вы хотите деплоить ваше приложение через подключение архива в марафоне.

Команда предполагает наличие установленных `node_modules` перед сборкой, в процессе работы же очищает дев зависимости используя `yarn` или `npm`.
yarn будет использоваться когда в рутовой папке проекта есть `yarn.lock` и `yarn` доступен в системе.
Если вы используете yarn 2, для выполнения команды очистки используется плагин [workspace-tools](https://github.com/yarnpkg/berry/blob/HEAD/packages/plugin-workspace-tools/README.md), поэтому он должен быть установлен и указан в `.yarnrc.yml` вашего проекта.

Итоговый архив будет содержать в себе `.build`, `node_modules`, `package.json` и `config` папки вашего проекта.

**Как запустить?**
```bash
arui-scripts archive-build
```

### bundle-analyze

Запускает [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) для анализа размера бандлов.
Так же при запуске будет генерироваться [stats-файл](https://webpack.js.org/api/stats/), который можно использовать в
[сторонних](http://webpack.github.io/analyse/) инструментах, например для понимания почему тот или иной модуль попал в бандл.
По умолчанию файл будет писаться в `.build/stats.json`, вы можете поменять это через отдельную [настройку statsOutputFilename](settings.md#statsOutputFilename).
