---
'@alfalab/scripts-modules': minor
---

Прямая передача хуков `on*` в `createModuleLoader` объявлена как deprecated. Передавайте их в отдельный параметр hooks:

```js
// Было:
const loader = createModuleLoader({
    // ...
    onBeforeModuleUnmount: () => {}
});

// Стало:
const loader = createModuleLoader({
    // ...
    hooks: {
        onBeforeModuleUnmount: () => {}
    },
});
```

Добавлены новые хуки:

- `onStart(moduleId: string)` - будет вызван перед тем, как запустится процесс загрузки модуля;
- `onBeforeMountableModuleMount(moduleId: string)` - специальных хук для монтируемых модулей, будет вызван перед запуском функции `mount` модуля;
- `onAfterMountableModuleMount(moudleId: string)` - специальный хук для монтируемых модулей, будет вызван после выполнения функции `mount` модуля.

Благодаря этим хукам вы сможете собирать метрики загрузки с ваших модулей и отслеживать все этапы загрузки.
