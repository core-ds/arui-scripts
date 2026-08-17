import { type ModuleLoadRecord } from '../types';
import { matchesLoad } from '../utils/load-matches';

function createRecord(overrides: Partial<ModuleLoadRecord> = {}): ModuleLoadRecord {
    return {
        loadId: 'load-1',
        moduleId: 'header',
        hostAppId: 'host',
        status: 'loaded',
        shareScope: 'default',
        fromCache: false,
        scripts: [],
        styles: [],
        timings: {},
        startedAt: 0,
        ...overrides,
    };
}

describe('matchesLoad', () => {
    it('should match everything when the query is empty', () => {
        expect(matchesLoad(createRecord(), '')).toBe(true);
    });

    it('should match by module id', () => {
        expect(matchesLoad(createRecord(), 'head')).toBe(true);
        expect(matchesLoad(createRecord(), 'footer')).toBe(false);
    });

    it('should match by container, version and base url', () => {
        const record = createRecord({
            containerId: 'exampleModules',
            moduleVersion: '2.5.0',
            baseUrl: 'http://localhost:8082',
        });

        expect(matchesLoad(record, 'examplemodules')).toBe(true);
        expect(matchesLoad(record, '2.5')).toBe(true);
        expect(matchesLoad(record, '8082')).toBe(true);
    });

    it('should match by the status label the user actually sees', () => {
        // в таблице написано «ошибка», а не error - искать пользователь будет именно так
        expect(matchesLoad(createRecord({ status: 'error' }), 'ошибка')).toBe(true);
        expect(matchesLoad(createRecord({ status: 'loaded' }), 'ошибка')).toBe(false);
    });

    it('should match by the error message', () => {
        const record = createRecord({
            status: 'error',
            error: { stage: 'fetch-manifest', message: 'Failed to fetch' },
        });

        expect(matchesLoad(record, 'failed')).toBe(true);
    });

    it('should ignore fields the record does not have', () => {
        expect(matchesLoad(createRecord(), 'localhost')).toBe(false);
    });
});
