alpine-node-nginx
===

В этом пакете хранится базовый образ, используемый для проектов на arui-scripts.
В образ включен nodejs и nginx с простейшей базовой конфигурацией.

Сборка и публикация образа осуществляется с помощью github-actions при создании нового тега.
Каждый образ будет протегирован как `latest`, `${НАЗВАНИЕ_ТЕГА}` и значения из файла `version`.
Файл `version` так же будет использоваться для определения базовой версии nodejs.

### Локальная сборка контейнера
Если вы хотите собрать локально, выполните

```sh
docker build --build-arg NODE_VERSION=14.17.6 --build-arg ALPINE_VERSION=3.14 -t alfabankui/arui-scripts:14.17.6 .
```

### Локальная сборка на arm-процессорах
Если у вас ноутбук на M1 - по умолчанию docker build будет собирать контейнер именно под arm архитектуру, и запустить
его на наших серверах будет невозможно. Поэтому собирать нужно немного иначе:

```sh
docker buildx build --platform linux/amd64 --build-arg NODE_VERSION=14.17.6 --build-arg ALPINE_VERSION=3.14 -t alfabankui/arui-scripts:14.17.6 .
```
