---
'arui-scripts': major
---

- Теперь как основной сборочный инструмент используется rspack.

Для большинства проектов миграция должна пройти максимально незаметно, rspack сохраняет обратную совместимость с webpack
в большинстве случаев. Подробнее о несовместимых изменениях можно почитать в документации [rspack](https://rspack.dev/guide/migration/webpack).
Наибольший прирост в производительности можно получить при использовании `swc` как [codeLoader](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/settings.md#codeLoader).

- Изменен дефолт для настройки `codeLoader`. Теперь по умолчанию используется `swc`. Для возврата к предыдущему поведению используйте `babel`.
- Изменен дефолт для настройки `jestCodeTransformer`. Теперь по умолчанию используется `swc`.
- Удалена опция `jestUseTsJest`. Используйте настройку `jestCodeTransformer` со значением `tsc` как замену.
- Удалена опция `useTscLoader`. Используйте настройку `codeLoader` со значением `tsc` как замену.
- Изменен формат настройки [`proxy`](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/settings.md#proxy) - теперь она
принимает массив объектов, а не объект. arui-scripts попробует преобразовать конфигурацию старого формата в новый, но рекомендуется обновить конфигурацию самостоятельно.
- Удалена опция `webpack4Compatibility`.
- Если вы использовали `babel-plugin-istanbul` для сбора code coverage - с настройками по умолчанию это больше не будет работать из-за замены babel на swc.
Рекомендуется использовать настройку [collectCoverage](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/settings.md#collectcoverage).
- Команда [bundle-analyze](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/commands.md#bundle-analyze) теперь так же запускает [rsdoctor](https://rsdoctor.dev/).
- Изменен дефолт для `devSourceMaps`, теперь по умолчанию используется `inline-cheap-source-map`.

При активном использовании оверрайдов скорее всего вы столкнетесь с различиями в конфигурациях. Информацию о том, как
мигрировать с webpack на rspack, и о различиях в их конфигурациях можно найти в [документации rspack](https://rspack.dev/guide/migration/webpack).
