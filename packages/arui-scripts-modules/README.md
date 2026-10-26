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
- [`createReactModule`, `useModuleReady`](#react-хелпер-модуля)

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
    allowLocalOverride: false, // опциональный флаг, включающий локальный оверрайд адреса модуля через localStorage (см. ниже)
});
```

#### Локальный оверрайд модулей

При `allowLocalOverride: true` в `createModuleFetcher` или
`createServerStateModuleFetcher` фетчер читает из `localStorage` переопределения
базового адреса приложения-источника для конкретных модулей. Это удобно для отладки:
можно указать адрес локального dev-сервера модуля в уже задеплоенном приложении и
перезагрузить страницу.

Ключ: `arui-scripts-module-overrides` (константа `LOCAL_OVERRIDE_STORAGE_KEY`).
Значение — JSON-объект, где ключ — `moduleId`, значение — базовый адрес:

```js
localStorage.setItem(
    'arui-scripts-module-overrides',
    JSON.stringify({ 'module-A': 'http://localhost:8080' }),
);
```

`createModuleFetcher` загружает с переопределённого адреса манифест и ресурсы,
а `createServerStateModuleFetcher` отправляет на него запрос получения ресурсов.
Некорректные значения игнорируются. Включайте флаг только на тестовых стендах: в
production это позволяет подменить код модуля произвольным адресом.

### `createServerStateModuleFetcher`
Функция, которая создает функцию `getModuleResources` для загрузки серверных модулей.

```ts
import { createServerStateModuleFetcher } from '@alfalab/scripts-modules';

const getModuleResources = createServerStateModuleFetcher({
    baseUrl: '', // Базовый адрес приложения, которое предоставляет модули. Может быть как относительным, так и абсолютным.
    headers: {}, // опциональный параметр для передачи дополнительных заголовков в запрос
    allowLocalOverride: false, // опциональный флаг, включающий локальный оверрайд адреса модуля через localStorage (см. выше)
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

Серверный рендеринг модулей использует per-request кэш ресурсов. На сервере оберните дерево
в `ModuleSsrRequestProvider` и передайте ему уникальный `requestId` на каждый HTTP-запрос
(например, `crypto.randomUUID()`):

```tsx
import { ModuleSsrRequestProvider } from '@alfalab/scripts-modules/ssr';

// внутри обработчика запроса хоста:
const requestId = crypto.randomUUID();

renderToPipeableStream(
    <AppHtml>
        <ModuleSsrRequestProvider requestId={requestId}>
            <App />
        </ModuleSsrRequestProvider>
    </AppHtml>,
    ...
);
```

`requestId` должен быть стабильным в рамках одного запроса (генерируйте его один раз на запрос,
а не внутри рендера) и уникальным между запросами — иначе кэш переживёт границу запросов и
`moduleState` одного запроса может попасть в другой. Если на сервере SSR-модуль рендерится без
провайдера, рендер упадёт с понятной ошибкой. На клиенте провайдер не нужен (он не рендерит DOM
и не влияет на гидрацию).

Поведение при гидрации:

| HTML от сервера | У модуля есть `hydrate` | Результат |
| --- | --- | --- |
| да | да | стили переиспользуются, скрипты загружаются, вызывается `hydrate()` |
| да | нет | стили переиспользуются, outlet очищается, вызывается `mount()` |
| нет, есть payload | не важно | ресурсы берутся из payload, вызывается `mount()` |
| нет payload | не важно | обычная клиентская загрузка с сетевым `getModuleResources` |

По умолчанию стили SSR-модуля инлайнятся в HTML хоста как `<style>` рядом с разметкой
модуля. Это устраняет FOUC при React 18 streaming: Suspense-boundary раскрывается вместе с
готовыми стилями.

Если хосту важнее меньший HTML и browser cache для CSS, можно включить link-режим:

```tsx
const { ModuleComponent } = createSsrMounter({
    moduleId: 'ServerStateModule',
    hostAppId: 'host',
    getModuleResources,
    stylesMode: 'link',
});
```

В этом режиме сервер отдаёт `<link rel="stylesheet" type="text/css">` с SSR-атрибутами.
Клиент переиспользует эти теги и не добавляет дубликаты. На React 18 Suspense-boundary может
раскрыться до окончания загрузки CSS, поэтому `inline` остаётся значением по умолчанию.

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

### Готовность и ошибки экземпляра модуля

`useModuleMounter`, `createLazyMounter` и клиентская часть `createSsrMounter` передают
в `mount`, `hydrate`, `update` опциональный четвёртый аргумент `ModuleLifecycleContext`:

```ts
import { type ModuleLifecycleContext, type MountableModule } from '@alfalab/scripts-modules';

const module: MountableModule<RunParams> = {
    readiness: 'explicit',
    mount(target, runParams, serverState, context?: ModuleLifecycleContext) {
        startApplication(target, runParams, serverState, {
            signal: context?.signal,
            onReady: () => context?.reportReady(),
            onFatalError: (error: unknown) => context?.reportError(error),
        });
    },
    unmount(target) {
        stopApplication(target);
    },
};

export default module;
```

`startApplication` / `stopApplication` в примере — функции самого модуля. Они должны
освобождать частично созданное приложение при `unmount` и прекращать работу при отмене.
Контекст может отсутствовать при запуске в старом хосте; реализация модуля должна
это допускать. Старые модули с тремя аргументами работают без изменений.

Без `readiness` mounter сообщает готовность после успешного завершения `mount` или
`hydrate`. Методы могут возвращать `void` либо `Promise<void>`; Promise ожидается.
Это означает завершение lifecycle-метода, а не завершение React-рендера.
При `readiness: 'explicit'` дополнительно ожидается `context.reportReady()`.
Ранний сигнал внутри метода запоминается, но ошибка метода отменяет готовность.
Повторные сигналы игнорируются. `update` получает тот же контекст и не сбрасывает готовность.

На хосте callbacks относятся к отдельному смонтированному экземпляру:

```tsx
<ModuleComponent
    runParams={runParams}
    onReady={() => setInitialized(true)}
    onError={({ error, stage }) => {
        setFailed(true);
        reportError(error, { stage });
    }}
    readyTimeoutMs={10_000}
/>
```

У `useModuleMounter` эти же параметры передаются в объект аргументов хука; его
`loadingState` остаётся `pending` до готовности и становится `rejected` при фатальной
ошибке, включая runtime-ошибку после готовности. У `createLazyMounter` callbacks и
таймаут передаются в настройки фабрики рядом с `loader`; props возвращённого
компонента по-прежнему целиком принадлежат `runParams` модуля. Для нескольких lazy
экземпляров используются общие callbacks фабрики, но независимые контексты и таймеры.
SSR вызывает эти callbacks только на клиенте; серверные ошибки обрабатываются
существующим серверным механизмом рендеринга.

`readyTimeoutMs` по умолчанию отключён. Положительное конечное значение включает
таймаут только для `readiness: 'explicit'`, начиная с вызова `mount` / `hydrate`.
Загрузка ресурсов в этот интервал не входит. Готовность, ошибка и размонтирование
отменяют таймер. Ошибка таймаута имеет этап `ready-timeout`.

`onError` получает `{ error, stage }`, где `stage` — `fetch-manifest`, `fetch-resources`,
`resolve-export`, `mount`, `hydrate`, `update`, `runtime`, `ready-timeout` или `unmount`.
Синхронные исключения и отклонённые Promise из lifecycle-методов обрабатываются
одинаково. Обновления выполняются последовательно; пока метод выполняется, сохраняются
последние параметры следующего обновления. После фатальной ошибки новые обновления
прекращаются, signal отменяется, экземпляр и его ресурсы освобождаются.
Очистка выполняется один раз, даже после частичного неудачного монтирования.
Ошибка очистки сообщается отдельно с этапом `unmount`, сохраняя исходную ошибку.
При отсутствии `onError` ошибка выводится в консоль.

После cleanup запоздалые сигналы контекста и завершения lifecycle Promise игнорируются.
Модуль должен сам учитывать `signal`: mounter не может остановить произвольную
асинхронную работу или предотвратить её последующие изменения DOM.

Ошибки внутри отдельного React root автоматически не перехватываются. Модуль должен
связать свой Error Boundary с `context.reportError`; ошибки фоновых операций тоже
нужно передавать явно.

Loader hooks сохраняются для мониторинга. `onAfterModuleMount` означает получение
экспорта, а не готовность UI. При прямом вызове методов результата loader без mounter
управление контекстом остаётся у вызывающего кода. Собственный `Loader` может вызвать
`params.onLoadError?.('fetch-manifest')` (либо `fetch-resources` / `resolve-export`)
перед отклонением Promise, чтобы сообщить mounter-у этап исходной ошибки. Если этап
не сообщён, используется `resolve-export`.


### React-хелпер модуля

`@alfalab/scripts-modules/react` предоставляет `createReactModule` и `useModuleReady`.
Для этой точки входа нужны согласованные версии React и ReactDOM 18+.
`react-dom` — опциональная peer-зависимость: основной импорт пакета её не загружает.

Минимальная входная точка React-модуля:

```tsx
import { createReactModule, type ReactModuleProps } from '@alfalab/scripts-modules/react';

function App({ runParams, serverState }: ReactModuleProps<{ title: string }>) {
    return <h1>{runParams.title}: {serverState.hostAppId}</h1>;
}

export default createReactModule({ Component: App });
```

Результат — обычный `MountableModule` с `mount`, `hydrate`, `update`, `unmount`.
Компонент получает `runParams` и `serverState`; их типы выводятся из его props.
Можно указать собственный тип серверного состояния вторым параметром `ReactModuleProps`.
Каждый контейнер получает отдельный React root. Update сохраняет состояние компонентов;
unmount безопасно вызывать повторно. Провайдеры приложения размещаются внутри App.

По умолчанию готовность автоматическая: хелпер сообщает её после первого успешного
commit. Возврат из `root.render` ещё не считается готовностью. Если первый commit
показывает Suspense fallback или загрузочный экран, автоматическая готовность всё равно
наступает. Для бизнес-готовности используется явный режим:

```tsx
import { createReactModule, useModuleReady } from '@alfalab/scripts-modules/react';

function App() {
    const account = useAccount();
    useModuleReady(account.status === 'success');

    return <AccountScreen account={account} />;
}

export default createReactModule({ Component: App, readiness: 'explicit' });
```

`useAccount` и `AccountScreen` в примере принадлежат приложению. `useModuleReady(condition)`
отправляет сигнал в эффекте после commit с истинным условием; по умолчанию condition
равен true. Готовность одноразовая для запуска: изменение condition обратно в false
или update не сбрасывают её. Если хук вызван несколькими компонентами, достаточно
первого истинного сигнала. Несколько обязательных условий нужно объединить самостоятельно.
В режиме auto хук не меняет автоматическую семантику.

Внутри адаптера оба режима используют `readiness: 'explicit'` контракта модуля:
mounter ожидает сигнал от React. Поэтому заданный хостом `readyTimeoutMs` применяется
к ожиданию готовности хелпера в обоих режимах. Без внешнего lifecycle context модуль
рендерится, но не отправляет уведомления хосту. Хук вне Provider хелпера ничего не
делает, что позволяет отдельно рендерить App в Storybook или на сервере.

Внутренний Error Boundary сообщает фатальные ошибки рендера и React-эффектов через
`context.reportError`. Хост получает этап `runtime` и управляет fallback. Boundary
возвращает null после ошибки; готовность этого запуска больше не сообщается.
Без контекста ошибка выводится в консоль. Обработчики событий и фоновые Promise
Boundary автоматически не перехватывает. Для их интеграции нужен явный вызов
`reportError` через обычный lifecycle context, например в собственной обёртке адаптера.
Восстановимые ошибки гидрации сохраняют стандартное поведение React.

Хелпер гидрирует серверную разметку через hydrateRoot. Сервер продолжает рендерить
обычный App без внутренних обёрток адаптера; серверный render API хелпер не добавляет.
Импорт и вызов фабрики безопасны без DOM, сами lifecycle-методы предназначены для клиента.
Повторный mount/hydrate в активный контейнер и update до запуска выбрасывают ошибку.
Очистка React root откладывается до микрозадачи, чтобы хост мог вызывать unmount во
время собственного commit. Повторный запуск в том же контейнере до этой очистки
сохраняет root, но создаёт новое дерево приложения с новым состоянием.
