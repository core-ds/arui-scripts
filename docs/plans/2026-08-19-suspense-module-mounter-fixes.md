**Goal:** Исправить выбор SSR payload для нескольких инстансов модуля и lifecycle `createLazyMounter`.

**Architecture:** `createSsrMounter` хранит клиентские loaders в `Map`, ключом которого является
вычисленный `instanceId`, и передаёт этот идентификатор embedded fetcher. `createLazyMounter`
хранит mounted target в ref, освобождает экземпляр модуля при remount/unmount и ведёт счётчик
активных экземпляров, чтобы освобождать общий результат lazy-загрузки только после последнего.

**Tech Stack:** TypeScript, React 18, Jest, Testing Library, Yarn workspaces.

---

### Task 1: Изолировать SSR payload по instanceId

**Files:**
- Modify: `packages/arui-scripts-modules/src/ssr/create-ssr-mounter.tsx:148-163, 265-290`
- Test: `packages/arui-scripts-modules/src/ssr/__tests__/create-ssr-mounter.tests.tsx`

- [ ] **Step 1: Write the failing integration test**

```tsx
it('hydrates each SSR instance with its own embedded payload', async () => {
    // Render `first` and `second` with distinct instanceId and moduleState values.
    // Hydrate them and assert each hydrate call receives its matching moduleState.
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn workspace @alfalab/scripts-modules test create-ssr-mounter.tests.tsx`

Expected: FAIL because both client instances read the first module payload.

- [ ] **Step 3: Create loaders per instanceId**

```tsx
const clientLoaders = new Map<string, Loader<GetResourcesParams, ModuleType>>();

function getClientLoader(instanceId: string) {
    let loader = clientLoaders.get(instanceId);
    if (!loader) {
        loader = createModuleLoader({
            moduleId,
            hostAppId,
            getModuleResources: createEmbeddedModuleFetcher({ instanceId, fallback: getModuleResources }),
            ...loaderOptions,
        });
        clientLoaders.set(instanceId, loader);
    }
    return loader;
}
```

Pass `instanceId` from `ClientModule` into `getClientLoader(instanceId)`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn workspace @alfalab/scripts-modules test create-ssr-mounter.tests.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/arui-scripts-modules/src/ssr/create-ssr-mounter.tsx packages/arui-scripts-modules/src/ssr/__tests__/create-ssr-mounter.tests.tsx
git commit -m "fix(modules): isolate SSR mounter payloads by instance"
```

### Task 2: Освобождать lazy-модуль и ресурсы

**Files:**
- Modify: `packages/arui-scripts-modules/src/module-loader/create-lazy-mounter.tsx:49-71`
- Test: `packages/arui-scripts-modules/src/module-loader/__tests__/create-lazy-mounter.tests.tsx`

- [ ] **Step 1: Write failing lifecycle tests**

```tsx
it('unmounts the module and loader resources when the component unmounts', async () => {
    // Render, wait for mount, unmount, then expect module.unmount and result.unmount.
});

it('unmounts before re-mounting when update is unavailable', async () => {
    // Rerender with new props and expect unmount before the second mount.
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn workspace @alfalab/scripts-modules test create-lazy-mounter.tests.tsx`

Expected: FAIL because the effect has no cleanup.

- [ ] **Step 3: Add lifecycle cleanup**

```tsx
let activeInstances = 0;

const mountedTargetRef = useRef<HTMLElement>();
const mountedRef = useRef(false);

useEffect(() => {
    if (mountedRef.current && module.update) {
        module.update(target, runParams, state);
        return;
    }
    if (mountedRef.current) module.unmount(target);
    module.mount(target, runParams, state);
    mountedTargetRef.current = target;
    mountedRef.current = true;
}, [runParams, target]);

useEffect(() => () => {
    if (mountedRef.current) module.unmount(mountedTargetRef.current!);
    activeInstances -= 1;
    if (activeInstances === 0) result.unmount();
}, []);
```

Increment `activeInstances` only after a successful initial `mount`. Keep refs for the current
target and ensure resource cleanup executes only after the last lazy component instance unmounts.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn workspace @alfalab/scripts-modules test create-lazy-mounter.tests.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/arui-scripts-modules/src/module-loader/create-lazy-mounter.tsx packages/arui-scripts-modules/src/module-loader/__tests__/create-lazy-mounter.tests.tsx
git commit -m "fix(modules): clean up lazy mounter lifecycle"
```

### Task 3: Verify combined module changes

**Files:** no source changes expected.

- [ ] **Step 1: Run the affected package test suite**

Run: `yarn workspace @alfalab/scripts-modules test`

Expected: PASS with zero failed tests.

- [ ] **Step 2: Inspect the final diff**

Run: `git diff master...HEAD --check && git status --short`

Expected: no whitespace errors; only the pre-existing untracked `docs/ssr-module-flow.md` remains.
