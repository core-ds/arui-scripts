arui-scripts
===

[Пользовательская документация](./packages/arui-scripts/README.md)

## Разработка
Проект является монорепозиторием, в котором находятся следующие пакеты:

- [arui-scripts](./packages/arui-scripts/) - Код конфигураций сборщиков
- [alpine-node-nginx](./packages/alpine-node-nginx/) - Базовый образ docker контейнера, на котором будут основываться контейнеры проектов
- [@alfalab/scripts-server](./packages/arui-scripts-server) - Утилиты для использования на сервере
- [@alfalab/scripts-modules](./packages/arui-scripts-modules) - Библиотека для работы с модулями приложений
- [@alfalab/client-event-bus](./packages/client-event-bus/) - Библиотека для работы c Event Bus
- [example](./packages/example) - тестовый проект, на котором проводится проверка сборщиков
- [example-modules](./packages/example-modules) - тестовый проект с примерами реализации модулей
