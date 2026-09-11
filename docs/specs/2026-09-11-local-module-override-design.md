# Локальный оверрайд адреса модуля

## Цель

Дать разработчику модуля возможность проверить изменения в уже задеплоенном приложении,
не поднимая и не пересобирая приложение-потребитель. Разработчик запускает dev-сервер
своего приложения-источника модуля, прописывает в `localStorage` браузера адрес этого
dev-сервера для конкретного `moduleId` и перезагружает страницу. Загрузчик модуля берёт
переопределённый адрес как `baseUrl` и тянет с него и манифест, и ресурсы модуля.

Оверрайд должен быть опциональным и по умолчанию выключенным, чтобы production-сборки
были защищены без дополнительных действий.

## Область

Поддерживается только клиентский путь загрузки — `createModuleFetcher`. SSR-поток
(`createServerStateModuleFetcher`) не затрагивается: сервер не имеет доступа к
`localStorage` клиента, поэтому для SSR-ресурсов переопределение не применяется.

## Публичный API

В `createModuleFetcher` добавляется опциональный параметр:

```ts
const getModuleResources = createModuleFetcher({
    baseUrl: '',
    assetsUrl: '/assets/webpack-assets.json',
    allowLocalOverride: false, // значение по умолчанию
});
```

`allowLocalOverride` — флаг, включающий чтение оверрайдов из `localStorage`. При `false`
(по умолчанию) `localStorage` не читается, поведение полностью совпадает с текущим.

Дополнительно из корня пакета экспортируется константа `LOCAL_OVERRIDE_STORAGE_KEY` с
именем ключа `localStorage`, чтобы потребители и документация не дублировали строку.

## Контракт localStorage

- Ключ: `arui-scripts-module-overrides`.
- Значение: JSON-объект, сопоставляющий `moduleId` базовому адресу приложения-источника:

```json
{ "module-A": "http://localhost:8080" }
```

Пример установки из devtools:

```js
localStorage.setItem(
    'arui-scripts-module-overrides',
    JSON.stringify({ 'module-A': 'http://localhost:8080' }),
);
```

Правила чтения:

- Значение читается при каждом вызове `getModuleResources`, а не при создании фетчера.
  Это значит, что перезагрузка страницы всегда подхватывает актуальное значение.
- Некорректный JSON, `null`, массив, не-объект, нестроковые или пустые значения
  игнорируются (возвращается `undefined`).
- Любой доступ к `localStorage` обёрнут в `try/catch`: SSR, отключённое хранилище,
  приватный режим и ошибки безопасности не должны ломать загрузку модуля.

## Поведение

При каждом вызове `getModuleResources`:

1. `overrideBaseUrl = allowLocalOverride ? getLocalModuleOverride(moduleId) : undefined`.
2. `effectiveBaseUrl = overrideBaseUrl ?? baseUrl`.
3. Адрес манифеста строится из `effectiveBaseUrl` и `assetsUrl`, манифест запрашивается.
4. В результат записывается `moduleState.baseUrl = effectiveBaseUrl`.

Так как `createModuleLoader` резолвит все адреса скриптов и стилей относительно
`moduleState.baseUrl` (`create-module-loader.ts`, `fetch-resources.ts`), оверрайд
автоматически распространяется и на ресурсы — как для `compat`, так и для `default`
(mode module federation, где мы сами подключаем remote entry).

## Изоляция и структура

Новый модуль `utils/local-override.ts` инкапсулирует всё, что связано с ключом,
чтением и валидацией:

- `LOCAL_OVERRIDE_STORAGE_KEY` — имя ключа;
- `getLocalModuleOverride(moduleId): string | undefined` — безопасное чтение.

`create-module-fetcher.ts` отвечает только за оркестрацию: получить оверрайд, построить
адрес манифеста, запросить его, вернуть ресурсы. Существующая функция `getModuleFiles`
начинает принимать `manifestUrl` аргументом, чтобы текст ошибки «модуль не найден»
содержал фактически использованный адрес манифеста (в том числе переопределённый).

## Обработка ошибок

- Разбор оверрайдов никогда не бросает исключение.
- Если переопределённый адрес недоступен, наружу выходит обычная ошибка запроса
  манифеста без изменений.
- Семантика `resourcesCache` не меняется: перезагрузка страницы пересоздаёт модульный
  scope, поэтому устаревший кеш не мешает.

## Тестирование

Новые тесты `utils/__tests__/local-override.tests.ts`:

- возвращает адрес для известного модуля;
- возвращает `undefined`, если ключа нет;
- возвращает `undefined` при некорректном JSON;
- возвращает `undefined`, если значение не объект, `null` или массив;
- возвращает `undefined` для нестрокового или пустого значения;
- не бросает исключение, если доступ к `localStorage` падает.

Дополнения в `create-module-fetcher.tests.ts`:

- при `allowLocalOverride: true` и наличии оверрайда `fetchAppManifest` вызывается с
  переопределённым адресом, а `moduleState.baseUrl` равен оверрайду;
- при `allowLocalOverride: true` без оверрайда используется `baseUrl`;
- при `allowLocalOverride: false` (по умолчанию) оверрайд игнорируется;
- текст ошибки использует фактический адрес манифеста при включённом оверрайде.

## Документация

- В README в разделе `createModuleFetcher` документируется `allowLocalOverride` и
  добавляется подраздел «Локальный оверрайд модулей»: ключ, формат JSON, пример для
  devtools и напоминание включать флаг только на тестовых стендах.
- Добавляется changeset с `minor` для `@alfalab/scripts-modules`.

## Файлы

- `packages/arui-scripts-modules/src/module-loader/utils/local-override.ts` (новый)
- `packages/arui-scripts-modules/src/module-loader/utils/__tests__/local-override.tests.ts` (новый)
- `packages/arui-scripts-modules/src/module-loader/create-module-fetcher.ts`
- `packages/arui-scripts-modules/src/module-loader/__tests__/create-module-fetcher.tests.ts`
- `packages/arui-scripts-modules/src/module-loader/index.ts` (экспорт константы)
- `packages/arui-scripts-modules/README.md`
- `.changeset/<name>.md`

## Что не входит

- Переопределение адреса для SSR-потока.
- Хелперы для управления оверрайдами (set/clear) и экспозиция на `window` — достаточно
  документированного формата `localStorage`.
- Ограничение адреса только localhost: допускается любой `http(s)` URL, безопасность
  обеспечивается выключенным по умолчанию флагом.
