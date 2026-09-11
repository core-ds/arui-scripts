---
"@alfalab/scripts-modules": minor
---

Добавлена возможность локально переопределять адрес приложения-источника модуля через `localStorage` (ключ `arui-scripts-module-overrides`). Опция `allowLocalOverride` в `createModuleFetcher` включает чтение оверрайдов `{ moduleId: url }`; манифест и ресурсы модуля загружаются с переопределённого адреса. По умолчанию опция выключена.
