import { ModuleFederationContainer } from '../types';
// webpack любит двойные подчеркивания для внутренних функций
/* eslint-disable no-underscore-dangle */

/**
 * Метод для получения контента уже загруженного модуля
 * @param containerId
 * @param moduleId
 */
export async function getModule<ModuleType>(containerId: string, moduleId: string) {
    if (typeof __webpack_init_sharing__ === 'undefined') {
        if (typeof __vite_federation_wrapper__ === 'undefined') {
            throw new Error('Не удалось инициализировать module federation. __webpack_init_sharing__ или __vite_federation_wrapper__ не найдены');
        }

        // загрузка происходит через vite, поэтому мы используем врапер из arui-scripts для инизиализации remote
        return __vite_federation_wrapper__.getRemote(containerId, moduleId);
    }
    // module federation работает таким образом:
    // 1. Инициализация shared скоупа. Фактически загружает в него все известные приложению на данный момент модули (и из себя, и из других remote, если есть)
    // 2. вебпак пишет нужный "контейнер" в window. Под контейнером понимается совокупность модулей от какого то приложения
    // 3. мы инициализируем контейнер. Он может записать шареные модули в общий скоуп
    // 4. мы получаем из контейнера тот модуль, который нас интересовал. Собственно в нашем случае в контейнере будет только один модуль
    // 5. "запускаем" модуль. Он вернет нам то, что заэкспорчено из файла, который предоставляет module federation
    await __webpack_init_sharing__('default');
    const container = (window as unknown as Record<string, ModuleFederationContainer>)[containerId];

    if (!container || !container.init) {
        throw new Error(
            `Cannot load external remote: ${containerId}, unable to locate module federation init function`,
        );
    }

    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get<ModuleType>(moduleId);

    if (!factory) {
        throw new Error(
            `Cannot load external remote: ${moduleId}, unable to locate module inside a container`,
        );
    }

    return factory();
}

/**
 * Метод для получения контента уже загруженного compat модуля
 */
export function getCompatModule<ModuleType>(moduleId: string) {
    const module = (window as unknown as Record<string, ModuleType>)[moduleId];

    if (!module) {
        throw new Error(
            `Cannot load compat module: ${moduleId}, unable to locate module in window`,
        );
    }

    return module;
}
