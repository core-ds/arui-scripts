Тонкая настройка
===

Если вам не хватает гибкости при использовании `arui-scripts`, например вы хотите добавить свой плагин для вебпака -
вы можете воспользоваться механизмом `overrides`.

Для этого вам необходимо создать в корне вашего проекта файл `arui-scripts.overrides.js` или `arui-scripts.overrides.ts`, из которого вы сможете управлять
конфигурацией почти всех инструментов, используемых в `arui-scripts`.

Принцип работы тут следующий. Для всех конфигураций определен набор ключей, которые они будут искать в `arui-scripts.overrides.js`,
В случае если такой ключ найден и это функция - она будет вызвана, и в качестве аргументов ей будут переданы
существующая конфигурация и полный конфиг приложения (см [AppConfig](../src/configs/app-configs/types.ts)).
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
    import {
        createPostcssConfig, // функция для создания конфигурационного файла postcss
        postcssPlugins, // список плагинов
        postcssPluginsOptions, // коллекция конфигураций плагинов
    } from 'arui-scripts/build/configs/postcss.config';

    module.exports = {
        postcss: (config) => {
            const { files } = postcssPluginsOptions['@csstools/postcss-global-data'];
            const newOption = {
                ...postcssPluginsOptions,
                '@csstools/postcss-global-data': {
                    files:files.concat(['./vars.css'])
                }
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
  Базовый шаблон [тут](../src/templates/dockerfile.template.ts).
  [`Dockerfile` в корне проекта](#docker) имеет приоритет над overrides.
- `DockerfileCompiled` - докерфайл, который будет использоваться для сборки контейнера при использовании команды `arui-scripts docker-build:compiled`
- `nginx` - шаблон конфигурации для nginx внутри контейнера.
  Базовый шаблон [тут](../src/templates/nginx.conf.template.ts).
  [Файл `nginx.conf`](nginx.md) в корне имеет приоритет над оверрайдами.
- `start.sh` - шаблон entrypoint докер контейнера. Базовый шаблон [тут](../src/templates/start.template.ts).
- `serverExternalsExemptions` - список модулей, которые не будут добавлены в список внешних зависимостей сервера. [Подробнее](caveats.md#node-externals).

Для некоторых конфигураций определены несколько ключей, они будут применяться в том порядке, в котором они приведены в этом файле.

### Создание дополнительных конфигураций для webpack
На некоторых проектах может потребоваться создать дополнительные конфигурации для webpack. Например, для создания
service worker'а (или любых других кейсов). Для этого можно использовать функцию-хелпер `createSingleWebpackConfig`:

```ts
import type { OverrideFile } from 'arui-scripts';

const overrides: OverrideFile = {
    webpackClient: (config, appConfig, { createSingleClientWebpackConfig }) => {
        return [
            config,
            createSingleClientWebpackConfig(
                './src/sw.js', // entrypoint, может быть массивом/объектом
                'sw', // наименование сборки, влияет на имена чанков
            ),
        ];
    }
};

export default overrides;
```
Эта функция вернет независимую конфигурацию для webpack, которую можно использовать в качестве оверрайда. Вы так же можете ее модифицировать,
не боясь что это повлияет на другие конфигурации.

Созданная таким образом конфигурация будет шарить с оригинальной конфигурацией только плагин для формирования assets-manifest'а.

### Переопределение плагинов или загрузчиков для конфигураций webpack
Иногда может понадобиться возможность поменять конфигурацию конкретного загрузчика или плагина, для этого в `webpackClient`, `webpackClientDev`, `webpackServer` и `webpackServerDev` третьим параметром можно получить хелпер-функции `findLoader` и `findPlugin`:
```ts
import type { OverrideFile } from 'arui-scripts';

const overrides: OverrideFile = {
    webpackClient: (config, appConfig, { findLoader, findPlugin }) => {
      // ...        
    }
};

export default overrides;
```
- `findLoader` - помогает найти загрузчик для переопределения. Функция возвращает ссылку, поэтому вы можете спокойно мутировать этот результат и обходиться без создания нового объекта через spread-оператор. В качестве аргументов принимает `config` и `testRule`, по которому будет искаться загрузчик. Пример:
```ts
import type { OverrideFile } from 'arui-scripts';

const overrides: OverrideFile = {
    webpackClient: (config, appConfig, { findLoader }) => {
      const cssModulesLoader = findLoader(config, '/\\.module\\.css$/')
      const currentCssLoader = cssModulesLoader.use.find((cssLoader) => {
        return cssLoader.loader.includes('css-loader') && !cssLoader.loader.includes('postcss-loader')
      })

      currentCssLoader.options.modules = {
        localIdentName: '[name]-[local]-[hash:base64:5]'
      }

      return config
    }
};

export default overrides
```
- `findPlugin` - помогает найти плагин для переопределения. Функция так же возвращает ссылку. В качестве аргументов принимает `config` и название плагина. Все типизировано, поэтому название можете достать из автокомплита. для `webpackClient` и `webpackClientDev` из автокомплита будут приходить клиентские плагины, а для `webpackServer` и `webpackServerDev` серверные. Примеры:
```ts
import type { OverrideFile } from 'arui-scripts';

const overrides: OverrideFile = {
    webpackClient: (config, appConfig, { findPlugin }) => {
      const [MiniCssExtractPlugin] = findPlugin(config, 'MiniCssExtractPlugin')

      // возвращаемые плагины так же типизированы
      MiniCssExtractPlugin.options.ignoreOrder = false

      return config
    },
    webpackServerDev: (config, appConfig, { findPlugin }) => {
      const [BannerPlugin] = findPlugin(config, 'BannerPlugin');

      BannerPlugin.options.banner = 'unexpected error';

      return config
    }
};

export default overrides
```
