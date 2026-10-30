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

Команду `bundle-diff` можно запускать локально или в CI/CD.

Для анализа изменений клиентских бандлов необходимы snapshot двух production сборок:

- `current`: snapshot текущей сборки PR
- `baseline`: snapshot сборки целевой ветки PR

Сохранить snapshot текущей сборки можно командой:

```bash
ARUI_SCRIPTS_RSDOCTOR_OUTPUT=rsdoctor/current yarn build
```

Сохраните snapshot успешной сборки целевой ветки. Перед сравнением поместите snapshot
нужного коммита целевой ветки в каталог `rsdoctor/baseline`, затем запустите команду:

```bash
arui-scripts bundle-diff --current rsdoctor/current --baseline rsdoctor/baseline
```

Команда `bundle-diff` не скачивает baseline автоматически. При запуске в CI/CD настройте
получение и сохранение snapshot в пайплайне (при локальном запуске нужно подготовить вручную).

Команда создает HTML/JSON diff и markdown комментарий с таблицей размеров и ссылками на отчеты.
Подробнее, включая использование в CI, в [документации bundle-diff](docs/commands.md#bundle-diff).

Использование

===

0. Пакет требует использовать следующие версии:

Зависимость | Версия
-- | --
`nodejs` | `22.12.0+, 24.0.0+, 26.0.0+`
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

TypeScript

===

TypeScript устанавливается в проект как peer-зависимость. Поддерживаются версии 5, 6 и 7;
проверка типов использует установленный в проекте компилятор, в том числе нативный TypeScript 7.
Сборка и тесты по умолчанию используют SWC. Для TypeScript 7 выбирайте `swc` или `babel`
в настройках `codeLoader` и `jestCodeTransformer`.

Значение `tsc` у обеих настроек **deprecated** и работает только с TypeScript <7.
На TypeScript 5–6 оно сохраняет прежнее поведение и выводит предупреждение.
На TypeScript 7 конфигурация с `tsc` отклоняется с подсказкой о переходе на SWC/Babel.
TS-конфиги, overrides и presets загружаются через `jiti`, без внутреннего компилятора TypeScript.

Подробнее в [настройках компиляторов](docs/compilers.md).

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
- [Особенности поведения](docs/caveats.md)
- [Использование модулей](docs/modules.md)
- [Client-only режим](./docs/client-only.md)
- [Словарь для сжатия](./docs/compression-dictionary.md)

Размер начального JS и CSS можно контролировать настройкой [buildSizeBudgets](docs/settings.md#buildsizebudgets).
При превышении лимита сборка завершается с ошибкой.
