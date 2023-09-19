import { AppConfigs } from '../app-configs/types';

// require.resolve вынесен как параметр функции для того, чтоб это можно было протестировать.
// на данный момент jest не дает возможности мокать require.resolve https://github.com/facebook/jest/issues/9543
export function getPolyfills(config: AppConfigs, requireResolve = require.resolve) {
    const polyfills: string[] = [];

    if (config.clientPolyfillsEntry && Array.isArray(config.clientPolyfillsEntry)) {
        polyfills.push(...config.clientPolyfillsEntry);
    } else if (config.clientPolyfillsEntry) {
        polyfills.push(config.clientPolyfillsEntry);
    } else {
        // Для сохранения обратной совместимости нам надо добавлять полифилы из физера только тогда, когда пользователь
        // не задал свои кастомные полифилы.
        try {
            const aruiPolyfills = requireResolve('arui-feather/polyfills');

            polyfills.push(aruiPolyfills);
        } catch (error) {
            // just ignore it
        }
    }

    return polyfills;
}
