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
- [`useModuleFactory`](#useModuleFactory)
- [`executeModuleFactory`](#executeModuleFactory)
- [`createSsrMounter`](#createSsrMounter)

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
        mountMode: 'compat', // режим монтирования модуля
        moduleRunParams: { // параметры, которые будут доступны при инициализации модуля
            baseUrl: 'http://localhost:8081',
        },
    }),
    // опциональные параметры
    resourceCache: 'single-item', // политика кеширования ресурсов модуля. Если 'none' - ресурсы модуля будут удалены из кеша после его удаления со страницы. Если 'single-item' - в кеше будет храниться значения для текущего значения loaderParams.
    resourcesTargetNode: document.head, // DOM-нода, в которую будут монтироваться ресурсы модуля (css и js)
    shareScope: 'my-scope', // параметр, который необходимо указать если shareScope модуля отличается от default
    disableInlineStyleSafari, // флаг, отключающий встраивание inline стилей в Safari
    hooks: {
        onStart: (moduleId) => {}, // хук, который будет вызван в самом начале процесса монтирования модуля
        onBeforeResourcesMount: (moduleId, resources) => {}, // хук, который будет вызван перед монтированием ресурсов
        onBeforeModuleMount: (moduleId, resources) => {}, // хук, который будет вызван перед загрузкой ресурсов модуля
        onAfterModuleMount: (moduleId, resources, module) => {}, // хук, который будет вызван после полной загрузки модуля
        onBeforeMountableModuleMount: (moduleId, targetNode) => {}, // хук, который будет вызван перед вызовом функции mount монтируемых модулей
        onAfterMountableModuleMount: (moduleId, targetNode) => {}, // хук, который будет вызван после выполнения функции mount монтируемых модулей
        onBeforeModuleUnmount: (moduleId, resources, module) => {}, // хук, который будет вызван перед размонтированием модуля
        onAfterModuleUnmount: (moduleId, resources, module) => {}, // хук, который будет вызван после размонтирования модуля
        onError: (moduleId, stage, error) => {}, // хук, который будет вызван при ошибке загрузки модуля. Не дает обработать ошибку, нужен только для логирования или мониторинга
    }
});

const result = await loader({
    cssTargetSelector: 'head', // опциональный параметр, селектор по которому будет производиться поиск DOM-ноды, в которую будут монтироваться стили модуля
    getResourcesParams: { ... }, // опциональные параметры, которые будут переданы в getModuleResources
});

console.log(result); // { module, moduleResources, unmount }
```

### `createModuleFetcher`
Функция, которая создает функцию `getModuleResources` для загрузки клиентских модулей.

```ts
import { createModuleFetcher } from '@alfalab/scripts-modules';

const getModuleResources = createModuleFetcher({
    baseUrl: '', // Базовый адрес приложения, которое предоставляет модули. Может быть как относительным, так и абсолютным.
    assetsUrl: '/assets/webpack-assets.json', // опциональный параметр для переопределения пути до файла с манифестом
});
```

### `createServerStateModuleFetcher`
Функция, которая создает функцию `getModuleResources` для загрузки серверных модулей.

```ts
import { createServerStateModuleFetcher } from '@alfalab/scripts-modules';

const getModuleResources = createServerStateModuleFetcher({
    baseUrl: '', // Базовый адрес приложения, которое предоставляет модули. Может быть как относительным, так и абсолютным.
    headers: {}, // опциональный параметр для передачи дополнительных заголовков в запрос
});
```

### `getServerStateModuleFetcherParams`
Функция, которая возвращает параметры для запроса серверных модулей.

```ts
import { getServerStateModuleFetcherParams } from '@alfalab/scripts-modules';

const params = getServerStateModuleFetcherParams(); // { method: 'POST', relativePath: '/api/getModuleResources' }
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
            {loadingState === 'pending' && <div>Загрузка...</div>}
            {loadingState === 'rejected' && <div>Ошибка загрузки</div>}
            {loadingState === 'fulfilled' && <div>Модуль загружен</div>}
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
        useShadowDom: false, // опциональный флаг, если true - внутри targetElementRef будет создан shadowRoot, и модуль будет монтироваться туда
    });

    return (
        <div>
            {loadingState === 'pending' && <div>Загрузка...</div>}
            {loadingState === 'rejected' && <div>Ошибка загрузки</div>}

            <div ref={ targetElementRef } />
        </div>
    );
}
```

### `useModuleFactory`

React-хук, который позволяет использовать модули-фабрики в компонентах

```tsx
import { createClientLoader, useModuleFactory } from '@alfalab/scripts-modules';

const loader = createModuleLoader({ ... });

const MyApp = () => {
    const {
        loadingState, // состояние загрузки модуля, 'unknown' | 'pending' | 'fulfilled' | 'rejected'
        module, // Результат выполнения фабрики
    } = useModuleFactory({
        loader, // загручик модуля, полученный с помощью createModuleLoader
        loaderParams: {}, // опциональные параметры, которые будут переданы в getModuleResources
        runParams: {}, // опциональные параметры, которые будут переданы в модуль при инициализации
        getFactoryParams: (serverState) => serverState, // опциональная функция, которая позволяет модифицировать серверное состояние модуля
    });

    return (
        <div>
            {loadingState === 'pending' && <div>Загрузка...</div>}
            {loadingState === 'rejected' && <div>Ошибка загрузки</div>}

            {loadingState === 'fulfilled' && <pre>{JSON.stringify(module)}</pre>}
        </div>
    );
}
```

### executeModuleFactory

Хелпер, позволяющий "выполнить" модуль-фабрику, полезен при использовании фабрик вне реакт-компонентов

```ts
import { createModuleLoader, executeModuleFactory } from '@alfalab/scripts-modules';

const loader = createModuleLoader({...});

async function mySuperMethod() {
    const result = await loader();

    const executionResult = executeModuleFactory(
        result.module,
        result.moduleResources.moduleState,
        {}, // опциональные run-параметры модуля
    );

    console.log(executionResult); // Тут будет то, что возвращает модуль-фабрика
}

```

### `createLazyMounter`

Возвращает функцию-загрузчик, которую можно использовать совместно с `React.lazy` и `React.Suspense`.
Модули, примонтированные таким образом будут загружаться **только один раз**, их ресурсы не будут удаляться из DOM.
Под серверным рендерингом `createLazyMounter` не запускает загрузчик и рендерит пустой outlet.
Для SSR модулей используйте [`createSsrMounter`](#createSsrMounter).

```tsx
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import {
    createLazyMounter,
    createModuleLoader,
    MountableModule,
} from '@alfalab/scripts-modules';

type ModuleRunParams = {
    username: string;
};

const loader = createModuleLoader<MountableModule<ModuleRunParams>>({
    // ...
});
const LazyModule = React.lazy(createLazyMounter({ loader }));

const MyApp = () => (
    <ErrorBoundary fallback={ <div>Ошибка!</div> }>
        <React.Suspense fallback={ <div>Загрузка...</div> }>
            <LazyModule
                username="Unknown" // props определяется по ModuleRunParams
            />
        </React.Suspense>
    </ErrorBoundary>
);
```

### `createSsrMounter`

Изоморфная фабрика для серверного рендеринга монтируемых модулей. На сервере компонент
запрашивает ресурсы модуля с флагом `ssr`, вставляет HTML модуля в ответ хоста и сериализует
payload ресурсов в `<script type="application/json">`. На клиенте этот payload используется
вместо повторного `getModuleResources` запроса, после загрузки скриптов вызывается `hydrate`
модуля или обычный `mount`, если `hydrate` не экспортирован.

SSR поддерживается только для `MountableModule`. Абстрактные и factory-модули, а также
`useShadowDom: true`, остаются client-side сценариями.

```tsx
import React, { Suspense } from 'react';

import { createServerStateModuleFetcher } from '@alfalab/scripts-modules';
import { createSsrMounter } from '@alfalab/scripts-modules/ssr';

type RunParams = {
    name: string;
    counter: number;
    onClick?: () => void;
};

type SsrRunParams = {
    name: string;
    counter: number;
};

const { ModuleComponent } = createSsrMounter<RunParams, SsrRunParams>({
    hostAppId: 'my-app',
    moduleId: 'ServerStateModule',
    getModuleResources: createServerStateModuleFetcher({
        baseUrl: 'http://localhost:8082',
    }),
});

export const Page = () => {
    const ssrRunParams = { name: 'Vasia', counter: 1 };

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <ModuleComponent
                instanceId='server-state-main'
                ssrRunParams={ssrRunParams}
                runParams={{
                    ...ssrRunParams,
                    onClick: () => console.log('client-only param'),
                }}
            />
        </Suspense>
    );
};
```

`ssrRunParams` должны быть JSON-сериализуемыми. В них передаётся только то, от чего зависит
серверная разметка модуля. Клиентские значения вроде callback, ref или DOM-объектов передаются
только в `runParams` и доступны модулю на этапе `hydrate`/`mount`/`update`. Если один и тот же
модуль рендерится на странице несколько раз, передавайте стабильный `instanceId`.

Поведение при гидрации:

| HTML от сервера | У модуля есть `hydrate` | Результат |
| --- | --- | --- |
| да | да | стили переиспользуются, скрипты загружаются, вызывается `hydrate()` |
| да | нет | стили переиспользуются, outlet очищается, вызывается `mount()` |
| нет, есть payload | не важно | ресурсы берутся из payload, вызывается `mount()` |
| нет payload | не важно | обычная клиентская загрузка с сетевым `getModuleResources` |

Стили SSR-модуля в текущей версии инлайнятся в HTML хоста как `<style>` рядом с разметкой
модуля. Это устраняет FOUC при React 18 streaming: Suspense-boundary раскрывается вместе с
готовыми стилями. Режим `<link rel="stylesheet">` запланирован как follow-up; клиентская логика
уже умеет переиспользовать серверные `<style>` и `<link>` теги, помеченные SSR-атрибутами.

Для автора модуля миграция состоит из трёх шагов:

1. В серверном описании модуля добавить `renderToHtml`, который рендерит тот же React-компонент
   через `renderToString` и получает готовый `moduleState` плюс `ssrRunParams`.
2. В клиентском экспорте монтируемого модуля добавить `hydrate(targetNode, runParams, serverState)`
   и вызвать внутри `hydrateRoot`.
3. Добавить `update(targetNode, runParams, serverState)`, если модуль должен обновлять
   `runParams` без полного размонтирования.

Пример серверного описания:

```tsx
import React from 'react';
import { renderToString } from 'react-dom/server';

import { createGetModulesExpress } from '@alfalab/scripts-server/build/express';

import { ServerStateModule } from './modules/server-state-module';

const moduleRouter = createGetModulesExpress({
    ServerStateModule: {
        mountMode: 'default',
        version: '1.0.0',
        getModuleState: async () => ({
            baseUrl: 'http://localhost:8082',
            paramFromServer: 'server data',
        }),
        renderToHtml: async ({ moduleState, ssrRunParams }) =>
            renderToString(
                <ServerStateModule
                    serverState={moduleState}
                    runParams={(ssrRunParams ?? {}) as Record<string, unknown>}
                />,
            ),
    },
});
```
