---
'@alfalab/scripts-server': minor
---

Добавлена поддержка серверного рендера модулей в `createGetModulesMethod`:

- `ModuleDescriptor` теперь может принимать метод `renderToHtml`, который возвращает HTML
  модуля для SSR-запросов;
- в ответ ресурсов модуля может попадать поле `html`, которое используется
  `createSsrMounter` из `@alfalab/scripts-modules/ssr`;
- для SSR-запросов в ответ добавляются `styles` module-federation модулей, что позволяет
  хост-серверу встроить стили при серверном рендере и избежать мигания интерфейса; для
  обычных (не-SSR) запросов ответ остаётся прежним;
- экспортированы типы `RenderModuleToHtmlParams`, `SsrErrorMode` и
  `CreateGetModulesMethodOptions`, включая настройку обработки ошибок SSR через
  `ssrErrorMode`.

Подробнее: [SSR-спецификация модулей](../docs/specs/ssr-spec.md).
