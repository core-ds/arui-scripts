---
'arui-scripts': patch
---

Изменена команда для очистки кэша yarn при сборке docker-образа через `docker-build:compiled`

Теперь команда выглядит так: `yarn cache clean --all`

Благодаря этому изменению, размер образов, собираемых через `docker-build:compiled`, станет меньше
