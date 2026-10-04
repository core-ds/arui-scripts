# Переход на TypeScript 7

`arui-scripts` работает на TypeScript 5, 6 и 7. Чтобы приложение собиралось на TypeScript 7, нужно привести
`tsconfig.json` в порядок: часть опций в этой версии удалена. Самая частая из них — `baseUrl`.

## Что еще нужно сделать

- Использовать Yarn 4.17.1 или новее: на более старых версиях установка TypeScript 7 падает из-за встроенного патча.
- Заменить `codeLoader: "tsc"` и `jestCodeTransformer: "tsc"` на `swc` (это значения по умолчанию): `ts-loader` и `ts-jest`
  опираются на JavaScript API, которого в TypeScript 7 нет.
- Убрать из tsconfig другие удаленные опции: `moduleResolution: "node"` и `"node10"`, `target: "es5"`.
- Учесть, что `typescript-eslint` пока не поддерживает TypeScript 7: линту нужна отдельная копия TypeScript 6. Как это
  сделано в монорепозитории `arui-scripts`, видно в `packageExtensions` файла `.yarnrc.yml`.

## baseUrl

На TypeScript 7 опция `baseUrl` удалена. Если она осталась, `tsc` и `arui-scripts build` падают:

```
error TS5102: Option 'baseUrl' has been removed. Please remove it from your configuration.
```

На TypeScript 6 та же опция помечена устаревшей (`TS5101`), а заглушить ошибку можно через `"ignoreDeprecations": "6.0"`.
На TypeScript 7 такого обходного пути нет.

Заменить `baseUrl` можно заранее, не дожидаясь обновления: `paths` без `baseUrl` работает начиная с TypeScript 4.1.

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
yarn tsc --noEmit
yarn arui-scripts build
yarn arui-scripts test
```

Если в проекте есть линт с `eslint-plugin-import` и `eslint-import-resolver-typescript`, запустите и его: он читает те
же `paths`.
