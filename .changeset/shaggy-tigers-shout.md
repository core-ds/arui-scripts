---
'arui-scripts': minor
'@alfalab/scripts-server': patch
---

В манифест добавлены общие JS и CSS чанки именованных lazy страниц для подключения при SSR.
`readAssetsManifest` возвращает ресурсы без повторов.

Значения `js` и `css` именованных async групп теперь массивы, даже для одного файла.
Правила подключения ресурсов описаны в [README](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts-server/README.md#readassetsmanifest).

Доработка для [#45](https://github.com/core-ds/arui-scripts/issues/45).
