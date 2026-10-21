# create-arui-scripts-app

Интерактивный CLI для генерации react-приложения на [`arui-scripts`](../arui-scripts).

## Быстрый старт

```bash
npx create-arui-scripts-app my-app
cd my-app
yarn
yarn start
```

Без вопросов (значения по умолчанию):

```bash
npx create-arui-scripts-app my-app --yes
```

Если `dir` не указан, файлы создаются в текущей папке.

## Флаги

Флаги можно совмещать с мастером: на вопросы, уже отвеченные флагами, CLI не
спрашивает. Например, `npx create-arui-scripts-app my-app --test-runner vitest`
спросит все, кроме тест-раннера.

- `-y` / `--yes` - без интерактивных вопросов, взять значения по умолчанию
- `--force` - перезаписать существующие файлы шаблона
- `--name <name>` - имя npm-пакета
- `--rtk` / `--no-rtk` - React + RTK или только React
- `--ssr` / `--client-only` - SSR или только клиент
- `--code-loader <swc|babel>` - транспилятор
- `--test-runner <jest|vitest>` - тест-раннер
- `--e2e-framework <cypress|playwright|none>` - e2e фреймворк
- `--css-modules` / `--no-css-modules` - CSS-модули
- `--client-port` / `--server-port` - порты клиента и сервера
- `--docker-registry` / `--presets` - docker registry и preset
- `--polyfills` / `--react-compiler` / `--lint` / `--install` - и соответствующие `--no-*`

## Что настраивает мастер

- **TypeScript 7** для приложения и тестов, проверка через `yarn typecheck` / `npm run typecheck`
- **React 19** из коробки, опционально **React + RTK** (Redux Toolkit)
- режим **SSR** (клиент + сервер, клиент в `src/client/`) или **clientOnly** (статика)
- SSR-сервер на **Hapi** с рендерингом приложения (`renderToString`) и гидрацией на клиенте
- транспилятор (**swc** / babel) и тест-раннер (**Jest** / Vitest)
- опционально **e2e** (**Cypress** / Playwright) с конфигом и хелперами
- опционально **React Router**
- CSS-модули, полифилы (`core-js`), `experimentalReactCompiler`, docker registry, preset
- опционально **arui-presets-lint** (eslint, prettier, stylelint, knip, secretlint, lefthook)
- опциональная установка зависимостей сразу после генерации

Пример с линтерами:

```bash
npx create-arui-scripts-app my-app --yes --lint --install
```

## Результат

Генерируются `package.json`, `arui-scripts.config.ts`, `tsconfig.json`, клиентская точка входа,
пример компонента со стилями и тестом, `global-definitions.d.ts`, `.gitignore`, `README.md`,
`.yarnrc.yml` (с `nodeLinker: node-modules` и Yarn 4.18.0),
а также в зависимости от ответов - серверная точка входа на Hapi, store на RTK, полифилы,
`vitest.config.ts`, e2e-каркас (Playwright или Cypress), роуты React Router и конфиги
`arui-presets-lint` (`eslint.config.mts`, `knip.ts`, `.secretlintrc.json`, `lefthook.yml`).

Дальнейшая сборка и запуск через команды `arui-scripts` в созданном проекте.
См. [документацию arui-scripts](../arui-scripts/README.md).
При подключении lint: `yarn lint` / `yarn lint:fix`.

## TypeScript и линтер

Новые проекты используют TypeScript `^7.0.2`. TypeScript проверяет типы через `typecheck`,
а SWC или Babel преобразует код при сборке и запуске тестов. Загрузчик `tsc` и `ts-jest`
больше не предлагаются.

С `--lint` линтер получает отдельную копию `@typescript/typescript6`, поскольку
`typescript-eslint` пока требует JavaScript API старого компилятора. В Yarn это настроено
через `packageExtensions` в `.yarnrc.yml`, в npm — через `overrides` для зависимостей
`arui-presets-lint` в `package.json`. Приложение использует TypeScript 7. Команда `typecheck` обращается напрямую к его
исполняемому файлу, чтобы npm не выбрал `tsc` из вложенной зависимости линтера.
Для npm нужен npm 10.9.3 или новее. Команды линта работают с обоими менеджерами:
`yarn lint` / `npm run lint`, `yarn lint:fix` / `npm run lint:fix`.
