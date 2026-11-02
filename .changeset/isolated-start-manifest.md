---
'@alfalab/scripts-server': patch
---

В `getAppManifest` и `readAssetsManifest` можно передать путь к манифесту сборки. Для разных путей используется отдельный кеш; чтение из `.build/webpack-assets.json` по умолчанию сохраняется.
