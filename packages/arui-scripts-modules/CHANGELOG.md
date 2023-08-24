# @alfalab/scripts-modules

## 1.3.0

### Minor Changes

- [#94](https://github.com/core-ds/arui-scripts/pull/94) [`ad23eb0`](https://github.com/core-ds/arui-scripts/commit/ad23eb09e75080a3828f04c9a30a72ea19ddde59) Thanks [@sanityFair](https://github.com/sanityFair)! - ## В данном PR исправлены:

  - Prototype pollution in webpack loader-utils Critical
  - Improper Neutralization of Special Elements used in a Command in Shell-quote Critical
  - json-schema is vulnerable to Prototype Pollution Critical
  - Prototype Pollution in immer Critical (
  - Для обновления пришлось вынести в плагины WatchMissingNodeModulesPlugin из react-dev-utils, так как в последней версии его убрали.)
  - Prototype Pollution in handlebars Critical

## 1.2.1

### Patch Changes

- [#71](https://github.com/core-ds/arui-scripts/pull/71) [`1f1fa45`](https://github.com/core-ds/arui-scripts/commit/1f1fa45d9d634d59e92169e4931b38e4945f2f92) Thanks [@chermashentsau](https://github.com/chermashentsau)! - Fix modules factory hook

## 1.2.0

### Minor Changes

- [#67](https://github.com/core-ds/arui-scripts/pull/67) [`5f0b9bb`](https://github.com/core-ds/arui-scripts/commit/5f0b9bbb2ed995a8888492b389a5ad340e783d0a) Thanks [@chermashentsau](https://github.com/chermashentsau)! - Add factory modules support

## 1.1.0

### Minor Changes

- [#56](https://github.com/core-ds/arui-scripts/pull/56) [`1c64198`](https://github.com/core-ds/arui-scripts/commit/1c641989791c4ff1e7a20d05c115f8a1d7817e30) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Add modules support and various tools to work with them correctly.

  Modules provides a way to define reusable piece of code to consume from different applications.
  Additional tooling provides a convenient way to consume this modules in applications.
  Full documentation is available in [separate doc](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/modules.md).
