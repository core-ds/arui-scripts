# Модули приложений

## Мотивация
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


## Общие принципы
Модуль - это некоторая совокупность js и css файлов, которые можно подключить в приложение. У модуля есть
входная точка - js файл, код которого будет являться его публичным api.

Для подключения модулей в приложение предоставляется набор библиотек, которые позволяют указать, какой модуль
и куда надо подключить.

## Типы модулей
Несмотря на кажущуюся простоту концепции, можно представить разные сценарии использования модулей. В ряде случаев
мы хотим просто предоставить доступ к коду из другого приложения, в других - мы хотим иметь возможность
настраивать поведение модуля в зависимости от приложения, в котором он используется. Или мы хотим сделать так, чтобы
наш модуль мог сразу же получить какие-то данные с сервера, потому что его поведение зависит от этих данных.

Из-за того, что эти сценарии различаются, мы выделили два типа модулей:

- Клиентские модули. Это модули, которые имеют только клиентскую часть.
- Модули с серверной частью. Это модули, которые имеют как клиентскую, так и серверную часть. Серверная часть может
реализовывать какую-то логику, которая не может быть реализована на клиенте, например отдавать разные модули в зависимости
от пользователя, получать предподготовленные данные с сервера и т.д.

### Сравнение

Клиентские модули:
- Можно реализовать в любом приложении, даже если у него нет серверной части.
- Меньше кода, меньше проблем с поддержкой.
- Немного проще подключение модуля в приложение-хост.

Модули с серверной частью:
- Можно реализовать дополнительную логику, которая не может быть реализована на клиенте.
- Возможность изменить режим подключения модуля без изменений на приложениях-хостах.

## Режимы подключения модулей

Кроме того, модули делятся еще и по способу их подключения:
- `mf` модули. Это модули, которые подключаются с помощью [webpack module federation](https://webpack.js.org/concepts/module-federation/).
- `embedded` модули. Такие модули подключаются просто через добавление нужных скриптов на страницу приложения.

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
Модуль является простым js/ts файлом, который следует простой договоренности:

`embedded` модули должны писать в window свой объект, который содержит функции для монтирования и демонтирования модуля.

```tsx
import type { // Обратите внимание на `import type` - наш в модель никак не использует код библиотеки, нам нужны только типы
    ModuleMountFunction,
    ModuleUnmountFunction,
    WindowWithMountableModule
} from '@arui-scripts/modules';

const mountModule: ModuleMountFunction = (moduleId, params, targetNode) => {
    // здесь мы можем отрендерить наш модуль в targetNode
    // например:
    ReactDOM.render(<App />, targetNode);
};

const unmountModule: ModuleUnmountFunction = (targetNode) => {
    // здесь мы можем отключить наш модуль от targetNode
    // например:
    ReactDOM.unmountComponentAtNode(targetNode);
};


// ClientModuleEmbedded - имя модуля, которое мы указали в настройках arui-scripts
(window as WindowWithMountableModule).ClientModuleEmbedded = {
    mount: mountModule,
    unmount: unmountModule,
};
```

`mf` модули не должны ничего писать в window (на самом деле за них то же самое делает webpack). Они должны просто
экспортировать функции `mount` и `unmount`:

```tsx
import type { ModuleMountFunction, ModuleUnmountFunction } from '@arui-scripts/modules';

export const mount: ModuleMountFunction = (moduleId, params, targetNode) => {
    // здесь мы можем отрендерить наш модуль в targetNode
    // например:
    ReactDOM.render(<App />, targetNode);
};

export const unmount: ModuleUnmountFunction = (targetNode) => {
    // здесь мы можем отключить наш модуль от targetNode
    // например:
    ReactDOM.unmountComponentAtNode(targetNode);
};
```

### (Опционально) Определить серверный эндпоинт для модуля
Если вы хотите, чтобы ваш модуль имел серверную часть, которая сможет подготовить данные для модуля, то вам необходимо
определить серверный эндпоинт для модуля. Для этого вам нужно определить объект, описывающий ваши модули:

```ts
import type { ModulesConfig } from '@arui-scripts/server';

const modules: ModulesConfig = {
    'ServerModuleEmbedded': {
        mountMode: 'embedded',
        version: '1.0.0',
        getRunParams: async (getResourcesRequest) => ({
            // getResouresRequest - это объект, который будет передан из хост-приложения
            // данные, которые вернет эта функция будут переданы в mount функцию модуля
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

Далее, в зависимости от того, какой серверный фреймворк вы используете, вам нужно будет подключить ваши модули в
соответствующий хендлер. Например, для express это будет выглядеть так:

```ts
import { createGetModulesExpress } from '@arui-scripts/server/build/express';

const modulesRouter = createGetModulesExpress(modules);

app.use(modulesRouter);
```

Для hapi@16:

```ts
import { createGetModulesHapi16Plugin } from '@arui-scripts/server/build/hapi16';

const modulesPlugin = createGetModulesHapi16Plugin(modules);

server.register(modulesPlugin);
```

Для hapi@20:

```ts
import { createGetModulesHapi20Plugin } from '@arui-scripts/server/build/hapi20';

const modulesPlugin = createGetModulesHapi20Plugin(modules);

server.register(modulesPlugin);
```

Если вы хотите использовать другой серверный фреймворк, вы можете использовать общий хелпер:

```ts
import { createGetModulesMethod } from '@arui-scripts/server';

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

### Тестирование модулей

TODO


## Подключение модулей в хост-приложение

### (Опционально) Настроить общие библиотеки
В случае, если модуль который вы хотите подключить использует какие-то общие библиотеки с хост-приложением, вы должны
определить параметры для этих библиотек в `arui-scripts.config.ts`.

```ts
import { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    embeddedModules: {
        shared: {
            'react': 'reactDOM',
            'react-dom': 'reactDOM',
        }
    },
    mfModules: {
        shared: {
            'react': {
                eager: true,
                singleton: true,
                requiredVersion: '^17.0.0',
            },
            'react-dom': {
                eager: true,
                singleton: true,
                requiredVersion: '^17.0.0',
            }
        }
    },
}
```

### Подключить модуль на страницу
Клиентские и серверные модули подключаются на страницу немного по-разному.

Подключение серверных модулей будет выглядеть так:

```tsx
import React, { useMemo } from 'react';
import { createLoader, useModuleLoader, getModuleResourcesPath } from '@arui-scripts/modules';

// Это просто функция, которая должна обратиться к серверу модуля.
// Скорее всего у вас уже есть хелпер, который создает подобные функции
// и насыщает запрос дополнительными данными, например, токеном авторизации, traceId и т.д.
const customFetch = (loaderParams) => {
    // arui-scripts не знает заранее ни дополнительных параметров (авторизация, заголовки), которые вы хотите передать в запрос,
    // ни того, на какой адрес нужно делать запрос. Поэтому вам нужно самим реализовать эту функцию.
    return fetch(`http://localhost:8081/${getModuleResourcesPath}`, {
        method: 'POST',
        body: JSON.stringify(loaderParams),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => response.json());
}

export const ServerModuleMounter = () => {
    // Загрузчик - это функция, которая прячет в себе запрос к серверу, подключение ресурсов на страницу и т.д.
    const loader = useMemo(() => createLoader({
        hostAppId: 'example', // id вашего хост-приложения
        fetchFunction: customFetch,
        // С помощью этой функции вы можете передать дополнительные параметры в запрос к серверу модуля.
        getModuleRequestParams: async () => ({
            paramName: 'some param that will be passed to module',
        }),
    }), []);

    // useModuleLoader - это простой хук, который с помощью переданного загрузчика подключает модуль на страницу.
    const {
        loadingState, // состояние загрузки модуля. 'pending' - модуль еще не загружен, 'resolved' - модуль загружен, 'rejected' - произошла ошибка при загрузке модуля
        targetElementRef, // ссылка на элемент, в который будет подключен модуль
    } = useModuleLoader(
        "ServerModuleEmbedded", // id модуля, который был указан в arui-scripts.config.ts
        loader,
    );

    return (
        <div>
            { loadingState === 'pending' && <div>Loading...</div> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </div>
    );
};
```

При подключении же клиентских модулей необходимо использовать функцию `createClientLoader` вместо `createLoader`:

```tsx
import React from 'react';
import { createClientLoader, useModuleLoader } from '@arui-scripts/modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const loader = createClientLoader({
    baseUrl: 'http://localhost:8081/', // базовый адрес приложения с подключаемым модулем
});

export const EmbeddedModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleLoader(
        "ClientModuleEmbedded", // id модуля, который был указан в arui-scripts.config.ts
        loader
    );

    return (
        <div>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </div>
    );
}

```


# Конфигурация модулей

## Embedded модули

`embeddedModules` - объект, управляющий конфигурацией embedded модулей.

- `embeddedModules.shared` - объект, описывающий библиотеки, которые приложение будет предоставлять модулям. Ключ объекта - название библиотеки,
значение - название переменной в window, в которую будет записана библиотека.
- `embeddedModules.exposes` - объект, описывающий embedded модули. Ключ объекта - id модуля, значение - объект с конфигурацией модуля.
- `embeddedModules.exposes[id].entry` - путь до точки входа модуля. Должен быть либо абсолютным, либо относительным от корня проекта.
- `embeddedModules.exposes[id].cssPrefix` - префикс для css классов модуля. По умолчанию все стили модуля будут префиксированы с `.module-{id модуля}`. Вы можете передать сюда
свой префикс, или `false` чтобы отключить префиксирование.
- `embeddedModules.exposes[id].embeddedConfig` - объект, описывающий какие библиотеки должны быть помечены для модуля как `external`. Ключ объекта - название библиотеки,
значение - название переменной в window, в которой модуль будет искать эту библиотеку.

## MF модули

`mfModules` - объект, управляющий конфигурацией Module Federation модулей.

- `mfModules.name` - опциональное имя модуля. Это имя будет использовано как название контейнера модуля. Если не указано, то
будет использовано имя пакета, в котором все `-` будут заменены на `_`. Должно быть уникальным в рамках хост-приложения,
и быть валидным именем для js переменной.
- `mfModules.shared` - объект, описывающий библиотеки, которые приложение будет предоставлять модулям, и библиотеки, которые модуль будет пытаться получить от хост-приложения.
Подробнее про варианты описания можно почитать в [документации](https://webpack.js.org/plugins/module-federation-plugin/#specify-package-versions).
- `exposes` - объект, описывающий какие модули должны быть предоставлены хост-приложению. Ключ объекта - название модуля,
значение - точка входа модуля.

# API библиотек
