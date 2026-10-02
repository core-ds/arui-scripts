---
'arui-scripts': major
---

Удалены устаревшие webpack алиасы. Ключи оверрайдов `webpack*` замените на `rspack*`, настройку `disableDevWebpackTypecheck` — на `disableDevRspackTypecheck`, `patchMainWebpackConfigForModules` на `patchMainRspackConfigForModules`, хелпер `createSingleClientWebpackConfig` на `createSingleClientRspackConfig`. В `findPlugin` ключ проверки типов теперь `TsCheckerRspackPlugin`
