# Локальный оверрайд для server-state fetcher

## Цель

Добавить в `createServerStateModuleFetcher` поддержку уже существующего механизма
локального переопределения адреса приложения-источника модуля. Это позволит при
загрузке ресурсов через server-state endpoint направлять запрос конкретного модуля
на локальный dev-сервер, не меняя адрес для остальных модулей.

## Публичный API

Функция принимает новую необязательную опцию `allowLocalOverride?: boolean` со
значением по умолчанию `false`:

```ts
const getModuleResources = createServerStateModuleFetcher({
    baseUrl: '',
    headers: {},
    allowLocalOverride: true,
});
```

Формат `localStorage`, ключ `arui-scripts-module-overrides` и правила валидации не
меняются. Используется существующий `getLocalModuleOverride(moduleId)`.

## Поведение

При каждом вызове созданного fetcher'а:

1. При включённом `allowLocalOverride` читается override для `params.moduleId`.
2. Валидный override становится эффективным `baseUrl`; при его отсутствии
   используется переданный при создании fetcher'а `baseUrl`.
3. URL запроса строится из эффективного базового адреса и существующего
   `relativePath`.

Метод, заголовки, тело, `AbortSignal`, разбор ответа и формат ошибок не меняются.
При выключенной опции `localStorage` не читается, поэтому сохранена обратная
совместимость и текущее production-поведение.

## Реализация

Изменение остаётся локальным для `create-server-state-module-fetcher.ts`: в тип
параметров и JSDoc добавляется опция, а перед построением URL вычисляется
`effectiveBaseUrl`. Общий helper не вводится, поскольку вычисление состоит из двух
простых строк и уже используется в таком виде в `createModuleFetcher`.

## Тестирование

В тестах `createServerStateModuleFetcher` проверяются три сценария:

- при включённой опции существующий override для `moduleId` используется в URL;
- при включённой опции без override используется исходный `baseUrl`;
- при выключенной по умолчанию опции существующий override игнорируется.

Существующие тесты продолжают проверять неизменность HTTP-контракта и обработки
ошибок.

## Документация и выпуск

README дополняется параметром, примером использования и пояснением, что общий
формат local override применяется также к server-state fetcher. Добавляется
changeset уровня `minor` для `@alfalab/scripts-modules`, так как публичный API
получает новую опциональную возможность без ломающих изменений.

## Файлы

- `packages/arui-scripts-modules/src/module-loader/create-server-state-module-fetcher.ts`
- `packages/arui-scripts-modules/src/module-loader/__tests__/create-server-state-module-fetcher.tests.ts`
- `packages/arui-scripts-modules/README.md`
- `.changeset/server-state-local-override.md`

## Что не входит

- изменение формата или экспорта local override;
- рефакторинг обоих fetcher'ов на общий resolver;
- изменение server-state endpoint, HTTP-метода или формата запроса/ответа.
