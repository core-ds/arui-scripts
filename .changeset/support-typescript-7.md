---
'arui-scripts': major
---

**Breaking Change: arui-scripts требует TypeScript 7.** Поддержка TypeScript 5 и 6 удалена.
Код приложения и тестов преобразуется через SWC или Babel, а проверку типов выполняет нативный компилятор TypeScript 7.

Удалены `codeLoader: "tsc"` и `jestCodeTransformer: "tsc"`: `ts-loader` и `ts-jest` используют JavaScript API,
которого нет в TypeScript 7. Удалены также зависимости `ts-node`, `ts-jest`, `ts-loader` и
`react-refresh-typescript`; если проект использовал их транзитивно для собственных задач, объявите их явно.

Чтобы обновить приложение:

- Установите `typescript@^7.0.0`. При использовании Yarn 4 обновите его до `4.17.1` или новее
  (в монорепозитории закреплен `4.18.0`): старые версии содержат несовместимый патч TypeScript.
- Замените `codeLoader: "tsc"` и `jestCodeTransformer: "tsc"` на `"swc"` или `"babel"`.
  По умолчанию обе настройки используют `"swc"`.
- Удалите из `tsconfig.json` опции, удаленные в TypeScript 7, включая `baseUrl`,
  `moduleResolution: "node"` / `"node10"` и `target: "es5"`. Для алиасов задайте явные `paths`
  с относительными путями, для разрешения модулей используйте `"bundler"` или `"nodenext"`
  с согласованной настройкой `module`.
- Запускайте `tsc --noEmit` отдельно для проверки типов тестов: `arui-scripts test` только преобразует и выполняет код.
- Для `typescript-eslint` настройте изолированную копию `@typescript/typescript6`: линтер пока требует JS API.
  Рецепт и примеры настройки описаны в `docs/typescript-7.md`.

Конфиги, оверрайды и пресеты на TypeScript загружаются через `@swc/core`. Типы при загрузке не проверяются,
`tsconfig.json` и `.swcrc` приложения не читаются, переменные `TS_NODE_*` больше не применяются.

В `arui-scripts/tsconfig.json` включен `skipLibCheck`: проверка сторонних `*.d.ts` по умолчанию пропускается.
Если проекту нужна эта проверка, задайте `skipLibCheck: false` у себя.
