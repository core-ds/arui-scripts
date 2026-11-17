export const consumerSource = `
            import type { ModuleContracts } from '@fixture/contracts';
            import { createTypedModuleLoader, useModuleMounter, useModuleFactory, createModuleFetcher, type ModuleRunParams, type ModuleServerState } from '@alfalab/scripts-modules';
            const createLoader = createTypedModuleLoader<ModuleContracts>();
            const resources = createModuleFetcher({ baseUrl: '/provider' });
            const loader = createLoader({ moduleId: 'Credit', hostAppId: 'consumer', getModuleResources: resources });
            useModuleMounter({ loader, runParams: { clientId: '123', width: 300 } });
            useModuleMounter({ loader }); // Existing optionality is preserved.
            // @ts-expect-error Wrong exposed module ID.
            createLoader({ moduleId: 'Missing', hostAppId: 'consumer', getModuleResources: resources });
            // @ts-expect-error Wrong runParams value.
            useModuleMounter({ loader, runParams: { clientId: '123', width: 'wide' } });
            // @ts-expect-error Missing required field in a provided object.
            useModuleMounter({ loader, runParams: { width: 300 } });
            const defaultLoader = createLoader({ moduleId: 'ReactCredit', hostAppId: 'consumer', getModuleResources: resources });
            useModuleMounter({ loader: defaultLoader, runParams: { theme: 'dark' } });
            // @ts-expect-error Default exports preserve their parameters.
            useModuleMounter({ loader: defaultLoader, runParams: { theme: 'blue' } });
            const factory = createLoader({ moduleId: 'Factory', hostAppId: 'consumer', getModuleResources: resources });
            const result = useModuleFactory({ loader: factory, runParams: { account: '123' }, getFactoryParams: state => ({ ...state, amount: state.amount + 1 }) });
            const balance: number | undefined = result.module?.balance;
            // @ts-expect-error The factory result is not any.
            const wrong: string | undefined = result.module?.balance;
            // @ts-expect-error Factory parameters are checked.
            useModuleFactory({ loader: factory, runParams: { account: 123 } });
            const params: ModuleRunParams<ModuleContracts['Credit']> = { clientId: '123', width: 300 };
            const state: ModuleServerState<ModuleContracts['Credit']> = { baseUrl: '', hostAppId: '', credit: { balance: 100 } };
            // @ts-expect-error Transitive external types survive publishing.
            const invalid: ModuleServerState<ModuleContracts['Credit']> = { baseUrl: '', hostAppId: '', credit: { balance: '100' } };
            const factoryParams: ModuleRunParams<ModuleContracts['Factory']> = { account: '123' };
        `;

const factoryBody =
    '(params: { account: string }, state: { baseUrl: string; hostAppId: string; amount: number }) => ({ balance: state.amount });';

export const factorySources = {
    default: `export default ${factoryBody}`,
    named: `export const factory = ${factoryBody}`,
    legacy: `export const mount = ${factoryBody}`,
};
