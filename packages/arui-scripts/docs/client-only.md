## Режим clientOnly
Если на вашем проекте не требуется иметь nodejs-сервер, то clientOnly режим работы - для вас.

Он полностью отключает сборку сервера, добавляет [HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/) для генерации
простой html, а так же значительно упрощает докер-контейнер, собираемый в качестве артефакта.

По-умолчанию html, создаваемый скриптами будет иметь div с id `react-app`, подключенные скрипты, а так же специальный тег `<script>` для работы с конфигурацией.
Вы можете модифицировать этот html используя [механизм оверрайдов](./overrides.md).

docker-контейнер, формируемый командой [arui-scripts docker-build](./commands.md#docker-build) будет содержать
только собранные файлы. node_modules, все что лежит в вашем `src` и других папках проекта будет игнорироваться.

### Работа с конфигурацией
Поскольку в client-only режиме нет никакого сервера - возникает вопрос как получать хоть какую то конфигурацию, которая
будет различаться для разных сред.

Для этого для client-only режима arui-scripts предоставляет механизм env-config.

**Помните - такая конфигурация будет доступна любому пользователю - она не должна содержать приватных данных и секретных ключей.**

Он позволяет вам создать json-шаблон, который будет наполняться данными из env-переменных.

В качестве шаблона используется файл `env-config.json` из root папки вашего проекта. Все вхождения `${NAME}` в нем
будут заменены на значения из env-переменных, а сам файл станет доступен по адресу `/env-config.json`.

Этот же шаблон будет встроен в `index.html` проекта на место, помеченное как `<%= envConfig %>`. В шаблоне для html
по-умолчанию он добавляется в тег `<script id="env-settings" type="application/json">`.
Таким образом вы можете получить те же настройки без дополнительных запросов: `JSON.parse(document.getElementById('env-settings').innerText)`.

В дев-режиме env переменные берутся из того окружения, в котором запущен dev-server.
Собранное приложение будет получать настройки только при запуске докер-контейнера - скрипт `start.sh` обработает все шаблоны таким же образом, как и dev-сервер.

**Пример:**

Содержимое `/env-config.json` вашего проекта:
```json
{
    "backendUrl": "${BACKEND_URL}",
    "staticData": "something very important",
    "unknownEnv": "${UNKNOWN_ENV}"
}
```

Пример запуска в dev-режиме:
```shell
BACKEND_URL=http://example.com yarn arui-scripts start
```

Пример запуска собранного docker-контейнера:
```shell
docker run --env BACKEND_URL=http://example.com -p 8080:8080 example:1.1.42 /src/start.sh
```

В обоих случаях по адресу http://localhost:8080/env-config.json будет такое содержимое:
```json
{
    "backendUrl": "http://example.com",
    "staticData": "something very important",
    "unknownEnv": ""
}
```

С дефолтным html-шаблоном index.html будет выглядеть так:
```html
<!doctype html>
<html lang="ru">
  <div id="react-app"></div>
  <script id="env-settings" type="application/json">
      {
          "backendUrl": "http://example.com",
          "staticData": "something very important",
          "unknownEnv": ""
      }
  </script>
  </body>
</html>
```
