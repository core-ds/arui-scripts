---
'@alfalab/scripts-artifacts': minor
'arui-scripts': patch
---

Сборка артефактов поставки вынесена в отдельный пакет `@alfalab/scripts-artifacts`.

Пакет устроен как набор чистых функций и настраивается одним файлом `arui-scripts-artifacts.ts` в
корне проекта (путь можно задать через `--c`/`--config`). Конфиг может быть на TypeScript, ESM или
CommonJS и описывает всё: базовый образ, параметры nginx, кастомные шаблоны и свои команды сборки —
так что кастомные сборочные скрипты в проектах больше не нужны.

Поддерживаются оба типа артефактов: docker-образ (`docker-build`, `docker-build:compiled`) и
tar-архив (`archive-build`). Хост-пайплайн (очистка `buildPath` → сборка приложения → удаление
dev-зависимостей) у них общий.

`arui-scripts` теперь использует этот пакет вместо собственной копии шаблонов и утилит. Поведение
команд и все ключи оверрайдов (`Dockerfile`, `DockerfileCompiled`, `nginx`, `nginxConf`, `start.sh`)
сохранены без изменений — отрендеренные Dockerfile, nginx-конфиги и start.sh совпадают побайтово.

Попутно починен `archive-build`: он падал с `TypeError: Cannot read properties of undefined
(reading 'c')`, потому что в `tar@7` нет default-экспорта, а код использовал `import tar from 'tar'`.

Единственное отличие в поведении: `archive-build` теперь подхватывает локальный `start.sh` из корня
проекта так же, как уже подхватывал `nginx.conf` (раньше игнорировал). Отключается опцией
`allowLocalStartScript: false`.
