Тонкая настройка
===

Если вам не хватает гибкости при использовании `arui-scripts`, например вы хотите добавить свой плагин для rspack -
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
    rspack: (config, applicationConfig) => {
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
    rspack: (config, applicationConfig) => {
        config.resolve.alias = {
            components: path.resolve(__dirname, 'src/components')
        };
        return config;
    }
};

export default overrides;
```

**В случае, если у вас на проекте лежит и ts, и js файл с overrides, использоваться будет js версия.**

С помощью этой конфигурации ко всем настройкам rspack будет добавлен `alias` *components*.

На данный момент можно переопределять следующие конфигурации:
- `babel-client` - конфигурация `babel` для клиентского кода. Ключи: `babel`, `babelClient`.
- `babel-server` - конфигурация `babel` для серверноого кода. Ключи: `babel`, `babelServer`.
- `dev-server` - конфигурация `webpack-dev-server`. Ключи: `devServer`.
- `postcss` - конфигурация плагинов для [`postcss`](https://github.com/postcss/postcss#webpack). Ключи: `postcss`.
- `stats-options` - конфигурация для [webpack-stats](https://webpack.js.org/configuration/stats/). Ключи: `stats`.
- `rspack.client.dev` - конфигурация для клиентского rspack в dev режиме.
  Ключи: `rspack`, `rspackClient`, `rspackDev`, `rspackClientDev`.
- `rspack.client.prod` - конфигурация для клиентского rspack в prod режиме.
  Ключи: `rspack`, `rspackClient`, `rspackProd`, `rspackClientProd`.
- `rspack.server.dev` - конфигурация для серверного rspack в dev режиме.
  Ключи: `rspack`, `rspackServer`, `rspackDev`, `rspackServerDev`.
- `rspack.server.prod` - конфигурация для серверного rspack в prod режиме.
  Ключи: `rspack`, `rspackServer`, `rspackProd`, `rspackServerProd`.
- `supporting-browsers` - список поддерживаемых браузеров в формате [browserslist](https://github.com/browserslist/browserslist).
  Альтернативно вы можете использовать любые методы передачи списка браузеров, поддерживаемые пакетом browserslist.
  Ключи: `browsers`, `supportingBrowsers`
- `supportingNode` - список поддерживаемых версий nodejs в формате [browserslist](https://github.com/browserslist/browserslist).
- `Dockerfile` - :warning: устарел, см. врезку ниже. Докерфайл, который будет использоваться для сборки контейнера.
  Базовый шаблон [тут](../../arui-scripts-artifacts/src/docker/templates/dockerfile.template.ts).
  [`Dockerfile` в корне проекта](#docker) имеет приоритет над overrides.
- `DockerfileCompiled` - :warning: устарел. Докерфайл, который будет использоваться для сборки контейнера при использовании команды `arui-scripts docker-build:compiled`
- `nginx` - :warning: устарел. Шаблон конфигурации для nginx внутри контейнера.
  Базовый шаблон [тут](../../arui-scripts-artifacts/src/nginx/templates/nginx.conf.template.ts).
  [Файл `nginx.conf`](nginx.md) в корне имеет приоритет над оверрайдами.
- `nginxConf` - :warning: устарел. Шаблон базовой конфигурации для nginx внутри  контейнера
  Базовый шаблон аналогичный тому, который добавлется в базовый образ [тут](../../arui-scripts-artifacts/src/nginx/templates/base-nginx.conf.template.ts).
  [Файл `base-nginx.conf`](base-nginx.md) в корне имеет приоритет над оверрайдами.
- `start.sh` - :warning: устарел. Шаблон entrypoint докер контейнера. Базовый шаблон [тут](../../arui-scripts-artifacts/src/start-script/start.template.ts).
- `serverExternalsExemptions` - список модулей, которые не будут добавлены в список внешних зависимостей сервера. [Подробнее](caveats.md#node-externals).
- `html` - шаблон для htmlWebpackPlugin, будет использоваться только в режиме [`clientOnly`](./settings.md#clientonly).
- `swc-client` - конфигурация `swc` для клиентского кода. Ключи: `swc`, `swcClient`.
- `swc-server` - конфигурация `swc` для серверного кода. Ключи: `swc`, `swcServer`.
- `swc-jest` - конфигурация `swc` для тестов. Ключи: `swc`, `swcJest`.

Для некоторых конфигураций определены несколько ключей, они будут применяться в том порядке, в котором они приведены в этом файле.

> ⚠️ Оверрайды файлов артефакта поставки (`Dockerfile`, `DockerfileCompiled`, `nginx`, `nginxConf`,
> `start.sh`) объявлены устаревшими и будут удалены в следующей мажорной версии arui-scripts.
> Переносите их в секцию `overrides` конфига `arui-scripts-artifacts.ts`
> ([таблица соответствия](../../arui-scripts-artifacts/docs/migration.md)).
> Команды сборки предупреждают о таких оверрайдах в консоли.

### Создание дополнительных конфигураций для rspack
На некоторых проектах может потребоваться создать дополнительные конфигурации для rspack. Например, для создания
service worker'а (или любых других кейсов). Для этого можно использовать функцию-хелпер `createSingleClientRspackConfig`:

```ts
import type { OverrideFile } from 'arui-scripts';

const overrides: OverrideFile = {
    rspackClient: (config, appConfig, { createSingleClientRspackConfig }) => {
        return [
            config,
            createSingleClientRspackConfig(
                './src/sw.js', // entrypoint, может быть массивом/объектом
                'sw', // наименование сборки, влияет на имена чанков
            ),
        ];
    }
};

export default overrides;
```
Эта функция вернет независимую конфигурацию для rspack, которую можно использовать в качестве оверрайда. Вы так же можете ее модифицировать,
не боясь что это повлияет на другие конфигурации.

Созданная таким образом конфигурация будет шарить с оригинальной конфигурацией только плагин для формирования assets-manifest'а.

### Переопределение плагинов или загрузчиков для конфигураций rspack
Иногда может понадобиться возможность поменять конфигурацию конкретного загрузчика или плагина, для этого в `rspackClient`, `rspackClientDev`, `rspackServer` и `rspackServerDev` третьим параметром можно получить хелпер-функции `findLoader` и `findPlugin`:
```ts
import type { OverrideFile } from 'arui-scripts';

const overrides: OverrideFile = {
    rspackClient: (config, appConfig, { findLoader, findPlugin }) => {
      // ...
    }
};

export default overrides;
```
- `findLoader` - помогает найти загрузчик для переопределения. Функция возвращает ссылку, поэтому вы можете спокойно мутировать этот результат и обходиться без создания нового объекта через spread-оператор. В качестве аргументов принимает `config` и `testRule`, по которому будет искаться загрузчик. Пример:
```ts
import type { OverrideFile } from 'arui-scripts';

const overrides: OverrideFile = {
    rspackClient: (config, appConfig, { findLoader }) => {
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
- `findPlugin` - помогает найти плагин для переопределения. Функция так же возвращает ссылку. В качестве аргументов принимает `config` и название плагина. Все типизировано, поэтому название можете достать из автокомплита. для `rspackClient` и `rspackClientDev` из автокомплита будут приходить клиентские плагины, а для `rspackServer` и `rspackServerDev` серверные. Примеры:
```ts
import type { OverrideFile } from 'arui-scripts';

const overrides: OverrideFile = {
    rspackClient: (config, appConfig, { findPlugin }) => {
      const [MiniCssExtractPlugin] = findPlugin(config, 'MiniCssExtractPlugin')

      // возвращаемые плагины так же типизированы
      MiniCssExtractPlugin.options.ignoreOrder = false

      return config
    },
    rspackServerDev: (config, appConfig, { findPlugin }) => {
      const [BannerPlugin] = findPlugin(config, 'BannerPlugin');

      BannerPlugin.options.banner = 'unexpected error';

      return config
    }
};

export default overrides
```
