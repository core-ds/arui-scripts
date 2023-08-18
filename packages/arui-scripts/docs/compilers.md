## Конфигурация typescripts

Компиляция TS работает из коробки, если в корне проекта есть файл `tsconfig.json`.
За основу можно использовать дефолтный конфиг:

```json
{
    "extends": "./node_modules/arui-scripts/tsconfig.json"
}
```

По умолчанию TS будет компилироваться через babel, но у этого есть ряд ограничений:
- нельзя использовать namespace
- Нельзя использовать устаревший синтаксис import/export (`import foo = require(...)`, `export = foo`)
- enum merging

Если вы используете что-то из вышеперечисленного - вы можете вернуться к использованию tsc для компиляции ts файлов используя
настройку [`useTscLoader`](settings.md#usetscloader).
