# Переход на TypeScript 7

`arui-scripts` требует TypeScript 7. Поддержка TypeScript 5 и 6 удалена.
SWC или Babel преобразует исходники приложения и тестов в JavaScript, а нативный TypeScript 7 проверяет типы.

## Что нужно сделать

-   Установить `typescript@^7.0.0` в devDependencies приложения.
-   При использовании Yarn 4 обновить его до `4.17.1` или новее: старые версии содержат несовместимый патч TypeScript.
    В монорепозитории `arui-scripts` закреплен Yarn `4.18.0`.
-   Заменить удаленные `codeLoader: "tsc"` и `jestCodeTransformer: "tsc"` на `"swc"` или `"babel"`.
    Значение по умолчанию для обеих настроек — `"swc"`.
-   Удалить из `tsconfig.json` опции, удаленные в TypeScript 7: `baseUrl`, `moduleResolution: "node"` и `"node10"`,
    `target: "es5"`. Использовать `moduleResolution: "bundler"` или `"nodenext"` с соответствующим `module`.
-   Учесть, что `typescript-eslint` пока требует отдельную копию TypeScript 6 только для линта, см. раздел «Линт».

`ts-node`, `ts-jest`, `ts-loader` и `react-refresh-typescript` больше не входят в зависимости `arui-scripts`.
Если проект использует их для собственных задач, объявите их явно.

Конфиги, оверрайды и пресеты на TypeScript загружаются через SWC без проверки типов и чтения `tsconfig.json`
или `.swcrc` приложения. Переменные `TS_NODE_*` больше не влияют на их загрузку.

## Проверка типов

`arui-scripts build` проверяет типы через `ts-checker-rspack-plugin` с нативным TypeScript 7.
При `arui-scripts start` и `start:prod` по умолчанию работает отдельный процесс `tsc --watch --noEmit`.
Если `disableDevRspackTypecheck: false`, проверка выполняется внутри Rspack через тот же плагин.

`arui-scripts test` преобразует тесты и исходники через SWC или Babel без проверки типов. Добавьте отдельную команду
`typecheck`; ее конфиг должен включать и файлы тестов. Исполняемый файл следует указать явно:

```json
{
    "scripts": {
        "typecheck": "node ./node_modules/typescript/bin/tsc --noEmit --incremental false --project tsconfig.json"
    }
}
```

При установке линтера через npm команда `.bin/tsc` может указывать на его вложенный TS6. Явный путь
гарантирует запуск TypeScript 7 приложения. В самом монорепозитории
эта проверка запускается через `yarn typecheck` и входит в `yarn test`.

В базовом `arui-scripts/tsconfig.json` включен `skipLibCheck`: сторонние `*.d.ts` по умолчанию не проверяются.
Чтобы сохранить их проверку, задайте `skipLibCheck: false` в приложении.

## baseUrl

На TypeScript 7 опция `baseUrl` удалена. Если она осталась, `tsc` и `arui-scripts build` падают:

```
error TS5102: Option 'baseUrl' has been removed. Please remove it from your configuration.
```

`ignoreDeprecations` не возвращает удаленные опции. Замените `baseUrl` явными алиасами в `paths`.

### Если `baseUrl` нужен только для `paths`

Это самый частый случай: `baseUrl` указывает на корень проекта, а в `paths` описаны алиасы.

```json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": { "Src/*": ["src/*"] }
    }
}
```

Уберите `baseUrl` и добавьте `./` в начало каждого пути из `paths`:

```json
{
    "compilerOptions": {
        "paths": { "Src/*": ["./src/*"] }
    }
}
```

Без `baseUrl` пути в `paths` считаются от каталога с `tsconfig.json` и обязаны начинаться с `./`. Иначе будет ошибка:

```
error TS5090: Non-relative paths are not allowed. Did you forget a leading './'?
```

### Если код импортирует модули от корня проекта

Например, `import { foo } from 'src/utils/foo'` работал только благодаря `baseUrl`. Добавьте в `paths` явный алиас для
каждого такого каталога:

```json
{
    "compilerOptions": {
        "paths": { "src/*": ["./src/*"] }
    }
}
```

Так импорты остаются как были, и они работают во всех инструментах `arui-scripts`: в `tsc`, сборке и `arui-scripts test`.

Не заменяйте `baseUrl` на универсальный алиас `"*": ["./*"]`. `tsc` и сборка с ним справляются, но `arui-scripts test`
превращает его в `moduleNameMapper` с шаблоном `^(.*)$`, и jest подменяет вообще все импорты, включая пакеты из
`node_modules` и относительные пути. Тесты при этом не запускаются.

### Как проверить

```bash
yarn tsc --version
yarn typecheck
yarn arui-scripts build
yarn arui-scripts test
```

Если в проекте есть линт с `eslint-plugin-import` и `eslint-import-resolver-typescript`, запустите и его: он читает те
же `paths`.

## Линт

`typescript-eslint` не поддерживает TypeScript 7 и сразу падает с ошибкой:

```
typescript-eslint does not support TS 7.0.
```

Пока он не научился работать с TypeScript 7, его пакетам нужна отдельная копия TypeScript 6 из пакета
`@typescript/typescript6`, а остальной проект остается на TypeScript 7.

С Yarn это делается через `packageExtensions` в `.yarnrc.yml`. Рецепт проверен на `arui-presets-lint` 11.2.0
(`typescript-eslint` 8.70.0, ESLint 9) и Yarn 4.18.0: на подложенной ошибке срабатывает правило с проверкой типов
`@typescript-eslint/no-unnecessary-type-assertion`.

```yaml
packageExtensions:
    'typescript-eslint@*':
        dependencies:
            typescript: 'npm:@typescript/typescript6@^6.0.0'
    '@typescript-eslint/eslint-plugin@*':
        dependencies:
            typescript: 'npm:@typescript/typescript6@^6.0.0'
    '@typescript-eslint/parser@*':
        dependencies:
            typescript: 'npm:@typescript/typescript6@^6.0.0'
    '@typescript-eslint/typescript-estree@*':
        dependencies:
            typescript: 'npm:@typescript/typescript6@^6.0.0'
    '@typescript-eslint/type-utils@*':
        dependencies:
            typescript: 'npm:@typescript/typescript6@^6.0.0'
    '@typescript-eslint/project-service@*':
        dependencies:
            typescript: 'npm:@typescript/typescript6@^6.0.0'
    '@typescript-eslint/tsconfig-utils@*':
        dependencies:
            typescript: 'npm:@typescript/typescript6@^6.0.0'
    '@typescript-eslint/utils@*':
        dependencies:
            typescript: 'npm:@typescript/typescript6@^6.0.0'
    'ts-api-utils@*':
        dependencies:
            typescript: 'npm:@typescript/typescript6@^6.0.0'
```

После правки выполните `yarn install`. При первой установке Yarn может предупредить (`YN0066`), что встроенный патч для
`typescript` не применился к `@typescript/typescript6`: на работу линта это не влияет.

Для `arui-presets-lint` 8 (`typescript-eslint` 7.18) в монорепозитории `arui-scripts` хватает пяти записей:
`@typescript-eslint/eslint-plugin`, `parser`, `typescript-estree`, `type-utils` и `ts-api-utils`. С npm и pnpm этот
рецепт не проверялся.
