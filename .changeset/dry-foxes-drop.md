---
'arui-scripts': patch
---

Исправление команды docker-build: она генерировала некорректный dockerfile,
из-за чего контейнер не мог запуститься с ошибкой `Cannot find module '/src/start.sh'`
