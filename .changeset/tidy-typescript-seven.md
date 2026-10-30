---
'arui-scripts': minor
---

Добавлена поддержка TypeScript 7 без внутренней зависимости от TypeScript 6: TS-конфиги загружаются через jiti, настройки Jest читаются без Compiler API, проверка типов использует компилятор проекта.

Режимы `codeLoader: 'tsc'` и `jestCodeTransformer: 'tsc'` помечены deprecated. Они продолжают работать с TypeScript 5–6 с предупреждением; для TypeScript 7 используйте SWC или Babel.
