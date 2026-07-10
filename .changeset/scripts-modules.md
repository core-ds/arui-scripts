---
'@alfalab/scripts-modules': minor
---

Добавлены API для монтирования модулей в React Suspense и SSR:

- `createLazyMounter` для клиентского монтирования модулей через `React.Suspense`;
- `createSsrMounter` из подпути `@alfalab/scripts-modules/ssr` для серверного рендеринга
  mountable-модулей, передачи ресурсов через встроенный payload и последующей клиентской
  гидрации без повторного запроса ресурсов;
- опциональные методы модулей `hydrate` и `update`, а также настройка доставки SSR-стилей:
  inline по умолчанию или `<link>` через `stylesMode: 'link'`.

Стили module-federation модулей, отрисованные на сервере, переиспользуются на клиенте без
повторной загрузки и мигания интерфейса.

`AruiAppManifest.css` и `createModuleFetcher` теперь принимают `string | string[]`.

`createServerStateModuleFetcher` теперь использует стандартный `fetch` вместо
`XMLHttpRequest`, поэтому рантаймам без глобального `fetch` потребуется полифил.

Подробнее: [документация `@alfalab/scripts-modules`](../packages/arui-scripts-modules/README.md#createssrmounter)
и [SSR-спецификация](../docs/specs/ssr-spec.md).
