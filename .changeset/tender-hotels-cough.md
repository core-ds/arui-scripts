---
'arui-scripts': major
---

Удалены deprecated webpack имена из кодовой базы.
В оверрайдах, настройках остались только имена rspack.

**Что сделать пользователю**

Замените имена один в один:
- ключи оверрайдов `webpack*` на такие же `rspack*` (`webpackClient` -> `rspackClient` и т.д.);
- `disableDevWebpackTypecheck` -> `disableDevRspackTypecheck`;
- `patchMainWebpackConfigForModules` -> `patchMainRspackConfigForModules`;
- `createSingleClientWebpackConfig` -> `createSingleClientRspackConfig`;
- в `findPlugin` ключ `ForkTsCheckerWebpackPlugin` -> `TsCheckerRspackPlugin`.
