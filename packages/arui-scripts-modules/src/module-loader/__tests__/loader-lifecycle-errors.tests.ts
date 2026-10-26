import { createModuleLoader } from '../create-module-loader';
import { type ModuleLoadErrorStage } from '../module-types';
import { type ModuleResources } from '../types';
import { getConsumerCounter } from '../utils/consumers-counter';
import { fetchResources } from '../utils/fetch-resources';
import { getCompatModule } from '../utils/get-module';

jest.mock('../utils/fetch-resources', () => ({
    fetchResources: jest.fn(async () => []),
    getResourcesTargetNodes: jest.fn(() => ({ js: document.head, css: document.head })),
}));
jest.mock('../utils/get-module', () => ({ getCompatModule: jest.fn() }));
jest.mock('../utils/consumers-counter', () => {
    const { getConsumerCounter: createCounter } = jest.requireActual('../utils/consumers-counter');
    const counter = createCounter();

    return { getConsumerCounter: () => counter };
});

const resources: ModuleResources = {
    scripts: [],
    styles: [],
    moduleVersion: '1',
    appName: 'test',
    mountMode: 'compat',
    moduleState: { baseUrl: '/', hostAppId: 'host' },
};

describe('Ошибки жизненного цикла загрузчика', () => {
    afterEach(() => jest.clearAllMocks());

    it.each<ModuleLoadErrorStage>(['fetch-manifest', 'fetch-resources', 'resolve-export'])(
        'сохраняет исходную ошибку и сообщает mounter-у этап %s',
        async (stage) => {
            const error = new Error(stage);
            const onLoadError = jest.fn();
            const onError = jest.fn();
            const getModuleResources = jest.fn().mockResolvedValue(resources);

            if (stage === 'fetch-manifest') getModuleResources.mockRejectedValueOnce(error);
            if (stage === 'fetch-resources')
                (fetchResources as jest.Mock).mockRejectedValueOnce(error);
            if (stage === 'resolve-export')
                (getCompatModule as jest.Mock).mockImplementationOnce(() => {
                    throw error;
                });
            const moduleId = `failure-${stage}`;
            const loader = createModuleLoader({
                moduleId,
                hostAppId: 'host',
                getModuleResources,
                hooks: { onError },
            });

            await expect(loader({ onLoadError })).rejects.toBe(error);
            expect(onLoadError).toHaveBeenCalledWith(stage);
            expect(onError).toHaveBeenCalledWith(moduleId, stage, error);
            expect(getConsumerCounter().getCounter(moduleId)).toBe(0);
        },
    );

    it('освобождает потребителя ресурсов один раз при явной очистке и отмене', async () => {
        const moduleId = 'idempotent-release';

        (getCompatModule as jest.Mock).mockReturnValueOnce({});
        const loader = createModuleLoader({
            moduleId,
            hostAppId: 'host',
            getModuleResources: async () => resources,
        });
        const controller = new AbortController();
        const result = await loader({ abortSignal: controller.signal });

        expect(getConsumerCounter().getCounter(moduleId)).toBe(1);
        result.unmount();
        controller.abort();
        result.unmount();
        expect(getConsumerCounter().getCounter(moduleId)).toBe(0);
    });
});
