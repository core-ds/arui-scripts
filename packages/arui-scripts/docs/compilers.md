## Конфигурация TypeScript

`arui-scripts` требует TypeScript 7. Если в корне проекта есть `tsconfig.json`, сборка проверяет типы
нативным компилятором. За основу можно использовать базовый конфиг:

```json
{
    "extends": "arui-scripts/tsconfig.json"
}
```

SWC (по умолчанию) или Babel преобразует TypeScript в JavaScript. Выбор задает
[`codeLoader`](settings.md#codeloader); значение `tsc` удалено, поскольку `ts-loader` требует JavaScript API,
которого нет в TypeScript 7.

Проверка типов выполняется отдельно от преобразования кода: при production-сборке — через
`ts-checker-rspack-plugin`, при разработке по умолчанию — в отдельном процессе `tsc --watch --noEmit`.
Настройка [`disableDevRspackTypecheck`](settings.md#disabledevrspacktypecheck) переключает проверку в разработке
между отдельным процессом и плагином Rspack. Оба варианта используют нативный TypeScript 7.

Для тестов [`jestCodeTransformer`](settings.md#jestcodetransformer) выбирает SWC или Babel.
Jest не проверяет типы: запускайте `tsc --noEmit` отдельно с конфигом, который включает тестовые файлы.
Порядок обновления зависимостей, `tsconfig.json` и линта описан в [руководстве по переходу на TypeScript 7](typescript-7.md).

Сами объявления proptypes удаляются с помощью [babel-plugin-transform-react-remove-prop-types](https://www.npmjs.com/package/babel-plugin-transform-react-remove-prop-types).
Но импорты пакетов `prop-types` при этом не удаляются. Чтобы это реализовать, используется `webpack.NormalModuleReplacementPlugin`.
С помощью него заменяются на пустышку пакеты, попадающие под маску:

- `/^react-style-proptype$/`
- `/^thrift-services\/proptypes/`
