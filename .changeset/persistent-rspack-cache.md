---
'arui-scripts': minor
---

**Что изменилось**
Добавлен постоянный кеш Rspack для dev и production-сборок с настройкой `persistentCache`, командами `cache:info` и `cache:clear` и сохранением данных при штатном завершении компиляторов. Добавлен пример использования в Jenkins.

**Что делать потребителю**
Для включения добавьте `persistentCache: true` в конфигурацию arui-scripts и `.cache/arui-scripts/` в `.gitignore` и `.prettierignore` приложения. В Jenkins настройте восстановление и сохранение этого каталога между сборками. По умолчанию постоянный кеш выключен.
