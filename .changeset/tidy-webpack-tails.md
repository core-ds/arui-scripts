---
"arui-scripts": patch
---

Удалены неиспользуемые webpack-зависимости, оставшиеся после миграции на Rspack: `pnp-webpack-plugin`, `babel-core` (bridge-шим), дубль `webpack-manifest-plugin` (в сборке используется `rspack-manifest-plugin`), а также типы `@types/webpack`, `@types/webpack-dev-server`, `@types/webpack-manifest-plugin`, `@types/start-server-webpack-plugin`. Прямые импорты типа `Compiler` из `webpack` переключены на `@rspack/core`. Изменения внутренние, публичный API не затронут — обновление уменьшает дерево зависимостей.
