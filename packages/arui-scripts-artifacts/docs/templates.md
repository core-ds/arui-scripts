Кастомизация файлов артефакта
===

В артефакт кладутся четыре сгенерированных файла:

| Ключ шаблона        | Файл                            | Что это                                        |
| ------------------- | ------------------------------- | ---------------------------------------------- |
| `dockerfile`        | `Dockerfile`                    | «сырой» образ: сборка на хосте                  |
| `dockerfileCompiled`| `Dockerfile`                    | compiled-образ: сборка внутри образа            |
| `nginxConf`         | `nginx.conf`                    | server-блок nginx                               |
| `baseNginxConf`     | `base-nginx.conf`               | базовый http-блок (`/etc/nginx/nginx.conf`)     |
| `startScript`       | `start.sh`                      | entrypoint артефакта                            |

⚠️ В `arui-scripts` имена `nginx` и `nginxConf` исторически перепутаны: `nginx` — это server-блок, а
`nginxConf` — базовый конфиг. Здесь они названы по смыслу, поэтому **`nginxConf` в двух пакетах
означает разные файлы**. Переносить оверрайды по [таблице миграции](migration.md), а не по
совпадению имен.

Каждый файл настраивается на четырех уровнях, по возрастанию приоритета:

1. **[Опции](settings.md)** — секции `docker`, `nginx` и верхнеуровневые `clientOnly`, `buildPath`,
   `serverOutput`, `publicPath` и остальные.
2. **`templates`** — полная замена рендерера: `(config) => string`.
3. **`overrides`** — точечная функция поверх сгенерированного: `(generated, config) => string`.
4. **[Локальные файлы](#локальные-файлы)** — `Dockerfile`, `start.sh`, `nginx.conf`,
   `base-nginx.conf` в корне проекта.

Начинать стоит с опций: почти все, что обычно правят руками, уже вынесено в настройки.

## templates

Полная замена генерации файла. Функция получает донасыщенный конфиг и возвращает содержимое файла:

```ts
import { defineConfig } from '@alfalab/arui-scripts-artifacts';

export default defineConfig({
    templates: {
        nginxConf: (config) => `
client_max_body_size 20m;

server {
    listen ${config.nginx.port};
    location = /health { return 200 ''; }
    location / { proxy_pass http://127.0.0.1:${config.serverPort}; }
}`,
    },
});
```

Рендереры по умолчанию (`renderDockerfile`, `renderDockerfileCompiled`, `renderNginxConf`,
`renderBaseNginxConf`, `renderStartScript`) экспортируются наружу — их можно вызывать и оборачивать
из своих шаблонов:

```ts
import { defineConfig, renderNginxConf } from '@alfalab/arui-scripts-artifacts';

export default defineConfig({
    templates: {
        nginxConf: (config) => `${renderNginxConf(config)}\n# наши правила\n`,
    },
});
```

## overrides

Точечная правка сгенерированного содержимого — когда менять файл целиком незачем:

```ts
import { defineConfig } from '@alfalab/arui-scripts-artifacts';

export default defineConfig({
    overrides: {
        dockerfile: (generated) => `${generated}\nLABEL team="web"`,
        nginxConf: (generated, config) =>
            config.clientOnly ? generated : `${generated}\n# proxy tuning\n`,
    },
});
```

Оверрайд применяется после `templates`, поэтому видит результат своего рендерера, а не дефолтного.
Базовый http-блок при выключенном `nginx.baseConf` не рендерится вовсе — оверрайд `baseNginxConf`
в этом случае не вызывается.

Секции `templates` и `overrides` сливаются по ключам, так что команда может переопределить один
шаблон, оставив остальные от верхнего уровня, — см. [Команды](commands.md#как-складываются-настройки).

## Локальные файлы

Файл в корне проекта побеждает и шаблон, и оверрайд: содержимое берется как есть.
CLI находит `Dockerfile`, `start.sh`, `nginx.conf` и `base-nginx.conf` сам, пути можно задать явно
через [`localFiles`](settings.md#localfiles).

Примеры того, что переопределяете, лежат прямо в пакете:
[dockerfile.template.ts](../src/docker/templates/dockerfile.template.ts),
[dockerfile-compiled.template.ts](../src/docker/templates/dockerfile-compiled.template.ts),
[nginx.conf.template.ts](../src/nginx/templates/nginx.conf.template.ts),
[base-nginx.conf.template.ts](../src/nginx/templates/base-nginx.conf.template.ts),
[start.template.ts](../src/start-script/start.template.ts).

Для `docker-build:compiled` подмена `Dockerfile` и `start.sh` запрещена: образ ставит зависимости и
собирает приложение сам, и чужой Dockerfile это ломает. Запрет снимается флагами
`localFiles.allowDockerfile` и `localFiles.allowStartScript`.

## Env-переменные в nginx.conf

Конфигурация nginx прогоняется при старте контейнера через
[envsubst](https://www.gnu.org/software/gettext/manual/html_node/envsubst-Invocation.html), поэтому
часть настроек можно не зашивать в образ, а передавать переменными окружения:

```nginx
server {
    listen 8080;
    server_name ${SERVICE_NAME};
}
```

```bash
docker run my-awesome-app --env SERVICE_NAME=my-app
```

**Важно.** Чтобы специальные переменные nginx (`$proxy_add_x_forwarded_for` и подобные) не
превратились в пустые строки, перед запуском `envsubst` они заменяются на `~~proxy_add_x_forwarded_for~~`,
а после — возвращаются в исходный вид. Так что envsubst подставляет **только** переменные,
записанные как `${MY_VAR}`.

Если используете свой базовый образ — убедитесь, что в нем есть `envsubst`. Для alpine он входит в
пакет [`gettext`](https://pkgs.alpinelinux.org/contents?branch=edge&name=gettext&arch=x86&repo=main).
