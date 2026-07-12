# arui-scripts — аудит и дорожная карта

> **Версия:** 23.0.2 · **Ветка:** `feat/rsc-poc` · **Сборщик:** Rspack 2.0 · **TS:** 6.0.2
> Монорепо (Yarn 4 + Turbo), 7 пакетов. Ядро — тулчейн сборки React-приложений: CSR + SSR +
> Module Federation + Docker. Активная работа — экспериментальный режим **RSC** (React Server Components).

---

## Часть 1. Технический аудит

### Сильные стороны
- Современное ядро: **Rspack 2**, SWC-минификация, Module Federation 2.
- **TypeScript 6 + strict** во всех пакетах; зрелый CI/CD (changesets, trusted publishing, матрица Node 20/22/24).
- Отличная документация, активная разработка.
- **RSC-POC** — амбициозная фича-дифференциатор (runtime `./rsc/{ssr,express,hapi,client}` в scripts-server).
- Тестов ~**15 файлов** (app-configs, apply-overrides, find-plugin, `webpack-rsc.tests.ts`, validate-config и др.).

### Проблемы (по убыванию важности)

| # | Проблема | Severity | Факт |
|---|----------|----------|------|
| 1 | **RSC — экспериментальный POC** без пути к стабильности | 🟠 | `experimentalRsc`-флаг; 1 rsc-тест; нет migration-гайда/критериев beta |
| 2 | **Остаточные webpack-зависимости** | 🟠 | `pnp-webpack-plugin`, `babel-core`-bridge, дубль `webpack-manifest-plugin`, `@types/webpack*` |
| 3 | **EOL / очень старые пакеты** | 🟠 | `chalk@^2.4.2`, `fs-extra@6.0.1`, `rimraf@^2.7.1`, `shelljs@0.8.5` |
| 4 | **Babel зажат** | 🟡 | `@babel/core` запинен `7.22.10`; `babel-jest@28` при `jest@^29` |
| 5 | **Двойная поддержка тулчейна** | 🟡 | Babel(default)+SWC(opt-in); Jest+Vitest |
| 6 | **Типобезопасность overrides** | 🟡 | `any` для babel/postcss-ключей в `apply-overrides.ts` |
| 7 | **Нейминг-долг** | 🟢 | `webpack.*.ts` используют Rspack; override-ключи `webpack*` |
| 8 | **React peer `>=16.3.0`** | 🟢 | блокирует стабильный RSC (валидация RSC уже требует React 19.1) |

> ⭐ Пункт 8 — не просто модернизация, а **предусловие стабильного RSC**: `validate-config.ts`
> уже требует React ≥19.1 в rsc-режиме, но peer остаётся `>=16.3.0`.

---

## Часть 2. План развития (фазы)

Оценка усилий: **S** <1д · **M** 1–3д · **L** >3д/PoC.

### Фаза 0 — Быстрые победы + страховка (~неделя)
- Снапшот-тесты генерируемых Rspack-конфигов (client/server/**rsc**). **M**
- Удалить webpack-хвосты (`pnp-webpack-plugin`, `babel-core`, дубль manifest-плагина, `@types/webpack*`). **S**
- Синхронизировать `babel-jest`→29, `core-js`→3.4x. **S**

### Фаза 1 — RSC: POC → Beta (стратегический приоритет ветки)
- **Поднять React baseline до 18/19** в peer (мажор) — разблокирует стабильный RSC, новый JSX-transform, React Compiler. **M**
- Тесты RSC: снапшоты rsc-конфигов + **e2e-сборка `example-rsc`**. **M–L**
- Стабилизировать контракт `./rsc/*` и `experimentalRsc`; критерии выхода из «experimental». **M**
- Migration-гайд + документация адаптеров (Express/Hapi/SSR). **M**

### Фаза 2 — Модернизация и производительность
- Заменить EOL: `chalk`→picocolors/chalk@4, `fs-extra`→нативный `node:fs`, `rimraf`→`node:fs.rm`, `shelljs`→`node:child_process`. **M**
- Апгрейд Babel 7.22→7.26, разпин `@babel/core`. **S–M**
- **SWC по умолчанию** вместо Babel. **M–L**
- **[Д4] Rspack persistent cache + lazy compilation + бюджеты бандла в CI.** **S–M**

### Фаза 3 — Стратегия/архитектура
- Переименование `webpack.*.ts`→`rspack.*.ts` + override-ключи `webpack*`→`rspack*` (**breaking, major**). **M**
- Консолидация: один транспайлер (SWC) + один тест-раннер. **M**
- **[Д3] Типизация `apply-overrides.ts`** (babel/postcss). **M**
- **[Д1] Валидация конфигов (zod-style).** **M**
- **[Д2] Улучшения Module Federation 2 + RSC-совместимость.** **M–L**
- PoC перехода ядра на Rsbuild. **L**
- ESM-first вывод пакета. **M**

### Идеи (продуктовые направления)
- Позиционировать arui-scripts как **RSC-ready build tool** — редкий дифференциатор.
- Интерактивный `init`/scaffolding; валидация конфигов с понятными ошибками (см. Д1).
- Улучшения Module Federation 2 + RSC (см. Д2).

---

## Часть 3. Детализация выбранных пунктов

### Д1. Валидация конфигов (zod-style)

**Сейчас:** [validate-config.ts](packages/arui-scripts/src/configs/app-configs/validate-config.ts) (107 стр.,
`eslint-disable complexity`) — императивные `if/throw` с русскими сообщениями; отдельно валидация
неизвестных ключей и [warn-about-deprecations.ts](packages/arui-scripts/src/configs/app-configs/warn-about-deprecations.ts).
Тип `AppConfigs` — чисто TS-тип (без рантайм-валидации), поэтому опечатка в имени опции или неверный тип
всплывают поздно и непонятно.

**Предложение — схема через `zod`** (или легче — `valibot`):
- **Единый источник истины:** `const AppConfigSchema = z.object({...})`, тип выводится `z.infer<...>` (заменяет ручной `AppConfigs`).
- **Неизвестные ключи:** `.strict()` → понятная ошибка «unknown key `X`» (+ подсказка did-you-mean).
- **Кросс-полевые правила** (`experimentalRsc` требует `swc`; несовместим с `clientOnly`/`modules`; React ≥19.1)
  → `.superRefine()` вместо ручных `if/throw` (убирает `complexity`-disable).
- **Депрекейшены** — на основе схемы, единообразно с `warn-about-deprecations`.
- Сохранить дружелюбные русские сообщения через `errorMap` / `.refine(msg)`.

**Файлы:** `app-configs/types.ts`, `validate-config.ts`, валидация ключей, `read-config-file.ts`, `warn-about-deprecations.ts`.
**Эффект:** ранние понятные ошибки, меньше кода, один источник типа+валидации. **Усилие: M.**
**Риски:** +1 build-time зависимость (~50 КБ); миграция публичного типа `AppConfigs` (оставить экспорт через `z.infer`).

---

### Д2. Module Federation 2 + RSC-совместимость

**Сейчас:** [modules.ts](packages/arui-scripts/src/configs/modules.ts) (195 стр.) —
`rspack.container.ModuleFederationPlugin` (provider/consumer, `shared`/`exposes`/`remotes`) + `compatModules`
(legacy-глобалы) + `@module-federation/runtime-tools@^2` + пакет-лоадер `scripts-modules`.
**RSC и MF сейчас взаимоисключающи:** `validate-config` кидает ошибку при `experimentalRsc` + `modules`/`compatModules`.
`patchMainWebpackConfigForModules` имеет complexity 22 (лоадер логики много).

**Предложение — 3 горизонта:**
1. **Ближний (MF2 DX):** перейти с встроенного `container.ModuleFederationPlugin` на
   **`@module-federation/enhanced`** (тот же MF2, но авто-генерация типов ремоутов, runtime-плагины,
   MF DevTools, manifest-протокол, dynamic remotes). Улучшает DX микрофронтендов вне RSC. **M**
2. **Средний (снять «тихие» ограничения):** заменить жёсткий throw на документированную матрицу
   совместимости; вынести react-стек в `shared: { singleton: true }` — фундамент под будущую RSC-федерацию. **S–M**
3. **Дальний (RSC-aware федерация, research):** Server Components через границы ремоутов — общий
   RSC-манифест, резолв client-references между хостом и ремоутами, `'use client'/'use server'` через
   федеративные модули. Экосистема ещё формирует паттерны → **PoC**, не коммит. **L**

**Файлы:** `modules.ts`, `configs/rsc.ts`, `validate-config.ts`, пакет `scripts-modules`.
**Эффект:** сильнее микрофронтенд-DX сейчас, ясный путь к RSC+MF потом. **Усилие: M (1–2), L (3).**

---

### Д3. Типизация `apply-overrides.ts`

**Уточнение по факту:** rspack-ключи (`webpack*`, `devServer`, `stats`, `swc*`) в
[apply-overrides.ts](packages/arui-scripts/src/configs/util/apply-overrides.ts) **уже типизированы**
через `@rspack/core` / `@rspack/dev-server` / `@swc/core`. Дженерики из `@rspack/core` тут по сути сделаны.
Реальный `any` остался точечно:
- `babel` / `babelClient` / `babelServer` / `babelDependencies: any` (TODO в коде);
- `postcss: any[]` (TODO в коде);
- внутренний `as any` в `webpack.client.ts` — rspack мистипизирует `splitChunks.cacheGroups.*.name`.

**Предложение — убрать оставшиеся `any`:**
- Babel-ключи → `import('@babel/core').TransformOptions` (типы уже в дереве).
- `postcss` → `import('postcss').AcceptedPlugin[]`.
- Внутренние касты (`splitChunks.name`) → корректная сигнатура из `@rspack/core` или узкий helper-тип.

**Файлы:** `apply-overrides.ts` (тип `Overrides`), `webpack.client.ts` (касты).
**Эффект:** автокомплит для babel/postcss-оверрайдов, минус `eslint-disable`. **Усилие: M.**

---

### Д4. Rspack persistent cache + lazy compilation + бюджеты бандла в CI

**Сейчас (факт):** `cache: mode === 'dev'` в [webpack.server.ts](packages/arui-scripts/src/configs/webpack.server.ts)/`webpack.client.ts`
— это **память-кэш** (не переживает рестарт процесса); babel-loader `cacheDirectory` в dev; `experiments: { css: false }`.
Персистентного кэша и lazy compilation нет. Rsdoctor подключён в `bundle-analyze`, но CI-гейта на размер нет.

**Предложение:**
- **Persistent cache (Rspack 2):** `experiments.cache = { type: 'persistent', ... }` — ускоряет холодную и
  повторную сборку между запусками (dev; при стабильности — prod). Дополняет/заменяет булев `cache`.
  Проверить инвалидацию (версия конфига/зависимостей/env). **S–M**
- **Lazy compilation:** `experiments.lazyCompilation` в dev — компиляция маршрутов/импортов по требованию,
  быстрее старт dev-сервера на крупных приложениях. **S**
- **Бюджеты бандла в CI:** `performance: { maxAssetSize, maxEntrypointSize, hints: 'error' }` в prod-конфиге
  и/или регресс-гейт (`size-limit` или Rsdoctor bundle-diff) в CI, падающий на превышении. **S–M**

**Файлы:** `webpack.client.ts`/`webpack.server.ts` (experiments), `webpack.client.prod.ts` (performance),
CI-воркфлоу, `bundle-analyze`.
**Эффект:** быстрее dev и CI-сборки, защита от разрастания бандла. **Усилие: S–M.**
**Риски:** persistent cache в Rspack 2 экспериментален — включать за флагом и проверить стабильность/инвалидацию.
