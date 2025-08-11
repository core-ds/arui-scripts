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

# Как использовать

Предположим у вас есть два приложения, `foo-app` и `bar-app`. Вы хотите предоставлять модуль из `foo-app` и использовать
его в `bar-app`.

## 1. Добавляем конфигурацию в arui-scripts.config.ts (в foo-app)

```ts
// ./arui-scripts.config.ts
import type { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    modules: {
        // если хост приложение шарит эти библиотеки, и они совпадают по версии
        shared: {
            'react': '^17.0.0', // так же поддерживаются более сложные версии например { requiredVersion: '^17.0.0', singleton: true }
            'react-dom': '^17.0.0',
        },
        exposes: {
            'SomeModule': './src/modules/some-module/index',
            'AnotherModule': './src/modules/another-module/index',
        }
    }
}

export default aruiScriptsConfig;
```

Эта конфигурация объявляет два модуля, `SomeModule` и `AnotherModule`. Эти модули смогут получать react и react-dom из
подключившего их приложения, если оно содержит конфигурацию для `modules.shared`, и версии библиотек подходят по semver.

## 2. Создаем входную точку модуля (в foo-app)

```tsx
// src/modules/some-module/index
import ReactDOM from 'react-dom';
import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';

export const mount: ModuleMountFunction = (targetNode, runParams, serverState) => {
    console.log( // Вы можете передать эти переменные в ваши компоненты, подробнее ниже
        runParams, // undefined
        serverState // { baseUrl: "https://example.com/foo-app", hostAppId: "bar-app" } // Эти данные определяются тем, что было передано в загрузчик в приложении-хосте
    );

    ReactDOM.render(
        <div>Hello from module!</div>,
        targetNode,
    );
}

export const unmount: ModuleUnmountFunction = (targetNode) => {
    ReactDOM.unmountComponentAtNode(targetNode);
}
```

Пример для React@18

```tsx
import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';
import ReactDOM from 'react-dom/client';

let root: ReturnType<typeof ReactDOM.createRoot>

export const mount: ModuleMountFunction = (targetNode, runParams, serverState) => {
    root = ReactDOM.createRoot(targetNode);

    root.render(<App preparedState={serverState} runParams={runParams} />);
}

export const unmount: ModuleUnmountFunction = () => {
    root?.unmount();
}
```

## 3. Подключите модуль в другом приложении (в bar-app)

Если предположить что приложение с модулем уже развернуто по адресу https://examle.com/foo-app
```tsx
import {
    createModuleLoader,
    createModuleFetcher,
    useModuleMounter,
    MountableModule,
} from '@alfalab/scripts-modules';

const loader = createModuleLoader<MountableModule>({
    hostAppId: 'bar-app',
    moduleId: 'test',
    getModuleResources: createModuleFetcher({
        baseUrl: 'https://examle.com/foo-app',
    }),
});

export const MyAwesomeComponent = () => {
    const { loadingState, targetElementRef } = useModuleMounter({ loader });

    return (
        <div>
            {loadingState === 'pending' && <div>pending...</div>}
            {loadingState === 'rejected' && <div>Error</div>}
            <div ref={targetElementRef} /> {/* сюда будет монтироваться модуль */}
        </div>
    );
}
```

На этом этапе вы получите подгружающееся в bar-app модуль.

## 4. (Опционально). Определить shared-библиотеки в приложении потребителе (в bar-app)

```ts
// ./arui-scripts.config.ts
import type { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    modules: {
        shared: {
            'react': '^17.0.0',
            'react-dom': '^17.0.0',
        },
    }
}

export default aruiScriptsConfig;
```
Эта конфигурация даст возможность использовать react и react-dom библиотеки из bar-app, не загружая их из foo-app.

## Готово!

Эта минимальная конфигурация, которая нужна для работы с модулями. Далее идет информация об advanced настройках работы с модулями.
Рекомендуется с ней ознакомиться хотя бы верхнеуровнево, для того, чтобы понимать какие возможности есть у модулей.

# Передача параметров в модуль из приложения-потребителя
Зачастую модули должны получать какую-то информацию из приложения потребителя при своей инициализации.

На стороне модуля эти параметры приходят в параметр `runParams` функции mount. Предположим ваш модуль должен получать из
приложения-потребителя тему (`theme`) и ширину (`width`). Тогда входная точка будет выглядеть примерно так:

```tsx
import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';

type ModuleRunParams = {
    theme: stirng;
    width: number;
};

export const mount: ModuleMountFunction<ModuleRunParams> = (targetNode, runParams) => {
    ReactDOM.render(
        <MyAwesomeComponent theme={runParams.theme} width={runParams.width} />,
        targetNode,
    );
}
// далее unmount как и раньше
```

На стороне потребителя:

```tsx
import { createModuleLoader, MountableModule, useModuleMounter } from '@alfalab/scripts-modules';

// У нас возможности передать типы из приложения-модуля в приложение-хост
// При желании вы можете вынести эти типы в общую библиотеку и использовать оттуда
type ModuleRunParams = {
    theme: string;
    width: number;
};

type ModuleType = MountableModule<ModuleRunParams>;

const loader = createModuleLoader<ModuleType>(/*...*/);
export const MyAwesomeComponent = () => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader,
        runParams: { theme: 'blue', width: 300 },
    });

    return (
        <div>
            { loadingState === 'pending' && <div>pending...</div> }
            { loadingState === 'rejected' && <div>Error</div> }
            <div ref={ targetElementRef }/>
        </div>
    );
}
```

:warning: **Внимание!** Модуль не будет обновляться при изменении runParams. Это осознанное решение, вы не должны относится к
параметрам тут с той же легкостью, что и к prop-ам react-компонентов. Очень легко провести параллели между эти двумя
концепциями, но использование runParams специально сделано менее удобным - чем меньше вы их используете, тем реже вы будете
их менять, и тем меньше вероятность привнести обратно несовместимые изменения. Старайтесь передавать в runParams только
примитивы, не пытаться передавать там объекты сущностей (например профиль пользователя).
В целом - минимизируйте их использование.
Если вам важно чтобы модуль перемонтировался каждый раз при изменении runParams - вы можете сделать это самостоятельно, например добавив
key в ваш компонент-обертку вокруг модуля.

# Возможность управления модулями с сервера
Сами модули используются только на клиентской части приложения. Но, в некоторых случаях, может быть полезно иметь возможность
управлять тем, какой модуль должен быть подключен на странице с сервера, или же иметь модуль, который будет при загрузке
иметь доступ к данным, доступным только на сервере (аналогично тому, как мы передаем серверный стейт в приложения при SSR).

По умолчанию, даже в клиентские модули в mount-функцию будет передан параметр `serverState`, содержащий:
- `baseUrl` - тот адрес, который использовался при загрузке модуля с помощью `createModuleFetcher`. Вы можете использовать
этот адрес например для определения того, где искать API вашего модуля
- `hostAppId` - идентификатор приложения, которое загружает модуль. Может быть полезен если вы хотите менять поведение
модуля в зависимости от того, кто его потребляет.

Так же `arui-scripts` предоставляет возможность создать специальный эндпоинт на вашем сервере, из которого вы сможете управлять
состоянием модуля.

Модули с такой возможностью мы называем _модулями с серверным состоянием_ (_server state_).

Для удобного создания таких эндпоинтов сделаны хелперы в пакете `@alfalab/scripts-server`. Например, для `hapi@20`:

```ts
import { createGetModulesHapi20Plugin } from '@alfalab/scripts-server/build/hapi-20';

const plugin = createGetModulesHapi20Plugin(
    {
        'SomeModule': {
            mountMode: 'default',
            version: '1.0.0',
            getModuleState: async (getResourcesRequest, request) => {
                console.log(getResourcesRequest.moduleId); // "SomeModule"
                console.log(getResourcesRequest.hostAppId); // В зависимости от того, что за приложение запросило модуль
                console.log(getResourcesRequest.params); // параметры запроса за модулем, подробнее ниже
                console.log(request); // Для каждого фреймворка это будет специфичный для него объект запроса
                const answerFromAwesomeService = await getSomethingFromBackend();
                return {
                    baseUrl: '/awesome-app',
                    answerFromAwesomeService, // эти данные попадут в параметр serverState mount-функции модуля
                };
            },
        }
    }
);

server.register(plugin);
```

Для других фреймворков это будет выглядеть аналогично, для `express`
```ts
import { createGetModulesExpress } from '@alfalab/scripts-server/build/express';

const modulesRouter = createGetModulesExpress({/*...*/});

app.use(modulesRouter);
```

Для `hapi@16`:

```ts
import { createGetModulesHapi16Plugin } from '@alfalab/scripts-server/build/hapi16';

const modulesPlugin = createGetModulesHapi16Plugin({/*...*/});

server.register(modulesPlugin);
```

Если вы хотите использовать другой серверный фреймворк, вы можете использовать общий хелпер:

```ts
import { createGetModulesMethod } from '@alfalab/scripts-server';

const getModules = createGetModulesMethod({/*...*/});

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

## Подключение модулей с серверным состоянием в приложении потребителе
Приложение-потребитель должно знать, что модуль имеет серверное состояние, поскольку это требует
небольшого изменения механизма подключения модуля:

```tsx
import {
    createModuleLoader,
    createServerStateModuleFetcher,
    useModuleMounter,
    MountableModule,
} from '@alfalab/scripts-modules';

type RequestParams = { // Опционально, вы можете определить параметры которые попадут на серверную часть модуля, в getResourcesRequest.params
    name: string;
}

const loader = createModuleLoader<MountableModule, RequestParams>({
    hostAppId: 'bar-app',
    moduleId: 'test',
    getModuleResources: createServerStateModuleFetcher({ // !!! другой метод подключения
        baseUrl: 'http://localhost:8082',
        headers: { 'X-Auth': 'bla-bla' } // опционально вы можете передать дополнительные заголовки для запроса
    }),
});

export const MyAwesomeComponent = () => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader,
        loaderParams: { name: 'Ivan' }, // Если модуль не принимает кастомных параметров на сервере - этого можно не делать!
    });

    return (
        <div>
            {loadingState === 'pending' && <div>pending...</div>}
            {loadingState === 'rejected' && <div>Error</div>}
            <div ref={targetElementRef} /> {/* сюда будет монтироваться модуль */}
        </div>
    );
}
```

# Изоляция стилей
Если ваши приложения активно используют глобальные стили (то есть не с css-modules или css-in-js), вы вполне
можете столкнуться с проблемой конфликтов стилей между модулями и приложением-потребителем.

Для решения конфликтов стилей вы можете попробовать перевести проект на css-modules, но это может быть довольно
трудоемкой задачей, особенно если у вас уже есть большая кодовая база.

arui-scripts предоставляет два решения для этой проблемы:
- _css-prefix_
- использование shadow dom

## css-prefix

Суть метода заключается в том, что ко всем стилям модуля будет добавляться префикс, который позволит изолировать
стили модуля от стилей приложения-потребителя.

:warning: **Внимание!** - изоляция стилей работает только в одном направлении - стили модуля не будут применены к элементам
хост-приложения. Но стили хост-приложения могут быть применены к элементам модуля.

Для того чтобы использовать этот метод, вам нужно:

1. Изменить конфигурацию модуля в `arui-scripts.config.ts`:

```ts
// ./arui-scripts.config.ts compatModules
import type { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    compatModules: {
        // Тут ключ - название библиотеки, значение - имя переменной в window, которая будет использоваться для получения библиотеки
        // Это те библиотеки, которые этот проект будет предоставлять модулям, подключаемым в него
        shared: {
            'react': 'react',
            'react-dom': 'reactDOM',
        },
        exposes: {
            'SomeModule': {
                entry: './src/modules/some-module/index',
                // Это те библиотеки, которые модуль будет пытаться получить из window
                externals: {
                    react: 'react',
                    'react-dom': 'reactDOM',
                },
            },
            'AnotherModule': {
                entry: './src/modules/another-module/index',
            },
        }
    }
}

export default aruiScriptsConfig;
```

```ts
// ./arui-scripts.config.ts module federation
import type { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    modules: {
        shared: {
            'react': '^17.0.0',
            'react-dom': '^17.0.0',
        },
        exposes: {
            'Module': './src/modules/module/index',
        },
        options: {
            cssPrefix: '.my-module'
        }
    }
}

export default aruiScriptsConfig;
```

2. Изменить входную точку модуля:

```tsx
// ./src/modules/some-module/index
import type {
    ModuleMountFunction,
    ModuleUnmountFunction,
    WindowWithMountableModule,
} from '@alfalab/scripts-modules';

const CSS_PREFIX = 'module-SomeModule'; // префикс, который будет добавлен к классам модуля. По умолчанию - module-<moduleId>

// Если ваше react-приложение использует порталы, вам так же надо не забыть добавить префикс к элементу-порталу.
export const mount: ModuleMountFunction = (targetNode, runParams, serverState) => {
    ReactDOM.render(
        <div className={ CSS_PREFIX }>Hello from module!</div>,
        targetNode,
    );
}

export const unmount: ModuleUnmountFunction = (targetNode) => {
    ReactDOM.unmountComponentAtNode(targetNode);
};

(window as WindowWithMountableModule).SomeModule = { // имя переменной в window должно соответствовать имени модуля в exposes
    mount: mountModule,
    unmount: unmountModule,
};
```

Как видите, изменения в сравнении с обычными модулями минимальны. На стороне потребителя при
этом не меняется ничего - `@alfalab/script-modules` сам поймет как загружать такой модуль и будет подключать его
нужным способом.

<details>
<summary>Писать в window? Вы что, с дуба рухнулись?</summary>
Да, конечно, это может создать определенные проблемы (конфликты имен модулей, определенные ограничения на используемые названия),
но по сути это единственный способ передать код модуля в хост-приложение.

Webpack module federation делает абсолютно то же самое, просто прячет работу с глобальными переменными за собой.
</details>

### Сравнение способов подключения модулей

`default` модули:
- **+++** Простой способ для переиспользования библиотек между модулем и приложением-хостом.
- **+++** Возможность использовать разные версии общих библиотек в разных модулях/хостах (речь про те библиотеки, которые будут шарится).
- **---** Нет встроенной изоляции стилей. Стили модуля будут применены к хост-приложению.
- **---** Нет возможности использовать модуль в приложении, которое не использует webpack.

Проблема изоляции стилей может быть решена с помощью [shadow dom](#shadow-dom),
или с помощью css modules. Но это накладывает некоторые ограничения либо на поддерживаемые браузеры (shadow dom), либо на существующую кодовую базу (css modules должны использоваться везде).

`compat` модули:
- **+++** Встроенная изоляция стилей. Стили модуля не будут применены к хост-приложению, если только вы не захотите этого.
- **---** Нет возможности использовать разные версии общих библиотек в разных модулях/хостах, если вы хотите их шарить.

*Как понять какой режим использовать?*
В целом, если ваше приложение и модули используют только css-modules, то можно использовать `default` режим. Конфликты в стилях
вам в таком случае не грозят. Если же вы используете обычный css, или ваши библиотеки используют обычный css, то лучше
использовать `compat` режим.

## Shadow dom
[Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) - это спецификация, которая позволяет
создавать изолированные DOM-деревья, которые не будут влиять на DOM-дерево родительского элемента.

arui-scripts предоставляет возможность использовать shadow dom для модулей. Для этого вам нужно:

- На стороне модуля - использовать `arui-scripts` старше `15.9.2`.
- На стороне потребителя - указать параметр `useShadowDom` в `useModuleMounter`:

```tsx
import {
    createModuleLoader,
    createModuleFetcher,
    useModuleMounter,
    MountableModule,
} from '@alfalab/scripts-modules';

const loader = createModuleLoader<MountableModule>({
    hostAppId: 'bar-app',
    moduleId: 'test',
    getModuleResources: createModuleFetcher({
        baseUrl: 'https://examle.com/foo-app',
    }),
});

export const MyAwesomeComponent = () => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader,
        useShadowDom: true, // !!!
    });

    return (
        <div>
            {loadingState === 'pending' && <div>pending...</div>}
            {loadingState === 'rejected' && <div>Error</div>}
            <div ref={targetElementRef} /> {/* сюда будет монтироваться модуль */}
        </div>
    );
}
```

Этот режим работает как для _default_, так и для _compat_ модулей.
Внутри targetElementRef будет создаваться shadowRoot, и модуль и его стили будут монтироваться в него.

# Кеширование модулей

По умолчанию модули будут загружаться каждый раз при использовании. Если ваше приложение будет монтировать/размонтировать модуль несколько раз,
каждый раз загрузка модуля будет выполняться заново.
Это поведение можно изменить, с помощью параметра `resourcesCache` функции `createModuleLoader`.

```tsx
const loader = createModuleLoader({
    resourcesCache: 'single-item', // по умолчанию 'none'
    // другие параметры
});
```

Это включит кеширование модуля. В режиме `'single-item'` в кеше будут храниться ресурсы модуля для последнего значения `loaderParams`, если они переданы.
При повторном монтировании модуля с теми же `loaderParams`, ресурсы будут браться из кеша, а не загружаться заново.
При изменении `loaderParams` ресурсы будут загружаться заново.

Обратите внимание, что кеширование модулей может вызывать проблемы при обновлении приложения, поставляющего модуль.
Если сессии пользователей очень долгие, а обновления модуля происходят часто, то это может привести к тому, что пользователи будут продолжать видеть старую версию модуля.
Так же стоит помнить что кеширование может увеличить потребление памяти вашим приложением. Используйте его с осторожностью и только в случае если вы уверены, что оно действительно необходимо.
Как альтернативу стоит рассмотреть использование кеширования на уровне http протокола, это дает приемлемую скорость работы без рисков утечки памяти и использования "старой" версии ресурсов.

**Внимание!** Использование `resourcesCache: 'single-item'` не будет работать вместе с `useShadowDom` из-за особенностей работы со стилями.

# Другие типы модулей

Помимо создания монтируемых модулей, есть возможность создавать и другие типы модулей, более подходящие для некоторых вариантов использования.


## Модули-фабрики
Модули-фабрики - это модули, которые поставляют фабрики, которые в свою очередь вызываются в рантайме со стейтом (клиентским или серверным, в зависимости от типа поставляемого модуля).

Такие модули должны экспортировать фабрику:

Для default модулей:

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

Серверный эндпоинт для таких модулей создается абсолютно так же, как и для монтируемых модулей.

### Подключение модулей-фабрик в приложении потребителе

Для подключения модулей-фабрик можно использовать хук `useModuleFactory`:

```tsx
import {
    createModuleLoader,
    createModuleFetcher,
    FactoryModule,
    useModuleFactory,
} from '@alfalab/scripts-modules';

const loader = createModuleLoader<FactoryModule>({
    hostAppId: 'bar-app',
    moduleId: 'test',
    getModuleResources: createModuleFetcher({ // или createServerStateModuleFetcher для модулей с серверным состоянием
        baseUrl: 'https://examle.com/foo-app',
    }),
});

export const MyAwesomeComponent = () => {
    const { loadingState, module } = useModuleFactory({ loader });

    return (
        <div>
            { loadingState === 'pending' && <div>pending...</div> }
            { loadingState === 'rejected' && <div>Error</div> }
            <pre>{ JSON.stringify(module) }</pre> {/* модуль будет содержать то, что вернула фабрика */}
        </div>
    );
}
```

Если вы хотите использовать модуль-фабрику вне реакт-компонента, вы можете использовать другой метод:

```ts
import {
    createModuleLoader,
    createModuleFetcher,
    FactoryModule,
    executeModuleFactory,
} from '@alfalab/scripts-modules';

const loader = createModuleLoader<FactoryModule>(/*...*/);

(async () => {
    const loaderResult = await loader();

    const executionResult = executeModuleFactory(
        result.module,
        result.moduleResources.moduleState,
        {}, // опциональные run-параметры модуля
    );

    console.log(executionResult); // Тут будет то, что возвращает модуль-фабрика
})();
```

## Абстрактные модули

Для совсем сложных кейсов, когда вам нужен полный контроль над всем тем, что делает код из модуля, вы можете использовать
абстрактные модули. Они могут иметь абсолютно любую структуру, экспортировать из себя любые методы и константы.

```tsx
// src/modules/abstract-module/index.ts
export const doSomething = () => {
    console.log('Hello from abstract module!');
};

export const publicConstant = 3.14;

window.AbstractModule = { // для compat модулей
    doSomething,
    publicConstant,
};
```

Для подключения вы можете использовать хук `useModuleLoader`:

```tsx
import {
    createModuleLoader,
    createModuleFetcher,
    useModuleLoader,
} from '@alfalab/scripts-modules';

type CustomModule = {
    doSomething: () => void;
    publicConstant: number;
}

const loader = createModuleLoader<CustomModule>({
    hostAppId: 'bar-app',
    moduleId: 'test',
    getModuleResources: createModuleFetcher({
        baseUrl: 'https://examle.com/foo-app',
    }),
});

export const MyAwesomeComponent = () => {
    const { loadingState, module } = useModuleLoader({ loader });

    return (
        <div>
            { loadingState === 'pending' && <div>pending...</div> }
            { loadingState === 'rejected' && <div>Error</div> }
            <pre>{ JSON.stringify(module) }</pre> {/* модуль будет содержать то, что экспортирует модуль, то есть doSomething и publicConstant */}
        </div>
    );
}
```

# Тестирование модулей
Поскольку в общем случае модули представляют собой простой js код - для тестирования вы можете пользоваться любыми привычными вам инструментами.

Для тестирования модулей в cypress или playwright вы можете создать отдельный эндпоинт в вашем приложении, который будет
подключать модуль в ваше же приложение.


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
    shareScope?: string // скоуп который будет присваиваться модулям в shared если иное имя не будет задано в sharedConfig. Значение по умолчанию - 'default'
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
