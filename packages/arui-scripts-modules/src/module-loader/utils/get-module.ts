import { ModuleFederationContainer } from '../types';

/**
 * Метод для получения контента уже загруженного mf-модуля
 * @param containerId
 * @param moduleId
 */
export async function getMfModule<ModuleType>(containerId: string, moduleId: string) {
    // mf работает таким образом:
    // 1. Инициализация shared скоупа. Фактически загружает в него все известные приложению на данный момент модули (и из себя, и из других remote, если есть)
    // 2. вебпак пишет нужный "контейнер" в window. Под контейнером понимается совокупность модулей от какого то приложения
    // 3. мы инициализируем контейнер. Он может записать шареные модули в общий скоуп
    // 4. мы получаем из контейнера тот модуль, который нас интересовал. Собственно в нашем случае в контейнере будет только один модуль
    // 5. "запускаем" модуль. Он вернет нам то, что заэкспорчено из файла, который предоставляет mf
    await __webpack_init_sharing__('default');
    const container = (window as unknown as Record<string, ModuleFederationContainer>)[containerId];

    if (!container || !container.init) {
        throw new Error(`Cannot load external remote: ${containerId}, unable to locate mf init function`);
    }

    // webpack любит двойные подчеркивания для внутренних функций
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get<ModuleType>(moduleId);

    if (!factory) {
        throw new Error(`Cannot load external remote: ${moduleId}, unable to locate module inside a container`);
    }

    return factory();
}

/**
 * Метод для получения контента уже загруженного embedded модуля
 */
export function getEmbeddedModule<ModuleType>(moduleId: string) {
    const module = (window as unknown as Record<string, ModuleType>)[moduleId];

    if (!module) {
        throw new Error(`Cannot load embedded module: ${moduleId}, unable to locate module in window`);
    }

    return module;
}
