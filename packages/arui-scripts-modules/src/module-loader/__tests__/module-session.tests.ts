import { createModuleSession } from '../module-session';
import { type ModuleMounterOptions, type MountableModule } from '../module-types';
import { type LoaderResult, type ModuleResources } from '../types';

const resources: ModuleResources = {
    scripts: [],
    styles: [],
    moduleVersion: '1',
    appName: 'test',
    mountMode: 'compat',
    moduleState: { baseUrl: '/', hostAppId: 'host' },
};
const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
};

describe('Сессия загрузки модуля', () => {
    it('сообщает об ошибке очистки ресурсов при завершении отменённой загрузки', async () => {
        const error = new Error('release');
        const onError = jest.fn();
        const module = { mount: jest.fn(), unmount() {} };
        const session = createModuleSession({
            load: async () => ({
                module,
                moduleResources: resources,
                unmount() {
                    throw error;
                },
            }),
            targetNode: document.createElement('div'),
            getRunParams: () => 'a',
            getOptions: () => ({ onError }),
        });

        session.dispose();
        await flush();
        expect(module.mount).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith({ error, stage: 'unmount' });
    });
    it('сохраняет ошибку и указанный этап загрузки', async () => {
        const error = new Error('network');
        const onError = jest.fn();

        createModuleSession({
            load: async (_signal, reportStage) => {
                reportStage('fetch-manifest');
                throw error;
            },
            targetNode: document.createElement('div'),
            getRunParams: () => undefined,
            getOptions: () => ({ onError }),
        });
        await flush();
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith({ error, stage: 'fetch-manifest' });
    });

    it('освобождает результат отменённой загрузки без монтирования и сообщения о готовности', async () => {
        let finish!: (value: LoaderResult<MountableModule<string>>) => void;
        const module = { mount: jest.fn(), unmount: jest.fn() };
        const unmount = jest.fn();
        const onReady = jest.fn();
        const onError = jest.fn();
        const session = createModuleSession({
            load: () =>
                new Promise<LoaderResult<MountableModule<string>>>((resolve) => {
                    finish = resolve;
                }),
            targetNode: document.createElement('div'),
            getRunParams: () => 'a',
            getOptions: () => ({ onReady, onError }),
        });

        session.dispose();
        session.dispose();
        finish({ module, moduleResources: resources, unmount });
        await flush();
        expect(module.mount).not.toHaveBeenCalled();
        expect(unmount).toHaveBeenCalledTimes(1);
        expect(onReady).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });

    it('сообщает о некорректном экспорте и освобождает ресурсы', async () => {
        const onError = jest.fn();
        const unmount = jest.fn();

        createModuleSession({
            load: async () => ({
                module: {} as MountableModule<string>,
                moduleResources: resources,
                unmount,
            }),
            targetNode: document.createElement('div'),
            getRunParams: () => 'a',
            getOptions: () => ({ onError }),
        });
        await flush();
        expect(onError).toHaveBeenCalledWith({ error: expect.any(Error), stage: 'resolve-export' });
        expect(unmount).toHaveBeenCalledTimes(1);
    });

    it('после загрузки использует актуальные параметры и обработчики', async () => {
        let params = 'a';
        const staleReady = jest.fn();
        const currentReady = jest.fn();
        let options: ModuleMounterOptions = { onReady: staleReady };
        const module = { mount: jest.fn(), unmount() {} };
        const session = createModuleSession({
            load: async () => ({ module, moduleResources: resources, unmount() {} }),
            targetNode: document.createElement('div'),
            getRunParams: () => params,
            getOptions: () => options,
        });

        params = 'b';
        options = { onReady: currentReady };
        await flush();
        expect(module.mount).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            'b',
            resources.moduleState,
            expect.any(Object),
        );
        expect(staleReady).not.toHaveBeenCalled();
        expect(currentReady).toHaveBeenCalledTimes(1);
        session.dispose();
    });
});
