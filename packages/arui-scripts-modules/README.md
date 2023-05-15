@alfalab/scripts-modules
===

Пакет, упрощающий работу с [модулями в arui-scripts](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/modules.md)

## Установка

```bash
yarn add @alfalab/scripts-modules
```

## Использование

### `createLoader`
Функция, которая создает лоадер для модуля.

```ts
import { createLoader } from '@alfalab/scripts-modules';
import * as exports from 'webpack';
import moduleId = exports.RuntimeGlobals.moduleId;

const loader = createLoader({
  hostAppId: 'my-app-ui', // id приложения, в котором будет загружаться модуль
  fetchFunction: () => Promise.resolve(), // функция, которая будет использоваться для обращения на сервер за информацией о модуле
  // Опциональные параметры:
  // опциональная функция, которая возвращает параметры для запроса на сервер
  getModuleRequestParams: async (moduleId: string) => ({ moduleId }),
  // опциональная функция, которая вызывается перед монтированием ресурсов модуля
  onBeforeResourcesMount: async (moduleId, moduleParams) => {},
  // опциональная функция, которая позволяет модифицировать параметры модуля, полученные от сервера
  getModuleRunParams: async (moduleId: string, moduleRunParams: ResourcesResponse) => moduleRunParams,
  // опциональная функция, которая вызывается перед монтированием модуля
  onBeforeModuleMount: (moduleId: string, moduleParams: ResourcesResponse, targetNode?: HTMLElement) => {},
  // опциональная функция, которая вызывается после монтирования модуля
  onAfterModuleMount: (moduleId: string, moduleParams: ResourcesResponse) => {},
  // опциональная функция, которая вызывается перед размонтированием модуля
  onBeforeModuleUnmount: (moduleId: string, moduleParams: ResourcesResponse, targetNode?: HTMLElement) => {},
});
```

Загрузчик отвечает за то, чтобы модуль был правильным образом загружен, смонтирован в дом, и размонтирован.

Пример использования `loader`:

```ts
import { createLoader } from '@alfalab/scripts-modules';

const loader = createLoader({ hostAppId: 'app' /*...*/ });

// загрузка модуля

const { unmount, result } = loader('IdOfAModule', document.getElementById('root'));

result.then(() => {
  // модуль загружен и смонтирован
  // ...
  // размонтирование модуля
  unmount();
});
```

### `createClientLoader`
Функция, которая создает загрузчик для клиентских модулей. Является оберткой над `createLoader`.

```ts
import { createClientLoader } from '@alfalab/scripts-modules';

const loader = createClientLoader({
  // Базовый адрес приложения, которое предоставляет модули. Может быть как относительным, так и абсолютным.
  baseUrl: '',
  // Режим монтирования модуля
  mountMode: 'embedded',
  // Опциональные параметры полностью совпадают с параметрами createLoader
});
```

Использование `loader` аналогично `createLoader`.

### `useModuleLoader`

React-хук, который позволяет загружать модули в компонентах.

```tsx
import { createClientLoader, useModuleLoader } from '@alfalab/scripts-modules';

const loader = createClientLoader({ // или createLoader
  baseUrl: '',
  mountMode: 'embedded',
});

const MyApp = () => {
  const { loadingState, targetElementRef } = useModuleLoader('IdOfAModule', loader);

  return (
    <div>
      {loadingState === 'loading' && <div>Загрузка...</div>}
      {loadingState === 'error' && <div>Ошибка загрузки</div>}
      <div ref={targetElementRef} />
    </div>
  );
}
```

`unmount` модуля будет вызван автоматически при размонтировании компонента.
