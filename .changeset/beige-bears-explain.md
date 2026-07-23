---
'arui-scripts': major
---

Обновление тулчейна: Babel 8, Jest 30, отказ от EOL-пакетов, добавлена zod валидация конфигов

**breaking changes:**

- **Babel 8.** Все `@babel/*` → `^8.0.0`; удалены `@babel/plugin-syntax-dynamic-import` и `babel-core`.
- **Jest 30** (`jest`/`babel-jest`/`@types/jest` -> `^30`, `babel-loader` -> `^10`).

**Другие изменения:**

- EOL-зависимости заменены на нативные Node API (`fs-extra` -> `node:fs`, `shelljs` -> `node:child_process`, `rimraf` -> `node:fs.rm`); `chalk` `^2` -> `^4`.
- `core-js` `3.32` -> `3.49`.
- Конфиги валидируются и типизируются через `zod`: тип `AppConfigs` выводится из схемы, строгая проверка ключей с подсказками.