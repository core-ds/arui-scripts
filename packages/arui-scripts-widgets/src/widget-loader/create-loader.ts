import { cleanModuleFunctions } from './utils/clean-module-functions';
import { ConsumersCounter } from './utils/consumers-counter';
import { removeAppResources, scriptsFetcher, stylesFetcher } from './utils/dom-utils';
import type {
    CreateLoaderParams,
    GetResourcesRequest,
    GetResourcesResponse,
    LoaderFunction,
    ModuleFederationContainer,
    ModuleMountFunction,
    ModuleUnmountFunction,
    WindowWithMountFunction,
    WindowWithUnmountFunction,
} from './types';
import { parseMfModuleId } from './parse-mf-module-id';

export function createLoader<
    ResourcesRequest extends GetResourcesRequest, ResourcesResponse extends GetResourcesResponse,
>(
    loaderParams: CreateLoaderParams<ResourcesRequest, ResourcesResponse>,
): LoaderFunction {
    return function applicationLoader(moduleFullId: string, targetNode?: HTMLElement) {
        const consumers = new ConsumersCounter(moduleFullId);
        const moduleId = parseMfModuleId(moduleFullId).moduleName;
        let currentModuleResources: ResourcesResponse | undefined;
        let currentMountFunction: ModuleMountFunction | undefined;
        let currentUnmountFunction: ModuleUnmountFunction | undefined;

        async function loadModule(): Promise<ReturnType<ModuleMountFunction>> {
            const requestParams = await loaderParams.getModuleRequestParams?.(moduleId);

            // Загружаем настройки модуля
            currentModuleResources = await loaderParams.fetchFunction({
                moduleId,
                hostAppId: loaderParams.hostAppId,
                params: requestParams,
            } as ResourcesRequest);

            if (typeof (window as any).webpackJsonp !== 'undefined' && process.env.NODE_ENV !== 'production') {
                console.warn('Если вы хотите использовать модули - вам надо обновиться до webpack 5/arui-scripts 12.' +
                    'в противном случае вы можете получить совершенно неожиданные ошибки');
            }

            await loaderParams.onBeforeResourcesMount?.(moduleId, currentModuleResources);

            const [runParams] = await Promise.all([
                loaderParams.getModuleRunParams?.(moduleId, currentModuleResources)
                    || currentModuleResources.moduleRunParams,
                // Подключаем на страницу ресурсы, которые нужны приложению
                consumers.isAbsent() ? scriptsFetcher(
                    moduleId,
                    currentModuleResources.scripts,
                    currentModuleResources.moduleRunParams.contextRoot,
                ) : Promise.resolve(),
                consumers.isAbsent() ? stylesFetcher(
                    moduleId,
                    currentModuleResources.styles,
                    currentModuleResources.moduleRunParams.contextRoot,
                ) : Promise.resolve(),
            ]);

            // увеличиваем счетчик потребителей только после добавления скриптов и стилей
            consumers.increase();

            loaderParams.onBeforeModuleMount?.(moduleId, currentModuleResources, targetNode);

            const moduleFunctions = currentModuleResources.mountMode === 'mf'
                ? await getMfMountFunctions(moduleFullId)
                : await getEmbeddedMountFunctions(currentModuleResources);

            currentMountFunction = moduleFunctions.mount;
            currentUnmountFunction = moduleFunctions.unmount;

            if (!currentMountFunction) {
                throw new Error(
                    `Module ${moduleId} mount function is not available`,
                );
            }

            const result = await currentMountFunction(
                moduleId,
                runParams,
                targetNode,
            );

            loaderParams.onAfterModuleMount?.(moduleId, currentModuleResources);

            return result;
        }

        return {
            unmount: () => {
                consumers.decrease();

                if (currentModuleResources) {
                    loaderParams.onBeforeModuleUnmount?.(
                        moduleId,
                        currentModuleResources,
                        targetNode,
                    );
                }

                if (currentUnmountFunction) {
                    currentUnmountFunction(targetNode);
                }

                if (consumers.isAbsent()) {
                    removeAppResources(moduleId);
                    cleanModuleFunctions(
                        currentModuleResources?.mountFunctionName,
                        currentModuleResources?.unmountFunctionName,
                    );
                }
            },
            result: loadModule(),
        };
    };
}

/**
 * Метод для получения mount/unmount функций модуля, сделанного через module-federation
 * @param moduleFullId
 */
async function getMfMountFunctions(moduleFullId: string) {
    // mf работает таким образом:
    // 1. Инициализация shared скоупа. Фактически загружает в него все известные приложению на данный момент модули (и из себя, и из других remote, если есть)
    // 2. вебпак пишет нужный "контейнер" в window. Под контейнером понимается совокупность модулей от какого то приложения
    // 3. мы инициализируем контейнер. Он может записать шареные модули в общий скоуп
    // 4. мы получаем из контейнера тот модуль, который нас интересовал. Собственно в нашем случае в контейнере будет только один модуль
    // 5. "запускаем" модуль. Он вернет нам то, что заэкспорчено из файла, который предоставляет mf
    await __webpack_init_sharing__('default');
    const { containerId, moduleName } = parseMfModuleId(moduleFullId);
    const container = (window as unknown as Record<string, ModuleFederationContainer>)[containerId];

    if (!container || !container.init) {
        throw new Error(`Cannot load external remote: ${containerId}, unable to locate mf init function`);
    }

    type MfModule = {
        mount(): ModuleMountFunction;
        unmount(): ModuleUnmountFunction;
    };

    // webpack любит двойные подчеркивания для внутренних функций
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get<MfModule>(moduleName);

    if (!factory) {
        throw new Error(`Cannot load external remote: ${moduleName}, unable to locate module inside a container`);
    }

    const module = await factory();

    return {
        mount: module.mount,
        unmount: module.unmount,
    };
}

/**
 * Метод для получения mount/unmount функций модуля, сделанных как embedded
 * @param currentModuleResources
 */
async function getEmbeddedMountFunctions(currentModuleResources: GetResourcesResponse) {
    // embedded модули просто пишут нужные функции в window. Просто достаем их оттуда
    return {
        mount: (window as WindowWithMountFunction)[currentModuleResources.mountFunctionName],
        unmount: currentModuleResources.unmountFunctionName
            ? (window as WindowWithUnmountFunction)[currentModuleResources.unmountFunctionName]
            : undefined,
    };
}
