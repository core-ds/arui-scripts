ARUI-scripts
===

Простой и гибкий инструмент для одновременной сборки клиентской и серверной части react-приложений.

Быстрый старт

===

Самый быстрый способ начать - запустить интерактивный CLI [`create-arui-scripts-app`](../create-arui-scripts-app/README.md):

```bash
npx create-arui-scripts-app my-app
cd my-app
yarn
yarn start
```

CLI `arui-scripts` поддерживает глобальные флаги `--help`, `--version` и справку по командам
`arui-scripts <команда> --help`. Подробнее в [CLI](docs/cli.md).

Использование

===

0. Пакет требует использовать следующие версии:

Зависимость | Версия
-- | --
`nodejs` | `^20.19.0` или `>=22.12.0`
`typescript` | `7.x`
Yarn (если используется) | `4.17.1+`
`react` | `16.13.0+`
`react-dom` | `16.13.0+`

Для обновления существующего проекта см. [переход на TypeScript 7](docs/typescript-7.md).
Поддержка TypeScript 5/6 и значений `codeLoader: "tsc"`, `jestCodeTransformer: "tsc"` удалена.
Для преобразования кода используйте SWC (по умолчанию) или Babel; типы проверяет нативный TypeScript 7.

1. Установите `arui-scripts` и TypeScript 7 в свой проект как dev зависимости

```bash
yarn add arui-scripts typescript@^7.0.0 --dev
```

или

```bash
npm install arui-scripts typescript@^7.0.0 --save-dev
```

2. Создайте необходимые файлы

- `src/index.{js,jsx,ts,tsx}` - входная точка для клиентского приложения.
- `src/server/index.{js,jsx,tsx}` - входная точка для серверного приложения.
Если нужен только клиент, смотреть [Режим clientOnly](./docs/client-only.md).

**Полифилы (опционально).**
Отдельный бандл полифилов не обязателен: по умолчанию [clientPolyfillsEntry](docs/settings.md#clientpolyfillsentry) не задан. Для большинства целей по браузерам (их можно сузить или расширить через overrides `supporting-browsers`, см. [Тонкая настройка](docs/overrides.md#тонкая-настройка)) можно не подключать отдельный файл полифилов.

Если полифилы все же нужны (старые браузеры или режим `entry` у SWC/Babel с `core-js`):

- добавьте в проект зависимость `core-js` (при необходимости)
- создайте файл, например `src/polyfills.ts`, с импортом `import 'core-js/stable';`
- укажите в [arui-scripts.config](docs/settings.md) или в `package.json` в секции `aruiScripts`: `clientPolyfillsEntry: './src/polyfills'`

Пути ко входным точкам и полифилам можно переопределить через настройки.
Полный список в [документации по настройкам](docs/settings.md).

3. Используйте команды из `arui-scripts`!

Документация

===
- [Список актуальных версий docker-образов](../alpine-node-nginx/README.md)
- [Генерация проекта (`create-arui-scripts-app`)](../create-arui-scripts-app/README.md)
- [CLI](docs/cli.md)
- [Настройки](docs/settings.md)
- [Команды](docs/commands.md)
- [Примеры входных точек](docs/examples.md)
- [Пресеты](docs/presets.md)
- [Тонкая настройка](docs/overrides.md)
- [Настройки сборки артефакта](docs/artifact.md)
- [Настройки компиляторов](docs/compilers.md)
- [Переход на TypeScript 7](docs/typescript-7.md)
- [Особенности поведения](docs/caveats.md)
- [Использование модулей](docs/modules.md)
- [Client-only режим](./docs/client-only.md)
- [Словарь для сжатия](./docs/compression-dictionary.md)
