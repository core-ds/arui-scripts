# @alfalab/arui-scripts-vitest

Конфигурация [Vitest](https://vitest.dev/) для приложений на `arui-scripts`. Заменяет команду
`arui-scripts test:vitest` и импорт `arui-scripts/vitest`, которые объявлены устаревшими и будут удалены
в следующей мажорной версии `arui-scripts`.

## Быстрый старт

```bash
yarn add -D @alfalab/arui-scripts-vitest vitest vite jsdom
```

Нужен Node.js `^22.12.0 || ^24.0.0 || >=26.0.0`, как и для самого vitest 5.

`vitest`, `vite` и `jsdom` ставятся в проект явно: конфиг проекта импортирует `vitest/config`, скрипты запускают
бинарник `vitest`, `vite` — обязательная peer-зависимость vitest (yarn не устанавливает peer-зависимости сам),
а окружение `jsdom` vitest ищет в проекте. Пакет сам зависит от `vitest@^5.0.2`, поэтому держите в проекте
совместимую версию, иначе установится вторая копия vitest.

`vitest.config.ts` в корне проекта:

```ts
import { defineConfig, mergeConfig } from 'vitest/config';
import aruiConfig from '@alfalab/arui-scripts-vitest';

export default mergeConfig(
    aruiConfig,
    defineConfig({
        test: {
            setupFiles: ['./__tests__/setup.js'],
            // другие настройки Vitest
        },
    }),
);
```

Если дополнительные настройки не нужны, достаточно реэкспорта:

```ts
export { default } from '@alfalab/arui-scripts-vitest';
```

Запуск:

```bash
vitest run
```

## Что входит в конфигурацию

-   окружение `jsdom` (сам пакет `jsdom` нужно установить в проект);
-   API Vitest через явные импорты: `import { describe, it, expect } from 'vitest'` (без глобальных переменных);
-   замена импортов `.css` на пустые модули, ассетов (svg, png, шрифты и др.) — на строку с именем файла;
-   маппинг путей из `tsconfig.json` (paths) через [vite-tsconfig-paths](https://www.npmjs.com/package/vite-tsconfig-paths);
-   маски для тестов: `src/**/__tests__/**/*`, `src/**/__test__/**/*`, `src/**/*.{test,spec,tests}.*`;
-   покрытие через провайдер `v8`.

Для обратной совместимости `setupFiles` берутся из `jest.setupFiles` в `package.json`, если они там заданы.

## Миграция с `arui-scripts test:vitest`

1. Установите пакеты: `yarn add -D @alfalab/arui-scripts-vitest vitest vite jsdom`.
2. Если в `vitest.config.*` используется `import aruiConfig from 'arui-scripts/vitest'`, замените импорт на
   `@alfalab/arui-scripts-vitest`. Если своего конфига нет, создайте его по примеру выше.
3. Замените `arui-scripts test:vitest` в скриптах `package.json` на `vitest run`.
