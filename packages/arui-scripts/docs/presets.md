Пресеты
===

В случае, если вы хотите использовать определенный набор конфигураций и оверрайдов сразу в нескольких проектах - вам может
помочь механизм пресетов. Он позволяет выносить конфигурацию и оверрайды в отдельный пакет.
Для того чтобы использовать персеты на проекте вы должны указать в настройках проекта имя пакета с пресетами:

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
С помощью этого файла можно задать любые ключи [конфигурации](settings.md).
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
С помощью этого файла можно задать базовые оверрайды проекта, аналогично [заданию оверрайдов на проекте](overrides.md).
```js
module.exports = {
    babelClient(config) {
        config.plugins.push('my-awesome-babel-plugin');
        return config;
    }
};
```

На проекте оверрайды из пресетов будут выполняться в первую очередь, после них будут выполняться оверрайды из проекта.
