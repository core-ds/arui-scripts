ARUI-scripts
===

Простой и гибкий инструмент для одновременной сборки клиентской и серверной части react-приложений.

Быстрый старт

===

Самый быстрый способ начать — интерактивный мастер `init`. Он задаст несколько вопросов и сгенерирует готовый к запуску проект:

```bash
npx arui-scripts init my-app
cd my-app
yarn
yarn start
```

CLI умеет настраивать:

- **React 19** из коробки, опционально **React + RTK** (Redux Toolkit);
- режим **SSR** (клиент + сервер, клиент в `src/client/`) или **clientOnly** (статика);
- SSR-сервер на **Hapi**;
- транспилятор (**swc**/babel/tsc) и тест-раннер (**Jest**/Vitest);
- CSS-модули, полифилы (`core-js`), `experimentalReactCompiler`, docker registry, preset.

Также CLI поддерживает глобальные флаги `arui-scripts --help`, `arui-scripts --version` и справку по командам `arui-scripts <команда> --help`.
Подробнее - в [CLI и генерация проекта](docs/cli.md).

Использование

===

0. Пакет требует использовать следующие версии:

Зависимость | Версия
-- | --
`nodejs` | `20.0.0+, 22.0.0+, 24.0.0+`
`react` | `16.13.0+`
`react-dom` | `16.13.0+`

1. Установите `arui-scripts` в свой проект как dev зависимость

```bash
yarn add arui-scripts --dev
```

или

```bash
npm install arui-scripts --save-dev
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
- [CLI и генерация проекта (`init`)](docs/cli.md)
- [Настройки](docs/settings.md)
- [Команды](docs/commands.md)
- [Примеры входных точек](docs/examples.md)
- [Пресеты](docs/presets.md)
- [Тонкая настройка](docs/overrides.md)
- [Настройки сборки артефакта](docs/artifact.md)
- [Настройки компиляторов](docs/compilers.md)
- [Особенности поведения](docs/caveats.md)
- [Использование модулей](docs/modules.md)
- [Client-only режим](./docs/client-only.md)
- [Словарь для сжатия](./docs/compression-dictionary.md)
