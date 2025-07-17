---
'@alfalab/scripts-modules': minor
---

Изменена логика добавления стилей для Safari, теперь вместо встраивания через тэг `link` будет происходить встраивание через `inline` стили тэгом `style`.
Чтобы отключить это поведение можно передать `disableInlineStyleSafari: true` в `createModuleLoader`
