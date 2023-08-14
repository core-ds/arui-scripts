Примеры входных точек для сервера и клиента
===

## Клиент
Для корректной работы hot-module-replacement на клиенте вам надо добавить примерно такой код:

_./src/index.tsx_
```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/app';

const targetElement = document.getElementById('react-app');

ReactDOM.render(
    <App />,
    targetElement
);

if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./components/app', () => {
        let NextAppAssignments = require('./components/app').App;

        ReactDOM.render(
            <NextAppAssignments />,
            targetElement
        );
    });
}
```

## Сервер

### Использование hot-module-replacement
По умолчанию серверная часть приложения будет просто перезапускаться после каждого изменения кода,
для использования hot module replacement на сервере можно использовать настройку [`useServerHMR`](settings.md#useserverhmr).

Ваша входная точка сервера должна выглядеть примерно так (на примере hapi):

_./src/server/index.ts_
```ts
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

_./src/server/server.ts_
```ts
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

### Формирование html для серверного рендеринга

Для того чтобы корректно формировать html вам нужно знать имена чанков, которые будут сгенерированы вебпаком.
Для этого рекомендуется использовать метод `readAssetsManifest` из `@alfalab/scripts-server`, который возвращает объект с именами чанков.

Документация по `readAssetsManifest` доступна [здесь](../../arui-scripts-server/README.md#readassetsmanifest).
