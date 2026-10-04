---
'arui-scripts': minor
---

**Что изменилось**
Добавлена поддержка TypeScript 7: сборка, `arui-scripts start` и `arui-scripts test` работают на нём. Раньше `arui-scripts` падал при запуске, потому что в TypeScript 7 нет JavaScript API, на который опирались `ts-node`, `ts-jest` и `ts-loader`.

-   Конфиги, оверрайды и пресеты на TypeScript загружаются через `@swc/core` вместо `ts-node`. Как и раньше, типы при этом не проверяются и `tsconfig.json` не читается.
-   В `arui-scripts/tsconfig.json` включён `skipLibCheck`: нативная проверка типов из TypeScript 7 иначе падает на ошибках в чужих `.d.ts`.
-   `codeLoader: "tsc"` и `jestCodeTransformer: "tsc"` на TypeScript 7 не поддерживаются: `arui-scripts` завершается с понятной ошибкой и предлагает `swc` или `babel`.

**Что делать потребителю**
На TypeScript 5 и 6 ничего делать не нужно, кроме одного: если tsconfig приложения наследуется от `arui-scripts/tsconfig.json`, то `skipLibCheck` теперь включён и `tsc` не проверяет файлы `*.d.ts`. Если проверка нужна, задайте `skipLibCheck: false` у себя.

Чтобы перейти на TypeScript 7:

-   замените `codeLoader: "tsc"` и `jestCodeTransformer: "tsc"` на `swc` (это значения по умолчанию);
-   уберите из tsconfig приложения опции, удалённые в TypeScript 7: `baseUrl`, `moduleResolution: "node"` и `"node10"`, `target: "es5"` и другие;
-   если используете Yarn 4, обновите его до 4.17.1 или новее: встроенный патч для `typescript` в старых версиях падает (проверено: на 4.13.0 установка падает, на 4.18.0 работает).

Менеджер пакетов может предупредить, что `ts-jest` и `react-refresh-typescript` не поддерживают TypeScript 7. На работу `arui-scripts` это не влияет.

Переменные окружения `TS_NODE_*` больше не влияют на загрузку конфигов. Зависимость `ts-node` пока остаётся в `arui-scripts`, но не используется и будет удалена в одном из следующих мажорных релизов: если ваш проект использует `ts-node`, который приходил транзитивно, объявите его в своих зависимостях.

**Контекст:** TypeScript 7 стал `latest` в npm, а `arui-scripts` с ним не запускался. Работа проверена на TypeScript 7.0.2.
