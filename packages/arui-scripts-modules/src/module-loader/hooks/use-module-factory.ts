import { BaseModuleState, Loader } from '../types';
import { useEffect, useState } from 'react';
import { LoadingState } from './types';

export type UseModuleFactoryParams<LoaderParams, FactoryParams extends BaseModuleState> = {
    /**
     * Загрузчик модуля
     */
    loader: Loader<LoaderParams, any>;
    /**
     * Параметры, которые будут переданы в loader
     */
    loaderParams?: LoaderParams;
    /**
     * Функция, который позволяет дополнить/изменить параметры для фабрики 
     */
    getFactoryParams?: (params: FactoryParams) => FactoryParams;
}

export type UseModuleFactoryResult<ModuleExportType> = {
    /**
     * Состояние загрузки модуля
     */
    loadingState: LoadingState;
    /**
     * Экспорт модуля
     */
    module: ModuleExportType | undefined;
}

export function useModuleFactory<LoaderParams, FactoryParams extends BaseModuleState, ModuleExportType = any>({
    loader,
    loaderParams,
    getFactoryParams,
}: UseModuleFactoryParams<LoaderParams, FactoryParams>): UseModuleFactoryResult<ModuleExportType> {
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');
    const [module, setModule] = useState<ModuleExportType | undefined>();

    useEffect(() => {
        let unmountFn: () => void | undefined;

        async function run() {
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParams as LoaderParams,
                });

                const factoryParams = getFactoryParams ? 
                    await getFactoryParams(result.moduleResources.moduleState as FactoryParams) :
                    result.moduleResources.moduleState

                let moduleResult;

                /**
                 * Делаем 3 возможных варианта доставки фабрики:
                 * Для compat модулей фабрику можно записать прямо в window
                 * Для compat и для mf модулей делаем также возможным записи в поля factory и default
                 */
                if (typeof result.module === 'function') {

                    moduleResult = result.module(factoryParams);

                } else if (result.module.default && typeof result.module.default === 'function') {

                    moduleResult = result.module.default(factoryParams);

                } else if (result.module.factory && typeof result.module.factory === 'function') {

                    moduleResult = result.module.factory(factoryParams);
                }



                setModule(moduleResult)

                unmountFn = result.unmount;

                setLoadingState('fulfilled');
            } catch (error) {
                setLoadingState('rejected');
                // eslint-disable-next-line no-console
                console.error(error);
            }
        }

        run();

        return function moduleCleanUp() {
            unmountFn?.();
        }
    }, [loader]);

    return {
        loadingState,
        module,
    };
}
