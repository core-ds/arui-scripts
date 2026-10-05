# CLI arui-scripts

`arui-scripts` предоставляет CLI для сборки, запуска и тестирования react-приложений.
После установки пакета команды доступны через `arui-scripts <команда>`

Для генерации нового проекта используйте отдельный пакет
[`create-arui-scripts-app`](../../create-arui-scripts-app/README.md):

```bash
npx create-arui-scripts-app my-app
```

## Глобальные флаги

-   `arui-scripts --help` — список всех команд с описаниями.
-   `arui-scripts --version` (`-v`) - версия пакета.
-   `arui-scripts <команда> --help` - справка по конкретной команде.

## Команды

Полный список и описание — в [docs/commands.md](commands.md):
`start`, `start:prod`, `build`, `docker-build`, `docker-build:compiled`, `test`, `test:vitest`,
`archive-build`, `bundle-analyze`, `ensure-yarn`, `changelog`.

## Диагностика сборки

В `start` и `start:prod` ошибки клиентского и серверного watch-компиляторов группируются по категориям. Причина ошибки и фрагмент исходника сохраняются; для распознанных ошибок выводятся подсказки. `build` показывает первую ошибку с подробностями и подсказками, без группировки. Подробнее: [вывод ошибок](error-grouping.md).

Настройки `stats` для группированного watch-вывода и ограничения описаны в [диагностике сборки](error-grouping.md#настройка-watch-вывода).
