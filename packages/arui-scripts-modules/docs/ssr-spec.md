# Spec: Server-Side Rendering support for modules

Status: draft
Packages affected: `@alfalab/scripts-modules`, `@alfalab/scripts-server`, example apps
Related branch: `feat/suspense-module-mounter`

## 1. Goals

1. A host application that renders HTML on the server (React 18+ streaming or string rendering)
   can include the **rendered HTML of a module** in its response, so the module is visible on
   first paint with no loading flash.
2. On the client, the module **hydrates** the server-rendered markup instead of re-mounting it,
   and does so **without repeating the `getModuleResources` request** made by the host server.
3. All existing consumers — hosts and module providers — keep working **without any changes**.
   Every new capability is opt-in on both sides of the contract and degrades gracefully when
   only one side has opted in.
4. The library remains usable in non-SSR apps exactly as today; SSR support must not increase
   the client bundle for consumers who don't use it.

### Non-goals

- Executing module JS bundles inside the host's server process (no `vm`, no module federation
  on the Node side). The module's own server renders the module's HTML.
- SSR for shadow-DOM mounting (`useShadowDom: true`). Declarative shadow DOM support may come
  later; for now SSR + shadow DOM is an explicit error.
- SSR for abstract and factory modules. Only **mountable** modules (`MountableModule`) can be
  server-rendered; other module types stay client-side.
- Streaming module HTML from the module server (the module server returns a complete HTML
  string per request).
- Automatic re-render of a server-rendered module when host state changes (covered by the
  separate `update()` contract extension, section 4.2).

## 2. Background: why modules can't SSR today

Three independent blockers:

1. **Resource injection.** `fetchResources` / `getResourcesTargetNodes` append `<script>` /
   `<link>` tags to `document.head` and wait for DOM `load` events.
   `createServerStateModuleFetcher` uses `XMLHttpRequest`, which doesn't exist in Node.
2. **Module retrieval.** Both `getModule` (module federation) and `getCompatModule` read from
   `window`; MF additionally requires `__webpack_init_sharing__` from a browser webpack runtime.
3. **The mount contract.** `mount(targetNode, runParams, serverState)` is imperative and
   client-only: there is no way to obtain HTML from a module on the server and no way to attach
   to existing markup on the client.

Additionally, the current `createLazyMounter` **crashes under `renderToPipeableStream`**:
React invokes the `React.lazy` factory on the server while resolving the Suspense boundary, and
the factory runs the loader (XHR + `document.head`). Fixing this is a prerequisite even for
apps that only want "render a fallback on the server".

## 3. Design overview

The SSR model is **HTML-over-the-wire**:

```
┌──────────────┐   getModuleResources({ ssr: { runParams } })   ┌───────────────┐
│ host server  │ ─────────────────────────────────────────────► │ module server │
│              │ ◄───────────────────────────────────────────── │               │
│              │   { html, scripts, styles, moduleState, ... }  └───────────────┘
│              │
│  streams / renders host HTML containing:
│    • module styles (inlined or as <link> tags)
│    • outlet <div> with the module's html
│    • serialized resources payload (JSON in <script type="application/json">)
└──────┬───────┘
       │ HTML
       ▼
┌──────────────┐
│ browser      │  1. host app hydrates; SSR mounter finds the embedded payload
│              │  2. loader runs with an "embedded" fetcher → no network request
│              │  3. module scripts load; existing style tags are adopted, not replaced
│              │  4. module.hydrate(targetNode, runParams, serverState) attaches
└──────────────┘
```

Key properties:

- The host server never executes module code; it only forwards HTML. Module and host can use
  different React versions (each mountable module owns its React root already).
- The module's server renders the module by importing the component **directly from its own
  source** — module client code and module server live in the same project, so no extra build
  target is needed.
- The expensive `getModuleResources` call happens exactly once, on the host server. The client
  gets its result via the embedded payload.

## 4. Contract changes (`@alfalab/scripts-modules`)

### 4.1 `ModuleResources`

```ts
export type ModuleResources<ModuleState extends BaseModuleState = BaseModuleState> = {
    // ...existing fields...
    /**
     * HTML модуля, отрендеренный на сервере модуля.
     * Присутствует только в ответ на запрос с полем `ssr`.
     */
    html?: string;
};
```

### 4.2 `MountableModule` — optional `hydrate` and `update`

```ts
export type MountableModule<RunParams = void, ServerState extends BaseModuleState = BaseModuleState> = {
    mount: ModuleMountFunction<RunParams, ServerState>;
    unmount: ModuleUnmountFunction;
    /**
     * Опциональный метод: модуль должен "оживить" (hydrate) серверную разметку,
     * находящуюся внутри targetNode, вместо её замены.
     * Типичная реализация: ReactDOM.hydrateRoot(targetNode, <Component {...} />).
     */
    hydrate?: ModuleMountFunction<RunParams, ServerState>;
    /**
     * Опциональный метод: обновить уже смонтированный модуль новыми параметрами
     * без полного перемонтирования (не теряя фокус/состояние DOM).
     * Типичная реализация: root.render(<Component {...newParams} />).
     */
    update?: ModuleMountFunction<RunParams, ServerState>;
};
```

Feature detection everywhere: if `hydrate` is absent on a server-rendered module, the mounter
clears the outlet and falls back to `mount()` (correct, but with a visual flash; dev-mode
`console.warn`). If `update` is absent, mounters keep their current re-mount behavior on
`runParams` change.

`isMountableModule()` in `create-module-loader.ts` must **not** be changed to require the new
methods.

### 4.3 `GetResourcesRequest` — SSR marker

```ts
export type GetResourcesRequest<GetResourcesParams = void> = {
    moduleId: string;
    hostAppId: string;
    params: GetResourcesParams;
    /**
     * Присутствует, если хост запрашивает серверный рендеринг модуля.
     */
    ssr?: {
        /** Сериализуемое подмножество runParams, с которым нужно отрендерить HTML */
        runParams?: unknown;
    };
};
```

Constraint (documented, not enforced): `ssr.runParams` must be JSON-serializable. Client-only
values (callbacks, refs) are passed later, at `hydrate` time. The module's render output must
depend only on the serializable subset plus `moduleState`, otherwise hydration will mismatch
inside the module's own root (module author's responsibility, same rule as any SSR app).

## 5. Server-side pieces

### 5.1 Module server: `createGetModulesMethod` (`@alfalab/scripts-server`)

Extend `ModuleDescriptor`:

```ts
export type ModuleDescriptor<FrameworkParams extends unknown[] = [], GetResourcesParams = void> = {
    mountMode: MountMode;
    version?: string;
    getModuleState: (...) => Promise<GetModuleStateResult>;
    /**
     * Опциональный серверный рендер модуля. Если задан и хост запросил ssr,
     * результат попадёт в поле `html` ответа.
     * Вызывается ПОСЛЕ getModuleState, получает готовый moduleState.
     */
    renderToHtml?: (
        params: {
            moduleState: GetModuleStateResult & { hostAppId: string };
            ssrRunParams: unknown;
            getResourcesRequest: GetResourcesRequest<GetResourcesParams>;
        },
        ...frameworkParams: FrameworkParams
    ) => string | Promise<string>;
};
```

`createGetModulesMethod` handler changes:

- If `getResourcesRequest.ssr` is present **and** the descriptor has `renderToHtml`, await it
  and include `html` in the response. Errors from `renderToHtml` must not fail the whole
  response: log, omit `html`, and let the client fall back to normal client-side mount
  (configurable via `ssrErrorMode: 'fallback' | 'reject'`, default `'fallback'`).
- If `ssr` is absent or `renderToHtml` is not defined — behavior is byte-for-byte today's.

The typical `renderToHtml` implementation imports the module component from the same codebase
and calls `renderToString` with the module's own React. No arui-scripts build changes required.

### 5.2 Isomorphic resources fetcher

`createServerStateModuleFetcher` is rewritten on `fetch` (Node 18+ and all supported browsers),
keeping the exact request shape (`POST`, JSON body, same headers behavior). Additions:

- Pass through `AbortSignal` (the loader already has one; today it is ignored by the fetcher).
- Works in Node without polyfills → the same fetcher is used by the host server.

This is a standalone, independently shippable change.

### 5.3 Host server/client: the SSR mounter

New public API — an **isomorphic** component factory (working name):

```ts
import { createSsrMounter } from '@alfalab/scripts-modules/ssr';

const { ModuleComponent } = createSsrMounter<RunParams, SsrRunParams>({
    loader,               // обычный лоадер из createModuleLoader
    getModuleResources,   // тот же fetcher, что передан в loader — нужен серверной части
    moduleId,
    fallback?: ReactNode, // что рендерить, если SSR не удался / выключен
});

// использование одинаково на сервере и клиенте:
<Suspense fallback={<Spinner />}>
    <ModuleComponent
        ssrRunParams={{ name: 'Vasia' }}   // сериализуемое, участвует в серверном рендере
        runParams={{ onClick, name: 'Vasia' }} // полные параметры для mount/hydrate
        instanceId?: string                // см. 5.5
    />
</Suspense>
```

**On the server** the component:

1. Suspends on `getModuleResources({ moduleId, hostAppId, params, ssr: { runParams: ssrRunParams } })`
   via a per-render promise cache keyed by `moduleId + instanceId` (integrates with React 18
   streaming: the host shell is not blocked; the module streams into its Suspense boundary).
2. Renders, in order:
   - module styles (see 5.4);
   - the outlet: `<div data-module-mount-id={instanceId}><div dangerouslySetInnerHTML={{ __html: resources.html }} /></div>`;
   - the embedded payload `<script type="application/json">` (see 5.5).
3. If the response has no `html` (module didn't opt in, or SSR failed) — renders the outlet
   empty plus the payload; the client will do a normal client-side mount, still skipping the
   duplicate resources request.

**On the client** the component:

1. Looks up the embedded payload for `moduleId + instanceId`. If found, the loader is invoked
   with an embedded fetcher (section 6.1) — no network call.
2. Renders the same outlet shape. Hydration-safety of the server HTML: on first client render
   the component snapshots `outlet.innerHTML` from the existing DOM (before React mutates
   anything) and passes it as the identical `dangerouslySetInnerHTML` value, so React 18
   hydration never discards the server markup. This snapshot technique is an implementation
   detail encapsulated in one place.
3. After scripts are loaded: calls `module.hydrate(target, runParams, serverState)` when both
   server HTML and `hydrate` exist; otherwise clears the outlet and calls `mount` (dev warning).
4. On `runParams` change: calls `module.update(...)` if present, else current behavior.
5. On unmount: `module.unmount(target)` + loader `unmount()` as today.

`createLazyMounter` (current branch) stays a **client-only** API: it gets a `typeof window`
guard so that under SSR the lazy factory resolves to a component rendering an empty outlet
(never running the loader on the server), and its docs state that `createSsrMounter` is the
SSR-capable variant. This fixes the current crash under `renderToPipeableStream` without
changing its client behavior.

### 5.4 Styles and FOUC

The whole point of SSR is first paint without flashes, so style delivery is part of the spec:

- **Default behavior: inline styles.** The host-server part of the mounter fetches
  the CSS files listed in `resources.styles` (server-to-server, cacheable) and emits them as
  `<style data-parent-app-id={moduleId} data-module-ssr-href={resolvedUrl}>...</style>`
  inside the same streamed chunk as the module HTML. With React 18 streaming, Suspense content
  is revealed atomically with its inline styles → no FOUC, no reliance on `<link>` load timing.
- **Opt-in behavior: `stylesMode: 'link'`.** The host-server part of the mounter emits
  `<link rel="stylesheet" type="text/css" href=... data-parent-app-id=... data-module-ssr-href=...>`
  instead of downloading CSS and embedding it into `<style>`. This keeps HTML smaller and lets
  the browser reuse its HTTP cache, but on React 18 the Suspense boundary may be revealed before
  the stylesheet finishes loading. Use this mode only when that tradeoff is acceptable for the
  host. The client adoption logic (6.2) keeps these server links in place and waits for `sheet`
  or `load` before mounting/hydrating the module.
- Server-fetched CSS is cached in-process keyed by URL (module asset URLs are content-hashed).

### 5.5 Embedded payload format

```html
<script type="application/json" data-module-ssr-payload="ServerStateModule" data-module-instance="a1">
{"scripts":["..."],"styles":["..."],"moduleState":{...},"mountMode":"default","appName":"...","moduleVersion":"..."}
</script>
```

- Content is `JSON.stringify` with `<`, `>`, `&`, U+2028/U+2029 escaped (`<` etc.) to
  prevent `</script>` breakout — a small shared `serializeForHtml` util with unit tests.
- `html` is **not** included in the payload (it already lives in the DOM).
- `data-module-instance`: distinguishes multiple instances of the same module on one page.
  Default is a stable hash of `ssrRunParams` (+ ordinal for identical params); overridable via
  the `instanceId` prop for full determinism. Documented recommendation: pass `instanceId`
  explicitly when rendering the same module more than once.
- Client util (also exported standalone):

```ts
export function getEmbeddedModuleResources(moduleId: string, instanceId?: string): ModuleResources | undefined;
```

## 6. Client-side pieces

### 6.1 Embedded fetcher

```ts
export function createEmbeddedModuleFetcher<GetResourcesParams = undefined>(options?: {
    /** fallback-фетчер для случаев, когда payload на странице нет (SPA-переходы) */
    fallback?: ModuleResourcesGetter<GetResourcesParams>;
    instanceId?: string;
}): ModuleResourcesGetter<GetResourcesParams>;
```

Resolution order: embedded payload → `fallback` → reject with a descriptive error.
`createSsrMounter` wires this automatically; the standalone export serves custom integrations
(e.g. `useModuleMounter` users who render module HTML themselves).

### 6.2 Resource adoption in `fetchResources`

Today `fetchResources` removes any tags with `data-parent-app-id={moduleId}` and re-appends
them — that would strip the server-emitted styles and cause the exact flash SSR is meant to
prevent.

New behavior (active only when server-emitted resources exist; otherwise unchanged):

- A tag is **adoptable** if it carries `data-module-ssr-href` (or `href`/`src`) that resolves
  to the same URL as a requested resource for the same `moduleId`.
- Adoptable styles: kept in place, not re-fetched, not re-appended. Inline `<style>` tags are
  by definition loaded; `<link>` tags are awaited via `link.sheet` presence or a `load`
  listener with a timeout fallback.
- Scripts are **not** emitted by the server (the server never runs module JS), so script
  loading is unchanged.
- Non-matching leftover SSR tags (e.g. module version changed between server render and a
  cached client navigation) are removed as today.
- `removeModuleResources` already removes by `data-parent-app-id`, so unmount cleans up adopted
  tags with no changes.

### 6.3 Mounter behavior matrix

| Server rendered HTML | module has `hydrate` | Result |
| --- | --- | --- |
| yes | yes | adopt styles → load scripts → `hydrate()` (no flash) |
| yes | no  | adopt styles → load scripts → clear outlet → `mount()` (flash; dev warning) |
| no (payload only) | — | load resources from payload → `mount()` (no duplicate request) |
| no payload at all | — | current behavior, network fetch → `mount()` |

`useShadowDom: true` combined with SSR → thrown error with a clear message (non-goal).

## 7. Backward-compatibility guarantees

1. No public API is removed or changes signature; all new fields/methods are optional.
2. `createModuleLoader`, `useModuleMounter`, `useModuleLoader`, compat/factory/abstract module
   flows: zero behavioral change when SSR features are not used. `fetchResources` adoption
   logic only activates when `data-module-ssr-*` markers are present in the DOM.
3. Old host + new module server: host never sends `ssr` → response identical to today.
4. New host + old module server: response has no `html` → client-side mount, still one
   resources request (row 3 of the matrix).
5. Old module bundles (no `hydrate`/`update`) work with every new mounter (rows 2–4).
6. `@alfalab/scripts-server` handler output for non-SSR requests is byte-for-byte unchanged.
7. Peer dependency stays `react >16.18`; SSR APIs additionally require React 18+ **on the
   host** (Suspense streaming) — checked at runtime with a clear error, not via peerDeps.
8. New server-only code (`createSsrMounter` server branch, CSS fetching) lives behind the
   `@alfalab/scripts-modules/ssr` subpath export, so client bundles of non-SSR consumers are
   unaffected. Adding the `exports` map must keep the root entry (`.`) resolving exactly as
   today's `main`/`module`/`typings`; deep imports into `src/` are not a supported surface and
   are not preserved.

## 8. Implementation plan

Each phase is independently releasable (changesets, minor versions).

**Phase 0 — SSR safety (bugfix-level, ship first)**
- `createServerStateModuleFetcher` → `fetch` + `AbortSignal` support.
- `createLazyMounter`: server guard (factory never runs the loader in Node; renders empty
  outlet). Fixes the `renderToPipeableStream` crash on the current branch.
- Tests: fetcher unit tests; a jsdom-free Node test asserting the lazy factory is server-safe.

**Phase 1 — contracts**
- Type extensions from section 4 (`html`, `hydrate`, `update`, `ssr` in the request).
- `serializeForHtml` + `getEmbeddedModuleResources` utils with tests.
- `@alfalab/scripts-server`: `renderToHtml` in `ModuleDescriptor` + handler support +
  `ssrErrorMode`.

**Phase 2 — client hydration path**
- Resource adoption in `fetchResources` (section 6.2) with jsdom tests for every matrix row.
- `createEmbeddedModuleFetcher`.
- `update()` support in `useModuleMounter` / `createLazyMounter` (call instead of re-mount when
  present).

**Phase 3 — `createSsrMounter`**
- `exports` map in package.json (`.` preserving current resolution, new `./ssr` subpath).
- Server branch: suspense cache, inline styles emission, outlet, payload.
- Client branch: payload lookup, innerHTML snapshot hydration, hydrate/mount fallback chain.
- Integration tests: real `renderToPipeableStream` → serialize → jsdom hydrate round-trip.

**Phase 4 — examples and docs**
- `example-modules`: add an SSR-capable module (`renderToHtml` on the server, `hydrate`/`update`
  exports on the client) — both `default` (MF) and `compat` variants.
- `example`: replace the hand-rolled suspense mounter demo with `createSsrMounter` usage in the
  streaming server (`src/server/index.tsx`), keeping one non-SSR mounter demo per existing type.
- Fix the `@alfalab/scripts-modules/src/...` deep import in example code (unsupported surface,
  see section 10, decision 3).
- README: new "Серверный рендеринг модулей" section: contracts, matrix from 6.3, serializable
  runParams rule, inline-styles behavior and opt-in `stylesMode: 'link'` tradeoffs,
  migration notes for module authors (3 steps: implement `renderToHtml`, export `hydrate`,
  export `update`).
- validate-build tests in both examples covering the SSR round-trip.

## 9. Edge cases and risks

- **Multiple instances of one module with different `ssrRunParams`** — handled via
  `instanceId`; the resources cache key in `create-module-loader` must not collide (payloads
  differ only in `moduleState` when params differ; scripts/styles are shared and adopted once).
- **Version skew**: page HTML rendered against module v1, user keeps the tab open, module
  server deploys v2, client SPA-navigates and re-mounts → embedded payload (v1 URLs,
  content-hashed) still resolves as long as the module server keeps N previous asset versions
  available. Document this as an operational requirement for module providers using SSR.
- **`resourcesCache: 'single-item'` + embedded fetcher**: compatible (the embedded result just
  seeds the cache), but `useShadowDom` restrictions stay as-is.
- **Security**: `html` is injected via `dangerouslySetInnerHTML`. Trust model documented: only
  point loaders at first-party module servers; the payload serializer prevents script breakout,
  but the module HTML itself is trusted by design.
- **Hydration mismatch inside the module** (module rendered with different data than the
  client passes): module's own responsibility; recommend modules log/report hydration errors
  from their `hydrateRoot` `onRecoverableError`.
- **`abort`/timeout on the host server**: the suspense cache entry must reject on the render's
  abort signal so `renderToPipeableStream`'s `abort()` doesn't leak pending fetches.

## 10. Resolved decisions

1. **Naming: `createSsrMounter`.** A separate factory; `createLazyMounter` stays small and
   client-only (it only gains the Phase 0 server guard).
2. **`stylesMode: 'link'` is opt-in; inline remains the default.** Inline styles remain the
   default because they best satisfy the no-FOUC goal on React 18 streaming. Link mode is exposed
   for hosts that prefer smaller HTML and browser-cacheable stylesheets and accept the stylesheet
   load timing tradeoff.
3. **Server-only host code ships via the `@alfalab/scripts-modules/ssr` subpath export.**
   Requires adding an `exports` map to package.json: `"."` mapping to today's `main`/`module`/
   `typings`, plus `"./ssr"`. Deep imports like `@alfalab/scripts-modules/src/...` (seen once in
   example code) are auto-import mistakes, not a supported surface, and are not preserved — the
   example is fixed as part of Phase 4. The `ssr` subpath keeps Node-only code (server CSS
   fetching, payload serialization) out of client bundles without relying on tree-shaking.
4. **`createSsrMounter` builds the client loader itself (supersedes the §5.3 signature).**
   Instead of accepting a pre-built `loader`, the factory takes `getModuleResources` +
   `moduleId` + `hostAppId` (+ the loader options) and constructs the client loader internally,
   wrapping the fetcher in `createEmbeddedModuleFetcher`. Rationale: the whole point is that the
   client skips the resources request; a caller-supplied loader built with the plain network
   fetcher would silently re-request. Making the wiring internal makes "no duplicate request"
   impossible to get wrong. A caller-supplied loader could be added later as a power-user escape
   hatch. The §5.3 example (passing `loader` + `getModuleResources`) is therefore out of date.

## 11. Deferred in Phase 3 — return here later

These were consciously **not** implemented in the first `createSsrMounter` cut. None block the
core goal (server render + client hydrate with no duplicate resources request); each is isolated
enough to add without reworking what shipped.

### 11.1 `fallback?: ReactNode` factory option (§5.3) — deferred

**What it was meant to do:** render `fallback` when SSR is disabled or the server render failed,
instead of surfacing an error.

**Why deferred — the hydration-consistency problem.** If the server renders `fallback` (a
different subtree than the normal outlet+payload+styles wrapper), then on the client there is no
`data-module-ssr-root` element to snapshot and no embedded payload to read. The client component
would render its normal wrapper → **hydration mismatch** against the server's `fallback` markup,
and worse, no payload means the client silently falls back to a network request (defeating the
point). Making `fallback` correct means the server and client must agree on rendering `fallback`
*and* the client must then transition from fallback → mounted module in a hydration-safe way —
essentially a second, parallel outlet/handoff path. That's real design work, not a small add.

**What ships instead:** no `fallback` prop. Errors during the server resource read propagate to
the host's own error boundary; the host wraps the module in its own `<Suspense fallback>` (for the
pending state) and error boundary (for failure). This is idiomatic React 18 and covers the common
cases. Note the module server's `ssrErrorMode: 'fallback'` (§5.1) already turns a *module-render*
failure into a normal response with no `html` (→ client-side mount, no error), so the mounter-level
`fallback` is only needed for hard resource-fetch failures.

**When picking this up:** decide whether `fallback` is (a) purely a host concern (document
"wrap in your own error boundary", possibly drop the prop from the spec), or (b) a real
server↔client handoff to build. If (b): render `fallback` inside the same `data-module-ssr-root`
wrapper on both sides, emit a payload marker that says "SSR fallback, mount fresh on client", and
have the client clear the fallback and `mount()` (never `hydrate()`).

### 11.2 Server suspense cache is process-global, not per-request

`suspense-resource-cache.ts` keys entries by `moduleId + instanceId + params + ssrRunParams` in a
module-level `Map`, and evicts each entry on a microtask right after it is read (just long enough
to survive the throw-promise → retry cycle within one render). Consequences:

- **Cross-request sharing edge case:** two requests rendering concurrently with an *identical*
  cache key can share one in-flight fetch. That's correct only if `moduleState` is a pure function
  of the key. If `moduleState` depends on request context **not** captured in `params`/`ssrRunParams`
  (auth headers, cookies, locale from the request), concurrent identical-keyed requests could leak
  one request's state into another. Documented contract (§4.3) already requires render output to
  depend only on the serializable params + `moduleState`; this makes that a hard requirement for
  SSR, not just a recommendation.
- **No abort wiring (§9 "abort/timeout on the host server"):** the cache entry does not reject on
  the host render's abort signal, so a `renderToPipeableStream({ ... }).abort()` can leave a pending
  resources fetch running (it just resolves into a soon-to-be-evicted entry). Not a correctness bug
  for the response, but a potential dangling request.

**When picking this up:** the clean fix is a **per-request cache** rather than a module-global one —
e.g. pass a cache object via React context that the host creates per request, or adopt React 19's
`cache()` / `use()` once we can rely on it. That also gives a natural place to thread the render's
`AbortSignal` into `getModuleResources` so aborts cancel in-flight fetches.

### 11.3 `<link>`-mode style adoption

The Phase 2 adoption logic (`fetch-resources.ts`) handles both `<style>` and `<link>` tags with
`data-module-ssr-href`. Inline mode emits loaded `<style>` tags. Link mode emits stylesheet links;
the client keeps matching links in place, waits for `link.sheet`/`load` with the existing timeout,
and avoids appending duplicate stylesheet tags.
