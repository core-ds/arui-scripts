# Что такое модули
Модули приложений предназначены для решения простой проблемы - переиспользование фронтового кода между приложениями.

В целом, для того чтобы переиспользовать код у нас есть много разных способов, например:
- копировать код из одного приложения в другое. Быстро, но неудобно и неэффективно.
- выносить код в отдельный пакет и подключать его через npm. Понятный и достаточно удобный вариант,
  но ограничивает нас в скорости изменений. Если мы хотим заменить обновить код в пакете, процесс
  раскатки этого обновления на все приложения может занять много времени.
- Сделать так, чтобы мы могли подключать код из других приложений в свое. При этом мы получаем
  возможность быстро изменить общий код только в одном месте, а все приложения автоматически получат
  обновления.

Модули позволяют реализовать именно последний вариант. Если вы знакомы с концепцией [module federation](https://webpack.js.org/concepts/module-federation/),
то модули приложений - это его реализация в рамках arui-scripts, с дополнительным уровнем абстракции, который, в том числе,
позволяет использовать модули без самого module-federation.

## Общие принципы работы модулей
С точки зрения кода модуль представляет собой простой js-объект, который может быть _каким то образом_ подключен в другое приложение.

`arui-scripts` предоставляет решение для сборки таких модулей, а также отдельную библиотеку для упрощения их подключения в другие приложения.

## Режимы подключения модулей

В `arui-scripts` есть два способа сборки модулей:
- `default` -  Это стандартные модули, которые подключаются с помощью [webpack module federation](https://webpack.js.org/concepts/module-federation/).
- `compat` - Это модули, которые подключаются просто добавлением нужных скриптов на страницу.

Основная проблема, которую решает ModuleFederation - это возможность не загружать на хост-приложение код библиотек уже подключенных в него.
Например, хост-приложение уже использует `react`, модуль так же написан на `react`. ModuleFederation дает нам легко "переиспользовать"
уже загруженный в браузер код `react` в модуле, не загружая его еще раз.

### Сравнение

`default` модули:
- **+++** Простой способ для переиспользования библиотек между модулем и приложением-хостом.
- **+++** Возможность использовать разные версии общих библиотек в разных модулях/хостах (речь про те библиотеки, которые будут шарится).
- **---** Нет встроенной изоляции стилей. Стили модуля будут применены к хост-приложению.
- **---** Нет возможности использовать модуль в приложении, которое не использует webpack.

Проблема изоляции стилей может быть решена с помощью [shadow dom](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM),
или с помощью css modules. Но это накладывает некоторые ограничения либо на поддерживаемые браузеры (shadow dom), либо на
существующую кодовую базу (css modules должны использоваться везде, если у вас будет две версии arui-feather на странице - будет не очень приятно).

`compat` модули:
- **+++** Встроенная изоляция стилей. Стили модуля не будут применены к хост-приложению, если только вы не захотите этого.
- **---** Нет возможности использовать разные версии общих библиотек в разных модулях/хостах, если вы хотите их шарить.

*Как понять какой режим использовать?*
В целом, если ваше приложение и модули используют только css-modules, то можно использовать `default` режим. Конфликты в стилях
вам в таком случае не грозят. Если же вы используете обычный css, или ваши библиотеки используют обычный css, то лучше
использовать `compat` режим.

## Возможность управления модулями с сервера
Сами модули используются только на клиентской части приложения. Но, в некоторых случаях, может быть полезно иметь возможность
управлять тем, какой модуль должен быть подключен на странице с сервера, или же иметь модуль, который будет при загрузке
иметь доступ к данным, доступным только на сервере (аналогично тому, как мы передаем серверный стейт в приложения при SSR).

Поэтому `arui-scripts` предоставляет возможность создать специальный эндпоинт на вашем сервере, из которого вы сможете управлять
состоянием модуля.

Модули с такой возможностью мы называем _модулями с серверным состоянием_ (_server state_).

## Особые типы модулей
Несмотря на то, что сами по себе модули представляют собой простой js-объект, мы определяем один особый тип модулей - _монтируемые модули_.

### Монтируемые модули
Монтируемые модули - это модули, основное предназначение которых - отрендерить какой-то компонент внутри хост-приложения.
Монтируемые модули могут быть как клиентскими, так и серверными.

Такие модули должны экспортировать две функции:

```tsx
import { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';
export const mount: ModuleMountFunction = (targetNode, runParams, serverState) => {
    // здесь происходит монтирование модуля в хост-приложение
    // targetNode - это DOM-нода, в которую нужно отрендерить модуль
    // runParams - это параметры, которые были переданы при запуске модуля
    // serverState - это состояние, которое было передано с сервера

    // Скорее всего это будет что-то вроде:
    ReactDOM.render(<App preparedState={serverState} runParams={runParams} />, targetNode);
}

export const unmount: ModuleUnmountFunction = (targetNode) => {
    // здесь происходит демонтирование модуля из хост-приложения
    // Скорее всего это будет что-то вроде:
    ReactDOM.unmountComponentAtNode(targetNode);
}
```

### Модули-фабрики
Модули-фабрики - это модули, которые поставляют фабрики, которые в свою очередь вызываются в рантайме со стейтом (клиентским или серверным, в зависимости от типа поставляемого модуля).

Такие модули должны экспортировать фабрику:

Для mf(default) модулей:

```tsx
import type { FactoryModule } from '@alfalab/scripts-modules';

const factory: FactoryModule = function (runParams, serverState) {
    // serverState - это состояние, которое подготовлено на сервере модуля
    // runParams - это параметры, которые были переданы при запуске модуля клиентом
    // в фабрике можно на основе стейта вернуть готовый модуль
    return {
        serverState,
        doSomething: () => {
            fetch(serverState.baseUrl + '/api/getData')
        }
    };
}

export default factory;
// или export { factory };
```

для compat модулей:
```ts
import type { FactoryModule } from '@alfalab/scripts-modules';

const factory: FactoryModule = function (runParams, serverState) {
    // в фабрике можно на основе стейта вернуть готовый модуль
    return {
        serverState,
        doSomething: () => {
            fetch(serverState.baseUrl + '/api/getData')
        }
    };
}

window.ModuleCompat = factory;
```

## Как создать модуль

### Описать модуль в настройках arui-scripts
Для того чтобы ваше приложение начало предоставлять модули, вам необходимо добавить настройки в `arui-scripts.config.ts`:

```ts
import { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    compatModules: {
        exposes: {
            'ClientModuleCompat': { // имя модуля, будет использоваться приложениями-потребителями
                entry: './src/modules/module-compat/index', // точка входа модуля
            },
            'ServerStateModuleCompat': {
                entry: './src/modules/server-state-module-compat/index',
                // этот модуль будет ожидать на странице глобальные переменные react и reactDOM,
                // он будет использовать их вместо библиотек из своего node_modules
                compatConfig: {
                    react: 'react',
                    'react-dom': 'reactDOM',
                }
            }
        }
    },
    modules: {
        // модули тут смогут переиспользовать react и react-dom из хост-приложения,
        // если хост приложение шарит эти библиотеки, и они совпадают по версии
        shared: {
            'react': '^17.0.0', // так же поддерживаются более сложные версии например { requiredVersion: '^17.0.0', singleton: true }
            'react-dom': '^17.0.0',
        },
        exposes: {
            'module': './src/modules/module/index',
            'ServerStateModule': './src/modules/server-state-module/index',
        }
    }
}

export default aruiScriptsConfig;
```

Все параметры конфигурации описаны [ниже](#Конфигурация-модулей).

### Создать модуль
Модуль является простым js/ts файлом. Он может использовать любой код вашего проекта, и любые библиотеки из node_modules.

В зависимости от режима подключения модуля, входная точка будет выглядеть по-разному.

#### Default модуль
Входная точка модуля должна экспортировать все поля модуля через `export`.

```ts
// src/modules/module/index.ts

export const doSomething = () => {
    console.log('Hello from module!');
};

export const publicConstant = 3.14;
```

#### Compat модуль
Входная точка compat модуля должна писать в глобальную переменную `window` объект с ключом `{НазваниеМодуля}`.
Все поля этого объекта по сути и будут являться модулем, ваши потребители смогут использовать их.

```ts
// src/modules/module-compat/index.ts

window.ModuleCompat = {
    doSomething: () => {
        console.log('Hello from compat module!');
    },
    publicConstant: 3.14,
    // ...
};
```

<details>
<summary>Писать в window? Вы что, с дуба рухнулись?</summary>
Да, конечно, это может создать определенные проблемы (конфликты имен модулей, определенные ограничения на используемые названия),
но по сути это единственный способ передать код модуля в хост-приложение.

Webpack module federation делает абсолютно то же самое, просто прячет работу с глобальными переменными за собой.
</details>

#### Создание модулей предопределенного типа

**Монтируемый модуль, default**

```tsx
// src/modules/module/index.ts

import React from 'react';
import ReactDOM from 'react-dom';
import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';
import { Module } from './Module';

export const mount: ModuleMountFunction<any, any> = (targetNode, runParams, serverState) => {
    console.log('Module: mount', { runParams, serverState });
    if (!targetNode) {
        throw new Error(`Target node is not defined for module`);
    }

    ReactDOM.render(<Module />, targetNode);
};
export const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('Module: unmount');
    if (!targetNode) {
        return;
    }

    ReactDOM.unmountComponentAtNode(targetNode);
};
```

**Монтируемый модуль, compat**

```tsx
// src/modules/module-compat/index.ts
import React from 'react';
import ReactDOM from 'react-dom';
import type { ModuleMountFunction, ModuleUnmountFunction, WindowWithMountableModule } from '@alfalab/scripts-modules';
import { ModuleCompat } from './ModuleCompat';

const mount: ModuleMountFunction<any, any> = (targetNode, runParams, serverState) => {
    console.log('ModuleCompat: mount', { runParams, serverState });
    ReactDOM.render(<ModuleCompat />, targetNode);
};
const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('ModuleCompat: unmount');

    ReactDOM.unmountComponentAtNode(targetNode);
};

(window as WindowWithMountableModule).ModuleCompat = {
    mount: mountModule,
    unmount: unmountModule,
};
```


### (Опционально) Определить серверный эндпоинт для модуля
Если вы хотите, чтобы ваш модуль имел серверную часть, которая сможет подготовить данные для модуля, то вам необходимо
определить серверный эндпоинт для модуля. Для этого вам нужно определить объект, описывающий ваши модули:

```ts
import type { ModulesConfig } from '@alfalab/scripts-server';

const modules: ModulesConfig = {
    'ServerStateModuleCompat': {
        mountMode: 'compat',
        version: '1.0.0',
        getRunParams: async (getResourcesRequest) => ({
            // getResouresRequest - это объект, который будет передан из хост-приложения

            // данные, которые вернет эта будут доступны при инициализации модуля
            paramFromServer: 'This can be any data from server',
            asyncData: 'It can be constructed from async data, so you may perform some service calls here',
            contextRoot: 'http://localhost:8081',
        }),
    },
    'ServerModule': {
        mountMode: 'default',
        version: '1.0.0',
        getRunParams: async () => ({
            paramFromServer: 'This can be any data from server',
            asyncData: 'It can be constructed from async data, so you may perform some service calls here',
            contextRoot: 'http://localhost:8081',
        }),
    },
};
```

Подробнее о `getResourcesRequest` и `getRunParams` рассказано в разделе [Подключение модулей](#Подключение-модулей).

Далее, в зависимости от того, какой серверный фреймворк вы используете, вам нужно будет подключить ваши модули в
соответствующий хендлер. Например, для express это будет выглядеть так:

```ts
import { createGetModulesExpress } from '@alfalab/scripts-server/build/express';

const modulesRouter = createGetModulesExpress(modules);

app.use(modulesRouter);
```

Для `hapi@16`:

```ts
import { createGetModulesHapi16Plugin } from '@alfalab/scripts-server/build/hapi16';

const modulesPlugin = createGetModulesHapi16Plugin(modules);

server.register(modulesPlugin);
```

Для `hapi@20`:

```ts
import { createGetModulesHapi20Plugin } from '@alfalab/scripts-server/build/hapi20';

const modulesPlugin = createGetModulesHapi20Plugin(modules);

server.register(modulesPlugin);
```

Если вы хотите использовать другой серверный фреймворк, вы можете использовать общий хелпер:

```ts
import { createGetModulesMethod } from '@alfalab/scripts-server';

const getModules = createGetModulesMethod(modules);

// getModules будет иметь следующую сигнатуру:
type ModulesMethod = {
    method: string; // http метод, который нужно использовать для обработки запроса
    path: string; // путь, который нужно использовать для обработки запроса
    handler: (request: GetResourcesRequest) => Promise<GetResourcesResponse>; // обработчик запроса
}

// далее в зависимости от фреймворка вы можете использовать этот метод
// для конфигурации вашего сервера
// вы можете посмотреть примеры реализации тких методов для express, hapi@16 и hapi@20.
```

### (Опционально) Разобраться с изоляцией стилей

#### Compat модули
В случае с compat модулями, стили модуля будут применены только к элементам, которые находятся внутри элемента
с классом `module-{имя модуля}`. Это позволяет изолировать стили модуля от стилей хост-приложения.

Вашей ответственностью будет добавить к рут-элементу модуля класс .module-nameOfModule. Вы должны сделать это в самом верхнем компоненте/элементе вашего модуля.

Вы можете переопределить префикс для css классов модуля, в `arui-scripts.config.ts`, подробнее в [конфигурации модулей](#Конфигурация-модулей).

Если ваше react-приложение использует порталы, вам так же надо не забыть добавить префикс к элементу-порталу.

**Важно** - изоляция стилей работает только в одном направлении - стили модуля не будут применены к элементам
хост-приложения. Но стили хост-приложения могут быть применены к элементам модуля.

#### Стандартные модули
Никакого встроенного механизма изоляции стилей для стандартных модулей нет. Если хост-приложение и модуль используют css-modules,
то конфликтов возникнуть не должно. Если же это не так - вы можете попробовать решить эту проблему используя shadow-dom.

### Тестирование модулей
Поскольку в общем случае модули представляют собой простой js код - для тестирования вы можете пользоваться любыми привычными вам инструментами.

Для тестирования модулей в cypress или playwright вы можете создать отдельный эндпоинт в вашем приложении, который будет
подключать модуль в ваше же приложение.


# Подключение модулей

## Создание загрузчика
Базовый способ подключение модулей - это использование `createModuleLoader` из `@alfalab/scripts-modules`. Этот метод
вернет вам функцию, которая позволит подключить модуль в ваше приложение.

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
});
```

Вам вовсе не обязательно руками описывать функцию `getModuleResources`. В зависимости от типа модуля, вы можете
использовать один из готовых хелперов:

Для модулей без серверного стейта:
```ts
import { createModuleLoader, createModuleFetcher } from '@alfalab/scripts-modules';

const loader = createModuleLoader({
    hostAppId: 'my-app',
    moduleId: 'test',
    getModuleResources: createModuleFetcher({
        baseUrl: 'http://localhost:8081',
    }),
});
```

`createModuleFetcher` сам сделает запрос за манифестом приложения, и правильным образом сформирует описание модуля.

Для модулей с серверным стейтом:
```ts
import { createModuleLoader, createServerStateModuleFetcher } from '@alfalab/scripts-modules';

const loader = createModuleLoader({
    hostAppId: 'my-app',
    moduleId: 'test',
    getModuleResources: createServerStateModuleFetcher({
        baseUrl: 'http://localhost:8081',
        headers: { 'X-Auth': 'bla-bla' } // опционально вы можете передать дополнительные заголовки для запроса
    }),
});
```

`createServerStateModuleFetcher` сам сделает запрос к ручке, которая отдает описание модуля.

В случае же совсем кастомных требований, вы можете реализовать функцию `getModuleResources` самостоятельно.

## Использование загрузчика
После того как вы создали `loader` - вы легко можете получить доступ к модулю:

```ts
const { module, unmount, moduleResources } = await loader({
    getResourcesParams: { foo: 'bar' }, // параметры, которые будут переданы в getModuleResources
});

console.log(module); // модуль, который вы загрузили. Тут будут доступны всё, что было экспортировано из модуля
console.log(moduleResources); // полный ответ от getModuleResources

// вызов этой функции отмонтирует модуль из вашего приложения - удалит скрипты и стили модуля, а так же удалит
// все глобальные переменные, которые были определены в модуле.
unmount();
```

При вызове `loader` вы можете передать параметры, которые попадут в функцию `getModuleResources`. Это может быть полезно,
если вы хотите передать какие-то параметры на сервер модуля.

`getModuleResources` будет вызвана со следующими параметрами:
```ts
const getModuleResourcesParams = {
    moduleId: 'test', // id модуля, который вы хотите подключить
    hostAppId: 'my-app', // id вашего приложения
    params: { foo: 'bar' }, // параметры, которые вы передали в loader как `getResourcesParams`
}
```

При использовании `createServerStateModuleFetcher` именно эти данные будут отправлены на сервер и будут доступны в функции `getRunParams` модуля.

При использовании `createModuleFetcher` вам не нужно беспокоиться о том, какие параметры вы передаете в `getModuleResources` - они
никак не используются в клиентских модулях.

## Использования загрузчика в реакт-приложении

Для того чтобы упростить работу с загрузчиком в реакт-приложении, мы предоставляем хук `useModuleLoader`:

```tsx
import { createModuleLoader, useModuleLoader, createModuleFetcher } from '@alfalab/scripts-modules';

const loader = createModuleLoader({
    moduleId: 'test',
    getModuleResources: createModuleFetcher({
        baseUrl: 'http://localhost:8081',
    }),
});

const MyComponent = () => {
    const { loadingState, module, resources } = useModuleLoader(loader); // вторым параметром можно передать параметры, которые будут переданы в getModuleResources

    return (
        <div>
            {loadingState === 'loading' && <div>Loading...</div>}
            {loadingState === 'error' && <div>Error</div>}
            {loadingState === 'success' && (
                <div>
                    <div>Module loaded</div>
                    <div>{module}</div> {/* модуль, который вы загрузили. Тут будет доступно всё, что было экспортировано из модуля */}
                    <div>{resources}</div>
                </div>
            )}
        </div>
    );
};
```

### Использование монтируемых модулей

Для работы с монтируемыми модулями так же есть готовый хук `useModuleMounter`:

```tsx
import { createModuleLoader, useModuleMounter, createModuleFetcher } from '@alfalab/scripts-modules';

const loader = createModuleLoader({
    moduleId: 'test',
    getModuleResources: createModuleFetcher({
        baseUrl: 'http://localhost:8081',
    }),
});

const MyComponent = () => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader,
        loaderParams: {}, // параметры, которые будут переданы в getModuleResources, опционально
        runParams: {}, // параметры, которые будут переданы в mount функцию модуля, опционально
    });

    return (
        <div>
            {loadingState === 'loading' && <div>Loading...</div>}
            {loadingState === 'error' && <div>Error</div>}
            <div ref={targetElementRef} /> {/* сюда будет монтироваться модуль */}
        </div>
    );
};
```

# Документация API

## Конфигурация модулей
Типы, которые используются для конфигурирования модулей в `arui-scripts.config.ts`:

### Modules
```ts
type Modules = {
    name?: string; // имя приложения, которое будет исползоваться как имя module federation контейнера. По-умолчанию будет использовано имя из package.json (оно будет преобразовано в snake-case)
    exposes?: { // модули, которые приложение будет предоставлять
        [moduleId: string]: string; // moduleId - id модуля, value - путь до точки входа модуля
    };
    shared?: (string | SharedObject)[] | SharedObject; // конфигурация shared параметра для ModuleFederationPlugin
};

type SharedObject = {
    [index: string]: string | SharedConfig;
};

type SharedConfig = {
    eager?: boolean; // включить модуль в сборку приложения
    import?: string | false; // путь до модуля, который будет предоставлен в share scope
    packageName?: string; // имя пакета, из которого будет взята версия модуля
    requiredVersion?: string | false; // версия модуля, которая будет использована для проверки версии модуля в share scope
    shareKey?: string; // ключ, по которому будет искаться модуль в share scope
    shareScope?: string; // имя share scope
    singleton?: boolean; // использовать только одну версию модуля в share scope
    strictVersion?: boolean; // использовать только версию модуля, которая указана в requiredVersion
    version?: string | false; // версия модуля, которая будет использована для проверки версии модуля в share scope
}
```

### CompatModules
```ts
type CompatModules = {
    shared?: { // библиотеки, которые будут доступны compat модулям при подключении в этом приложении
        [libraryName: string]: string; // libraryName - имя библиотеки, которое вы указали в package.json, value - название глобальной переменной, в которой будет доступна библиотека
    };
    exposes?: { // модули, которые приложение будет предоставлять
        [moduleId: string]: CompatModuleConfig;
    };
};

type CompatModuleConfig = {
    entry: string; // путь до точки входа модуля
    externals?: Record<string, string>; // список библиотек, которые модуль будет пытаться получить из приложения, в которое он будет встроен. Аналогично CompatModules.shared
    cssPrefix?: false | string; // опционально, префикс для css-классов модуля. По-умолчанию будет использовано имя модуля
};
```

## Конфигурация серверной части

### createGetModulesMethod
```ts
type ModulesConfig = {
    [moduleId: string]: {
        mountMode: 'compat' | 'default'; // режим монтирования модуля
        version?: string; // версия модуля, по умолчанию 'unknown'
        getModuleState: GetModuleStateMethod; // метод, который будет вызван для получения состояния модуля
    };
};

type GetModuleStateMethod = (
    getResourcesRequest: GetResourcesRequest,
) => Promise<any>;

type GetResourcesRequest<GetResourcesParams = void> = {
    moduleId: string; // id загружаемого модуля
    hostAppId: string; // id приложения-хоста
    params: GetResourcesParams; // параметры, которые передаются в функцию получения ресурсов модуля
};
```
