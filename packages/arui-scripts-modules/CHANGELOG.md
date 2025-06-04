# @alfalab/scripts-modules

## 1.7.1

### Patch Changes

-   [#330](https://github.com/core-ds/arui-scripts/pull/330) [`e3c998d`](https://github.com/core-ds/arui-scripts/commit/e3c998d4cd5cdae9b9565f7599847e0d547194aa) Thanks [@jorjif](https://github.com/jorjif)! - Добавлена поддержка свойства shareScope для использования в модулях

## 1.7.0

### Minor Changes

-   [#311](https://github.com/core-ds/arui-scripts/pull/311) [`9e33c1d`](https://github.com/core-ds/arui-scripts/commit/9e33c1d5bb675d7356eb8b5ebcfb0fe38050a630) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - В `createModuleLoader` добавлен параметр `resourceCache`, который позволяет настроить кеширование ресурсов модуля

## 1.6.2

### Patch Changes

-   [#205](https://github.com/core-ds/arui-scripts/pull/205) [`be214e9`](https://github.com/core-ds/arui-scripts/commit/be214e916ad537ecc57971d24f544c62b5b2f86d) Thanks [@Dan28396](https://github.com/Dan28396)! - Исправлены типы лоадера, чтобы можно было использовать его вне хуков и запускать без параметров. BaseModuleState дополнен полем preloadedState, который приходит для модулей, перешедших на вторую версию серверной ручки getModuleResources

## 1.6.1

### Patch Changes

-   [#203](https://github.com/core-ds/arui-scripts/pull/203) [`32c89e8`](https://github.com/core-ds/arui-scripts/commit/32c89e8e077270c951348e54ce9303b07d8e3ff6) Thanks [@Dan28396](https://github.com/Dan28396)! - Добавлена возможность работы с модулями-фабриками, созданными внутренними бибилотеками

## 1.6.0

### Minor Changes

-   [#142](https://github.com/core-ds/arui-scripts/pull/142) [`473ab9f`](https://github.com/core-ds/arui-scripts/commit/473ab9f0482c740741c7ed7ae6e926d5ae06feca) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Добавлена возможность загружать монтируемые модули в shadow-DOM

### Patch Changes

-   [#146](https://github.com/core-ds/arui-scripts/pull/146) [`92cb660`](https://github.com/core-ds/arui-scripts/commit/92cb6606518f9226d0e61f3af755f3b1531946f5) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправлено удаление модулей и их ресурсов со страници при отмонтировании хука до загрузки модуля

## 1.5.0

### Minor Changes

-   [#135](https://github.com/core-ds/arui-scripts/pull/135) [`7b897ed`](https://github.com/core-ds/arui-scripts/commit/7b897ed5ce4485d42c7d7ab7516038e802de9396) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Добавлен экспорт функции executeModuleFactory для использования модулей фабрик вне react-хуков

## 1.4.1

### Patch Changes

-   [#129](https://github.com/core-ds/arui-scripts/pull/129) [`ca6dd72`](https://github.com/core-ds/arui-scripts/commit/ca6dd722843a82b550d78012a279f7ed59316809) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправлена типизация для хуков загрузчика модулей

## 1.4.0

### Minor Changes

-   [#98](https://github.com/core-ds/arui-scripts/pull/98) [`ed40587`](https://github.com/core-ds/arui-scripts/commit/ed4058763981be72124be3f29269563df748b627) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - - Добавлено описание типов для Factory-модулей, доступно как `FactoryModule`.

    -   Factory-модули теперь могут принимать `runParams` - отдельный параметр, который не будет передаваться на сервер, а
        сразу будет попадать из клиента в клиент.
        **Важно:** `runParams` теперь является первым аргументом для `run` функции.

    -   Mountable модули теперь могут использовать запись вида `export default mountableModule;` вместо отдельных экспортов
        `mount` и `unmount` функций.

## 1.3.0

### Minor Changes

-   [#94](https://github.com/core-ds/arui-scripts/pull/94) [`ad23eb0`](https://github.com/core-ds/arui-scripts/commit/ad23eb09e75080a3828f04c9a30a72ea19ddde59) Thanks [@sanityFair](https://github.com/sanityFair)! - ## В данном PR исправлены:

    -   Prototype pollution in webpack loader-utils Critical
    -   Improper Neutralization of Special Elements used in a Command in Shell-quote Critical
    -   json-schema is vulnerable to Prototype Pollution Critical
    -   Prototype Pollution in immer Critical (
    -   Для обновления пришлось вынести в плагины WatchMissingNodeModulesPlugin из react-dev-utils, так как в последней версии его убрали.)
    -   Prototype Pollution in handlebars Critical

## 1.2.1

### Patch Changes

-   [#71](https://github.com/core-ds/arui-scripts/pull/71) [`1f1fa45`](https://github.com/core-ds/arui-scripts/commit/1f1fa45d9d634d59e92169e4931b38e4945f2f92) Thanks [@chermashentsau](https://github.com/chermashentsau)! - Fix modules factory hook

## 1.2.0

### Minor Changes

-   [#67](https://github.com/core-ds/arui-scripts/pull/67) [`5f0b9bb`](https://github.com/core-ds/arui-scripts/commit/5f0b9bbb2ed995a8888492b389a5ad340e783d0a) Thanks [@chermashentsau](https://github.com/chermashentsau)! - Add factory modules support

## 1.1.0

### Minor Changes

-   [#56](https://github.com/core-ds/arui-scripts/pull/56) [`1c64198`](https://github.com/core-ds/arui-scripts/commit/1c641989791c4ff1e7a20d05c115f8a1d7817e30) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Add modules support and various tools to work with them correctly.

    Modules provides a way to define reusable piece of code to consume from different applications.
    Additional tooling provides a convenient way to consume this modules in applications.
    Full documentation is available in [separate doc](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/modules.md).
