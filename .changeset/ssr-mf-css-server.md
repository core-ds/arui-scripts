---
'@alfalab/scripts-server': minor
---

`createGetModulesMethod` теперь отдаёт `styles` для default-модулей (module federation),
читая per-expose css из манифеста сборки — **только** для запросов с полем `ssr`. Это позволяет
хост-серверу встроить стили модуля при серверном рендере и избежать мигания интерфейса. Для обычных
(не-SSR) запросов ответ остаётся прежним (`styles: []`), гарантия обратной
совместимости сохранена.

Подробнее: [SSR-спецификация модулей, раздел 10](../docs/specs/ssr-spec.md#10-addendum-css-delivery-for-module-federation-modules).
