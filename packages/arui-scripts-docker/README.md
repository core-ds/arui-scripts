@alfalab/scripts-docker
===

Максимально кастомизируемые скрипты и шаблоны для сборки docker-образов приложений, основанных на
`arui-scripts`. Логика, которая раньше жила внутри команд `arui-scripts docker-build` и была намертво
завязана на глобальный конфиг, вынесена в отдельный пакет: все шаблоны и утилиты работают с обычным
объектом опций, поэтому образ можно собрать из любого места — CLI, программно или из другого пакета
(например, `newclick-builder`).

## Установка

```bash
yarn add @alfalab/scripts-docker
```

## CLI

```bash
# «сырой» образ (приложение собирается на хосте, результат кладется в образ)
arui-scripts-docker docker-build

# compiled-образ (зависимости и сборка выполняются внутри образа)
arui-scripts-docker docker-build:compiled

# переопределение имени/версии/registry
arui-scripts-docker docker-build name=my-app version=1.2.3 registry=registry.example.com
```

CLI автоматически:

- берет `name`/`version` из `package.json`;
- подхватывает локальные `Dockerfile`, `start.sh`, `nginx.conf`, `base-nginx.conf` из корня проекта;
- загружает пользовательский конфиг `arui-scripts-docker.config.js`, если он есть.

### Пользовательский конфиг

```js
// arui-scripts-docker.config.js
module.exports = {
    baseDockerImage: 'alfabankui/arui-scripts:24.10.0-slim',
    clientOnly: true,
    nginx: { workerProcesses: 4 },
    // точечно донасыщаем сгенерированный Dockerfile
    overrides: {
        dockerfile: (generated) => `${generated}\nLABEL team="web"`,
    },
};
```

Конфиг может экспортировать объект или функцию (в т.ч. асинхронную), возвращающую опции.

## Программное API

### `buildDockerImage`

Высокоуровневая сборка: донасыщает конфиг, рендерит шаблоны, готовит временную директорию, запускает
`docker build`, чистит за собой и (опционально) пушит образ.

```ts
import { buildDockerImage } from '@alfalab/scripts-docker';

await buildDockerImage({
    variant: 'compiled', // 'runtime' | 'compiled'
    name: 'my-app',
    version: '1.0.0',
    dockerRegistry: 'registry.example.com',
    baseDockerImage: 'alfabankui/arui-scripts:24.10.0-slim',
    clientOnly: false,
    nginx: { workerProcesses: 4 },
    extraBuildArgs: { COMMIT_SHA: process.env.COMMIT_SHA },
    // хук перед docker build — например, собрать приложение
    beforeBuild: async () => {
        // await exec('npm run build');
    },
});
```

### Гранулярные утилиты

Если нужен полный контроль над процессом, используйте отдельные функции — именно так их использует
`newclick-builder`:

```ts
import {
    resolveDockerConfig,
    renderDockerTemplates,
    prepareFilesForDocker,
    getBuildParamsFromArgs,
    getDockerBuildCommand,
    exec,
} from '@alfalab/scripts-docker';

const config = resolveDockerConfig({
    baseDockerImage: 'my-registry/base:1.0.0',
    serverOutput: 'server/index.js',
    clientServerPort: 8080,
    serverPort: 3000,
    addNodeModulesToDockerIgnore: true,
});

const { imageFullName } = getBuildParamsFromArgs(config);
const templates = renderDockerTemplates({
    config,
    variant: 'compiled',
    // полная замена шаблона nginx-конфига
    templates: {
        nginxConf: (cfg) => myCustomNginxTemplate(cfg),
    },
});

await prepareFilesForDocker({ config, templates });
await exec(getDockerBuildCommand(config));
await exec(`docker push ${imageFullName}`);
```

## Кастомизация

Каждый файл, попадающий в образ, можно настроить на трех уровнях (по возрастанию приоритета):

1. **Опции** — `baseDockerImage`, `clientOnly`, `runFromNonRootUser`, `nginx`, `platform`,
   `extraBuildArgs`, `buildPath`, `serverOutput` и т.д. (см. `DockerBuildOptions`).
2. **`templates`** — полная замена рендерера конкретного шаблона (`dockerfile`, `dockerfileCompiled`,
   `nginxConf`, `baseNginxConf`, `startScript`).
3. **`overrides`** — точечная функция `(generated, config) => string` поверх сгенерированного шаблона.
4. **Локальные файлы** — `Dockerfile`, `start.sh`, `nginx.conf`, `base-nginx.conf` в корне проекта.

## Экспортируемые шаблоны

`renderDockerfile`, `renderDockerfileCompiled`, `renderNginxConf`, `renderBaseNginxConf`,
`renderStartScript` — чистые функции `(config) => string`, которые можно переиспользовать и оборачивать.
