# Server-state local module override implementation plan

**Goal:** Добавить в `createServerStateModuleFetcher` опциональное переопределение `baseUrl` по `moduleId` через существующий localStorage-контракт, задокументировать API и выпустить его как minor-изменение.

**Architecture:** Fetcher остаётся владельцем сборки URL server-state endpoint. При каждом вызове он получает override через существующий `getLocalModuleOverride(params.moduleId)`, только если `allowLocalOverride` включён, и передаёт эффективный адрес в `urlSegmentWithoutEndSlash`; остальные части HTTP-контракта не меняются.

**Tech Stack:** TypeScript, Jest/jsdom, Yarn workspaces, Changesets, Markdown.

---

## File map

- Modify: `packages/arui-scripts-modules/src/module-loader/__tests__/create-server-state-module-fetcher.tests.ts` — зафиксировать URL-поведение для включённого, отсутствующего и выключенного override.
- Modify: `packages/arui-scripts-modules/src/module-loader/create-server-state-module-fetcher.ts` — добавить публичную опцию и вычисление эффективного `baseUrl`.
- Modify: `packages/arui-scripts-modules/README.md` — описать опцию и общий localStorage-контракт для server-state fetcher.
- Create: `.changeset/server-state-local-override.md` — объявить minor-изменение `@alfalab/scripts-modules`.

### Task 1: Add local override behavior with TDD

**Files:**
- Modify: `packages/arui-scripts-modules/src/module-loader/__tests__/create-server-state-module-fetcher.tests.ts:1-180`
- Modify: `packages/arui-scripts-modules/src/module-loader/create-server-state-module-fetcher.ts:1-51`

- [ ] **Step 1: Make the URL normalizer mock preserve its input and isolate localStorage**

Import the shared key:

```ts
import { LOCAL_OVERRIDE_STORAGE_KEY } from '../utils/local-override';
```

Replace the fixed normalizer result in `beforeAll` with:

```ts
(urlSegmentWithoutEndSlash as jest.Mock).mockImplementation((value: string) =>
    value.replace(/\/$/, ''),
);
```

Extend `beforeEach` so tests cannot leak overrides:

```ts
beforeEach(() => {
    mockFetch.mockReset();
    window.localStorage.clear();
});
```

- [ ] **Step 2: Write the failing override test and the compatibility cases**

Add these tests after the existing POST request test:

```ts
it('uses the override base url when allowLocalOverride is enabled', async () => {
    window.localStorage.setItem(
        LOCAL_OVERRIDE_STORAGE_KEY,
        JSON.stringify({ test: 'http://localhost:8080/' }),
    );
    mockResponse({ json: {} });

    const fetchServerResources = createServerStateModuleFetcher({
        baseUrl: 'https://test.com/',
        allowLocalOverride: true,
    });

    await fetchServerResources({
        moduleId: 'test',
        hostAppId: 'host',
        params: undefined,
    });

    expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/getModuleResources',
        expect.any(Object),
    );
});

it('falls back to baseUrl when no local override exists', async () => {
    mockResponse({ json: {} });

    const fetchServerResources = createServerStateModuleFetcher({
        baseUrl: 'https://test.com/',
        allowLocalOverride: true,
    });

    await fetchServerResources({
        moduleId: 'test',
        hostAppId: 'host',
        params: undefined,
    });

    expect(mockFetch).toHaveBeenCalledWith(
        'https://test.com/api/getModuleResources',
        expect.any(Object),
    );
});

it('ignores a local override when allowLocalOverride is disabled', async () => {
    window.localStorage.setItem(
        LOCAL_OVERRIDE_STORAGE_KEY,
        JSON.stringify({ test: 'http://localhost:8080' }),
    );
    mockResponse({ json: {} });

    const fetchServerResources = createServerStateModuleFetcher({
        baseUrl: 'https://test.com/',
    });

    await fetchServerResources({
        moduleId: 'test',
        hostAppId: 'host',
        params: undefined,
    });

    expect(mockFetch).toHaveBeenCalledWith(
        'https://test.com/api/getModuleResources',
        expect.any(Object),
    );
});
```

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
rtk yarn workspace @alfalab/scripts-modules test create-server-state-module-fetcher.tests.ts --runInBand
```

Expected: FAIL in `uses the override base url when allowLocalOverride is enabled` because `allowLocalOverride` is not present in `CreateServerResourcesFetcherParams` and/or the request still uses `https://test.com/api/getModuleResources`.

- [ ] **Step 4: Implement the minimal production change**

Add the helper import:

```ts
import { getLocalModuleOverride } from './utils/local-override';
```

Extend the parameter type:

```ts
type CreateServerResourcesFetcherParams = {
    baseUrl: string;
    headers?: Record<string, string>;
    /**
     * Разрешает переопределять базовый адрес приложения-источника модулей через localStorage
     * (см. LOCAL_OVERRIDE_STORAGE_KEY). По-умолчанию false.
     */
    allowLocalOverride?: boolean;
};
```

Document and destructure the option with a disabled default:

```ts
/**
 * Функция, которая создает метод для получения ресурсов модуля с серверным состоянием
 * @param baseUrl
 * @param headers
 * @param allowLocalOverride Флаг, включающий локальный оверрайд адреса модуля через localStorage
 */
export function createServerStateModuleFetcher<GetResourcesParams = undefined>({
    baseUrl,
    headers = {},
    allowLocalOverride = false,
}: CreateServerResourcesFetcherParams): ModuleResourcesGetter<GetResourcesParams, BaseModuleState> {
```

Replace URL construction inside `fetchServerResources` with:

```ts
const overrideBaseUrl = allowLocalOverride
    ? getLocalModuleOverride(params.moduleId)
    : undefined;
const effectiveBaseUrl = overrideBaseUrl ?? baseUrl;
const url = `${urlSegmentWithoutEndSlash(effectiveBaseUrl)}${relativePath}`;
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
rtk yarn workspace @alfalab/scripts-modules test create-server-state-module-fetcher.tests.ts --runInBand
```

Expected: PASS, 9 tests passed.

- [ ] **Step 6: Run all package tests**

Run:

```bash
rtk yarn workspace @alfalab/scripts-modules test --runInBand
```

Expected: PASS with no failed suites or tests.

- [ ] **Step 7: Commit the tested behavior**

```bash
rtk git add packages/arui-scripts-modules/src/module-loader/create-server-state-module-fetcher.ts packages/arui-scripts-modules/src/module-loader/__tests__/create-server-state-module-fetcher.tests.ts
rtk git commit -m "feat(modules): support local override for server state"
```

### Task 2: Document and release the public option

**Files:**
- Modify: `packages/arui-scripts-modules/README.md:85-115`
- Create: `.changeset/server-state-local-override.md`

- [ ] **Step 1: Update the README example and local override description**

Add the option to the `createServerStateModuleFetcher` example:

```ts
const getModuleResources = createServerStateModuleFetcher({
    baseUrl: '', // Базовый адрес приложения, которое предоставляет модули. Может быть как относительным, так и абсолютным.
    headers: {}, // опциональный параметр для передачи дополнительных заголовков в запрос
    allowLocalOverride: false, // опциональный флаг, включающий локальный оверрайд адреса модуля через localStorage (см. выше)
});
```

Replace the first sentence of `Локальный оверрайд модулей` with wording that covers both fetchers:

```md
При `allowLocalOverride: true` в `createModuleFetcher` или
`createServerStateModuleFetcher` фетчер читает из `localStorage` переопределения
базового адреса приложения-источника для конкретных модулей. Это удобно для отладки:
можно указать адрес локального dev-сервера модуля в уже задеплоенном приложении и
перезагрузить страницу.
```

Clarify what each fetcher requests from the overridden address:

```md
`createModuleFetcher` загружает с переопределённого адреса манифест и ресурсы,
а `createServerStateModuleFetcher` отправляет на него запрос получения ресурсов.
Некорректные значения игнорируются. Включайте флаг только на тестовых стендах: в
production это позволяет подменить код модуля произвольным адресом.
```

- [ ] **Step 2: Add the minor changeset**

Create `.changeset/server-state-local-override.md`:

```md
---
'@alfalab/scripts-modules': minor
---

**Что изменилось**
В `createServerStateModuleFetcher` добавлена опция `allowLocalOverride`, которая включает чтение из `localStorage` переопределения базового адреса приложения-источника для запрашиваемого `moduleId`. Запрос ресурсов отправляется на переопределённый адрес в том же формате, который уже поддерживает `createModuleFetcher`.

**Что делать потребителю**
Обязательных действий не требуется: опция по умолчанию выключена. Для отладки server-state модуля на тестовом стенде включите `allowLocalOverride: true` и укажите адрес локального dev-сервера в `localStorage` под ключом `arui-scripts-module-overrides`.
```

- [ ] **Step 3: Validate formatting and the package build**

Run:

```bash
rtk yarn workspace @alfalab/scripts-modules lint
rtk yarn workspace @alfalab/scripts-modules build
```

Expected: both commands exit 0; existing lint warnings may remain, but no new errors or formatting failures are introduced.

- [ ] **Step 4: Commit documentation and release metadata**

```bash
rtk git add packages/arui-scripts-modules/README.md .changeset/server-state-local-override.md
rtk git commit -m "docs(modules): document server-state local override"
```

### Task 3: Final verification

**Files:**
- Verify only; no file changes expected.

- [ ] **Step 1: Run the complete package verification from a clean working tree**

```bash
rtk yarn workspace @alfalab/scripts-modules test --runInBand
rtk yarn workspace @alfalab/scripts-modules lint
rtk yarn workspace @alfalab/scripts-modules build
rtk git diff --check HEAD~2..HEAD
rtk git status --short
```

Expected: tests, lint, build, and diff check exit 0; `git status --short` has no output.

- [ ] **Step 2: Review the final commit range against the approved spec**

```bash
rtk git log --oneline -3
rtk git diff --stat 83e6de7d..HEAD
rtk git diff 83e6de7d..HEAD -- packages/arui-scripts-modules/src/module-loader/create-server-state-module-fetcher.ts packages/arui-scripts-modules/src/module-loader/__tests__/create-server-state-module-fetcher.tests.ts packages/arui-scripts-modules/README.md .changeset/server-state-local-override.md
```

Expected: the diff contains only the approved fetcher option, its three behavior tests, README updates, and one minor changeset.
