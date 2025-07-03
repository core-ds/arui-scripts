Настройка arui-scripts
===

`arui-scripts` - гибкий инструмент, и зачастую вам необходимо настроить его под свои нужды.

Для этого предусмотрено несколько механизмов:

1. [Пресеты](presets.md)
2. Настройки в `package.json` (см. раздел [настройка через package.json](#настройка-через-packagejson))
3. [Конфигурационный файл](#Конфигурационный-файл)
4. [Переменные окружения](#переменные-окружения)

Если вы задаете одну и ту же настройку в разных местах, то она будет применена именно в том порядке, в котором они перечислены выше.

Предпочтительным способом настройки является использование конфигурационного файла.

## Механизмы настройки

### Настройка через package.json
Пример настройки через package.json:
```json
{
    "aruiScripts": {
        "clientEntry": {
            "mobile": "./src/mobile",
            "desktop": "./src/desktop"
        }
    }
}
```

### Конфигурационный файл - arui-scripts.config (js | ts)
Пример конфигурационного файла:

```ts
import { PackageSettings } from 'arui-scripts';

const settings: PackageSettings = {
    clientEntry: {
        mobile: './src/mobile',
        desktop: './src/desktop',
    },
};

export default settings;

```

### Переменные окружения
Использование переменных окружения для настройки может быть полезным для отладки или использования в специфических сценариях на CI.

Пример настройки через переменные окружения:
```bash
ARUI_SCRIPTS_CONFIG="{\"clientEntry\":{\"mobile\":\"./src/mobile\",\"desktop\":\"./src/desktop\"}}" yarn start
```

## Список настроек

### Общие настройки
#### clientServerPort
Порт WebpackDevServer и nginx итогового контейнера. По умолчанию `8080`.

#### serverPort
Порт нодового сервера. Нужен для правильного проксирования запросов от дев сервера и nginx. По умолчанию `3000`.

#### debug
Режим отладки, в котором не выполняются некоторые нежелательные операции и выводится больше сообщений об ошибках, по умолчанию `false`.

#### devSourceMaps
Какой вид source-map использовать в режиме разработки. По умолчанию `inline-cheap-source-map`. Эта настройка может сильно влиять на время сборки.
Подробнее можно почитать [здесь](https://webpack.js.org/configuration/devtool/).

:warning: **Внимание**. При использовании любых source-map на основании eval webpack-dev-server будет
модифицировать заголовок `Content-Security-Policy` (при наличии) и добавлять в разрешенные источники для `script-src` `unsafe-eval`.

Это необходимо для того, чтобы код вообще запускался в браузере. Это не влияет на реальную безопасность приложения,
так как используется ТОЛЬКО в дев-режиме. Если по каким-то причинам вас такое поведение не устраивает - вы можете поменять
тип source-map на любой другой, не использующий eval.

#### devServerCors
Включает добавление CORS заголовков в ответы dev-сервера. По умолчанию `false`.

#### useServerHMR
Использовать ли HotModuleReplacement для сервера. По умолчанию `false`.

#### presets
Пресеты, которые будут использоваться для настройки сборки. См. [пресеты](presets.md).

#### proxy
Позволяет настроить проксирование запросов в dev-режиме. По умолчанию `[]`. Так же этот параметр можно задать в `package.json`.

В случае, если ваш фронт должен обращаться к API, отличному от вашего nodejs сервера, в **дев режиме** вы можете настроить проксирование запросов.

Например:

```ts
import { PackageSettings } from 'arui-scripts';

const settings: PackageSettings = {
    proxy: [
        {
            context: '/corp-shared-ui',
            target: 'http://some-other-host',
            headers: {
                host: 'some-other-host',
            },
        },
    ],
};

export default settings;
```

Такая конфигурация будет проксировать запросы к `http://localhost:8080/corp-shared-ui/` на `http://some-other-host/corp-shared-ui`.
Подробнее о конфигурации прокси сервера можно почитать в [документации rspack](https://rspack.dev/guide/features/dev-server#proxy).

:warning: Эта настройка работает только в **дев режиме**.

#### clientOnly
Позволяет отключить сборку сервера, оставив только клиентскую часть. По умолчанию `false`. Подробнее можно прочитать в
[документации client-only режима](./client-only.md).


### Настройки путей

#### buildPath
Папка, в которую будет производиться сборка. По умолчанию `.build`

#### assetsPath
Папка, в которую будут попадать статические файлы. По умолчанию `assets`.

#### additionalBuildPath
Массив путей, которые попадут в архив при использовании [команды archive-build](./commands.md#archive-build). По умолчанию `['config']`.

#### statsOutputFilename
Имя [stats-файла](https://webpack.js.org/api/stats/), которое будет использоваться в [bundle-analyze команде](./commands.md#bundle-analyze). По умолчанию `stats.json`

#### serverEntry
Точка входа для исходников сервера, по умолчанию `./src/server/index`

#### serverOutput
Имя файла для компиляции сервера, по умолчанию `server.js`

#### clientPolyfillsEntry
Точка входа для полифилов. Будет подключаться до основной точки входа. По умолчанию подтягивает полифилы из arui-feather, если он установлен.

#### clientEntry
Точка входа для клиентского приложения. По умолчанию `./src/index`.

Этот ключ принимает не только строки, но и любые возможные в [webpack варианты](https://webpack.js.org/concepts/entry-points/).
Например, вы можете создать две отдельных входных точки для мобильной и десктопной версии приложения:

```ts
const settings = {
    clientEntry: {
        mobile: './src/mobile',
        desktop: './src/desktop',
    },
};
```

Ко всем клиентским entryPoint так же будут добавлены `clientPolyfillsEntry` (если задан)
и, в dev режиме, необходимые для hot-module-reload файлы


### Настройки сборки артефактов

#### dockerRegistry
Адрес используемого docker registry, по умолчанию `''`, то есть используется публичный registry

#### baseDockerImage
Имя базового образа, используемого для построения docker образа. По умолчанию `'alfabankui/arui-scripts:latest'`

#### nginxRootPath
Базовый путь, до файлов в контейнере, который будет использоваться в nginx. По умолчанию `'/src'`.

#### nginx

Некоторые настройки для базовой конфигурации `nginx` (`/etc/nginx/nginx.conf`).

```ts
const settings = {
    nginx: {
        workerProcesses: 2,
        workerRlimitNoFile: 20000,
        workerConnections: 19000,
        eventsUse: 'epoll',
        daemon: 'off'
    },
};
```

#### runFromNonRootUser
Сборка образа под пользователем nginx. Нужна для совместимости с k8s, т.к там зачастую запрещен запуск контейнера из под root По умолчанию `true`.

#### removeDevDependenciesDuringDockerBuild
Отключает удаление devDependencies из node_modules при сборке докер образа. Используется когда вам не нужно удалять devDependencies,
т.к. в своём Dockerfile вы не переносите node_modules в докер-контейнер. По умолчанию `true`.

#### archiveName
Имя архива, который будет создан при использовании команды [archive-build](./commands.md#archive-build). По умолчанию `'build.tar'`.

### Модификация сборки
#### keepPropTypes
Позволяет отключить удаление `prop-types` из бандла. По умолчанию `false`.

Так как в production режими proptypes не проверяются, их имеет смысл удалить из production сборки.

Сами объявления proptypes удаляются с помощью [babel-plugin-transform-react-remove-prop-types](https://www.npmjs.com/package/babel-plugin-transform-react-remove-prop-types).
Но импорты пакетов `prop-types` при этом не удаляются. Чтобы это реализовать, используется `webpack.NormalModuleReplacementPlugin`.
С помощью него заменяются на пустышку пакеты, попадающие под маску:

- `/^react-style-proptype$/`
- `/^thrift-services\/proptypes/`

#### codeLoader
Позволяет выбрать какой инструмент использовать для обработки js и ts кода приложения. По умолчанию `swc`.

Возможные значения:
- `babel` - для всего кода будет использоваться `babel-loader`;
- `tsc` - для ts кода будет использоваться `ts-loader`, для всего остального - `babel-loader`;
- `swc` - для всего кода будет использоваться `swc-loader`.

`swc` является предпочтительным режимом, дефолты не меняются для сохранения обратной совместимости.
Использование swc позволяет значительно ускорить сборку (до 2 раз на больших проектах), но не будет создавать полностью идентичный с babel код.
Итоговый бандл может получиться немного больше, чем при использовании babel, но разница полностью компенсируется при использовании сжатия.

#### installServerSourceMaps
Добавлять ли в серверную сборку пакет source-map-support. По умолчанию `false`.

#### jestCodeTransformer
Позволяет выбрать какой инструмент использовать для обработки js и ts кода приложения при запуске тестов. По умолчанию `swc`.

Возможные значения:
- `babel` - для всего кода будет использоваться `babel-jest`;
- `tsc` - для ts кода будет использоваться `ts-jest`, для всего остального - `babel-jest`;
- `swc` - для всего кода будет использоваться `@swc/jest`.
  Swc более строго следует спецификациям и [не дает возможности](https://github.com/swc-project/swc/issues/5059) делать `spyOn` для экспортов из esm модулей.

#### collectCoverage
Добавлять ли инструменты для сборки coverage при сборке. По умолчанию определяется по env переменным - будет выставлено в `true` если `NODE_ENV = 'cypress'` или `USE_ISTANBUL = 'enabled'`.
Сбор coverage не будет работать при использовании `codeLoader=tsc`.

#### disableDevWebpackTypecheck
Выключает проверку типов вебпаком во время разработки. По умолчанию `true`.
Вместо этого будет запускаться отдельный процесс `tsc`, который будет выдавать сообщения об ошибках в типах только в консоль.

### Обработка изображений
#### dataUrlMaxSize
Ресурсы, не превышающие данный размер (в байтах), будут включены в исходники `inline`, иначе вынесены в отдельный файл. По умолчанию `1536`.

#### imageMinimizer
Раздел настроек, связанных с оптимизацией графики.

:warning: **Внимание!** Если вы планируете использовать любые `imagemin`-плагины, кроме `svgo`, необходимо установить их дополнительно. <br/>
Так как после установки плагинам необходим прямой доступ в сеть для скачивания утилит (`cjpeg` и пр.), они указаны в `peerDependencies` `arui-scripts`, чтобы не приводить к ошибкам в закрытых контурах.<br/><br/>

- `imageMinimizer.svg.enabled` - включает/отключает оптимизацию `svg`. По умолчанию `true`.
- `imageMinimizer.gif.enabled` - включает/отключает оптимизацию `gif`. По умолчанию `false`.
- `imageMinimizer.gif.optimizationLevel` - уровень сжатия `gif`. От `1` до `3`. По умолчанию `1`.
- `imageMinimizer.jpg.enabled` - включает/отключает оптимизацию `jpg`. По умолчанию `false`.
- `imageMinimizer.jpg.quality` - качество выходного файла. От `0` до `100`. По умолчанию `75`.
- `imageMinimizer.png.enabled` - включает/отключает оптимизацию `png`. По умолчанию `false`. О структуре формата png и влиянии описанных далее оптимизаций можно прочитать [здесь](https://www.w3.org/TR/PNG-Chunks.html)
- `imageMinimizer.png.optimizationLevel` - уровень сжатия `png`. От `0` до `7`. По умолчанию `3`. [Подробнее](https://github.com/imagemin/imagemin-optipng#optimizationlevel)
- `imageMinimizer.png.bitDepthReduction` - допускает уменьшение глубины цвета изображения. По умолчанию `false`. [Подробнее](https://github.com/imagemin/imagemin-optipng#bitdepthreduction)
- `imageMinimizer.png.colorTypeReduction` - допускает изменение представления изображения (оттенки серого / прозрачность / пр.). По умолчанию `false`. [Подробнее](https://github.com/imagemin/imagemin-optipng#colortypereduction)
- `imageMinimizer.png.paletteReduction` - допускает уменьшение палитры изображения. По умолчанию `false`. [Подробнее](https://github.com/imagemin/imagemin-optipng#palettereduction)
- `imageMinimizer.png.interlaced` - потоковый порядок передачи изображение. По умолчанию этот параметр идентичен значению из входного изображения. [Подробнее](https://github.com/imagemin/imagemin-optipng#interlaced)

### Обработка стилей
#### componentsTheme
Путь к css файлу с темой для [core-components](https://github.com/core-ds/core-components). По умолчанию `null`.

#### keepCssVars
Отключает postcss-custom-properties, css переменные будут оставаться в бандле. По умолчанию `false`.

### Модули

#### modules
Позволяет настроить работу с модулями. По умолчанию `{}`. Подробнее в разделе [модули](modules.md).

#### compatModules
Позволяет настроить работу с `compat` модулями. По умолчанию `{}`. Подробнее в разделе [модули](modules.md).

#### disableModulesSupport
Полностью выключает любые манипуляции с WMF плагином. По умолчанию `false`.
Нужно для проектов, которые хотят реализовывать модули самостоятельно, чтобы избежать конфликтов в конфигурации плагинов.
