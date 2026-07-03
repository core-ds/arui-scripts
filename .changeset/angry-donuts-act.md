---
'arui-scripts': patch
---

Исправлен запуск команды `bundle-analyze`. Теперь явно включаются необходимые поля stats для `webpack-bundle-analyzer`, которые больше не попадают в `stats.toJson()` по умолчанию
