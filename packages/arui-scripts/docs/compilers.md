## TypeScript

Компиляция TS работает из коробки, если в корне проекта есть файл `tsconfig.json`.
За основу можно использовать дефолтный конфиг:

```json
{
    "extends": "arui-scripts/tsconfig.json"
}
```

TypeScript остаётся peer-зависимостью: установите нужную версию в проект.
Проверка типов использует TypeScript проекта. Версии 5–6 работают через JavaScript-компилятор,
версия 7 — через нативный компилятор. Это относится и к отдельному процессу watch,
и к проверке типов в Rspack.

Транспиляция кода приложения и тестов по умолчанию выполняется через SWC.
Для TypeScript 7 используйте `swc` или `babel`:

```ts
export default {
    codeLoader: 'swc',
    jestCodeTransformer: 'swc',
};
```

### Устаревшие режимы tsc

Значение `tsc` в настройках [`codeLoader`](settings.md#codeloader) и
[`jestCodeTransformer`](settings.md#jestcodetransformer) **deprecated**.
Оно использует `ts-loader` / `ts-jest` и поддерживается только с TypeScript <7.
На TypeScript 5–6 режимы продолжают работать с предупреждением; на TypeScript 7
arui-scripts выдаёт ошибку с рекомендацией перейти на SWC/Babel.

Это ограничение относится к транспиляции. Проверка типов через `tsc` продолжает работать
на TypeScript 7 при использовании SWC/Babel.

### Конфиги и overrides

Файлы `arui-scripts.config.ts`, `arui-scripts.overrides.ts` и TS-presets загружаются через `jiti`.
Для их выполнения не нужен старый TypeScript Compiler API и не устанавливается отдельный TS 6.
