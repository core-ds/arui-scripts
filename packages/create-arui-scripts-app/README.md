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

| Флаг | Описание |
| ---- | -------- |
| `-y, --yes` | Без интерактивных вопросов |
| `--force` | Перезаписать существующие файлы шаблона |
| `--name <name>` | Имя npm-пакета |
| `--rtk` / `--no-rtk` | React + RTK или только React |
| `--ssr` / `--client-only` | SSR или только клиент |
| `--code-loader <swc\|babel\|tsc>` | Транспилятор |
| `--test-runner <jest\|vitest>` | Тест-раннер |
| `--css-modules` / `--no-css-modules` | CSS-модули в примере |
| `--client-port` / `--server-port` | Порты |
| `--docker-registry` / `--presets` | Опциональные настройки |
| `--polyfills` / `--react-compiler` / `--install` | И соответствующие `--no-*` |

В CI / без TTY нужен `--yes` или явные флаги настроек.

## Что настраивает мастер

- **React 19** из коробки, опционально **React + RTK** (Redux Toolkit)
- режим **SSR** (клиент + сервер, клиент в `src/client/`) или **clientOnly** (статика)
- SSR-сервер на **Hapi**
- транспилятор (**swc** / babel / tsc) и тест-раннер (**Jest** / Vitest)
- CSS-модули, полифилы (`core-js`), `experimentalReactCompiler`, docker registry, preset
- опциональная установка зависимостей сразу после генерации

## Результат

Генерируются `package.json`, `arui-scripts.config.ts`, `tsconfig.json`, клиентская точка входа,
пример компонента со стилями и тестом, `global-definitions.d.ts`, `.gitignore`, `README.md`,
а также в зависимости от ответов — серверная точка входа на Hapi, store на RTK, полифилы и
`vitest.config.ts`.

Дальнейшая сборка и запуск — через команды `arui-scripts` в созданном проекте.
См. [документацию arui-scripts](../arui-scripts/README.md).
