---
'arui-scripts': minor
---

**Что изменилось**
`arui-scripts` запускается на TypeScript 7: сборка, `start` и `test`. На TypeScript 5 и 6 эти команды работают как раньше.

**Что делать потребителю**
На TypeScript 5 и 6 достаточно обновить пакет. Если tsconfig приложения наследуется от `arui-scripts/tsconfig.json`, в нём включён `skipLibCheck`, и `tsc` не проверяет чужие `*.d.ts`. Чтобы вернуть проверку, задайте `skipLibCheck: false` в своём tsconfig.

Чтобы перейти на TypeScript 7:

-   обновите Yarn до 4.17.1 или новее;
-   замените `codeLoader: "tsc"` и `jestCodeTransformer: "tsc"` на `swc` (это значения по умолчанию);
-   уберите из tsconfig опции, которых нет в TypeScript 7. Чаще всего это `baseUrl`. Как её заменить, написано в `packages/arui-scripts/docs/typescript-7.md`.

Если проект брал `ts-node` из зависимостей `arui-scripts`, добавьте его в свои зависимости.

**Контекст:** TypeScript 7 стал `latest` в npm, и прежняя версия `arui-scripts` с ним не запускалась.
