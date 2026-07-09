---
'@alfalab/scripts-modules': minor
---

Серверные стили default-модулей (module federation) теперь наследуются рантаймом module
federation без двойной загрузки и мигания:

- `createSsrMounter` проставляет на серверные `<style>`/`<link>`-теги атрибут `data-href`
  (resolved URL css) — по нему css-рантайм module federation находит уже присутствующий стиль
  и не догружает css-чанк. Для default-модулей `data-parent-app-id` больше не проставляется:
  владение стилями остаётся за MF-рантаймом (как и для рантайм-вставленных стилей), поэтому
  `fetchResources`/`removeModuleResources` их не трогают;
- `createModuleLoader` не подключает `styles` для default-модулей — их всегда грузит рантайм
  module federation. Сервер может присылать css default-модуля в `styles` (для серверного
  рендера стилей), но на клиенте они усыновляются по `data-href`, а не подключаются повторно;
- `AruiAppManifest.css` и `createModuleFetcher` теперь принимают `string | string[]`
  (per-expose css default-модулей — массив).

Подробнее: [SSR-спецификация модулей, раздел 10](../packages/arui-scripts-modules/docs/ssr-spec.md#10-addendum-css-delivery-for-module-federation-modules).
