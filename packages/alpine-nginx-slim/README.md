# nginx с дополнительными модулями для проектов совместимых с arui-scripts

Dockerfile основан на официальном образе nginx alpine-slim (https://github.com/nginxinc/docker-nginx/tree/master/modules)
с простейшей базовой конфигурацией.

#### Дополнительные модули nginx
- brotli

## Сборка и деплой

```sh
cd alpine-nginx-slim
docker build --build-arg ALPINE_VERSION=3.19 -t alfabankui/arui-scripts:test .
```

### Как собрать и задеплоить в артифактори в infra.binary.alfabank.ru
Если у вас ноутбук на M-серии - по умолчанию docker build будет собирать контейнер именно под arm архитектуру, и запустить
его на наших серверах будет невозможно. Поэтому собирать нужно немного иначе:

```sh
cd alpine-nginx-slim
docker buildx create --use
docker buildx build --platform linux/amd64 --build-arg ALPINE_VERSION=3.19 -t alfabankui/arui-scripts:test --load .
```


