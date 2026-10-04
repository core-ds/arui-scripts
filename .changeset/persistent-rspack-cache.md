---
'arui-scripts': minor
---

Добавлен opt-in постоянный кэш Rspack для dev и production: `persistentCache`, отдельные области client/server и профилей, отслеживание конфигураций и linked-пакетов, безопасные команды `cache:info`/`cache:clear` и параметры portable/readonly для CI. Компиляторы закрываются с ожиданием сохранения кэша; восстановление корректно возвращает DCB-ассеты.
