# Локальный оверрайд адреса модуля

**Goal:** Позволить переопределять `baseUrl` приложения-источника модуля через `localStorage`, чтобы разработчик мог проверять изменения модуля в уже задеплоенном приложении, не поднимая consumer.

**Architecture:** Новый утилитный модуль `utils/local-override.ts` читает и валидирует JSON-карту `{ moduleId: url }` из `localStorage`. `createModuleFetcher` получает опцию `allowLocalOverride` (по умолчанию `false`) и при каждом вызове резолвит эффективный `baseUrl` (`override ?? baseUrl`), от которого строит URL манифеста и который кладёт в `moduleState.baseUrl`. Так как `createModuleLoader` и `fetchResources` резолвят скрипты/стили относительно `moduleState.baseUrl`, оверрайд автоматически распространяется и на ресурсы. Из корня пакета экспортируется константа ключа.

**Tech Stack:** TypeScript, Jest (jsdom), `@alfalab/scripts-modules`.

---

## Файлы

- Create: `packages/arui-scripts-modules/src/module-loader/utils/local-override.ts` — ключ + безопасное чтение/валидация оверрайда.
- Test: `packages/arui-scripts-modules/src/module-loader/utils/__tests__/local-override.tests.ts`
- Modify: `packages/arui-scripts-modules/src/module-loader/create-module-fetcher.ts` — опция `allowLocalOverride`, резолв `effectiveBaseUrl` per call.
- Test: `packages/arui-scripts-modules/src/module-loader/__tests__/create-module-fetcher.tests.ts`
- Modify: `packages/arui-scripts-modules/src/module-loader/index.ts` — экспорт `LOCAL_OVERRIDE_STORAGE_KEY`.
- Modify: `packages/arui-scripts-modules/README.md` — документация.
- Create: `.changeset/local-module-override.md`

Команды для запуска тестов пакета выполняются из `packages/arui-scripts-modules` (`workdir`).

---

### Task 1: Утилита чтения оверрайда

**Files:**
- Create: `packages/arui-scripts-modules/src/module-loader/utils/local-override.ts`
- Test: `packages/arui-scripts-modules/src/module-loader/utils/__tests__/local-override.tests.ts`

- [ ] **Step 1: Написать падающий тест**

Создать `src/module-loader/utils/__tests__/local-override.tests.ts`:

```ts
import { getLocalModuleOverride, LOCAL_OVERRIDE_STORAGE_KEY } from '../local-override';

describe('getLocalModuleOverride', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('returns the override url for a known module', () => {
        window.localStorage.setItem(
            LOCAL_OVERRIDE_STORAGE_KEY,
            JSON.stringify({ 'module-A': 'http://localhost:8080' }),
        );

        expect(getLocalModuleOverride('module-A')).toBe('http://localhost:8080');
    });

    it('returns undefined if the key is missing', () => {
        expect(getLocalModuleOverride('module-A')).toBeUndefined();
    });

    it('returns undefined on invalid JSON', () => {
        window.localStorage.setItem(LOCAL_OVERRIDE_STORAGE_KEY, '{not-json');

        expect(getLocalModuleOverride('module-A')).toBeUndefined();
    });

    it('returns undefined if the value is not an object', () => {
        window.localStorage.setItem(LOCAL_OVERRIDE_STORAGE_KEY, '"string"');
        expect(getLocalModuleOverride('module-A')).toBeUndefined();

        window.localStorage.setItem(LOCAL_OVERRIDE_STORAGE_KEY, '42');
        expect(getLocalModuleOverride('module-A')).toBeUndefined();
    });

    it('returns undefined if the value is null or an array', () => {
        window.localStorage.setItem(LOCAL_OVERRIDE_STORAGE_KEY, 'null');
        expect(getLocalModuleOverride('module-A')).toBeUndefined();

        window.localStorage.setItem(LOCAL_OVERRIDE_STORAGE_KEY, '["module-A"]');
        expect(getLocalModuleOverride('module-A')).toBeUndefined();
    });

    it('returns undefined for non-string or empty values', () => {
        window.localStorage.setItem(
            LOCAL_OVERRIDE_STORAGE_KEY,
            JSON.stringify({ 'module-A': 123, 'module-B': '', 'module-C': '   ' }),
        );

        expect(getLocalModuleOverride('module-A')).toBeUndefined();
        expect(getLocalModuleOverride('module-B')).toBeUndefined();
        expect(getLocalModuleOverride('module-C')).toBeUndefined();
    });

    it('does not throw when localStorage access fails', () => {
        const originalGetItem = Storage.prototype.getItem;

        Storage.prototype.getItem = () => {
            throw new Error('SecurityError');
        };

        expect(getLocalModuleOverride('module-A')).toBeUndefined();

        Storage.prototype.getItem = originalGetItem;
    });
});
```

- [ ] **Step 2: Запустить тест, убедиться что падает**

Run: `yarn jest src/module-loader/utils/__tests__/local-override.tests.ts`
Expected: FAIL — «Cannot find module '../local-override'».

- [ ] **Step 3: Реализовать утилиту**

Создать `src/module-loader/utils/local-override.ts`:

```ts
export const LOCAL_OVERRIDE_STORAGE_KEY = 'arui-scripts-module-overrides';

/**
 * Возвращает переопределённый базовый адрес приложения-источника для модуля
 * или undefined, если оверрайда нет или он некорректен.
 * Любая ошибка доступа к localStorage не должна ломать загрузку модуля.
 */
export function getLocalModuleOverride(moduleId: string): string | undefined {
    try {
        const raw = window.localStorage.getItem(LOCAL_OVERRIDE_STORAGE_KEY);

        if (!raw) {
            return undefined;
        }

        const parsed: unknown = JSON.parse(raw);

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return undefined;
        }

        const value = (parsed as Record<string, unknown>)[moduleId];

        return typeof value === 'string' && value.trim() ? value.trim() : undefined;
    } catch {
        return undefined;
    }
}
```

- [ ] **Step 4: Запустить тест, убедиться что проходит**

Run: `yarn jest src/module-loader/utils/__tests__/local-override.tests.ts`
Expected: PASS (8 тестов).

- [ ] **Step 5: Коммит**

```bash
git add src/module-loader/utils/local-override.ts src/module-loader/utils/__tests__/local-override.tests.ts
git commit -m "feat(modules): add local module override reader"
```

---

### Task 2: Оверрайд в createModuleFetcher

**Files:**
- Modify: `packages/arui-scripts-modules/src/module-loader/create-module-fetcher.ts`
- Test: `packages/arui-scripts-modules/src/module-loader/__tests__/create-module-fetcher.tests.ts`

- [ ] **Step 1: Добавить тесты**

Дополнить `src/module-loader/__tests__/create-module-fetcher.tests.ts`. Импорт в начале файла:

```ts
import { LOCAL_OVERRIDE_STORAGE_KEY } from '../utils/local-override';
```

В конец файла добавить:

```ts
describe('createModuleFetcher with local override', () => {
    const mockManifest = {
        __metadata__: {
            version: '1.0',
            name: 'Test App',
        },
        module1: {
            js: 'module1.js',
            css: 'module1.css',
            mode: 'compat',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        window.localStorage.clear();
    });

    it('uses the override base url when allowLocalOverride is enabled', async () => {
        window.localStorage.setItem(
            LOCAL_OVERRIDE_STORAGE_KEY,
            JSON.stringify({ module1: 'http://localhost:8080' }),
        );
        (fetchAppManifest as jest.Mock).mockResolvedValue(mockManifest);

        const moduleFetcher = createModuleFetcher({
            baseUrl: 'http://example.com',
            allowLocalOverride: true,
        });

        const moduleResources = await moduleFetcher({
            moduleId: 'module1',
            hostAppId: 'app1',
            params: undefined,
        });

        expect(fetchAppManifest).toHaveBeenCalledWith(
            'http://localhost:8080/assets/webpack-assets.json',
        );
        expect(moduleResources.moduleState.baseUrl).toBe('http://localhost:8080');
    });

    it('falls back to baseUrl when no override exists', async () => {
        (fetchAppManifest as jest.Mock).mockResolvedValue(mockManifest);

        const moduleFetcher = createModuleFetcher({
            baseUrl: 'http://example.com',
            allowLocalOverride: true,
        });

        const moduleResources = await moduleFetcher({
            moduleId: 'module1',
            hostAppId: 'app1',
            params: undefined,
        });

        expect(fetchAppManifest).toHaveBeenCalledWith(
            'http://example.com/assets/webpack-assets.json',
        );
        expect(moduleResources.moduleState.baseUrl).toBe('http://example.com');
    });

    it('ignores override when allowLocalOverride is disabled', async () => {
        window.localStorage.setItem(
            LOCAL_OVERRIDE_STORAGE_KEY,
            JSON.stringify({ module1: 'http://localhost:8080' }),
        );
        (fetchAppManifest as jest.Mock).mockResolvedValue(mockManifest);

        const moduleFetcher = createModuleFetcher({ baseUrl: 'http://example.com' });

        const moduleResources = await moduleFetcher({
            moduleId: 'module1',
            hostAppId: 'app1',
            params: undefined,
        });

        expect(fetchAppManifest).toHaveBeenCalledWith(
            'http://example.com/assets/webpack-assets.json',
        );
        expect(moduleResources.moduleState.baseUrl).toBe('http://example.com');
    });

    it('uses the effective manifest url in the not-found error', async () => {
        window.localStorage.setItem(
            LOCAL_OVERRIDE_STORAGE_KEY,
            JSON.stringify({ missing: 'http://localhost:8080' }),
        );
        (fetchAppManifest as jest.Mock).mockResolvedValue({
            __metadata__: { version: '1.0', name: 'Test App' },
        });

        const moduleFetcher = createModuleFetcher({
            baseUrl: 'http://example.com',
            allowLocalOverride: true,
        });

        await expect(
            moduleFetcher({ moduleId: 'missing', hostAppId: 'app1', params: undefined }),
        ).rejects.toThrow(
            'Module missing not found in manifest from http://localhost:8080/assets/webpack-assets.json',
        );
    });
});
```

- [ ] **Step 2: Запустить тесты, убедиться что новые падают**

Run: `yarn jest src/module-loader/__tests__/create-module-fetcher.tests.ts`
Expected: новые 4 теста FAIL (поведение не реализовано), старые 2 PASS.

- [ ] **Step 3: Реализовать поддержку оверрайда**

Заменить всё содержимое `src/module-loader/create-module-fetcher.ts` на:

```ts
import { fetchAppManifest } from './utils/fetch-app-manifest';
import { getLocalModuleOverride } from './utils/local-override';
import { urlSegmentWithoutEndSlash } from './utils/normalize-url-segment';
import { type ModuleResourcesGetter } from './create-module-loader';
import { type AruiAppManifest, type BaseModuleState, type ModuleResources } from './types';

type CreateClientResourcesFetcherParams = {
    baseUrl: string;
    assetsUrl?: string;
    /**
     * Разрешает переопределять базовый адрес приложения-источника модулей через localStorage
     * (см. LOCAL_OVERRIDE_STORAGE_KEY). По-умолчанию false.
     */
    allowLocalOverride?: boolean;
};

// js/css в манифесте могут быть строкой или массивом, нормализуем в плоский список.
function toArray(value: string | string[] | undefined): string[] {
    if (!value) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
}

/**
 * Функция, которая создает метод для получения ресурсов модуля.
 * Предполагается, что она будет использоваться вместе с createModuleLoader.
 * @param baseUrl Базовый адрес приложения, которое предоставляет модули
 * @param assetsUrl Опциональный параметр для переопределения адреса манифеста
 * @param allowLocalOverride Флаг, включающий локальный оверрайд адреса модуля через localStorage
 */
export function createModuleFetcher({
    baseUrl,
    assetsUrl = '/assets/webpack-assets.json',
    allowLocalOverride = false,
}: CreateClientResourcesFetcherParams): ModuleResourcesGetter<void, BaseModuleState> {
    function getModuleFiles(manifest: AruiAppManifest, moduleId: string, manifestUrl: string) {
        if (!manifest[moduleId]) {
            throw new Error(`Module ${moduleId} not found in manifest from ${manifestUrl}`);
        }

        const moduleFiles = manifest[moduleId];
        const moduleVendorFiles = manifest[`vendor-${moduleId}`] || {};

        return {
            scripts: [...toArray(moduleFiles.js), ...toArray(moduleVendorFiles.js)],
            styles: [...toArray(moduleFiles.css), ...toArray(moduleVendorFiles.css)],
            mode: moduleFiles.mode || 'compat',
        };
    }

    return async function getClientModuleResources({
        moduleId,
        hostAppId,
    }): Promise<ModuleResources> {
        const overrideBaseUrl = allowLocalOverride ? getLocalModuleOverride(moduleId) : undefined;
        const effectiveBaseUrl = overrideBaseUrl ?? baseUrl;
        const manifestUrl = `${urlSegmentWithoutEndSlash(effectiveBaseUrl)}${assetsUrl}`;
        const manifest = await fetchAppManifest(manifestUrl);
        const { mode, ...moduleFiles } = getModuleFiles(manifest, moduleId, manifestUrl);

        return {
            ...moduleFiles,
            /* eslint-disable no-underscore-dangle */
            moduleVersion: manifest.__metadata__.version || 'unknown',
            appName: manifest.__metadata__.name,
            /* eslint-enable no-underscore-dangle */
            mountMode: mode,
            moduleState: {
                baseUrl: effectiveBaseUrl,
                hostAppId,
            },
        };
    };
}
```

- [ ] **Step 4: Запустить тесты, убедиться что проходят**

Run: `yarn jest src/module-loader/__tests__/create-module-fetcher.tests.ts src/module-loader/utils/__tests__/local-override.tests.ts`
Expected: PASS (все 6 + 8 тестов).

- [ ] **Step 5: Коммит**

```bash
git add src/module-loader/create-module-fetcher.ts src/module-loader/__tests__/create-module-fetcher.tests.ts
git commit -m "feat(modules): support local base url override in createModuleFetcher"
```

---

### Task 3: Экспорт константы из корня пакета

**Files:**
- Modify: `packages/arui-scripts-modules/src/module-loader/index.ts`

- [ ] **Step 1: Добавить экспорт**

Добавить в конец `src/module-loader/index.ts` (после существующих экспортов из `utils/serialize-for-html`):

```ts
export { LOCAL_OVERRIDE_STORAGE_KEY } from './utils/local-override';
```

- [ ] **Step 2: Проверка сборки и линта**

Run: `yarn build:commonjs && yarn lint:scripts`
Expected: сборка успешна, линт без ошибок.

- [ ] **Step 3: Коммит**

```bash
git add src/module-loader/index.ts
git commit -m "feat(modules): export LOCAL_OVERRIDE_STORAGE_KEY"
```

---

### Task 4: Документация в README

**Files:**
- Modify: `packages/arui-scripts-modules/README.md`

- [ ] **Step 1: Дополнить раздел createModuleFetcher**

В блоке кода раздела `### `createModuleFetcher`` (README.md, строки ~78-81) заменить:

```ts
const getModuleResources = createModuleFetcher({
    baseUrl: '', // Базовый адрес приложения, которое предоставляет модули. Может быть как относительным, так и абсолютным.
    assetsUrl: '/assets/webpack-assets.json', // опциональный параметр для переопределения пути до файла с манифестом
});
```

на:

```ts
const getModuleResources = createModuleFetcher({
    baseUrl: '', // Базовый адрес приложения, которое предоставляет модули. Может быть как относительным, так и абсолютным.
    assetsUrl: '/assets/webpack-assets.json', // опциональный параметр для переопределения пути до файла с манифестом
    allowLocalOverride: false, // опциональный флаг, включающий локальный оверрайд адреса модуля через localStorage (см. ниже)
});
```

После блока кода `createModuleFetcher` (строка 82, до раздела `### `createServerStateModuleFetcher``) вставить подраздел:

```markdown
#### Локальный оверрайд модулей

При `allowLocalOverride: true` фетчер читает из `localStorage` переопределения базового
адреса приложения-источника для конкретных модулей. Это удобно для отладки: можно указать
адрес локального dev-сервера модуля в уже задеплоенном приложении и перезагрузить страницу.

Ключ: `arui-scripts-module-overrides` (константа `LOCAL_OVERRIDE_STORAGE_KEY`).
Значение — JSON-объект, где ключ — `moduleId`, значение — базовый адрес:

```js
localStorage.setItem(
    'arui-scripts-module-overrides',
    JSON.stringify({ 'module-A': 'http://localhost:8080' }),
);
```

С переопределённого адреса загружаются и манифест, и ресурсы модуля. Некорректные
значения игнорируются. Включайте флаг только на тестовых стендах: в production это
позволяет подменить код модуля произвольным адресом.
```

- [ ] **Step 2: Проверка форматирования**

Run: `yarn format:check`
Expected: PASS (форматирование соответствует prettier).

- [ ] **Step 3: Коммит**

```bash
git add README.md
git commit -m "docs(modules): document local module override"
```

---

### Task 5: Changeset

**Files:**
- Create: `.changeset/local-module-override.md`

- [ ] **Step 1: Создать changeset**

Создать `.changeset/local-module-override.md`:

```markdown
---
"@alfalab/scripts-modules": minor
---

Добавлена возможность локально переопределять адрес приложения-источника модуля через `localStorage` (ключ `arui-scripts-module-overrides`). Опция `allowLocalOverride` в `createModuleFetcher` включает чтение оверрайдов `{ moduleId: url }`; манифест и ресурсы модуля загружаются с переопределённого адреса. По умолчанию опция выключена.
```

- [ ] **Step 2: Коммит**

```bash
git add .changeset/local-module-override.md
git commit -m "chore(modules): add changeset for local module override"
```

---

### Task 6: Финальная проверка

**Files:**
- none

- [ ] **Step 1: Полный прогон тестов, линта и сборки пакета**

Run (из `packages/arui-scripts-modules`):
`yarn test && yarn lint && yarn build`
Expected: все тесты PASS, линт без ошибок, сборка успешна.