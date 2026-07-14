# CLI arui-scripts

`arui-scripts` предоставляет CLI для сборки, запуска, тестирования и генерации
react-приложений. После установки пакета команды доступны через `arui-scripts <команда>`
(обычно - из npm-скриптов в `package.json`).

## Глобальные флаги

- `arui-scripts --help` - список всех команд с описаниями.
- `arui-scripts --version` (`-v`) - версия пакета.
- `arui-scripts <команда> --help` - справка по конкретной команде.

## Команды

Полный список и описание - в [docs/commands.md](commands.md):
`start`, `start:prod`, `build`, `docker-build`, `docker-build:compiled`, `test`, `test:vitest`,
`archive-build`, `bundle-analyze`, `ensure-yarn`, `changelog`, а также `init` (см. ниже).

## Генерация проекта: `init`

```bash
arui-scripts init `directory`
```

CLI создает готовый к запуску проект на TypeScript. Если указать `dir` -
файлы создаются в этой папке, иначе в текущей. По умолчанию ставится **React 19**.

CLI задает вопросы:

-   **имя проекта** (по умолчанию - имя папки);
-   **стек**: `React` или `React + RTK (Redux Toolkit)`;
-   **тип приложения**: `SSR (клиент + сервер)` или `clientOnly (только клиент)`;
-   **транспилятор**: `swc` (по умолчанию), `babel` или `tsc`;
-   **тест-раннер**: `Jest` (по умолчанию) или `Vitest`;
-   **CSS-модули** в примере (да/нет);
-   **порты** dev-сервера и node-сервера;
-   **Docker registry** (опционально);
-   **preset-пакет** (опционально);
-   **полифилы** (core-js) - да/нет;
-   **experimentalReactCompiler** - да/нет;
-   **установить зависимости** сразу (по умолчанию - нет).

В результате генерируются `package.json`, `arui-scripts.config.ts`, `tsconfig.json`, клиентская точка входа, пример компонента со стилями и тестом,
`global-definitions.d.ts`, `.gitignore`, `README.md`, а также в зависимости от ответов -
серверная точка входа на Hapi, store на RTK, полифилы и `vitest.config.ts`.

Для **SSR** клиентский код кладется в `src/client/`, серверный - в `src/server/`.
Для **clientOnly** клиентский код лежит в `src/`.

Пример:

```bash
arui-scripts init my-app
cd my-app
yarn   # или npm install
yarn start
```
