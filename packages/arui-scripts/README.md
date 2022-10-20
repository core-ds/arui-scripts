ARUI-scripts
===

Приложение на нашем стеке без какой либо конфигурации билдеров.

Во многом пакет аналогичен `react-scripts` из `create-react-app`, разница заключается
в немного отличающихся настройках для `babel`, поддержки `ts` и возможности работы с серверным кодом.

Использование
===

0. Пакет требует использовать следующие версии:

Зависимость | Версия
-- | --
`nodejs` | `12.13.0+`
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
- `node_modules/arui-feather/polyfills` - полифилы для клиентского приложения.

При желании вы можете изменить эти пути с помощью настроек.

3. Используйте команды из `arui-scripts`!

Доступные команды
---

- `arui-scripts start` - запускает WebpackDevServer для фронтенда и webpack в режиме `--watch` для сервера.
- `arui-scripts build` - компилирует клиент и сервер для использования в production
- `arui-scripts docker-build` - собирает docker контейнер c production билдом и загружает его в артифактори
- `arui-scripts test` - запускает jest тесты.
- `arui-scripts archive-build` - собирает архив с production билдом
- `arui-scripts bundle-analyze` - запускает [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) для prod версии клиентского кода


Настройки
---

Несмотря на то, что все работает из коробки, вы можете захотеть поменять некоторые настройки сборщиков.
Сделать это можно в `package.json`, определив там свойство `aruiScripts`, или положить в корень проекта файл
`arui-scripts.config.(js|ts)`.

Доступные настройки:

- `dockerRegistry` - адрес используемого docker registry, по умолчанию `''`, то есть используется публичный registry
- `baseDockerImage` - имя базового образа, используемого для построения docker образа. По умолчанию `alfabankui/arui-scripts:latest`.
- `runFromNonRootUser` - сборка образа под пользователем `nginx`. Нужна для совместимости с k8s, т.к там зачастую запрещен запуск контейнера из под `root` По умолчанию `false`.
- `serverEntry` - точка входа для исходников сервера, по умолчанию `src/server/index`.
- `serverOutput` - имя файла для компиляции сервера, по умолчанию `server.js`.
- `clientPolyfillsEntry` - точка входа для полифилов. Будет подключаться до основной точки входа. По умолчанию подтягивает полифилы из `arui-feather`, если он установлен.
- `clientEntry` - точка входа для клиентского приложения. По умолчанию `src/index.js`.
- `useServerHMR` - использовать ли HotModuleReplacement для сервера. По умолчанию `false`.
- `webpack4Compatibility` - включить ли режим совместимости с webpack 4. По умолчанию `false`. Подробнее можно почитать в [этом issue](https://github.com/webpack/webpack/issues/14580).
- `clientServerPort` - порт WebpackDevServer и nginx итогового контейнера. По умолчанию `8080`.
- `serverPort` - порт нодового сервера. Нужен для правильного проксирования запросов от дев сервера и nginx. По умолчанию `3000`.
- `installServerSourceMaps` - добавлять ли в серверную сборку пакет `source-map-support`. По умолчанию `false`.
- `additionalBuildPath` - массив путей, которые попадут в архив при использовании команды `archive-build`. По умолчанию `['config']`.
- `archiveName` - имя архива, который будет создан при использовании команды `archive-build`. По умолчанию `build.tar`.
- `keepPropTypes` - если `true`, пакеты с prop-types не будут удалены из production билда.
- `debug` - режим отладки, в котором не выполняются некоторые нежелательные операции и выводится больше сообщений об ошибках, по умолчанию `false`.
- `statsOutputFilename` - имя [stats-файла](https://webpack.js.org/api/stats/), которое будет использоваться в [bundle-analyze](#анализ-бандла) команде
- `useTscLoader` -  использовать ts-loader вместо babel-loader для обработки ts файлов. У babel-loader есть [ряд ограничений](https://blogs.msdn.microsoft.com/typescript/2018/08/27/typescript-and-babel-7/). По умолчанию `false`.
- `componentsTheme` - путь к css файлу с темой для [core-components](https://alfa-laboratory.github.io/core-components). Используется для настройки [postcss-custom-properties](https://github.com/postcss/postcss-custom-properties#importfrom).
- `keepCssVars` - отключает `postcss-custom-properties`, css переменные будут оставаться в бандле.
- `removeDevDependenciesDuringDockerBuild` - отключает удаление devDependencies из node_modules при сборке докер образа. Используется когда вам не нужно удалять devDependencies, т.к. в своём Dockerfile вы не переносите node_modules в докер-контейнер

В целях отладки все эти настройки можно переопределить не изменяя package.json
Просто передайте необходимые настройки в environment переменной ARUI_SCRIPTS_CONFIG
```
ARUI_SCRIPTS_CONFIG="{\"serverPort\":3333}" yarn start
```

Так же, читаются настройки jest (см. [документацию](https://facebook.github.io/jest/docs/en/configuration.html))
и `proxy` (см. [документацию](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#proxying-api-requests-in-development)).

Использование отдельных конфигурационных файлов
---
Для сложных конфигураций может быть удобно вынести их из package.json в отдельный файл. Конфигурация будет загружаться из файла
`arui-scripts.config.js` или `arui-scripts.config.ts`
Пример `arui-scripts.config.ts`:
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

Несколько entry point
---
Ключи `serverEntry` и `clientEntry` принимают не только строки, но и любые возможные в [webpack варианты](https://webpack.js.org/concepts/entry-points/).
Например, package.json:
```json
{
    "aruiScripts": {
        "clientEntry": { "mobile": "src/mobile/", "desktop": "src/desktop/" },
        "serverEntry": ["src/server-prepare", "src/server"]
    }
}
```

Ко всем клиентским entryPoint так же будут добавлены `clientPolyfillsEntry` (если задан)
и, в dev режиме, необходимые для hot-module-reload файлы.

Переопределение настроек компиляторов
---

По умолчанию для компиляции используется только Babel, для переопределения конфига можете положить файл `.babelrc` в рут папку своего проекта.
TypeScript можно включить, положив `tsconfig.json` в корень проекта.

Пути до ассетов
---
Во время компиляции продакшн версии билда будет созданно два бандла `vendor.[hash].js` и `main.[hash].js`. Для
того, чтобы генерировать правильный html с подключением этих ассетов вы можете использовать файл `webpack-assets.json`
который будет автоматически положен в папку со скомпилированным кодом.

`vendor.js` будет содержать все используемые вами `node_modules`, за исключением модулей, в названии которых содержится `arui`.

`main.js` содержит все остальное.

Важно подключать ваши ассеты в правильном порядке, `vendor.js` должен подключаться ДО `main.js`.

Пример функции, которая сформирует отсортированные в правильном порядке массивы для js и css файлов:
```js
function readAssetsManifest() {
    // читаем манифест
    const manifestPath = path.join(process.cwd(), '.build/webpack-assets.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const js = [];
    const css = [];
    // vendor должен идти перед main
    ['vendor', 'main'].forEach((key) => {
        if (!manifest[key]) { // в дев сборке vendor.js не формируется
            return;
        }
        if (manifest[key].js) {
            js.push(manifest[key].js);
        }
        if (manifest[key].css) {
            css.push(manifest[key].css);
        }
    });

    return {
        js, css
    };
}
```

Использование hot-module-replacement
---
#### Клиент:

По умолчанию на клиенте будет подменяться только css. Для правильной работы с react вам надо добавить примерно такой код:
```jsx harmony
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app';

ReactDOM.render(
    <App />,
    document.getElementById('react-app')
);
if (module.hot) {
    module.hot.accept('./app', () => {
        const NextAppAssignments = require('./app').default;
        ReactDOM.render(
            <NextAppAssignments />,
            document.getElementById('react-app')
        );
    });
}
```

#### Сервер
Серверная часть приложения по умолчанию будет просто перезапускаться после каждого изменения кода,
для использования hot module replacement на сервере нужно сделать несколько вещей:

В `package.json` добавить:
```json
{
    "aruiScripts": { "useServerHMR": true }
}
```

Ваша входная точка сервера должна выглядеть примерно так (на примере hapi):
##### server/index.js
```js
import server from './server';

let currentServer = server;

async function startServer() {
    try {
        await currentServer.start();
    } catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
}

startServer();

if (module.hot) {
    module.hot.accept(['./server'], async () => {
        try {
            await currentServer.stop();

            currentServer = server; // импорт из сервера заменится самостоятельно
            await startServer();
        } catch (error) {
            console.log('Failed to update server. You probably need to restart application', error);
        }
    });
}
```
##### server/server.js
```js
import hapi from 'hapi';
const server = new hapi.Server();

server.ext('onPostStart', (_, done) => {
    console.log(`Server is running: ${server.info.uri}`);
    done();
});

(async () => {
    server.connection({ port: 3000 });

    // ...
    // конфигурация вашего сервера
    // ...
})();

export default server;
```

Таким образом после изменения кода сервер не будет полностью пререзагружаться, что во многих случаях быстрее.
В случае изменения входной точки сервера при использовании HMR вам надо будет перезапускать сервер вручную.

Тесты
---
Команда `arui-scripts test` внутри запускает jest с дополнительной конфигурацией.

Конфигурация включает в себя:
- Использование `jest-snapshot-serializer-class-name-to-string` для правильной работы с `cn`
- Замену всех импортов css файлов на пустые файлы
- Компиляцию .js/.jsx файлов используя babel
- Компиляцию .ts/.tsx файлов используя tsc
- Замену импортов остальных типов файлов на импорт строк с названием файла

По умолчанию под маску для поиска тестов попадают все файлы `*test*.(js|jsx|ts|tsx)`, `*spec*.((js|jsx|ts|tsx))`, `*/__test__/*.(js|jsx|ts|tsx)`.

Вы можете переопределять любые настройки jest в `package.json`, [документация](https://facebook.github.io/jest/docs/en/configuration.html).

Если какие либо из ваших инструментов (например VSСode или WebStorm) не могут запустить тесты поскольку не находят конфигурацию, вы можете так же указать `arui-scripts` как preset для jest.
Таким образом будет работать как запуск тестов через arui-script, так и любые сторонние инструменты, запускающие jest.

##### package.json
```json
{
    "jest": {
        "preset": "arui-scripts"
    }
}
```

docker
---

Команда `arui-scripts docker-build` запускает компиляцию продакшн версии и сборку докер образа.

Образ основан на [alpine-node-nginx](https://github.com/alfa-laboratory/arui-scripts/blob/master/packages/alpine-node-nginx/).

Имя контейнера определяется как `{configs.dockerRegistry}/{name}:{version}`. Переменные `name` и `version` по умолчанию берутся из package.json,
но вы так же можете переопределить их из командной строки, например
`arui-scripts docker-build name=container-name version=0.1-beta`

Команда предполагает наличие установленных `node_modules` перед сборкой, в процессе работы же очищает дев зависимости используя `yarn` или `npm`.
yarn будет использоваться когда в рутовой папке проекта есть `yarn.lock` и `yarn` доступен в системе.
Если вы используете yarn 2, для выполнения команды очистки используется плагин [workspace-tools](https://github.com/yarnpkg/berry/blob/HEAD/packages/plugin-workspace-tools/README.md), поэтому он должен быть установлен и указан в `.yarnrc.yml` вашего проекта.

Итоговый контейнер будет содержать `nginx` и скрипт для запуска `nginx` одновременно с `nodejs` сервером.

В итоге, для корректного запуска вашего докер-контейнера вам надо будет выполнить

```
docker run -p 8080:8080 container-name:version ./start.sh
```

На `8080` порту будет поднят nginx, который будет раздавать статику и проксировать все остальные запросы к `nodejs`.

Вы также можете переопределить полностью процесс сборки docker-образа используя механизм [overrides](#тонкая-настройка)
или создав в корневой директории проекта `Dockerfile` содержащий необходимый набор инструкций.
Пример [Dockerfile](src/templates/dockerfile.template.ts).

`Dockerfile` в корне проекта имеет приоритет над overrides.

archive
---

Команда `arui-scripts archive-build` запускает компиляцию продакшн версии и сборку архива со скомпилированным кодом.

Этот вариант может быть полезен если вы хотите деплоить ваше приложение через подключение архива в марафоне.

Команда предполагает наличие установленных `node_modules` перед сборкой, в процессе работы же очищает дев зависимости используя `yarn` или `npm`.
yarn будет использоваться когда в рутовой папке проекта есть `yarn.lock` и `yarn` доступен в системе.
Если вы используете yarn 2, для выполнения команды очистки используется плагин [workspace-tools](https://github.com/yarnpkg/berry/blob/HEAD/packages/plugin-workspace-tools/README.md), поэтому он должен быть установлен и указан в `.yarnrc.yml` вашего проекта.

Итоговый архив будет содержать в себе `.build`, `node_modules`, `package.json` и `config` папки вашего проекта.

Проксирование запросов до бэкенда.
---

В случае, если ваш фронт должен обращаться к API, отличному от вашего nodejs сервера, в дев режиме вы можете настроить проксирование запросов.
Сделать это можно используя свойство `proxy` в вашем `package.json`.

Например:

```json
{
    "proxy": {
        "/corp-shared-ui": {
            "target": "http://corpint4",
            "headers": {
                "host": "corpint4"
            }
        }
    }
}
```

Такая конфигурация будет проксировать запросы к `http://localhost:8080/corp-shared-ui/` на `http://corpint4/corp-shared-ui`.
Подробнее о конфигурации прокси сервера можно почитать в [документации Webpack](https://webpack.js.org/configuration/dev-server/#devserver-proxy).

Конфигурация typescript
---

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

Если вы используете что-то из вышеперичисленного - вы можете вернуться к использованию tsc для компиляции ts файлов

```json
{
    "aruiScripts": { "useTscLoader": true }
}
```

Конфигурация nginx
---

Несмотря на то, что nginx имеет готовый конфиг с роутингом, иногда возникает необходимость добавлять свои роуты.
Вы можете использовать механизм [overrides](#тонкая-настройка).
Так же вы можете создать `nginx.conf` на уровне проекта со своими роутами. Пример конфига [тут](src/templates/nginx.conf.template.ts).
Файл nginx.conf имеет приоритет над оверрайдами.


Использование env переменных в nginx.conf
---
Иногда у вас может возникнуть потребность переопределять какие-то из настроек nginx в зависимости
от среды, на которой запущен контейнер. Это можно сделать задав свой `nginx.conf` и передав ENV переменные
в контейнер. По умолчанию конфигурация nginx прогоняется при старте
через [envsubst](https://www.gnu.org/software/gettext/manual/html_node/envsubst-Invocation.html).

Если вы используете свой базовый docker-образ для работы приложения - убедитесь что в нем доступен `envsubst`.
Для alpine он является частью пакета [`gettext`](https://pkgs.alpinelinux.org/contents?branch=edge&name=gettext&arch=x86&repo=main)

**Важно**. Для того, чтобы сохранить нормальную работу специальных переменных nginx, типа `$proxy_add_x_forwarded_for`
перед запуском envsubst они будут заменены на `~~proxy_add_x_forwarded_for~~`, а затем возвращены в исходный вид.
envsubst будет заменять переменные записанные **только** как `${MY_VAR}`.


Вы можете использовать это так:

```nginx.conf
server {
    listen 8080;
    server_name ${SERVICE_NAME};
    ...
}
```

```shell
docker run my-awesome-app --env SERVICE_NAME=my-app
```

После запуска nginx будет иметь server_name `my-app`.

Удаление proptypes
---

Так как в production режими proptypes не проверяются, их имеет смысл удалить из production сборки.

Сами объявления proptypes удаляются с помощью [babel-plugin-transform-react-remove-prop-types](https://www.npmjs.com/package/babel-plugin-transform-react-remove-prop-types).
Но импорты пакетов `prop-types` при этом не удаляются. Чтобы это реализовать, используется `webpack.NormalModuleReplacementPlugin`.
С помощью него заменяются на пустышку пакеты, попадающие под маску:

- `/^react-style-proptype$/`
- `/^thrift-services\/proptypes/`

Если, по какой то причине, вы не хотите такого поведения - вы можете отключить его, добавив в `package.json`:

```json
{
    "aruiScripts": {
        "keepPropTypes": true
    }
}
```

require не js файлов в node_modules в node.js
---
Сборка серверной части устроена таким образом, что большая часть `node_modules` не вкомпиливается
в итоговый бандл, а загружается стандартным `require` node.js. Как правило - это нам и нужно.
Но в случае react-компонентов, мы зачастую запрашиваем кроме кода компонентов еще и `.css`, `.png` и другие файлы.
require node.js на таких местах ломается. Поэтому наши внутренние библиотеки компонентов все же вкомпиливаются
в итоговый бандл сервера. Это сделанно с помощью [добавления их в исключение](src/configs/webpack.server.dev.ts#L59)
плагина [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals).
В случае, если вам необходима обработка не-js файлов из других внешних модулей - вы можете
воспользоваться механизмом `overrides`, описанным ниже.
По умолчанию же все не-js файлы из внешних модулей будут проигнорированы.

Кеширование билда
---
В dev сборке для сервера и клиента настроено кеширование. Оно должно нормально работать когда вы просто работаете
над проектом - меняете ваш код, ставите новые зависимости и тд.

Но когда вы руками меняете код внутри node_modules - вы не сможете увидеть ваши изменения, так как webpack будет
использовать данные из кеша. Для того чтобы ваши изменения применились в сборке вам необходимо очистить кеш
webpack и перезапустить сборку. Кеши хранятся в папке `.cache` внутри `node_modules` вашего проекта.

```
rm -rf ./node_modules/.cache
```


Анализ бандла
---
Для изучения итогового бандла приложения и просмотра его размеров и включенных файлов в arui-scripts есть команда
```
arui-scripts bundle-analyze
```
Она запускает [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) для клиентского кода.
Так же при запуске будет генерироваться [stats-файл](https://webpack.js.org/api/stats/), который можно использовать в
[сторонних](http://webpack.github.io/analyse/) инструментах, например для понимания почему тот или иной модуль попал в бандл.
По умолчанию файл будет писаться в `.build/stats.json`.

Тонкая настройка
===
Если вам не хватает гибкости при использовании `arui-scripts`, например вы хотите добавить свой плагин для вебпака -
вы можете воспользоваться механизмом `overrides`.

Для этого вам необходимо создать в корне вашего проекта файл `arui-scripts.overrides.js` или `arui-scripts.overrides.ts`, из которого вы сможете управлять
конфигурацией почти всех инструментов, используемых в `arui-scripts`.

Принцип работы тут следующий. Для всех конфигураций определен набор ключей, которые они будут искать в `arui-scripts.overrides.js`,
В случае если такой ключ найден и это функция - она будет вызвана, и в качестве аргументов ей будут переданы
существующая конфигурация и полный конфиг приложения (см [AppConfig](./src/configs/app-configs/types.ts)).
Возвращать такая функция должна так же конфигурацию.

Пример `arui-scripts.overrides.js`:
```javascript
const path = require('path');
module.exports = {
    webpack: (config, applicationConfig) => {
        config.resolve.alias = {
            components: path.resolve(__dirname, 'src/components')
        };
        return config;
    }
};
```

Пример `arui-scripts.overrides.ts`:
```ts
import type { OverrideFile } from 'arui-scripts';
import path from 'path';

const overrides: OverrideFile = {
    webpack: (config, applicationConfig) => {
        config.resolve.alias = {
            components: path.resolve(__dirname, 'src/components')
        };
        return config;
    }
};

export default overrides;
```

**В случае, если у вас на проекте лежит и ts, и js файл с overrides, использоваться будет js версия.**

С помощью этой конфигурации ко всем настройкам вебпака будет добавлен `alias` *components*.

На данный момент можно переопределять следующие конфигурации:
- `babel-client` - конфигурация `babel` для клиентского кода. Ключи: `babel`, `babelClient`.
- `babel-server` - конфигурация `babel` для серверноого кода. Ключи: `babel`, `babelServer`.
- `dev-server` - конфигурация `webpack-dev-server`. Ключи: `devServer`.
- `postcss` - конфигурация для `postcss`. Ключи: `postcss`.
  > `config` postcss содержит массив с уже инициализированными плагинами, параметры которых уже зафиксированны. Если необходимо изменить параметры плагинов можно пересоздать конфиг, таким образом:
    ```javascript
    const {
        createPostcssConfig, // функция для создания конфигурационного файла postcss
        postcssPlugins, // список плагинов
        postcssPluginsOptions, // коллекция конфигураций плагинов
    } = require('arui-scripts/build/configs/postcss.config');

    module.exports = {
        postcss: () => {
            const newOption = {
                ...postcssPluginsOptions,
                'postcss-import': {
                    ...postcssPluginsOptions['postcss-import'],
                    path: [...postcssPluginsOptions['postcss-import'].path, './src'],
                },
            };
            return createPostcssConfig(postcssPlugins, newOption);
        },
    };
    ```
- `stats-options` - конфигурация для [webpack-stats](https://webpack.js.org/configuration/stats/). Ключи: `stats`.
- `webpack.client.dev` - конфигурация для клиентского webpack в dev режиме.
  Ключи: `webpack`, `webpackClient`, `webpackDev`, `webpackClientDev`.
- `webpack.client.prod` - конфигурация для клиентского webpack в prod режиме.
  Ключи: `webpack`, `webpackClient`, `webpackProd`, `webpackClientProd`.
- `webpack.server.dev` - конфигурация для серверного webpack в dev режиме.
  Ключи: `webpack`, `webpackServer`, `webpackDev`, `webpackServerDev`.
- `webpack.server.prod` - конфигурация для серверного webpack в prod режиме.
  Ключи: `webpack`, `webpackServer`, `webpackProd`, `webpackServerProd`.
- `supporting-browsers` - список поддерживаемых браузеров в формате [browserslist](https://github.com/browserslist/browserslist).
  Ключи: `browsers`, `supportingBrowsers`
- `Dockerfile` - докерфайл, который будет использоваться для сборки контейнера.
  Базовый шаблон [тут](./src/templates/dockerfile.template.ts).
  [`Dockerfile` в корне проекта](#docker) имеет приоритет над overrides.
- `nginx` - шаблон конфигурации для nginx внутри контейнера.
  Базовый шаблон [тут](./src/templates/nginx.conf.template.ts).
  [Файл `nginx.conf`](#конфигурация-nginx) в корне имеет приоритет над оверрайдами.
- `start.sh` - шаблон entrypoint докер контейнера. Базовый шаблон [тут](./src/templates/start.template.ts).

Для некоторых конфигураций определены несколько ключей, они будут применяться в том порядке, в котором они приведены в этом файле.

Пресеты
===

В случае, если вы хотите использовать определенный набор конфигураций и оверрайдов сразу в нескольких проектах - вам может
помочь механизм пресетов. Он позволяет выносить конфигурацию и оверрайды в отдельный пакет.
Для того чтобы использовать персеты на проекте вы должны указать в package.json:

```json
{
    "aruiScripts": {
        "presets": "my-company-presets"
    }
}
```

Как пресет должен быть указан путь до папки с общими настройками (для поиска пути будет использоваться `require.resolve`
от папки, содержащей package.json. Так что это может быть как папка в проекте, так и пакет из node_modules).

Сам пакет с пресетами может содержать два файла:
- `arui-scirpts.config.js` (или `arui-scripts.config.ts`)
- `arui-scripts.overrides.js` (или `arui-scirpts.overrides.ts`)

### arui-scripts.config (js | ts)
С помощью этого файла можно задать любые ключи [конфигурации](#настройки).
```js
module.exports = {
    baseDockerImage: 'my-company-artifactory.com/arui-scripts-base:11.2'
};
```

Или в виде ts:
```ts
import type { PackageSettings } from 'arui-scripts';

const settings: PackageSettings = {
    baseDockerImage: 'my-company-artifactory.com/arui-scripts-base:11.2'
};

export default settings;
```

На проекте конфиурация будет загружаться в следующем порядке:
1. базовые настройки из arui-scripts
2. настройки из presets
3. настройки из package.json проекта
4. настройки, переданные через env переменную.

**Важно!**

Если вы будете задавать относительные пути через общие конфигурации (например `serverEntry`, `additionalBuildPath` и другие)
они будут вычисляться относительно корня проекта, а не вашей конфигурации.
Вы можете использовать абсолютные пути при необходимости задать путь до файла внутри пакета с пресетами.

### arui-scripts.overrides (js | ts)
С помощью этого файла можно задать базовые оверрайды проекта, аналогично [заданию оверрайдов на проекте](#тонкая-настройка).
```js
module.exports = {
    babelClient(config) {
        config.plugins.push('my-awesome-babel-plugin');
        return config;
    }
};
```

На проекте оверрайды из пресетов будут выполняться в первую очередь, после них будут выполняться оверрайды из проекта.
