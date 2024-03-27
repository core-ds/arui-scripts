alpine-node-nginx
===

В этом пакете хранится базовый образ, используемый для проектов на arui-scripts.

Образ поставляется в двух вариантах: с облегченной конфигурацией nginx (slim версия) и с полным набором модулей.

В образ включен nodejs и nginx с простейшей базовой конфигурацией.

Сборка и публикация образа осуществляется с помощью github-actions при каждом пуше в мастер.
Собираются сразу несколько версий контейнера, с разными версиями nodejs внутри.

**Важно**: `latest` более не обновляется! Указывайте конкретную версию образа в настройках проекта.

Список доступных версий образа:
- 16.20.2, 16.20.2-slim
- 18.20.0, 18.20.0-slim
- 20.11.1, 20.11.1-slim

Наиболее актуальный список тегов можно найти на [dockerhub](https://hub.docker.com/r/alfabankui/arui-scripts/tags).


### Отличия slim версии от полной
В slim версии отсутствуют многочисленные модули nginx, которые обычно не нужны в проектах. Например:

- `ssl_module`, модуль для работы с https
- `image_filter_module`, модуль для обработки изображений
- `addition_module`, `sub_module` - модули для пост-обработки ответа

Полный список различий можно узнать сравнив [Dockerfile-slim](Dockerfile-slim) и [Dockerfile](Dockerfile).

Отказ от этих модулей позволяет так же убрать из образа лишние зависимости (openssl, libxslt, geoip), что уменьшает его размер и избавляет от
необходимости обновлять эти зависимости из-за уязвимостей.

### Локальная сборка контейнера
Если вы хотите собрать локально, выполните

```sh
docker build --build-arg NODE_VERSION=18.19.0 --build-arg ALPINE_VERSION=3.19 -t alfabankui/arui-scripts:test .
```
Или для slim версии:
```sh
docker build --build-arg NODE_VERSION=18.19.0 --build-arg ALPINE_VERSION=3.19 -t alfabankui/arui-scripts:test -f Dockerfile-slim .
```

### Локальная сборка на arm-процессорах
Если у вас ноутбук на M1 - по умолчанию docker build будет собирать контейнер именно под arm архитектуру, и запустить
его на наших серверах будет невозможно. Поэтому собирать нужно немного иначе:

```sh
docker buildx build --platform linux/amd64 --build-arg NODE_VERSION=18.19.0 --build-arg ALPINE_VERSION=3.19 -t alfabankui/arui-scripts:test -f Dockerfile-slim --load .
```
