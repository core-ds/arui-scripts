---
'@alfalab/scripts-modules': minor
---

**Что изменилось**
В `createServerStateModuleFetcher` добавлена опция `allowLocalOverride`, которая включает чтение из `localStorage` переопределения базового адреса приложения-источника для запрашиваемого `moduleId`. Запрос ресурсов отправляется на переопределённый адрес в том же формате, который уже поддерживает `createModuleFetcher`.

**Что делать потребителю**
Обязательных действий не требуется: опция по умолчанию выключена. Для отладки server-state модуля на тестовом стенде включите `allowLocalOverride: true` и укажите адрес локального dev-сервера в `localStorage` под ключом `arui-scripts-module-overrides`.
