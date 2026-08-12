# deleteNpm config flag for docker build

## Problem

The `docker-build` and `docker-build:compiled` commands generate a Dockerfile based on the
`alfabankui/arui-scripts` base image, which ships with `node`, `npm` and `npx` installed.
At runtime the server does not need `npm`/`npx`, so leaving them in the image wastes space.

## Goal

Add a new `aruiScripts` config flag `deleteNpm` (default `false`). When enabled, the generated
Dockerfile (for both `docker-build` and `docker-build:compiled`) removes `npm` and its libraries
from the container:

```dockerfile
RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx /usr/local/lib/node_modules/npm
```

## Scope

- Add `deleteNpm: boolean` to `AppConfigs` and a `false` default.
- Add a conditional `RUN` step to the normal-mode template and to the compiled-mode template.
- Add tests for both templates (step present when `deleteNpm: true`, absent when `false`).
- Document the flag in `packages/arui-scripts/docs/settings.md`.
- Add a changeset entry.

## Design

### 1. Config plumbing

- `src/configs/app-configs/types.ts`: add `deleteNpm: boolean;` to the `AppConfigs` type in the
  "docker compilation configs" section, next to `removeDevDependenciesDuringDockerBuild`.
- `src/configs/app-configs/get-defaults.ts`: add `deleteNpm: false` to the default config.

No changes to the merge/validation pipeline: unknown-key validation in
`validateSettingsKeys` only warns for keys not present in the default config, and the flag now
lives there, so it can be set via `package.json` `aruiScripts`, an arui-scripts config file, or
`ARUI_SCRIPTS_CONFIG` env.

### 2. Normal-mode template — `src/templates/dockerfile.template.ts`

When `configs.deleteNpm` is `true`, inject the `RUN rm -rf ...` step after the app `ADD` and
before the client-only `COPY`/`CMD` lines. When `false`, output is unchanged.

### 3. Compiled-mode template — `src/templates/dockerfile-compiled.template.ts`

When `configs.deleteNpm` is `true`, inject the same `RUN` step after
`ADD --chown=nginx:nginx . /src` and before the nginx directory setup / `USER nginx`.
The step must run as root, hence it must appear before `USER nginx`.

### 4. Tests

New `src/templates/__tests__/` test file. Because the templates read `configs` at module import
time, tests mock `../configs/app-configs` (via `jest.doMock` + `jest.resetModules`) and assert:

- `deleteNpm: true` — Dockerfile contains the `RUN rm -rf /usr/local/bin/npm ...` step;
- `deleteNpm: false` — Dockerfile does not contain it.

### 5. Documentation

`packages/arui-scripts/docs/settings.md`: add a `deleteNpm` section next to
`removeDevDependenciesDuringDockerBuild` explaining the flag, default value (`false`), and that it
removes `npm`/`npx` from the docker image to reduce its size.

### 6. Changeset

Add a `.changeset/*.md` entry (minor bump) describing the new `deleteNpm` setting.

## Non-goals

- No CLI argument support for the flag (config only).
- No changes to `alpine-node-nginx` base image build.
- No removal of other package managers or unrelated node_modules content.
