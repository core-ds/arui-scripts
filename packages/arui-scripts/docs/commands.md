# Доступные команды

===

CLI `arui-scripts` поддерживает глобальные флаги:

- `arui-scripts --help` - список всех команд с описаниями.
- `arui-scripts --version` (`-v`) - версия пакета.
- `arui-scripts <command> --help` - справка по конкретной команде.

## start

Запускает dev-сервер для клиентского кода и серверный код в watch-режиме.

**Как запустить?**

```bash
arui-scripts start
```

## start:prod

Запускает dev-сервер для клиентского кода и серверный код в watch-режиме. При этом использует production-конфигурацию для rspack.
Может быть полезна для сбора метрик производительности.

**Как запустить?**

```bash
arui-scripts start:prod
```

## build

Собирает клиентский и серверный код в production-режиме.

Если заданы [buildSizeBudgets](settings.md#buildsizebudgets), после клиентской сборки проверяются лимиты начального JS и CSS. Превышение останавливает сборку с ненулевым кодом.

**Как запустить?**

```bash
arui-scripts build
```

## test

Конфигурация включает в себя:
- Использование `jest-snapshot-serializer-class-name-to-string` для правильной работы с `cn`
- Замену всех импортов css файлов на пустые файлы
- Компиляцию .js/.jsx файлов используя babel
- Компиляцию .ts/.tsx файлов используя tsc
- Замену импортов остальных типов файлов на импорт строк с названием файла

Команда `arui-scripts test` внутри запускает jest с дополнительной конфигурацией.

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

## test:vitest

Команда `arui-scripts test:vitest` запускает unit тесты через [Vitest](https://vitest.dev/).

Vitest требует Node.js 22.12 или новее. Ему также нужен `vite` (peer-зависимость), `arui-scripts` устанавливает его сам.
Если `vitest` подключен в проект напрямую и используется yarn, добавьте `vite` в `devDependencies` проекта (yarn не устанавливает peer-зависимости автоматически).

Если в корне проекта есть `vitest.config.ts` (или `.js`, `.mjs`, `.cjs`), то используется он.
Иначе применяется конфигурация arui-scripts.

**Рекомендуемый способ настройки** - создать `vitest.config.js` с `mergeConfig`:

```javascript
import { defineConfig, mergeConfig } from 'vitest/config';
import aruiConfig from 'arui-scripts/vitest';

export default mergeConfig(aruiConfig, defineConfig({
    test: {
        setupFiles: ['./__tests__/setup.js'],
        // другие настройки Vitest
    },
}));
```

Базовый конфиг arui-scripts включает:
- API Vitest - используйте явные импорты: `import { describe, it, expect } from 'vitest'` (без глобальных переменных)
- Замену импортов `.css` на пустые модули, ассетов (svg, png, шрифты и др.) - на строку с именем файла
- Маппинг путей из `tsconfig.json` (paths) через [vite-tsconfig-paths](https://www.npmjs.com/package/vite-tsconfig-paths)
- Маски для тестов: `src/**/__tests__/**/*`, `src/**/__test__/**/*`, `src/**/*.{test,spec,tests}.*`

**Обратная совместимость**: при отсутствии `vitest.config.*` по-прежнему читается `jest.setupFiles` из `package.json`.

**Как запустить?**

```bash
arui-scripts test:vitest
```

## docker-build

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

## docker-build:compiled

Команда `arui-scripts docker-build:compiled` во многом аналогична `docker-build`, но вместо сборки проекта использует уже скомпилированный в папку `.build` код.
При этом в контейнер будут устанавливаться только production зависимости.
Команду предполагается использовать в CI/CD, когда проект собирается в отдельном шаге и результат сборки уже доступен.
За счет того, что в контейнер папки node_modules не копируются, а устанавливаются только production зависимости, скорость сборки контейнера значительно увеличивается.
В процессе сборки так же будет модифицироваться файл `.dockerignore` для того чтобы гарантировано исключить папку `node_modules` из контекста сборки докера.

**⚠️ Внимание** команда не работает с `clientOnly` режимом.

`arui-scripts docker-build:compiled` имеет те же опции, что и `arui-scripts docker-build`.
Dockerfile при этом будет сгенерирован автоматически, но вы можете переопределить его используя механизм [overrides](overrides.md).
Локальный `Dockerfile` в корне проекта в данном случае полностью игнорируется.

**Как запустить?**

```bash
arui-scripts docker-build:compiled
```

## archive-build

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

## bundle-analyze

Запускает [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) и [rsdoctor](https://rsdoctor.dev/) для анализа бандла и сборки.
Так же при запуске будет генерироваться [stats-файл](https://webpack.js.org/api/stats/), который можно использовать в
[сторонних](http://webpack.github.io/analyse/) инструментах, например для понимания почему тот или иной модуль попал в бандл.
По умолчанию файл будет писаться в `.build/stats.json`, вы можете поменять это через отдельную [настройку statsOutputFilename](settings.md#statsOutputFilename).

## bundle-diff

Генерирует [Rsdoctor Bundle Diff](https://rsdoctor.rs/guide/usage/bundle-diff) для двух production сборок клиента:
HTML отчеты, JSON diff, таблицу размеров `summary.json` и markdown комментарий для pull request `comment.md`.

### Сохранение данных production сборки

```bash
ARUI_SCRIPTS_RSDOCTOR_OUTPUT=rsdoctor/current yarn build
```

`yarn build` должен запускать `arui-scripts build`. Rsdoctor подключается к тем же production конфигурациям клиента, отдельная пересборка не нужна, серверные бандлы не учитываются.
Rsdoctor собирает только данные о бандле и не меняет результат сборки: JS, CSS и source maps совпадают со сборкой без этой переменной.
Встроенные lint правила Rsdoctor отключены, поэтому сбор данных не добавляет предупреждений. Обычный `bundle-analyze` сохраняет свое интерактивное поведение.

### Сравнение

```bash
yarn arui-scripts bundle-diff \
  --current rsdoctor/current \
  --baseline rsdoctor/baseline \
  --output rsdoctor/diff \
  --report-url https://artifacts.example/reports/build-123/ \
  --current-label 'feature/form @ current-sha' \
  --baseline-label 'develop @ baseline-sha'
```

| Опция                      | Назначение                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `--current <directory>`    | Обязательный каталог текущего snapshot с `index.json`                                                                            |
| `--baseline <directory>`   | Каталог базового snapshot; если он не передан, не содержит snapshot или собран другой версией Rsdoctor, выводятся текущие размеры и причина |
| `--output <directory>`     | Каталог результата; по умолчанию `rsdoctor/diff`                                                                                 |
| `--report-url <url>`       | URL, по которому будет опубликован каталог `--output`; без него ссылки на HTML отчеты относительные                              |
| `--current-label <label>`  | Ветка/коммит текущей сборки для комментария                                                                                      |
| `--baseline-label <label>` | Ветка/коммит базовой сборки для комментария                                                                                      |

Метрики Total Size / JavaScript / CSS / HTML / Other Assets используют правила Rsdoctor (emitted assets, без source maps и LICENSE). Other Assets объединяет изображения, шрифты, медиа и прочие файлы.
Предсжатые копии `.gz` и `.br` в таблицу не входят, потому что дублируют те же JS и CSS; в HTML отчете Rsdoctor они видны отдельными assets.
Для нескольких клиентов таблица суммирует размеры их outputs; одинаковый файл в двух outputs учитывается дважды.

Для каждого общего имени клиента создаются `client-N.html` и `client-N.json`. Новые и удалённые конфигурации учитываются в итоговой таблице и отмечаются в комментарии; для них парного HTML diff нет. JSON содержит native diff assets/modules/packages. При нулевом baseline рост отмечается как `new`, без бесконечного процента.

Повреждённые данные, несовместимый текущий snapshot и ошибки генерации завершают команду с ненулевым кодом. Snapshot фиксирует формат и версию Rsdoctor, поэтому baseline другой версии не сравнивается: например, в PR, который обновляет arui-scripts, сравнение появится после сборки целевой ветки с новой версией.

### Использование в CI

1. В сборке каждой ветки сохраняйте snapshot как артефакт, привязанный к SHA коммита.
2. В сборке pull request скачайте snapshot последнего коммита целевой ветки в каталог baseline. Snapshot другого коммита подставлять не стоит: сравнение покажет чужие изменения. Если snapshot не найден, все равно запускайте команду: комментарий покажет текущие размеры и объяснит, что нужна сборка целевой ветки.
3. Запустите `bundle-diff` с `--report-url`, указывающим, куда будет опубликован каталог `--output`, и опубликуйте этот каталог.
4. Опубликуйте `comment.md` комментарием в pull request. При повторных запусках удобно обновлять прежний комментарий, найдя его по заголовку `Rsdoctor Bundle Diff Analysis`.

HTML отчет — самодостаточный файл со встроенным JavaScript. Если хранилище артефактов запрещает выполнение скриптов, отчет можно скачать и открыть локально.
