---
'@alfalab/scripts-modules': minor
---

Добавлен опциональный lifecycle context для mountable-модулей: явная готовность,
сообщение runtime-ошибок и сигнал отмены. Все клиентские mounter-ы поддерживают
onReady, onError, readyTimeoutMs и асинхронные lifecycle-методы. Существующие модули
работают без изменений. Исправлена повторная очистка ресурсов при abort после unmount.
