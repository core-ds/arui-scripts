---
'@alfalab/scripts-server': minor
---

Добавлена поддержка серверного рендера модулей в `createGetModulesMethod`:

- `ModuleDescriptor` теперь может принимать метод `renderToHtml`, который возвращает HTML
  модуля для SSR-запросов;
- в ответ ресурсов модуля может попадать поле `html`, которое используется
  `createSsrMounter` из `@alfalab/scripts-modules/ssr`;
- экспортированы типы `RenderModuleToHtmlParams`, `SsrErrorMode` и
  `CreateGetModulesMethodOptions`, включая настройку обработки ошибок SSR через
  `ssrErrorMode`.

Подробнее: [SSR-спецификация модулей](../packages/arui-scripts-modules/docs/ssr-spec.md).
