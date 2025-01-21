---
'arui-scripts': patch
---

Исправлена проблема при обработке маленьких svg (меньше, чем [config.dataUrlMaxSize](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/settings.md#dataurlmaxsize)): теперь они корректно преобразуются в data-url
