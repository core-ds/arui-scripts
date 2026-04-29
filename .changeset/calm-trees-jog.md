---
'arui-scripts': major
---

В **arui-scripts** переведены инструменты сборки на **Rspack 2** и **@rspack/dev-server 2**.

## Почему мажорный релиз

Поднято требование к node.js: для разработки теперь требуется **20.19.0 и выше** или **22.12.0 и выше** (см. поле `engines` в `package.json`). На **node.js 18** и на **20.0–20.18** новая версия не рассчитана, потому что этого требует сам Rspack 2 и dev-server 2.

## Что это означает для проектов на arui-scripts

- **Обычный сценарий** (настройки из доки, без своих оверрайдов webpack/rspack/devServer): после обновления пакета достаточно **поднять версию node.js** до поддерживаемой версии и прогнать `yarn start` / `yarn build`.
- **Если в проекте есть оверрайды** (`arui-scripts` override с `devServer`, `proxy`, `webpackClient` и тд.): часть старых опций пропала или переименована в Rspack 2 и в dev-server 2. Например, в прокси dev-сервера больше нет `bypass`, вместо него теперь используются фильтры путей и колбэки в `on.*`. Подробнее про это в ссылка ниже.

## Ссылки про миграцию

- [Rspack: обновление с 1.x на 2.0](https://rspack.rs/guide/migration/rspack_1.x)
- [@rspack/dev-server: с v1 на v2](https://github.com/rstackjs/rspack-dev-server/blob/main/docs/migrate-v1-to-v2.md)
