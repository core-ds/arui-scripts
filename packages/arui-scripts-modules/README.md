@alfalab/scripts-modules
===

Пакет, упрощающий работу с [модулями в arui-scripts](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/modules.md)

## Установка

```bash
yarn add @alfalab/scripts-modules
```

## Доступные методы

- [`createModuleLoader`](#createModuleLoader)
- [`createClientResourcesFetcher`](#createClientResourcesFetcher)
- [`createServerResourcesFetcher`](#createServerResourcesFetcher)
- [`getServerFetcherParams`](#getServerFetcherParams)
- [`useModuleLoader`](#useModuleLoader)
- [`useModuleMounter`](#useModuleMounter)

## Использование

### `createModuleLoader`
Функция, которая создает загрузчик для модуля.

```ts
import { createModuleLoader } from '@alfalab/scripts-modules';

const loader = createModuleLoader({
    hostAppId: 'my-app', // id вашего приложения, оно будет передаваться в серверную ручку модуля
    moduleId: 'test', // id модуля, который вы хотите подключить
    // функция, которая должна вернуть описание модуля.
    getModuleResources: async ({ moduleId, hostAppId, params }) => ({
        scripts: ['http://localhost:8081/static/js/main.js'], // скрипты модуля
        styles: ['http://localhost:8081/static/css/main.css'], // стили модуля
        moduleVersion: '1.0.0', // версия модуля
        appName: 'moduleSourceAppName', // имя приложения, которое является источником модуля
        mountMode: 'embedded', // режим монтирования модуля
        moduleRunParams: { // параметры, которые будут доступны при инициализации модуля
            baseUrl: 'http://localhost:8081',
        },
    }),
    // опциональные параметры
    resourcesTargetNode: document.head, // DOM-нода, в которую будут монтироваться ресурсы модуля (css и js)
    onBeforeResourcesMount: (moduleId, resources) => {}, // коллбек, который будет вызван перед монтированием ресурсов
    onBeforeModuleMount: (moduleId, resources) => {}, // коллбек, который будет вызван перед монтированием модуля
    onAfterModuleMount: (moduleId, resources, module) => {}, // коллбек, который будет вызван после монтирования модуля
    onBeforeModuleUnmount: (moduleId, resources, module) => {}, // коллбек, который будет вызван перед размонтированием модуля
    onAfterModuleUnmount: (moduleId, resources, module) => {}, // коллбек, который будет вызван после размонтирования модуля
});
```

### `createClientResourcesFetcher`
Функция, которая создает функцию `getModuleResources` для загрузки клиентских модулей.

```ts
import { createClientResourcesFetcher } from '@alfalab/scripts-modules';

const getModuleResources = createClientResourcesFetcher({
    baseUrl: '', // Базовый адрес приложения, которое предоставляет модули. Может быть как относительным, так и абсолютным.
    assetsUrl: '/assets/webpack-assets.json', // опциональный параметр для переопределения пути до файла с манифестом
});
```

### `createServerResourcesFetcher`
Функция, которая создает функцию `getModuleResources` для загрузки серверных модулей.

```ts
import { createServerResourcesFetcher } from '@alfalab/scripts-modules';

const getModuleResources = createServerResourcesFetcher({
    baseUrl: '', // Базовый адрес приложения, которое предоставляет модули. Может быть как относительным, так и абсолютным.
    headers: {}, // опциональный параметр для передачи дополнительных заголовков в запрос
});
```

### `getServerFetcherParams`
Функция, которая возвращает параметры для запроса серверных модулей.

```ts
import { getServerFetcherParams } from '@alfalab/scripts-modules';

const params = getServerFetcherParams(); // { method: 'POST', relativePath: '/api/getModuleResources' }
```

### `useModuleLoader`

React-хук, который позволяет загружать модули в компонентах.

```tsx
import { createClientLoader, useModuleLoader } from '@alfalab/scripts-modules';

const loader = createModuleLoader({ ... });

const MyApp = () => {
    const {
        loadingState, // состояние загрузки модуля, 'unknown' | 'pending' | 'fulfilled' | 'rejected'
        module, // экспортированный модуль, если загрузка прошла успешно
        resources, // ресурсы модуля, если загрузка прошла успешно (css, js, ответ сервера)
    } = useModuleLoader({
        loader, // загручик модуля, полученный с помощью createModuleLoader
        loaderParams: {} // опциональные параметры, которые будут переданы в getModuleResources
    });

    return (
        <div>
            {loadingState === 'loading' && <div>Загрузка...</div>}
            {loadingState === 'error' && <div>Ошибка загрузки</div>}
            {loadingState === 'success' && <div>Модуль загружен</div>}
            <pre>{JSON.stringify(module, null, 4)}</pre>
        </div>
    );
}
```

### `useModuleMounter`

React-хук, который позволяет использовать монтируемые модули в компонентах.

```tsx
import { createClientLoader, useModuleMounter } from '@alfalab/scripts-modules';

const loader = createModuleLoader({ ... });

const MyApp = () => {
    const {
        loadingState, // состояние загрузки модуля, 'unknown' | 'pending' | 'fulfilled' | 'rejected'
        targetElementRef, // ссылка на DOM-ноду, в которую будет монтироваться модуль
    } = useModuleMounter({
        loader, // загручик модуля, полученный с помощью createModuleLoader
        loaderParams: {}, // опциональные параметры, которые будут переданы в getModuleResources
        runParams: {}, // опциональные параметры, которые будут переданы в модуль при инициализации
        createTargetNode: () => document.createElement('div'), // опциональная функция, которая должна вернуть DOM-ноду, в которую будет монтироваться модуль
    });

    return (
        <div>
            {loadingState === 'loading' && <div>Загрузка...</div>}
            {loadingState === 'error' && <div>Ошибка загрузки</div>}

            <div ref={ targetElementRef } />
        </div>
    );
}
```
