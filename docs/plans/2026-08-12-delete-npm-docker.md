# Implementation Plan: deleteNpm config flag for docker build

**Goal:** Add a `deleteNpm` aruiScripts config flag (default `false`) that, when enabled, injects a
`RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx /usr/local/lib/node_modules/npm` step into the
generated Dockerfile for both `docker-build` and `docker-build:compiled`.

**Architecture:** Add a boolean to the shared `AppConfigs` type + default, read it inside the two
Dockerfile template modules (which already read `configs` at import time), and conditionally emit the
`RUN` step. Templates are covered by new unit tests that mock the `configs` module.

**Tech Stack:** TypeScript, jest (`src/**/__tests__/*.ts`), jest.doMock + jest.resetModules for
module-level config mocks, changesets for release notes.

---

## File Structure

- Modify: `packages/arui-scripts/src/configs/app-configs/types.ts` — add `deleteNpm: boolean` to `AppConfigs`.
- Modify: `packages/arui-scripts/src/configs/app-configs/get-defaults.ts` — add `deleteNpm: false` default.
- Modify: `packages/arui-scripts/src/templates/dockerfile.template.ts` — conditional `RUN` step for normal mode.
- Modify: `packages/arui-scripts/src/templates/dockerfile-compiled.template.ts` — conditional `RUN` step for compiled mode.
- Create: `packages/arui-scripts/src/templates/__tests__/dockerfile-templates.tests.ts` — tests for both templates.
- Modify: `packages/arui-scripts/docs/settings.md` — document the flag.
- Create: `.changeset/delete-npm-docker-flag.md` — release note.

---

### Task 1: Add the `deleteNpm` config field

**Files:**
- Modify: `packages/arui-scripts/src/configs/app-configs/types.ts:43`
- Modify: `packages/arui-scripts/src/configs/app-configs/get-defaults.ts:47`

- [ ] **Step 1: Add the field to the `AppConfigs` type**

In `packages/arui-scripts/src/configs/app-configs/types.ts`, in the "docker compilation configs"
section, directly after the `removeDevDependenciesDuringDockerBuild: boolean;` line:

```ts
    runFromNonRootUser: boolean;
    removeDevDependenciesDuringDockerBuild: boolean;
    deleteNpm: boolean;
```

- [ ] **Step 2: Add the default value**

In `packages/arui-scripts/src/configs/app-configs/get-defaults.ts`, in the `getDefaultAppConfig()`
return object directly after `removeDevDependenciesDuringDockerBuild: true,`:

```ts
        runFromNonRootUser: true,
        removeDevDependenciesDuringDockerBuild: true,
        deleteNpm: false,
```

- [ ] **Step 3: Verify typecheck**

Run: `yarn workspace arui-scripts tsc --project tsconfig-local.json --noEmit`
Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add packages/arui-scripts/src/configs/app-configs/types.ts packages/arui-scripts/src/configs/app-configs/get-defaults.ts
git commit -m "feat(configs): add deleteNpm setting (default false)"
```

---

### Task 2: Normal-mode template support

**Files:**
- Modify: `packages/arui-scripts/src/templates/dockerfile.template.ts`
- Test: `packages/arui-scripts/src/templates/__tests__/dockerfile-templates.tests.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/arui-scripts/src/templates/__tests__/dockerfile-templates.tests.ts` with:

```ts
describe('dockerfile.template (normal mode)', () => {
    function getTemplate(deleteNpm: boolean) {
        jest.resetModules();
        jest.doMock('../configs/app-configs', () => ({
            configs: {
                baseDockerImage: 'test-image',
                clientOnly: false,
                nginx: null,
                runFromNonRootUser: false,
                buildPath: '.build',
                deleteNpm,
            },
        }));

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('../dockerfile.template').dockerfileTemplate;
    }

    it('should add npm removal step when deleteNpm is enabled', () => {
        const template = getTemplate(true);

        expect(template).toContain(
            'RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx /usr/local/lib/node_modules/npm',
        );
    });

    it('should not add npm removal step when deleteNpm is disabled', () => {
        const template = getTemplate(false);

        expect(template).not.toContain('rm -rf /usr/local/bin/npm');
    });
});
```

Note: the test file mock path must be relative to `src/templates/__tests__/`. If the require of
`../dockerfile.template` pulls in modules that choke under jest (e.g. `../configs/util/apply-overrides`),
adjust the mock to also mock `../configs/util/apply-overrides` to return the identity function.

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn workspace arui-scripts test dockerfile-templates`
Expected: the `deleteNpm`-enabled case FAILS because the step is not emitted yet.

- [ ] **Step 3: Implement the conditional step**

In `packages/arui-scripts/src/templates/dockerfile.template.ts`, between the app `ADD` block and the
client-only `COPY`/`CMD` lines (around lines 37-43), add a new template interpolation line:

```ts
${
    configs.runFromNonRootUser
        ? `ADD --chown=nginx:nginx ${appPathToAdd} ${appTargetPath}`
        : `ADD ${appPathToAdd} ${appTargetPath}`
}
${configs.deleteNpm ? 'RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx /usr/local/lib/node_modules/npm' : ''}
${configs.clientOnly ? 'COPY env-config.jso[n] /src/' : ''}
${configs.clientOnly ? 'CMD ["nginx"]' : ''}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn workspace arui-scripts test dockerfile-templates`
Expected: all cases PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/arui-scripts/src/templates/dockerfile.template.ts packages/arui-scripts/src/templates/__tests__/dockerfile-templates.tests.ts
git commit -m "feat(docker-build): add npm removal step when deleteNpm is enabled"
```

---

### Task 3: Compiled-mode template support

**Files:**
- Modify: `packages/arui-scripts/src/templates/dockerfile-compiled.template.ts`
- Test: `packages/arui-scripts/src/templates/__tests__/dockerfile-templates.tests.ts`

- [ ] **Step 1: Add the failing test**

Append to `packages/arui-scripts/src/templates/__tests__/dockerfile-templates.tests.ts`:

```ts
describe('dockerfile-compiled.template (compiled mode)', () => {
    function getTemplate(deleteNpm: boolean) {
        jest.resetModules();
        jest.doMock('../configs/app-configs', () => ({
            configs: {
                baseDockerImage: 'test-image',
                nginx: null,
                deleteNpm,
            },
        }));
        jest.doMock('../commands/util/yarn', () => ({
            getInstallProductionCommand: () => 'npm install --production',
            getYarnVersion: () => 'unavailable',
        }));

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('../dockerfile-compiled.template').dockerfileTemplate;
    }

    it('should add npm removal step when deleteNpm is enabled', () => {
        const template = getTemplate(true);

        expect(template).toContain(
            'RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx /usr/local/lib/node_modules/npm',
        );
    });

    it('should not add npm removal step when deleteNpm is disabled', () => {
        const template = getTemplate(false);

        expect(template).not.toContain('rm -rf /usr/local/bin/npm');
    });

    it('should place the removal step before USER nginx', () => {
        const template = getTemplate(true);
        const rmStep = template.indexOf('rm -rf /usr/local/bin/npm');
        const userNginx = template.indexOf('USER nginx');

        expect(rmStep).toBeGreaterThan(-1);
        expect(rmStep).toBeLessThan(userNginx);
    });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn workspace arui-scripts test dockerfile-templates`
Expected: compiled-mode `deleteNpm` cases FAIL.

- [ ] **Step 3: Implement the conditional step**

In `packages/arui-scripts/src/templates/dockerfile-compiled.template.ts`, between
`ADD --chown=nginx:nginx . /src` and the nginx directory setup block (around lines 40-43), insert a
new template interpolation line:

```ts
ADD --chown=nginx:nginx . /src

# При необходимости удаляем npm и связанные библиотеки из образа
${configs.deleteNpm ? 'RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx /usr/local/lib/node_modules/npm' : ''}

# Создаем директории для nginx и выставляем правильные права
RUN mkdir -p /var/lib/nginx && \
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn workspace arui-scripts test dockerfile-templates`
Expected: all cases PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/arui-scripts/src/templates/dockerfile-compiled.template.ts packages/arui-scripts/src/templates/__tests__/dockerfile-templates.tests.ts
git commit -m "feat(docker-build:compiled): add npm removal step when deleteNpm is enabled"
```

---

### Task 4: Run the full test suite

**Files:** none

- [ ] **Step 1: Run all tests in the package**

Run: `yarn workspace arui-scripts test`
Expected: all tests PASS (no regressions).

- [ ] **Step 2: Run lint**

Run: `yarn workspace arui-scripts lint`
Expected: no lint errors. Fix any formatting with `yarn workspace arui-scripts format` if needed.

- [ ] **Step 3: Commit any lint fixes**

```bash
git add -A
git commit -m "chore: lint fixes"
```

(Only if Step 2 produced changes; otherwise skip this step.)

---

### Task 5: Update documentation

**Files:**
- Modify: `packages/arui-scripts/docs/settings.md`

- [ ] **Step 1: Add the `deleteNpm` section**

In `packages/arui-scripts/docs/settings.md`, directly after the `removeDevDependenciesDuringDockerBuild`
section (ends around line 199), add:

```markdown
#### deleteNpm
Удаляет npm и связанные с ним библиотеки (`/usr/local/bin/npm`, `/usr/local/bin/npx`,
`/usr/local/lib/node_modules/npm`) из итогового docker-образа, собираемого командами
[docker-build](./commands.md#docker-build) и [docker-build:compiled](./commands.md#docker-build-compiled).
Полезно для уменьшения поверхности атаки и исключения неиспользуемых пакетов, которые могут
ложно срабатывать в security-сканерах. По умолчанию `false`.
```

- [ ] **Step 2: Commit**

```bash
git add packages/arui-scripts/docs/settings.md
git commit -m "docs: document deleteNpm setting"
```

---

### Task 6: Add a changeset

**Files:**
- Create: `.changeset/delete-npm-docker-flag.md`

- [ ] **Step 1: Create the changeset file**

Create `.changeset/delete-npm-docker-flag.md` with:

```md
---
'arui-scripts': minor
---

Добавлена настройка `deleteNpm` для команд `docker-build` и `docker-build:compiled`. При её
включении из docker-образа удаляются npm и связанные с ним библиотеки, что уменьшает
поверхность атаки и исключает неиспользуемые пакеты из результатов security-сканирования.
```

- [ ] **Step 2: Commit**

```bash
git add .changeset/delete-npm-docker-flag.md
git commit -m "chore(changeset): add deleteNpm release note"
```

---

### Task 7: Final verification

**Files:** none

- [ ] **Step 1: Run full test suite + lint once more**

Run: `yarn workspace arui-scripts test && yarn workspace arui-scripts lint`
Expected: all tests PASS, no lint errors.

- [ ] **Step 2: Review the diff**

Run: `git log --oneline -8` and `git show --stat HEAD`
Expected: 6 feature commits (config, normal template, compiled template, docs, changeset, plus
optional lint fix) all present and coherent.
