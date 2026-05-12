---
'arui-scripts': minor
---

добавлен рееэкспорт patchMainWebpackConfigForModules для публичного api, для исправления ошибки ERR_PACKAGE_PATH_NOT_EXPORTED в проектах. если нужна функция patchMainWebpackConfigForModules, то используйте `import { patchMainWebpackConfigForModules } from 'arui-scripts'`
