---
'@alfalab/scripts-modules': patch
---

SSR-безопасность (подготовка к серверному рендерингу модулей):

- `createServerStateModuleFetcher` переписан на `fetch` вместо `XMLHttpRequest` — теперь работает в Node без полифилов и пробрасывает `AbortSignal` (загрузчик передаёт свой сигнал отмены в фетчер).
- `createLazyMounter` больше не запускает загрузчик на сервере: под SSR фабрика рендерит пустой outlet, что устраняет падение под `renderToPipeableStream`/`renderToString`. Настоящее монтирование по-прежнему происходит на клиенте.
