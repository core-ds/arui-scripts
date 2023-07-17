@alfalab/scripts-server
===

Набор утилит для использования на серверной части приложений, основанных на arui-scripts.

## Установка

```bash
yarn add @alfalab/scripts-server
```

## Использование

### `readAssetsManifest`
Функция, которая позволяет получить файлы сборки, сгенерированные webpack'ом.

```ts
import { readAssetsManifest } from '@alfalab/scripts-server';

const assets = await readAssetsManifest(); // readAssetsManifest так же принимает массив названий чанков. По умолчанию - ['vendor', 'main']

console.log(assets);
// {
//   js: ['assets/vendor.123456789.js', 'assets/main.123456789.js'],
//   css: ['assets/vendor.123456789.css', 'assets/main.123456789.css'],
// }
```
