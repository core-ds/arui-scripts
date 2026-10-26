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

Чтобы отдать клиенту страницу, которая загружается лениво, вместе со всеми нужными ей файлами, передайте имя ее чанка — то, что указано в `/* webpackChunkName: "..." */`.
В манифесте у такого чанка записан полный список файлов: собственные и общие, на которые код разрезал `splitChunks`.
Файлы, повторяющиеся в нескольких чанках, возвращаются один раз.

```ts
// const PreviewList = lazy(() => import(/* webpackChunkName: "preview-list" */ './preview-list'));

const assets = await readAssetsManifest(['vendor', 'main', 'preview-list']);

console.log(assets);
// {
//   js: ['assets/vendor.123456789.js', 'assets/main.123456789.js', 'assets/615.123456789.chunk.js', 'assets/preview-list.123456789.chunk.js'],
//   css: ['assets/vendor.123456789.css', 'assets/main.123456789.css', 'assets/preview-list.123456789.chunk.css'],
// }
```

Если `output.publicPath` задан явно и не равен `'auto'`, при вставке CSS в SSR HTML сохраняйте путь из манифеста в `data-href`, если меняете `href`.
Например, если сервер добавляет `/` в начало относительного пути, разметка для `assets/preview-list.123456789.chunk.css` должна выглядеть так:

```html
<link
    rel="stylesheet"
    href="/assets/preview-list.123456789.chunk.css"
    data-href="assets/preview-list.123456789.chunk.css"
/>
```

Так клиентский runtime распознает уже подключенные стили и не вставит повторный `<link>` при загрузке страницы.
Абсолютные URL и ссылки на CDN из манифеста используйте без добавления `/` в начало.

При `output.publicPath: 'auto'` runtime определяет абсолютный URL каталога сборки по адресу загруженного скрипта. В этом режиме указывайте абсолютный `href` CSS, соответствующий этому каталогу, без относительного `data-href` из манифеста:

```html
<link rel="stylesheet" href="https://app.example.com/assets/preview-list.123456789.chunk.css" />
```

Например, такой `href` подходит, если скрипт сборки загружен с `https://app.example.com/assets/main.123456789.js`. Относительный `data-href="assets/preview-list.123456789.chunk.css"` не совпадет с абсолютным URL runtime и приведет к повторной вставке стилей.

Для async-групп без имени отдельная именованная запись не формируется. Безымянные чанки остаются в записи `""`, а общие файлы `splitChunks` также входят в списки соответствующих именованных групп.

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
