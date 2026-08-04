import { type DevtoolsStageTrace } from '../../devtools/types';
import { type ModuleFederationContainer } from '../types';

const noopTrace: DevtoolsStageTrace = {
    start: () => undefined,
    end: () => undefined,
};

/**
 * Метод для получения контента уже загруженного модуля
 * @param containerId
 * @param moduleId
 * @param [shareScope='default']
 * @param [trace] необязательный репортёр подстадий для devtools
 */
export async function getModule<ModuleType>(
    containerId: string,
    moduleId: string,
    shareScope = 'default',
    trace: DevtoolsStageTrace = noopTrace,
) {
    // module federation работает таким образом:
    // 1. Инициализация shared скоупа. Фактически загружает в него все известные приложению на данный момент модули (и из себя, и из других remote, если есть)
    // 2. вебпак пишет нужный "контейнер" в window. Под контейнером понимается совокупность модулей от какого то приложения
    // 3. мы инициализируем контейнер. Он может записать шареные модули в общий скоуп
    // 4. мы получаем из контейнера тот модуль, который нас интересовал. Собственно в нашем случае в контейнере будет только один модуль
    // 5. "запускаем" модуль. Он вернет нам то, что заэкспорчено из файла, который предоставляет module federation
    trace.start('init-sharing');
    await __webpack_init_sharing__(shareScope);
    trace.end('init-sharing');

    const container = (window as unknown as Record<string, ModuleFederationContainer>)[containerId];

    trace.start('container-init');

    if (!container?.init) {
        throw new Error(
            `Cannot load external remote: ${containerId}, unable to locate module federation init function`,
        );
    }

    // webpack любит двойные подчеркивания для внутренних функций
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await container.init(__webpack_share_scopes__[shareScope]);
    trace.end('container-init');

    trace.start('container-get');
    const factory = await container.get<ModuleType>(moduleId);

    if (!factory) {
        throw new Error(
            `Cannot load external remote: ${moduleId}, unable to locate module inside a container`,
        );
    }
    trace.end('container-get');

    trace.start('factory');

    const module = factory();

    trace.end('factory');

    return module;
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
