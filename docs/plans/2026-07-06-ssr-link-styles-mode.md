**Goal:** Add opt-in SSR stylesheet link emission for `createSsrMounter`, so hosts can use server-rendered `<link rel="stylesheet">` tags instead of inline `<style>` tags.

**Architecture:** Keep the existing inline style behavior as the default. Add `stylesMode?: 'inline' | 'link'` to `createSsrMounter`; the server loader always resolves stylesheet URLs, fetches CSS content only in `inline` mode, and the server component renders either `<style>` or `<link>` tags with the existing SSR adoption attributes. The current client adoption path in `fetchResources` already handles SSR `<link>` tags, so client code should only need tests proving that behavior remains covered.

**Tech Stack:** TypeScript, React 18 SSR, Jest, Testing Library, Yarn workspaces, Changesets.

---

### File Structure

- Modify `packages/arui-scripts-modules/src/ssr/server-module-loader.ts`
  - Add `StylesMode`.
  - Return resolved stylesheet URLs in `ServerModulePayload`.
  - Skip CSS fetching when `stylesMode` is `'link'`.
- Modify `packages/arui-scripts-modules/src/ssr/create-ssr-mounter.tsx`
  - Add `stylesMode?: StylesMode` to `CreateSsrMounterOptions`.
  - Default `stylesMode` to `'inline'`.
  - Render `<link rel='stylesheet' type='text/css'>` tags when `stylesMode` is `'link'`.
- Modify `packages/arui-scripts-modules/src/ssr/__tests__/create-ssr-mounter.tests.tsx`
  - Add server-render tests for default inline mode and explicit link mode.
- Modify `packages/arui-scripts-modules/src/module-loader/utils/__tests__/fetch-resources.tests.ts`
  - Strengthen existing SSR `<link>` adoption coverage so it proves links are adopted, not duplicated.
- Modify `packages/arui-scripts-modules/docs/ssr-spec.md`
  - Replace the follow-up wording in section 5.4 with the implemented `stylesMode` behavior.
  - Update rollout/tasks/open decisions that currently say link mode is out of scope.
- Modify `packages/arui-scripts-modules/README.md`
  - Document `stylesMode: 'inline' | 'link'`, default behavior, and the React 18 FOUC tradeoff.
- Create `.changeset/ssr-link-styles-mode.md`
  - Add a minor changeset for `@alfalab/scripts-modules`.

### Task 1: Add Failing SSR Tests For Link Mode

**Files:**
- Modify: `packages/arui-scripts-modules/src/ssr/__tests__/create-ssr-mounter.tests.tsx`

- [ ] **Step 1: Add a test proving inline remains the default**

Insert this test after `server renders styles, outlet html and embedded payload` or adjust that existing test to include the new `fetchStyleContent` assertion:

```tsx
it('uses inline styles by default on the server', async () => {
    const fetchStyleContent = jest.fn().mockResolvedValue('.a{color:red}');
    const getModuleResources = jest
        .fn()
        .mockResolvedValue(buildResources({ styles: ['static/main.css'] }));

    const { ModuleComponent } = createSsrMounter<RunParams>({
        moduleId: MODULE_ID,
        hostAppId: 'host',
        getModuleResources,
        fetchStyleContent,
    });

    const html = await renderServerHtml(
        <Suspense fallback={<span>loading</span>}>
            <ModuleComponent instanceId={INSTANCE_ID} ssrRunParams={{ name: 'Vasia' }} />
        </Suspense>,
    );

    expect(fetchStyleContent).toHaveBeenCalledWith('https://module.example.com/app/static/main.css');
    expect(html).toContain('<style');
    expect(html).toContain('data-parent-app-id="ServerStateModule"');
    expect(html).toContain(
        'data-module-ssr-href="https://module.example.com/app/static/main.css"',
    );
    expect(html).toContain('.a{color:red}');
    expect(html).not.toContain('rel="stylesheet"');
});
```

- [ ] **Step 2: Add a failing test for explicit link mode**

Insert this test next to the inline server-render test:

```tsx
it('can render server styles as stylesheet links', async () => {
    const fetchStyleContent = jest.fn().mockResolvedValue('.a{color:red}');
    const getModuleResources = jest
        .fn()
        .mockResolvedValue(buildResources({ styles: ['static/main.css'] }));

    const { ModuleComponent } = createSsrMounter<RunParams>({
        moduleId: MODULE_ID,
        hostAppId: 'host',
        getModuleResources,
        fetchStyleContent,
        stylesMode: 'link',
    });

    const html = await renderServerHtml(
        <Suspense fallback={<span>loading</span>}>
            <ModuleComponent instanceId={INSTANCE_ID} ssrRunParams={{ name: 'Vasia' }} />
        </Suspense>,
    );

    expect(fetchStyleContent).not.toHaveBeenCalled();
    expect(html).toContain('<link');
    expect(html).toContain('rel="stylesheet"');
    expect(html).toContain('type="text/css"');
    expect(html).toContain('href="https://module.example.com/app/static/main.css"');
    expect(html).toContain('data-parent-app-id="ServerStateModule"');
    expect(html).toContain(
        'data-module-ssr-href="https://module.example.com/app/static/main.css"',
    );
    expect(html).not.toContain('.a{color:red}');
});
```

- [ ] **Step 3: Run the focused test and verify it fails**

Run:

```bash
yarn workspace @alfalab/scripts-modules test src/ssr/__tests__/create-ssr-mounter.tests.tsx --runInBand
```

Expected: fail with a TypeScript or runtime error around unknown `stylesMode`, and/or missing `<link rel="stylesheet">` output.

### Task 2: Add Styles Mode To The Server Loader

**Files:**
- Modify: `packages/arui-scripts-modules/src/ssr/server-module-loader.ts`

- [ ] **Step 1: Add the public mode type and payload field**

Change the type section near `FetchStyleContent` to:

```ts
/**
 * Как хост-сервер отдаёт стили SSR-модуля.
 * inline — скачивает CSS и встраивает его в <style>.
 * link — отдаёт <link rel="stylesheet"> без server-to-server скачивания CSS.
 */
export type StylesMode = 'inline' | 'link';

/**
 * Функция, скачивающая содержимое css-файла модуля (server-to-server) для инлайна
 * в HTML. По умолчанию — глобальный `fetch` (Node 18+).
 */
export type FetchStyleContent = (url: string) => Promise<string>;

export type InlineStyle = {
    /** resolved URL стиля — используется как `data-module-ssr-href` для «усыновления» на клиенте */
    href: string;
    /** содержимое css-файла */
    content: string;
};

export type ServerModulePayload<ModuleState extends BaseModuleState = BaseModuleState> = {
    resources: ModuleResources<ModuleState>;
    /** resolved URL стилей — используются для inline и link SSR-вывода */
    styleUrls: string[];
    inlineStyles: InlineStyle[];
};
```

- [ ] **Step 2: Add `stylesMode` to load params**

Change `LoadServerModuleParams` to:

```ts
type LoadServerModuleParams<GetResourcesParams, ModuleState extends BaseModuleState> = {
    moduleId: string;
    hostAppId: string;
    params: GetResourcesParams;
    ssrRunParams: unknown;
    getModuleResources: ModuleResourcesGetter<GetResourcesParams, ModuleState>;
    fetchStyleContent: FetchStyleContent;
    stylesMode: StylesMode;
    signal?: AbortSignal;
};
```

- [ ] **Step 3: Skip CSS downloads in link mode**

Replace the style fetching block in `loadServerModule` with:

```ts
    const { baseUrl } = resources.moduleState;
    const styleUrls = resources.styles.map((src) => resolveResourceUrl(src, baseUrl));

    const inlineStyles =
        stylesMode === 'inline'
            ? await Promise.all(
                  styleUrls.map(async (href): Promise<InlineStyle | null> => {
                      try {
                          return { href, content: await fetchStyleContent(href) };
                      } catch {
                          return null;
                      }
                  }),
              )
            : [];

    return {
        resources,
        styleUrls,
        inlineStyles: inlineStyles.filter((style): style is InlineStyle => style !== null),
    };
```

Also destructure `stylesMode` in the function parameter list:

```ts
    fetchStyleContent,
    stylesMode,
    signal,
```

- [ ] **Step 4: Run the focused test and verify the failure moved**

Run:

```bash
yarn workspace @alfalab/scripts-modules test src/ssr/__tests__/create-ssr-mounter.tests.tsx --runInBand
```

Expected: still fail because `createSsrMounter` does not expose/pass `stylesMode` and does not render link tags yet.

- [ ] **Step 5: Keep the failing state uncommitted**

Do not commit yet. The failing tests from Task 1 are intentional TDD feedback, and this
intermediate server-loader state still does not pass the focused SSR mounter test. Continue to
Task 3 and commit once the mounter implementation makes the test pass.

### Task 3: Render Link Styles From createSsrMounter

**Files:**
- Modify: `packages/arui-scripts-modules/src/ssr/create-ssr-mounter.tsx`

- [ ] **Step 1: Import the mode type**

Change the import from `server-module-loader` to include `StylesMode`:

```ts
import {
    createDefaultFetchStyleContent,
    type FetchStyleContent,
    loadServerModule,
    type StylesMode,
} from './server-module-loader';
```

- [ ] **Step 2: Add the option to `CreateSsrMounterOptions`**

Add this field next to `fetchStyleContent`:

```ts
    /**
     * Как отдавать стили SSR-модуля на сервере.
     * inline — дефолт без FOUC для React 18 streaming.
     * link — меньший HTML и browser cache, но Suspense boundary может раскрыться до загрузки CSS.
     */
    stylesMode?: StylesMode;
```

- [ ] **Step 3: Default the option to inline**

Change the `createSsrMounter` destructuring to:

```ts
    getModuleResources,
    fetchStyleContent = createDefaultFetchStyleContent(),
    stylesMode = 'inline',
    ...loaderOptions
}: CreateSsrMounterOptions<RunParams, GetResourcesParams, ModuleState>) {
```

- [ ] **Step 4: Pass the mode to `loadServerModule` and read `styleUrls`**

Change the server resource read to:

```ts
        const { resources, inlineStyles, styleUrls } = readSuspenseResource(cacheKey, () =>
            loadServerModule<GetResourcesParams, ModuleState>({
                moduleId,
                hostAppId,
                params: getResourcesParams as GetResourcesParams,
                ssrRunParams,
                getModuleResources,
                fetchStyleContent,
                stylesMode,
            }),
        );
```

- [ ] **Step 5: Render either inline styles or stylesheet links**

Replace the current `{inlineStyles.map(...)}` JSX block with:

```tsx
                {stylesMode === 'inline'
                    ? inlineStyles.map((style) => (
                          <style
                              key={style.href}
                              {...{
                                  [DATA_APP_ID_ATTRIBUTE]: moduleId,
                                  [MODULE_SSR_HREF_ATTRIBUTE]: style.href,
                              }}
                              dangerouslySetInnerHTML={{ __html: style.content }}
                          />
                      ))
                    : styleUrls.map((href) => (
                          <link
                              key={href}
                              rel='stylesheet'
                              type='text/css'
                              href={href}
                              {...{
                                  [DATA_APP_ID_ATTRIBUTE]: moduleId,
                                  [MODULE_SSR_HREF_ATTRIBUTE]: href,
                              }}
                          />
                      ))}
```

- [ ] **Step 6: Run the focused SSR mounter tests**

Run:

```bash
yarn workspace @alfalab/scripts-modules test src/ssr/__tests__/create-ssr-mounter.tests.tsx --runInBand
```

Expected: pass.

- [ ] **Step 7: Commit the passing mounter implementation**

```bash
git add packages/arui-scripts-modules/src/ssr/create-ssr-mounter.tsx packages/arui-scripts-modules/src/ssr/server-module-loader.ts packages/arui-scripts-modules/src/ssr/__tests__/create-ssr-mounter.tests.tsx
git commit -m "feat(ssr): add stylesheet link mode"
```

### Task 4: Confirm Client Adoption Covers SSR Links

**Files:**
- Modify: `packages/arui-scripts-modules/src/module-loader/utils/__tests__/fetch-resources.tests.ts`

- [ ] **Step 1: Strengthen the adopted link test**

Replace the existing `should await an adopted <link> style until it loads` test with:

```ts
    it('should adopt an SSR <link> style, wait until it loads, and not add duplicates', async () => {
        const ssrLink = appendSsrStyle('/static/css/main.css', 'link') as HTMLLinkElement;

        let resolved = false;
        const promise = fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: [],
            styles: ['/static/css/main.css'],
            baseUrl: '',
        }).then(() => {
            resolved = true;
        });

        // Пока событие load не пришло, а sheet отсутствует (jsdom), промис не резолвится.
        await Promise.resolve();
        expect(resolved).toBe(false);

        ssrLink.dispatchEvent(new Event('load'));
        await promise;

        const ssrLinks = document.head.querySelectorAll(
            `link[${DATA_APP_ID_ATTRIBUTE}="${MODULE_ID}"][${MODULE_SSR_HREF_ATTRIBUTE}]`,
        );

        expect(resolved).toBe(true);
        expect(document.head.contains(ssrLink)).toBe(true);
        expect(ssrLinks).toHaveLength(1);
        expect(ssrLinks[0]).toBe(ssrLink);
        expect(stylesFetcher).toHaveBeenCalledWith(expect.objectContaining({ urls: [] }));
    });
```

- [ ] **Step 2: Run the adoption test**

Run:

```bash
yarn workspace @alfalab/scripts-modules test src/module-loader/utils/__tests__/fetch-resources.tests.ts --runInBand
```

Expected: pass without production code changes because link adoption already exists in `fetch-resources.ts`.

- [ ] **Step 3: Commit the adoption coverage**

```bash
git add packages/arui-scripts-modules/src/module-loader/utils/__tests__/fetch-resources.tests.ts
git commit -m "test(ssr): cover adopted stylesheet links"
```

### Task 5: Update SSR Documentation And Changeset

**Files:**
- Modify: `packages/arui-scripts-modules/docs/ssr-spec.md`
- Modify: `packages/arui-scripts-modules/README.md`
- Create: `.changeset/ssr-link-styles-mode.md`

- [ ] **Step 1: Update section 5.4 of the SSR spec**

Replace the current `Follow-up (out of scope for v1...)` bullet with:

```md
- **Opt-in behavior: `stylesMode: 'link'`.** The host-server part of the mounter emits
  `<link rel="stylesheet" type="text/css" href=... data-parent-app-id=... data-module-ssr-href=...>`
  instead of downloading CSS and embedding it into `<style>`. This keeps HTML smaller and lets
  the browser reuse its HTTP cache, but on React 18 the Suspense boundary may be revealed before
  the stylesheet finishes loading. Use this mode only when that tradeoff is acceptable for the
  host. The client adoption logic (6.2) keeps these server links in place and waits for `sheet`
  or `load` before mounting/hydrating the module.
```

Also update section 10 decision 2 from "out of scope" to:

```md
2. **`stylesMode: 'link'` is opt-in; inline remains the default.** Inline styles remain the
   default because they best satisfy the no-FOUC goal on React 18 streaming. Link mode is exposed
   for hosts that prefer smaller HTML and browser-cacheable stylesheets and accept the stylesheet
   load timing tradeoff.
```

Update section 11.3 from dead-code wording to:

```md
### 11.3 `<link>`-mode style adoption

The Phase 2 adoption logic (`fetch-resources.ts`) handles both `<style>` and `<link>` tags with
`data-module-ssr-href`. Inline mode emits loaded `<style>` tags. Link mode emits stylesheet links;
the client keeps matching links in place, waits for `link.sheet`/`load` with the existing timeout,
and avoids appending duplicate stylesheet tags.
```

- [ ] **Step 2: Update README usage docs**

Replace the paragraph that says link mode is planned with:

````md
По умолчанию стили SSR-модуля инлайнятся в HTML хоста как `<style>` рядом с разметкой
модуля. Это устраняет FOUC при React 18 streaming: Suspense-boundary раскрывается вместе с
готовыми стилями.

Если хосту важнее меньший HTML и browser cache для CSS, можно включить link-режим:

```tsx
const { ModuleComponent } = createSsrMounter({
    moduleId: 'ServerStateModule',
    hostAppId: 'host',
    getModuleResources,
    stylesMode: 'link',
});
```

В этом режиме сервер отдаёт `<link rel="stylesheet" type="text/css">` с SSR-атрибутами.
Клиент переиспользует эти теги и не добавляет дубликаты. На React 18 Suspense-boundary может
раскрыться до окончания загрузки CSS, поэтому `inline` остаётся значением по умолчанию.
````

- [ ] **Step 3: Add a changeset**

Create `.changeset/ssr-link-styles-mode.md`:

```md
---
'@alfalab/scripts-modules': minor
---

Added opt-in `stylesMode: 'link'` for SSR module mounters. Hosts can now render module styles as
server-emitted stylesheet links while the default inline mode remains unchanged.
```

- [ ] **Step 4: Run docs grep to confirm stale follow-up wording is gone**

Run:

```bash
rg -n "stylesMode: 'link'.*(out of scope|planned follow-up|not exposed)|link mode is dead|запланирован как follow-up" packages/arui-scripts-modules/docs/ssr-spec.md packages/arui-scripts-modules/README.md
```

Expected: no matches.

- [ ] **Step 5: Commit docs and changeset**

```bash
git add packages/arui-scripts-modules/docs/ssr-spec.md packages/arui-scripts-modules/README.md .changeset/ssr-link-styles-mode.md
git commit -m "docs(ssr): document stylesheet link mode"
```

### Task 6: Final Verification

**Files:**
- Verify only.

- [ ] **Step 1: Run package tests**

```bash
yarn workspace @alfalab/scripts-modules test --runInBand
```

Expected: pass.

- [ ] **Step 2: Run package type build**

```bash
yarn workspace @alfalab/scripts-modules build
```

Expected: pass.

- [ ] **Step 3: Run package lint if time permits**

```bash
yarn workspace @alfalab/scripts-modules lint
```

Expected: pass or only pre-existing unrelated failures. Any failure in touched files must be fixed before completion.

- [ ] **Step 4: Inspect final diff**

```bash
git diff --stat HEAD~3..HEAD
git diff HEAD~3..HEAD -- packages/arui-scripts-modules/src/ssr packages/arui-scripts-modules/src/module-loader/utils packages/arui-scripts-modules/docs/ssr-spec.md packages/arui-scripts-modules/README.md .changeset/ssr-link-styles-mode.md
```

Expected: changes are limited to SSR link mode implementation, tests, docs, and changeset.

- [ ] **Step 5: Final implementation summary**

Report:

```md
Implemented opt-in `stylesMode: 'link'` for `createSsrMounter`.

Verification:
- `yarn workspace @alfalab/scripts-modules test --runInBand`
- `yarn workspace @alfalab/scripts-modules build`
- `yarn workspace @alfalab/scripts-modules lint`
```

### Self-Review

- Spec coverage: the plan covers the omitted SSR spec follow-up by exposing `stylesMode: 'link'`, preserving inline default behavior, avoiding CSS downloads in link mode, rendering SSR-marked stylesheet links, relying on existing client adoption, and updating docs.
- Placeholder scan: no task uses placeholder markers, incomplete requirements, or unspecified "add tests" language.
- Type consistency: the same `StylesMode`, `stylesMode`, `styleUrls`, `inlineStyles`, `FetchStyleContent`, and `ServerModulePayload` names are used across loader, mounter, tests, and docs.
