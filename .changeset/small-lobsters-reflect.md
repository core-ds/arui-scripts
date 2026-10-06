---
'arui-scripts': minor
---

Добавлена команда `bundle-diff` для сравнения размеров клиентских бандлов двух production сборок.
Она создает отчеты Rsdoctor в HTML и JSON, а также markdown комментарий для pull request с таблицей изменений и ссылками на отчеты.

Данные production сборки сохраняются при запуске `arui-scripts build` с переменной `ARUI_SCRIPTS_RSDOCTOR_OUTPUT`, результат сборки при этом не меняется.

Примеры использования и настройка CI описаны в [документации](docs/commands.md#bundle-diff).
