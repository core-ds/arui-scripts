---
'@alfalab/scripts-modules': minor
---

Добавлена возможность подменить адрес приложения-провайдера модуля в dev-режиме. `createModuleFetcher` и `createServerStateModuleFetcher` теперь читают подмены из `localStorage['arui:module-overrides']` и переменной сборки `ARUI_MODULE_OVERRIDES` — это позволяет разрабатывать модуль локально вместе с приложением-потребителем, без деплоя на стенд. В production-сборке чтение подмен полностью вырезается.
