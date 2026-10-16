---
'@alfalab/arui-scripts-vitest': major
'arui-scripts': minor
---

Конфигурация Vitest вынесена в отдельный пакет `@alfalab/arui-scripts-vitest`.

Пакет содержит тот же конфиг, что раньше отдавал `arui-scripts/vitest`, и не зависит от `arui-scripts`.
Для перехода установите его вместе с `vitest`, `vite` и `jsdom`, импортируйте конфиг в `vitest.config.ts`
из `@alfalab/arui-scripts-vitest` и запускайте тесты через `vitest run`.

Конфиг из нового пакета корректно импортируется и из ESM-конфигов (`vitest.config.mjs`, `vitest.config.mts`
или любой конфиг в проекте с `"type": "module"`). Импорт `arui-scripts/vitest` в таких конфигах возвращал
`{ default }`, и vitest молча использовал свои настройки по умолчанию; поведение старого импорта не
меняется, но после перехода на пакет настройки arui-scripts в таких проектах начнут применяться —
прогоните тесты. В обычном `vitest.config.ts` без `"type": "module"` старый импорт работал, и для него
ничего не меняется.

`arui-scripts` пока зависит от нового пакета, поэтому команда `arui-scripts test:vitest` и импорт
`arui-scripts/vitest` продолжают работать без изменений, но выводят предупреждение об устаревании.
В следующей мажорной версии `arui-scripts` они будут удалены, а `vitest`, `vite` и `vite-tsconfig-paths`
перестанут устанавливаться вместе с `arui-scripts`.

Попутно `arui-scripts test:vitest` завершается с ошибкой, если процесс vitest убит сигналом (например, из-за нехватки памяти). Раньше команда возвращала код 0, и CI считал такой прогон успешным.
