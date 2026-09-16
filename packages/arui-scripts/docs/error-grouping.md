# Улучшенный вывод ошибок

В режиме `start` / watch `arui-scripts` группирует ошибки сборки по категориям и выводит подсказки по исправлению.

Группировка работает через `handleCompilationResult` в client/server watch-компиляторах. Команда `build` по-прежнему выводит одну ошибку через `printBuildError` с подсказками, но без группировки по категориям.

## Группировка ошибок

Ошибки группируются по типу для удобства навигации:

| Категория | Описание |
|---|---|
| `Module Error` | Ошибки импорта (модуль не найден, экспорт не существует) |
| `TypeScript Error` | Ошибки типизации |
| `CSS Error` | Синтаксические ошибки стилей |
| `Syntax Error` | Синтаксические ошибки JS/TS |
| `Runtime Error` | Ошибки выполнения (React, undefined) |
| `Module Federation Error` | Проблемы с Module Federation |
| `Configuration Error` | Проблемы конфигурации (memory, target) |

## Подсказки по исправлению

Для каждой ошибки выводятся подсказки:

```
Client: Build failed

Module Error:
  • Module not found: Error: Can't resolve './Button'
    at src/components/index.tsx:5
    Suggestions:
      - Check that the file path is correct
```

Для пакетов из `node_modules` также печатается команда:

```
Suggestions:
  - Check if the package is installed
    Run: npm ls lodash
  - Install the package
    Run: npm install lodash
```

## Поддерживаемые ошибки

### Модули не найдены

Распознаются форматы Node (`Cannot find module`) и bundler (`Module not found` / `Can't resolve`).
Подсказки: проверка пути для relative imports или `npm ls` / `npm install` для пакетов.

### TypeScript ошибки

Команда для запуска `tsc --noEmit` для получения подробной информации.
`TS2307` и другие `TSxxxx` классифицируются как TypeScript, а не как module.

### Heap out of memory

Команда для увеличения памяти Node.js:

```bash
NODE_OPTIONS=--max-old-space-size=4096
```

### Module Federation

- Проверка `remoteEntry.js` доступности
- Проверка что remote-приложение запущено
- Настройка shared dependencies

### React element type

Проверка корректности импорта компонентов.

## Внутренний плагин

`SmartErrorsPlugin` — внутренний helper для форматирования stats-ошибок. В дефолтный rspack-config он не подключается: вывод уже делается в watch-хуках (`handleCompilationResult` / `printBuildError`). Публичного export-пути `arui-scripts/plugins/smart-errors-plugin` нет.

## Файлы модуля

- `src/commands/util/error-formatter.ts` — форматирование ошибок
- `src/commands/util/error-patterns.ts` — паттерны ошибок и подсказки
- `src/commands/util/error-category.ts` — определение категории ошибки
- `src/commands/util/error-location.ts` — извлечение location из ошибки
- `src/plugins/smart-errors-plugin.ts` — внутренний helper / optional rspack plugin
