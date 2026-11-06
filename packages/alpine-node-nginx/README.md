alpine-node-nginx
===

В этом пакете хранится базовый образ, используемый для проектов на arui-scripts.

Образ поставляется в двух вариантах: с облегченной конфигурацией nginx (slim версия) и с полным набором модулей.

В образ включен nodejs и nginx с простейшей базовой конфигурацией.

Сборка и публикация образа осуществляется с помощью github-actions при каждом пуше в мастер.
Собираются сразу несколько версий контейнера, с разными версиями nodejs внутри.

**Важно**: `latest` более не обновляется! Указывайте конкретную версию образа в настройках проекта.

### Список доступных версий образа:

- 22.23.4, 22.23.4-slim
- 24.22.2, 24.22.2-slim
- 26.13.0, 26.13.0-slim
- nginx-1.27.1-slim

Наиболее актуальный список тегов можно найти на [dockerhub](https://hub.docker.com/r/alfabankui/arui-scripts/tags).

### Автоматическое обновление Node.js

Workflow [Update Node.js versions](../../.github/workflows/update-node-versions.yml) ежедневно
в 08:23 по Москве проверяет релизы Node.js. Если есть обновления и готовые Docker-образы,
создает или обновляет один PR с версиями образов и связанными файлами.

Обновляются только стабильные minor- и patch-версии уже используемых веток Node.js.
Версия Alpine сохраняется, новые major-ветки добавляются вручную.

Для ручного запуска откройте workflow в GitHub Actions. Опция `dry-run` позволяет проверить
обновления без создания PR. Для создания PR нужен секрет `GH_TOKEN` с правами записи
contents, pull requests и workflows.

### Отличия slim версии от полной
В slim версии отсутствуют многочисленные модули nginx, которые обычно не нужны в проектах. Например:

- `ssl_module`, модуль для работы с https
- `image_filter_module`, модуль для обработки изображений
- `addition_module`, `sub_module` - модули для пост-обработки ответа

Полный список различий можно узнать сравнив [Dockerfile-slim](Dockerfile-slim) и [Dockerfile](Dockerfile).

Отказ от этих модулей позволяет так же убрать из образа лишние зависимости (openssl, libxslt, geoip), что уменьшает его размер и избавляет от
необходимости обновлять эти зависимости из-за уязвимостей.

### Образ без nodejs

`Dockerfile-nginx-slim` - аналогичный образу `Dockerfile-slim`, но без nodejs.

### Локальная сборка контейнера
Если вы хотите собрать локально, выполните

```sh
docker build --build-arg NODE_VERSION=24.22.2 --build-arg ALPINE_VERSION=3.23 -t alfabankui/arui-scripts:test .
```
Или для slim версии:
```sh
docker build --build-arg NODE_VERSION=24.22.2 --build-arg ALPINE_VERSION=3.23 -t alfabankui/arui-scripts:test -f Dockerfile-slim .
```

### Локальная сборка на arm-процессорах
Если у вас ноутбук на M1 - по умолчанию docker build будет собирать контейнер именно под arm архитектуру, и запустить
его на наших серверах будет невозможно. Поэтому собирать нужно немного иначе:

```sh
docker buildx build --platform linux/amd64 --build-arg NODE_VERSION=24.22.2 --build-arg ALPINE_VERSION=3.23 -t alfabankui/arui-scripts:test -f Dockerfile-slim --load .
```
