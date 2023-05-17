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
- `mf` -  Это модули, которые подключаются с помощью [webpack module federation](https://webpack.js.org/concepts/module-federation/).
- `embedded` - Это модули, которые подключаются просто добавлением нужных скриптов на страницу.

Основная проблема, которую решает ModuleFederation - это возможность не загружать на хост-приложение код библиотек уже подключенных в него.
Например, хост-приложение уже использует `react`, модуль так же написан на `react`. ModuleFederation дает нам легко "переиспользовать"
уже загруженный в браузер код `react` в модуле, не загружая его еще раз.

### Сравнение

`mf` модули:
- **+++** Простой способ для переиспользования библиотек между модулем и приложением-хостом.
- **+++** Возможность использовать разные версии общих библиотек в разных модулях/хостах (речь про те библиотеки, которые будут шарится).
- **---** Нет встроенной изоляции стилей. Стили модуля будут применены к хост-приложению.
- **---** Нет возможности использовать модуль в приложении, которое не использует webpack.

Проблема изоляции стилей может быть решена с помощью [shadow dom](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM),
или с помощью css modules. Но это накладывает некоторые ограничения либо на поддерживаемые браузеры (shadow dom), либо на
существующую кодовую базу (css modules должны использоваться везде, если у вас будет две версии arui-feather на странице - будет не очень приятно).

`embedded` модули:
- **+++** Встроенная изоляция стилей. Стили модуля не будут применены к хост-приложению, если только вы не захотите этого.
- **---** Нет возможности использовать разные версии общих библиотек в разных модулях/хостах, если вы хотите их шарить.

## Возможность управления модулями с сервера
Сами модули используются только на клиентской части приложения. Но, в некоторых случаях, может быть полезно иметь возможность
управлять тем, какой модуль должен быть подключен на странице с сервера, или же иметь модуль, который будет при загрузке
иметь доступ к данным, доступным только на сервере (аналогично тому, как мы передаем серверный стейт в приложения при SSR).

Поэтому `arui-scripts` предоставляет возможность создать специальный эндпоинт на вашем сервере, из которого вы сможете управлять
состоянием модуля.

Модули с такой возможностью мы называем _серверными модулями_ (обычные модули мы называем _клиентскими_).

## Особые типы модулей
Несмотря на то, что сами по себе модули представляют собой простой js-объект, мы определяем один особый тип модулей - _монтируемые модули_.

### Монтируемые модули
Монтируемые модули - это модули, основное предназначение которых - отрендерить какой-то компонент внутри хост-приложения.
Монтируемые модули могут быть как клиентскими, так и серверными.

Такие модули должны экспортировать две функции:

```tsx
export function mount(targetNode, runParams, serverState): void {
    // здесь происходит монтирование модуля в хост-приложение
    // targetNode - это DOM-нода, в которую нужно отрендерить модуль
    // runParams - это параметры, которые были переданы при запуске модуля
    // serverState - это состояние, которое было передано с сервера

    // Скорее всего это будет что-то вроде:
    ReactDOM.render(<App preparedState={serverState} runParams={runParams} />, targetNode);
}

export function unmount(targetNode): void {
    // здесь происходит демонтирование модуля из хост-приложения
    // Скорее всего это будет что-то вроде:
    ReactDOM.unmountComponentAtNode(targetNode);
}
```

## Как создать модуль

### Описать модуль в настройках arui-scripts
Для того чтобы ваше приложение начало предоставлять модули, вам необходимо добавить настройки в `arui-scripts.config.ts`:

```ts
import { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    embeddedModules: {
        exposes: {
            'ClientModuleEmbedded': {
                entry: './src/modules/client-module-embedded/index',
            },
            'ServerModuleEmbedded': {
                entry: './src/modules/server-module-embedded/index',
                // этот модуль будет ожидать на странице глобальные переменные react и reactDOM,
                // он будет использовать их вместо библиотек из своего node_modules
                embeddedConfig: {
                    react: 'react',
                    'react-dom': 'reactDOM',
                }
            }
        }
    },
    mfModules: {
        // MF модули тут смогут переиспользовать react и react-dom из хост-приложения,
        // если хост приложение шарит эти библиотеки, и они совпадают по версии
        shared: {
            'react': '^17.0.0',
            'react-dom': '^17.0.0',
        },
        exposes: {
            'ClientModuleMF': './src/modules/client-module-mf/index',
            'ServerModuleMF': './src/modules/server-module-mf/index',
        }
    }
}

export default aruiScriptsConfig;
```

Все параметры конфигурации описаны [ниже](#Конфигурация-модулей).

### Создать модуль
Модуль является простым js/ts файлом. Он может использовать любой код вашего проекта, и любые библиотеки из node_modules.

В зависимости от режима подключения модуля, входная точка будет выглядеть по разному.

#### Embedded модуль
Входная точка embedded модуля должна писать в глобальную переменную `window` объект с ключом `{НазваниеМодуля}`.
Все поля этого объекта по сути и будут являться модулем, ваши потребители смогут использовать их.

```ts
// src/modules/client-module-embedded/index.ts

window.ClientModuleEmbedded = {
    doSomething: () => {
        console.log('Hello from embedded module!');
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

#### MF модуль
Входная точка MF модуля должна экспортировать все поля модуля через `export`.

```ts
// src/modules/client-module-mf/index.ts

export const doSomething = () => {
    console.log('Hello from mf module!');
};

export const publicConstant = 3.14;
```

#### Создание модулей предопределенного типа

**Монтируемый модуль, mf**

```ts
// src/modules/client-module-mf/index.ts

```

### (Опционально) Определить серверный эндпоинт для модуля
Если вы хотите, чтобы ваш модуль имел серверную часть, которая сможет подготовить данные для модуля, то вам необходимо
определить серверный эндпоинт для модуля. Для этого вам нужно определить объект, описывающий ваши модули:

```ts
import type { ModulesConfig } from '@alfalab/scripts-server';

const modules: ModulesConfig = {
    'ServerModuleEmbedded': {
        mountMode: 'embedded',
        version: '1.0.0',
        getRunParams: async (getResourcesRequest) => ({
            // getResouresRequest - это объект, который будет передан из хост-приложения

            // данные, которые вернет эта будут доступны при инициализации модуля
            paramFromServer: 'This can be any data from server',
            asyncData: 'It can be constructed from async data, so you may perform some service calls here',
            contextRoot: 'http://localhost:8081',
        }),
    },
    'ServerModuleMF': {
        mountMode: 'mf',
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

#### Embedded модули
В случае с embedded модулями, стили модуля будут применены только к элементам, которые находятся внутри элемента
с классом `module-{имя модуля}`. Это позволяет изолировать стили модуля от стилей хост-приложения.

Вашей ответственностью будет добавить к рут-элементу модуля класс .module-nameOfModule. Вы должны сделать это в самом верхнем компоненте/элементе вашего модуля.

Вы можете переопределить префикс для css классов модуля, в `arui-scripts.config.ts`, подробнее в [конфигурации модулей](#Конфигурация-модулей).

Если ваше react-приложение использует порталы, вам так же надо не забыть добавить префикс к элементу-порталу.

#### MF модули
Никакого встроенного механизма изоляции стилей для MF модулей нет. Если хост-приложение и модуль используют css-modules,
то конфликтов возникнуть не должно. Если же это не так - вы можете попробовать решить эту проблему используя shadow-dom.

### TODO: тестирование модулей

# Подключение модулей

## Создание загрузчика
Базовый способ подключение модулей - это использование `createModuleLoader` из `@alfalab/scripts-modules`. Этот метод
вернет вам функцию, которая позволит подключить модуль в ваше приложение.

```ts
import { createModuleLoader } from '@alfalab/scripts-modules';

const loader = createModuleLoader({
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
});
```

Вам вовсе не обязательно руками описывать функцию `getModuleResources`. В зависимости от типа модуля, вы можете
использовать один из готовых хелперов:

Для клиентских модулей:
```ts
import { createModuleLoader, createClientResourcesFetcher } from '@alfalab/scripts-modules';

const loader = createModuleLoader({
    moduleId: 'test',
    getModuleResources: createClientResourcesFetcher({
        baseUrl: 'http://localhost:8081',
        mountMode: 'mf',
    }),
});
```

`createClientResourcesFetcher` сам сделает запрос за манифестом приложения, и правильным образом сформирует описание модуля.

Для серверных модулей:
```ts
import { createModuleLoader, createServerResourcesFetcher } from '@alfalab/scripts-modules';

const loader = createModuleLoader({
    moduleId: 'test',
    getModuleResources: createServerResourcesFetcher({
        baseUrl: 'http://localhost:8081',
        headers: { 'X-Auth': 'bla-bla' } // опционально вы можете передать дополнительные заголовки для запроса
    }),
});
```

`createServerResourcesFetcher` сам сделает запрос к ручке, которая отдает описание модуля.

В случае же совсем кастомных требований, вы можете реализовать функцию `getModuleResources` самостоятельно.

## Использование загрузчика
После того как вы создали `loader` - вы легко можете получить доступ к модулю:

```ts
const { module, unmount, moduleResources } = await loader({
    getResourcesParams: {}, // параметры, которые будут переданы в getModuleResources
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
    hostAppId: 'hostAppId', // id вашего приложения
    params: {}, // параметры, которые вы передали в loader как `getResourcesParams`
}
```

На сервер будут отправлены именно эти параметры, они будут доступны как параметр в `getRunParams` в описании вашего модуля.

При использовании клиентских модулей, вам не нужно беспокоиться о том, какие параметры вы передаете в `getModuleResources` - они
никак не используются в клиентских модулях.

## Использования загрузчика в реакт-приложении

Для того чтобы упростить работу с загрузчиком в реакт-приложении, мы предоставляем хук `useModuleLoader`:

```tsx
import { createModuleLoader, useModuleLoader } from '@alfalab/scripts-modules';

const loader = createModuleLoader({
    moduleId: 'test',
    getModuleResources: createClientResourcesFetcher({
        baseUrl: 'http://localhost:8081',
        mountMode: 'mf',
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
import { createModuleLoader, useModuleMounter } from '@alfalab/scripts-modules';

const loader = createModuleLoader({
    moduleId: 'test',
    getModuleResources: createClientResourcesFetcher({
        baseUrl: 'http://localhost:8081',
        mountMode: 'embedded',
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
