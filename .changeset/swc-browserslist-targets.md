---
'arui-scripts': minor
---

`codeLoader: 'swc'`: код приложения и node_modules компилируются под список поддерживаемых браузеров (`supporting-browsers` или browserslist-конфиг проекта), а не в ES5. Список резолвится JS-версией browserslist и передаётся в `env.targets` обоих swc-лоадеров, серверная сборка компилируется под текущую версию node. Из дефолтного списка браузеров убран `Android >= 6`: browserslist-rs внутри SWC превращал его в android 37 и включал все ES5-трансформации. Включён `jsc.externalHelpers`, хелперы импортируются из `@swc/helpers` вместо дублирования в каждом модуле. Для node_modules и commonjs-файлов включено автоопределение типа модуля (`isModule: 'unknown'`), иначе swc вставлял бы в них `import` и ломал `module.exports`. Тесты компилируются под текущую версию node, а не под список браузеров.
