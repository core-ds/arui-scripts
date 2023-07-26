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

### `createGetModulesHapi16Plugin`
Функция, которая создает hapi-16 плагин для получения информации о модулях.

```ts
import { createGetModulesHapi16Plugin } from '@alfalab/scripts-server/build/hapi16';

const modulesPlugin = createGetModulesHapi16Plugin({
  moduleId: {
    mountMode: 'compat',
    getRunParams: async (getResourcesRequest, hapiRequestObject) => ({}),
  },
});

server.register(modulesPlugin);
```

### `createGetModulesHapi20Plugin`
Функция, которая создает hapi-20 плагин для получения информации о модулях.

```ts
import { createGetModulesHapi20Plugin } from '@alfalab/scripts-server/build/hapi20';

const modulesPlugin = createGetModulesHapi20Plugin({
  moduleId: {
    mountMode: 'compat',
    getRunParams: async (getResourcesRequest, hapiRequestObject) => ({}),
  },
});

server.register(modulesPlugin);
```

### `createGetModulesExpress`
Функция, которая создает express router для получения информации о модулях.

```ts
import { createGetModulesExpress } from '@alfalab/scripts-server/build/express';

const modulesRouter = createGetModulesExpress({
  moduleId: {
    mountMode: 'compat',
    getRunParams: async (getResourcesRequest, expressRequestObject) => ({}),
  },
});

app.use(modulesRouter);
```

### `createGetModulesMethod`

Функция, которая создает метод для получения информации о модулях. Не использует внутри никакой http-фреймворк, поэтому может быть использована в любом проекте.

```ts
import { createGetModulesMethod } from '@alfalab/scripts-server';

const getModules = createGetModulesMethod({
  moduleId: {
    mountMode: 'compat',
    getRunParams: async (getResourcesRequest, ...additionalArgs) => ({}),
  },
});

console.log(getModules.method); // POST
console.log(getModules.path); // /api/getModuleResources

await getModules.handler({}, 'any additional args'); // возвращает конфигурацию модуля
```

Этот метод следует использовать только если ваш фреймворк не поддерживается нативно.
Примером использования этого метода являются все фреймворк-специфичные методы, которые мы предоставляем в этом пакете.
