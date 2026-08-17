import {
    type ModuleLoadUpdate,
    reportLoadError,
    reportLoadStart,
    reportLoadSuccess,
    reportLoadUpdate,
    reportStageEnd,
    reportStageStart,
    reportUnmount,
} from '../report';
import {
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    DEVTOOLS_MODULES_VERSION,
    DEVTOOLS_VERSION,
    getDevtoolsModulesStore,
} from '../store';
import { type DevtoolsSnapshot, type ModuleLoadRecord } from '../types';

type GlobalWithScopes = typeof globalThis & { __webpack_share_scopes__?: unknown };

function resetGlobal() {
    delete (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];
    delete (globalThis as GlobalWithScopes).__webpack_share_scopes__;
    sessionStorage.clear();
}

function getSnapshot(): DevtoolsSnapshot {
    const store = getDevtoolsModulesStore();

    if (!store) {
        throw new Error('store is expected to be created');
    }

    return store.getSnapshot();
}

function getRecord(loadId: string | undefined): ModuleLoadRecord {
    const record = getSnapshot().loads.find((item) => item.loadId === loadId);

    if (!record) {
        throw new Error(`record ${loadId} not found`);
    }

    return record;
}

function startLoad() {
    return reportLoadStart({ moduleId: 'header', hostAppId: 'host', shareScope: 'default' });
}

describe('devtools report', () => {
    beforeEach(resetGlobal);
    afterEach(resetGlobal);

    it('should create pending record on load start', () => {
        const loadId = startLoad();

        expect(loadId).toBeTruthy();
        expect(getRecord(loadId)).toMatchObject({
            moduleId: 'header',
            hostAppId: 'host',
            shareScope: 'default',
            status: 'pending',
            fromCache: false,
            scripts: [],
            styles: [],
            timings: {},
        });
        expect(getSnapshot().events).toMatchObject([{ type: 'load-start', moduleId: 'header' }]);
    });

    it('should give unique loadId to every load attempt of the same module', () => {
        expect(startLoad()).not.toBe(startLoad());
    });

    it('should record full successful scenario with all stages', () => {
        const loadId = startLoad();

        reportStageStart(loadId, 'fetch-manifest');
        reportStageEnd(loadId, 'fetch-manifest');
        reportLoadUpdate(loadId, {
            manifestUrl: 'http://localhost:8082/assets-manifest.json',
            baseUrl: 'http://localhost:8082/',
            moduleVersion: '1.2.3',
            mountMode: 'default',
            containerId: 'exampleModules',
            scripts: ['http://localhost:8082/header.js'],
            styles: ['http://localhost:8082/header.css'],
        });
        reportStageStart(loadId, 'fetch-resources');
        reportStageEnd(loadId, 'fetch-resources');
        reportStageStart(loadId, 'container-get');
        reportStageEnd(loadId, 'container-get');
        reportLoadSuccess(loadId);

        const record = getRecord(loadId);

        expect(record).toMatchObject({
            status: 'loaded',
            moduleVersion: '1.2.3',
            mountMode: 'default',
            containerId: 'exampleModules',
            baseUrl: 'http://localhost:8082/',
            manifestUrl: 'http://localhost:8082/assets-manifest.json',
            scripts: ['http://localhost:8082/header.js'],
            styles: ['http://localhost:8082/header.css'],
        });
        expect(record.finishedAt).toEqual(expect.any(Number));
        expect(Object.keys(record.timings)).toEqual([
            'fetch-manifest',
            'fetch-resources',
            'container-get',
        ]);
        Object.values(record.timings).forEach((timing) => {
            expect(timing?.end).toBeGreaterThanOrEqual(timing?.start);
        });
    });

    it('should close open stage and mark record as failed on error', () => {
        const loadId = startLoad();

        reportStageStart(loadId, 'fetch-resources');
        reportLoadError(loadId, 'fetch-resources', new Error('Network is down'));

        const record = getRecord(loadId);

        expect(record.status).toBe('error');
        expect(record.error).toMatchObject({
            stage: 'fetch-resources',
            message: 'Network is down',
        });
        expect(record.error?.stack).toEqual(expect.any(String));
        expect(record.timings['fetch-resources']?.end).toEqual(expect.any(Number));
        expect(record.finishedAt).toEqual(expect.any(Number));
    });

    it('should record error on stage that was never started', () => {
        const loadId = startLoad();

        reportLoadError(loadId, 'container-init', new Error('Module is not available'));

        const record = getRecord(loadId);

        expect(record.status).toBe('error');
        expect(record.error?.stage).toBe('container-init');
        expect(record.timings['container-init']).toBeUndefined();
    });

    it('should serialize non-error throws', () => {
        const loadId = startLoad();

        reportLoadError(loadId, 'factory', 'just a string');
        expect(getRecord(loadId).error?.message).toBe('just a string');

        const otherLoadId = startLoad();

        reportLoadError(otherLoadId, 'factory', { code: 500 });
        expect(getRecord(otherLoadId).error?.message).toBe('[object Object]');
    });

    it('should not overwrite error status with success', () => {
        const loadId = startLoad();

        reportLoadError(loadId, 'mount', new Error('boom'));
        reportLoadSuccess(loadId);

        expect(getRecord(loadId).status).toBe('error');
    });

    it('should not overwrite unmounted status with success', () => {
        const loadId = startLoad();

        // так выглядит прерывание по abortSignal: ресурсы сняты со страницы, пока загрузка ещё шла
        reportUnmount(loadId);
        reportLoadSuccess(loadId);

        expect(getRecord(loadId).status).toBe('unmounted');
    });

    it('should snapshot the share scope at both ends of a load', () => {
        // скоуп меняется по ходу загрузки: хост кладёт свои библиотеки на init-sharing,
        // провайдер добавляет свои на container-init
        (globalThis as GlobalWithScopes).__webpack_share_scopes__ = {
            default: { react: { '18.3.1': { from: 'host', loaded: 1 } } },
        };

        const loadId = startLoad();

        expect(getSnapshot().shareScopes).toEqual([
            {
                name: 'default',
                packages: [
                    {
                        name: 'react',
                        versions: [{ version: '18.3.1', from: 'host', loaded: true }],
                    },
                ],
            },
        ]);

        (globalThis as GlobalWithScopes).__webpack_share_scopes__ = {
            default: {
                react: { '18.3.1': { from: 'host', loaded: 1 } },
                lodash: { '4.17.21': { from: 'provider', loaded: 0 } },
            },
        };
        reportLoadSuccess(loadId);

        expect(getSnapshot().shareScopes[0].packages.map((item) => item.name)).toEqual([
            'react',
            'lodash',
        ]);
    });

    it('should snapshot the share scope when a load fails', () => {
        (globalThis as GlobalWithScopes).__webpack_share_scopes__ = {
            default: { react: { '18.3.1': {} } },
        };

        const loadId = startLoad();

        (globalThis as GlobalWithScopes).__webpack_share_scopes__ = {
            default: { react: { '18.3.1': {} }, 'react-dom': { '18.3.1': {} } },
        };
        reportLoadError(loadId, 'container-init', new Error('boom'));

        // разбираться с ошибкой share scope помогает не меньше таймингов
        expect(getSnapshot().shareScopes[0].packages).toHaveLength(2);
    });

    it('should keep the share scope empty when module federation is not used', () => {
        startLoad();

        expect(getSnapshot().shareScopes).toEqual([]);
    });

    it('should mark record as unmounted', () => {
        const loadId = startLoad();

        reportLoadSuccess(loadId);
        reportUnmount(loadId);

        expect(getRecord(loadId).status).toBe('unmounted');
        expect(getSnapshot().events[getSnapshot().events.length - 1]).toMatchObject({
            type: 'unmount',
            moduleId: 'header',
        });
    });

    it('should mark cached loads', () => {
        const loadId = startLoad();

        reportLoadUpdate(loadId, { fromCache: true });

        expect(getRecord(loadId).fromCache).toBe(true);
    });

    it('should not write unknown fields into record', () => {
        const loadId = startLoad();
        const moduleExports = { render: () => undefined };

        reportLoadUpdate(loadId, {
            baseUrl: 'http://localhost:8082/',
            // именно от такого и защищаемся: ссылка на экспорт модуля не должна попасть в стор
            module: moduleExports,
            node: document.createElement('div'),
        } as unknown as ModuleLoadUpdate);

        const record = getRecord(loadId) as Record<string, unknown>;

        expect(record.module).toBeUndefined();
        expect(record.node).toBeUndefined();
        expect(record.baseUrl).toBe('http://localhost:8082/');
    });

    it('should keep snapshot serializable', () => {
        const loadId = startLoad();

        reportStageStart(loadId, 'fetch-manifest');
        reportLoadError(loadId, 'fetch-manifest', new Error('boom'));

        expect(() => JSON.stringify(getSnapshot())).not.toThrow();
    });

    it('should do nothing when loadId is undefined', () => {
        expect(() => {
            reportLoadUpdate(undefined, { fromCache: true });
            reportStageStart(undefined, 'mount');
            reportStageEnd(undefined, 'mount');
            reportLoadError(undefined, 'mount', new Error('boom'));
            reportLoadSuccess(undefined);
            reportUnmount(undefined);
        }).not.toThrow();
    });

    it('should degrade when namespace contract is of incompatible version', () => {
        (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY] = {
            version: DEVTOOLS_VERSION,
            [DEVTOOLS_MODULES_NAMESPACE]: {
                version: 999,
                getSnapshot: () => ({}),
                subscribe: () => () => undefined,
            },
        };

        expect(startLoad()).toBeUndefined();
    });

    it('should degrade when devtools root is of incompatible version', () => {
        (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY] = { version: 999 };

        expect(startLoad()).toBeUndefined();
    });

    it('should never throw when store internals are broken', () => {
        (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY] = {
            version: DEVTOOLS_VERSION,
            [DEVTOOLS_MODULES_NAMESPACE]: {
                version: DEVTOOLS_MODULES_VERSION,
                getSnapshot: () => ({}),
                subscribe: () => () => undefined,
                writer: {
                    nextLoadId: () => 'broken',
                    addLoad: () => {
                        throw new Error('store is broken');
                    },
                    getLoad: () => undefined,
                    updateLoad: () => {
                        throw new Error('store is broken');
                    },
                    addEvent: () => {
                        throw new Error('store is broken');
                    },
                },
            },
        };

        expect(startLoad()).toBeUndefined();
        expect(() => {
            reportStageStart('broken', 'mount');
            reportStageEnd('broken', 'mount');
            reportLoadUpdate('broken', { fromCache: true });
            reportLoadError('broken', 'mount', new Error('boom'));
            reportLoadSuccess('broken');
            reportUnmount('broken');
        }).not.toThrow();
    });
});
