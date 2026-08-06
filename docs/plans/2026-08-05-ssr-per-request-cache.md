**Goal:** Replace the process-global server resource cache of `createSsrMounter` with a per-request cache provided via React context, so concurrent HTTP requests can never share `moduleState` and entries from aborted renders cannot leak memory.

**Architecture:** A new provider `ModuleSsrRequestProvider` owns a fresh `Map` per HTTP request and exposes it through React context; `ServerModule` reads the cache via `useModuleSsrRequestContext()` (throwing a clear error when the provider is absent on the server) and `readSuspenseResource` becomes a pure function over the provided map. The global `Map` and `resetSuspenseResourceCache` are removed. The provider is hydration-transparent (renders `children` without a DOM node), so it is added only to the host's server entry point. Spec: `docs/specs/ssr-spec.md` §12.

**Tech Stack:** TypeScript, React 18 (context, hydration), Jest + Testing Library, Yarn workspaces, Changesets.

---

### File Structure

- Create `packages/arui-scripts-modules/src/ssr/request-context.tsx`
  - `ModuleSsrRequest` type, `SsrRequestContext`, `ModuleSsrRequestProvider`, `useModuleSsrRequestContext`.
- Create `packages/arui-scripts-modules/src/ssr/__tests__/request-context.tests.tsx`
  - Provider/hook unit tests.
- Create `packages/arui-scripts-modules/src/ssr/__tests__/suspense-resource-cache.tests.ts`
  - Pure `readSuspenseResource` unit tests.
- Modify `packages/arui-scripts-modules/src/ssr/suspense-resource-cache.ts`
  - `readSuspenseResource<T>(cache, key, load)`; export `CacheEntry`; remove the module-level `Map` and `resetSuspenseResourceCache`.
- Modify `packages/arui-scripts-modules/src/ssr/create-ssr-mounter.tsx`
  - `ServerModule` calls `useModuleSsrRequestContext()` and passes `cache` to `readSuspenseResource`.
- Modify `packages/arui-scripts-modules/src/ssr/__tests__/create-ssr-mounter.tests.tsx`
  - `renderServerHtml` wraps the tree in the provider; drop `resetSuspenseResourceCache`; add a throw-without-provider test.
- Modify `packages/arui-scripts-modules/src/ssr/index.ts`
  - Export `ModuleSsrRequestProvider`, `useModuleSsrRequestContext`, `ModuleSsrRequest`.
- Modify `packages/example/src/server/index.tsx`
  - Wrap `<App />` in `ModuleSsrRequestProvider` with a fresh `crypto.randomUUID()` per request.
- Modify `packages/arui-scripts-modules/README.md`
  - Document the provider requirement and `requestId` rules in the `createSsrMounter` section.
- Create `.changeset/ssr-per-request-cache.md`

Run tests from the repo root with:
`jest --config packages/arui-scripts-modules/jest.config.js <name>`

---

### Task 1: Per-request request context provider

**Files:**
- Create: `packages/arui-scripts-modules/src/ssr/request-context.tsx`
- Test: `packages/arui-scripts-modules/src/ssr/__tests__/request-context.tests.tsx`
- Modify: `packages/arui-scripts-modules/src/ssr/index.ts`

- [ ] **Step 1: Write the failing provider tests**

Create `packages/arui-scripts-modules/src/ssr/__tests__/request-context.tests.tsx`:

```tsx
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from '@testing-library/react';

import {
    ModuleSsrRequestProvider,
    type ModuleSsrRequest,
    useModuleSsrRequestContext,
} from '../request-context';

function Probe({ onContext }: { onContext: (request: ModuleSsrRequest) => void }) {
    onContext(useModuleSsrRequestContext());

    return null;
}

describe('ModuleSsrRequestProvider', () => {
    // createRoot.render() в React 18 может проглотить ошибку рендера в console.error,
    // поэтому проверяем throw через renderToStaticMarkup (он пробрасывает синхронно).
    it('throws when used without a provider', () => {
        expect(() => renderToStaticMarkup(<Probe onContext={() => {}} />)).toThrow(
            /ModuleSsrRequestProvider/,
        );
    });

    it('provides the requestId and a per-request cache Map', () => {
        let captured: ModuleSsrRequest | undefined;

        render(
            <ModuleSsrRequestProvider requestId='r1'>
                <Probe onContext={(request) => (captured = request)} />
            </ModuleSsrRequestProvider>,
        );

        expect(captured?.requestId).toBe('r1');
        expect(captured?.cache).toBeInstanceOf(Map);
    });

    it('resets the cache when the requestId changes', () => {
        const caches: Array<Map<string, unknown>> = [];

        const { rerender } = render(
            <ModuleSsrRequestProvider requestId='r1'>
                <Probe onContext={(request) => caches.push(request.cache)} />
            </ModuleSsrRequestProvider>,
        );

        rerender(
            <ModuleSsrRequestProvider requestId='r2'>
                <Probe onContext={(request) => caches.push(request.cache)} />
            </ModuleSsrRequestProvider>,
        );

        expect(caches[0]).not.toBe(caches[1]);
    });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `jest --config packages/arui-scripts-modules/jest.config.js request-context`
Expected: FAIL — `Cannot find module '../request-context'`.

- [ ] **Step 3: Implement the provider, context and hook**

Create `packages/arui-scripts-modules/src/ssr/request-context.tsx`:

```tsx
import React, { createContext, useContext, useMemo, useRef } from 'react';

import { type CacheEntry } from './suspense-resource-cache';

export type ModuleSsrRequest = {
    requestId: string;
    cache: Map<string, CacheEntry<unknown>>;
};

const SsrRequestContext = createContext<ModuleSsrRequest | undefined>(undefined);

/**
 * Провайдер per-request кэша серверного рендеринга модулей.
 *
 * Хост создаёт его на каждый HTTP-запрос с уникальным `requestId` (например,
 * `crypto.randomUUID()`) и передаёт `requestId` пропом — НЕ генерирует его внутри
 * рендера (Suspense throw→retry мог бы поменять его и сбросить кэш посередине рендера).
 *
 * Провайдер не рендерит DOM (оборачивает children без ноды), поэтому он
 * hydration-transparent: добавлять его нужно только в серверную точку входа хоста.
 * Кэш живёт в рамках запроса и умирает вместе с ним (GC). При смене `requestId`
 * кэш пересоздаётся.
 */
export function ModuleSsrRequestProvider({
    requestId,
    children,
}: {
    requestId: string;
    children: React.ReactNode;
}) {
    const cacheRef = useRef<{ requestId: string; cache: Map<string, CacheEntry<unknown>> } | null>(
        null,
    );

    if (!cacheRef.current || cacheRef.current.requestId !== requestId) {
        cacheRef.current = { requestId, cache: new Map() };
    }

    const value = useMemo<ModuleSsrRequest>(
        () => ({ requestId, cache: cacheRef.current!.cache }),
        [requestId],
    );

    return <SsrRequestContext.Provider value={value}>{children}</SsrRequestContext.Provider>;
}

export function useModuleSsrRequestContext(): ModuleSsrRequest {
    const context = useContext(SsrRequestContext);

    if (!context) {
        throw new Error(
            'createSsrMounter: для серверного рендеринга модуля оберните дерево в ' +
                '<ModuleSsrRequestProvider requestId="..."> с уникальным requestId на каждый ' +
                'HTTP-запрос хоста.',
        );
    }

    return context;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `jest --config packages/arui-scripts-modules/jest.config.js request-context`
Expected: PASS (3).

- [ ] **Step 5: Export the new API from the ssr subpath**

Modify `packages/arui-scripts-modules/src/ssr/index.ts` to append:

```ts
export {
    ModuleSsrRequestProvider,
    useModuleSsrRequestContext,
    type ModuleSsrRequest,
} from './request-context';
```

- [ ] **Step 6: Run the ssr tests to verify nothing broke**

Run: `jest --config packages/arui-scripts-modules/jest.config.js ssr`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/arui-scripts-modules/src/ssr/request-context.tsx \
  packages/arui-scripts-modules/src/ssr/__tests__/request-context.tests.tsx \
  packages/arui-scripts-modules/src/ssr/index.ts
git commit -m "feat(modules): add per-request ssr cache provider"
```

---

### Task 2: Pure readSuspenseResource + mounter wiring

**Files:**
- Test: `packages/arui-scripts-modules/src/ssr/__tests__/suspense-resource-cache.tests.ts` (new)
- Modify: `packages/arui-scripts-modules/src/ssr/suspense-resource-cache.ts`
- Modify: `packages/arui-scripts-modules/src/ssr/create-ssr-mounter.tsx`
- Modify: `packages/arui-scripts-modules/src/ssr/__tests__/create-ssr-mounter.tests.tsx`

- [ ] **Step 1: Write failing tests for the pure cache function**

Create `packages/arui-scripts-modules/src/ssr/__tests__/suspense-resource-cache.tests.ts`:

```ts
import { readSuspenseResource } from '../suspense-resource-cache';

function deferred() {
    let resolve!: (value: unknown) => void;

    const promise = new Promise((res) => {
        resolve = res;
    });

    return { promise, resolve };
}

describe('readSuspenseResource', () => {
    it('throws the pending promise, then returns the value on retry', async () => {
        const cache = new Map();
        const load = jest.fn(() => Promise.resolve('result'));

        expect(() => readSuspenseResource(cache, 'key', load)).toThrow();

        await Promise.resolve();

        expect(readSuspenseResource(cache, 'key', load)).toBe('result');
        expect(load).toHaveBeenCalledTimes(1);
    });

    it('dedupes concurrent reads with the same key into one load', async () => {
        const cache = new Map();
        const { promise, resolve } = deferred();
        const load = jest.fn(() => promise);

        expect(() => readSuspenseResource(cache, 'key', load)).toThrow();
        expect(() => readSuspenseResource(cache, 'key', load)).toThrow();

        resolve('result');
        await promise;

        expect(readSuspenseResource(cache, 'key', load)).toBe('result');
        expect(load).toHaveBeenCalledTimes(1);
    });

    it('throws the load error and removes the entry', async () => {
        const cache = new Map();
        const load = jest.fn(() => Promise.reject(new Error('boom')));

        expect(() => readSuspenseResource(cache, 'key', load)).toThrow();

        await Promise.resolve();

        expect(() => readSuspenseResource(cache, 'key', load)).toThrow('boom');
        expect(cache.size).toBe(0);
    });

    it('evicts the entry on the next microtask after a successful read', async () => {
        const cache = new Map();
        const load = jest.fn(() => Promise.resolve('result'));

        expect(() => readSuspenseResource(cache, 'key', load)).toThrow();

        await Promise.resolve();

        expect(readSuspenseResource(cache, 'key', load)).toBe('result');
        expect(cache.size).toBe(1);

        await Promise.resolve();

        expect(cache.size).toBe(0);
    });

    it('does not share entries between two different caches', async () => {
        const firstCache = new Map();
        const secondCache = new Map();
        const load = jest.fn(() => Promise.resolve('result'));

        expect(() => readSuspenseResource(firstCache, 'key', load)).toThrow();

        await Promise.resolve();

        expect(readSuspenseResource(firstCache, 'key', load)).toBe('result');
        expect(readSuspenseResource(secondCache, 'key', load)).toBe('result');
        expect(load).toHaveBeenCalledTimes(2);
    });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `jest --config packages/arui-scripts-modules/jest.config.js suspense-resource-cache`
Expected: FAIL — type error, `readSuspenseResource` takes 2 arguments but 3 given.

- [ ] **Step 3: Refactor `readSuspenseResource` to a pure function**

Replace the whole content of `packages/arui-scripts-modules/src/ssr/suspense-resource-cache.ts` with:

```ts
export type CacheEntry<T> = {
    status: 'pending' | 'success' | 'error';
    promise: Promise<void>;
    value?: T;
    error?: unknown;
};

/**
 * Читает значение для Suspense из переданного per-request кэша: при первом обращении
 * запускает `load()` и бросает промис (React покажет fallback и повторит рендер после
 * резолва). При повторном обращении возвращает результат или бросает ошибку.
 *
 * Кэш живёт в рамках одного HTTP-запроса хоста (см. `ModuleSsrRequestProvider`) — между
 * запросами записи не переиспользуются, поэтому `moduleState` одного запроса не может
 * попасть в другой. Eviction: запись удаляется на следующем микротаске после успешного
 * чтения — ровно чтобы пережить пару throw-promise → retry в рамках одного рендера.
 */
export function readSuspenseResource<T>(
    cache: Map<string, CacheEntry<unknown>>,
    key: string,
    load: () => Promise<T>,
): T {
    let entry = cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
        const created: CacheEntry<T> = {
            status: 'pending',
            promise: Promise.resolve(),
        };

        created.promise = load().then(
            (value) => {
                created.status = 'success';
                created.value = value;
            },
            (error) => {
                created.status = 'error';
                created.error = error;
            },
        );

        entry = created;
        cache.set(key, entry as CacheEntry<unknown>);
    }

    if (entry.status === 'pending') {
        // бросаем промис — механизм Suspense, а не ошибка
        // eslint-disable-next-line no-throw-literal, @typescript-eslint/no-throw-literal
        throw entry.promise;
    }

    if (entry.status === 'error') {
        cache.delete(key);
        // пробрасываем исходную ошибку загрузки как есть
        // eslint-disable-next-line no-throw-literal, @typescript-eslint/no-throw-literal
        throw entry.error;
    }

    // Успех: отдаём значение и планируем удаление записи после текущего прохода рендера.
    scheduleEviction(cache, key);

    return entry.value as T;
}

function scheduleEviction(cache: Map<string, CacheEntry<unknown>>, key: string) {
    const evict = () => cache.delete(key);

    if (typeof queueMicrotask === 'function') {
        queueMicrotask(evict);
    } else {
        Promise.resolve().then(evict);
    }
}
```

- [ ] **Step 4: Wire the per-request cache into `ServerModule`**

Modify `packages/arui-scripts-modules/src/ssr/create-ssr-mounter.tsx`:

1. Add an import after the `readSuspenseResource` import:

```ts
import { useModuleSsrRequestContext } from './request-context';
```

2. In `ServerModule`, replace the first line of the function body
   (`const instanceId = instanceIdProp ?? getDefaultInstanceId(ssrRunParams);`) with the context
   read followed by the same instance id line:

```tsx
        const { cache } = useModuleSsrRequestContext();
        const instanceId = instanceIdProp ?? getDefaultInstanceId(ssrRunParams);
```

3. Replace the `readSuspenseResource(cacheKey, () =>` call to pass the cache first:

```tsx
        const { resources, inlineStyles, styleUrls } = readSuspenseResource(cache, cacheKey, () =>
```

- [ ] **Step 5: Run the cache tests to verify they pass**

Run: `jest --config packages/arui-scripts-modules/jest.config.js suspense-resource-cache`
Expected: PASS (5).

- [ ] **Step 6: Update `create-ssr-mounter.tests.tsx` for the provider and new error**

Modify `packages/arui-scripts-modules/src/ssr/__tests__/create-ssr-mounter.tests.tsx`:

1. Replace the import of `resetSuspenseResourceCache` with the provider import:

```tsx
import { ModuleSsrRequestProvider } from '../request-context';
```

Remove the line `import { resetSuspenseResourceCache } from '../suspense-resource-cache';`.

2. In `beforeEach`, remove the line `resetSuspenseResourceCache();`.

3. Update the `renderServerHtml` helper to wrap the tree in the provider (the provider is
   hydration-transparent, so the client hydrate tests keep using the bare `element`):

```tsx
function renderServerHtml(element: React.ReactElement, wrapInProvider = true): Promise<string> {
    const tree = wrapInProvider ? (
        <ModuleSsrRequestProvider requestId='test-request'>{element}</ModuleSsrRequestProvider>
    ) : (
        element
    );

    const originalWindow = global.window;

    // @ts-expect-error — эмулируем серверное окружение без window
    delete global.window;

    return new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const writable = new Writable({
            write(chunk, _encoding, callback) {
                chunks.push(Buffer.from(chunk));
                callback();
            },
        });

        writable.on('finish', () => resolve(Buffer.concat(chunks).toString('utf8')));
        writable.on('error', reject);

        const { pipe } = renderToPipeableStream(tree, {
            onAllReady() {
                pipe(writable);
            },
            onShellError: reject,
        });
    }).finally(() => {
        global.window = originalWindow;
    });
}
```

4. Add a new test at the end of the `describe` block (before the closing `});` of the
   `describe('createSsrMounter', ...)`), asserting the server refuses to render without a provider:

```tsx
    it('throws on the server when the tree has no request provider', async () => {
        const getModuleResources = jest.fn().mockResolvedValue(buildResources());
        const { ModuleComponent } = createSsrMounter<RunParams>({
            moduleId: MODULE_ID,
            hostAppId: 'host',
            getModuleResources,
        });

        await expect(
            renderServerHtml(
                <Suspense fallback={<span>loading</span>}>
                    <ModuleComponent instanceId={INSTANCE_ID} ssrRunParams={{ name: 'Vasia' }} />
                </Suspense>,
                false,
            ),
        ).rejects.toThrow(/ModuleSsrRequestProvider/);
    });
```

- [ ] **Step 7: Run the full modules test suite**

Run: `jest --config packages/arui-scripts-modules/jest.config.js`
Expected: PASS (143+).

- [ ] **Step 8: Commit**

```bash
git add packages/arui-scripts-modules/src/ssr/suspense-resource-cache.ts \
  packages/arui-scripts-modules/src/ssr/__tests__/suspense-resource-cache.tests.ts \
  packages/arui-scripts-modules/src/ssr/create-ssr-mounter.tsx \
  packages/arui-scripts-modules/src/ssr/__tests__/create-ssr-mounter.tests.tsx
git commit -m "feat(modules): make server ssr cache per-request"
```

---

### Task 3: Wire the provider into the example host

**Files:**
- Modify: `packages/example/src/server/index.tsx`

- [ ] **Step 1: Wrap `<App />` in the provider**

Modify `packages/example/src/server/index.tsx`:

1. Add imports at the top of the file (after the existing imports):

```tsx
import { ModuleSsrRequestProvider } from '@alfalab/scripts-modules/ssr';
```

2. In the `/suspense` route handler, wrap `<App />` with a fresh per-request `requestId`:

```tsx
const { pipe, abort } = renderToPipeableStream(
    <AppHtml scripts={assets.js} styles={assets.css}>
        <ModuleSsrRequestProvider requestId={crypto.randomUUID()}>
            <App />
        </ModuleSsrRequestProvider>
    </AppHtml>,
    {
        bootstrapScripts: [],
        onShellReady() {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            pipe(res);
        },
        onShellError() {
            res.statusCode = 500;
            res.send('<h1>Error</h1>');
        },
        onError(err) {
            console.error(err);
        },
    },
);
```

(`crypto.randomUUID` is a global in Node 18+.)

- [ ] **Step 2: Verify the example type-checks**

Run from `packages/example`: `yarn lint:scripts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/example/src/server/index.tsx
git commit -m "feat(example): wrap ssr modules in per-request provider"
```

---

### Task 4: Documentation and changeset

**Files:**
- Modify: `packages/arui-scripts-modules/README.md`
- Create: `.changeset/ssr-per-request-cache.md`

- [ ] **Step 1: Document the provider requirement in the README**

In `packages/arui-scripts-modules/README.md`, inside the `### createSsrMounter` section, insert
the following paragraph right after the `ssrRunParams`/`instanceId` paragraph (which ends with
`...передавайте стабильный instanceId.`):

```markdown
Серверный рендеринг модулей использует per-request кэш ресурсов. На сервере оберните дерево
в `ModuleSsrRequestProvider` и передайте ему уникальный `requestId` на каждый HTTP-запрос
(например, `crypto.randomUUID()`):

```tsx
import { ModuleSsrRequestProvider } from '@alfalab/scripts-modules/ssr';

// внутри обработчика запроса хоста:
const requestId = crypto.randomUUID();

renderToPipeableStream(
    <AppHtml>
        <ModuleSsrRequestProvider requestId={requestId}>
            <App />
        </ModuleSsrRequestProvider>
    </AppHtml>,
    ...
);
```

`requestId` должен быть стабильным в рамках одного запроса (генерируйте его один раз на запрос,
а не внутри рендера) и уникальным между запросами — иначе кэш переживёт границу запросов и
`moduleState` одного запроса может попасть в другой. Если на сервере SSR-модуль рендерится без
провайдера, рендер упадёт с понятной ошибкой. На клиенте провайдер не нужен (он не рендерит DOM
и не влияет на гидрацию).
```

- [ ] **Step 2: Add the changeset**

Create `.changeset/ssr-per-request-cache.md`:

```md
---
'@alfalab/scripts-modules': minor
---

Серверный кэш ресурсов в `createSsrMounter` стал per-request: теперь он передаётся через
React-контекст провайдером `ModuleSsrRequestProvider` (`@alfalab/scripts-modules/ssr`), который
хост должен обернуть вокруг дерева на сервере с уникальным `requestId` на каждый HTTP-запрос.
Это исключает случайное переиспользование `moduleState` между одновременными запросами и утечку
записей кэша от прерванных рендеров. На клиенте провайдер не требуется.
```

- [ ] **Step 3: Run the full modules test suite once more**

Run: `jest --config packages/arui-scripts-modules/jest.config.js`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/arui-scripts-modules/README.md .changeset/ssr-per-request-cache.md
git commit -m "docs(modules): per-request ssr cache provider"
```

---

### Task 5: Final validation

**Files:** none (verification only)

- [ ] **Step 1: Run the modules package lint and tests**

Run from repo root:
`jest --config packages/arui-scripts-modules/jest.config.js`

Run from `packages/arui-scripts-modules`: `yarn lint:scripts`
Expected: all PASS, no lint errors.

- [ ] **Step 2: Run the example validate-build round-trip (slow gate)**

Run from `packages/example`: `yarn test`
Expected: PASS, including the SSR validate-build spec that exercises the real
`renderToPipeableStream` → jsdom hydrate round-trip. If this takes too long or the environment
lacks the built `@alfalab/scripts-modules` package, run the root `yarn build` first and retry.

- [ ] **Step 3: Confirm the spec is satisfied**

Check `docs/specs/ssr-spec.md` §12: provider API matches `request-context.tsx`; the global cache
is gone from `suspense-resource-cache.ts`; no `resetSuspenseResourceCache` references remain:

Run: `grep -rn "resetSuspenseResourceCache" packages/arui-scripts-modules/src`
Expected: no matches.
