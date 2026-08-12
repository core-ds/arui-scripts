import {
    getModuleOverride,
    MODULE_OVERRIDES_ENV_KEY,
    MODULE_OVERRIDES_STORAGE_KEY,
} from '../module-overrides';

describe('getModuleOverride', () => {
    const initialNodeEnv = process.env.NODE_ENV;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        delete process.env[MODULE_OVERRIDES_ENV_KEY];
        window.localStorage.clear();
    });

    afterEach(() => {
        warnSpy.mockRestore();
        delete process.env[MODULE_OVERRIDES_ENV_KEY];
        window.localStorage.clear();
        process.env.NODE_ENV = initialNodeEnv;
    });

    it('should return undefined when no overrides are configured', () => {
        expect(getModuleOverride('someModule')).toBeUndefined();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should read an override from the env variable', () => {
        process.env[MODULE_OVERRIDES_ENV_KEY] = JSON.stringify({
            someModule: 'http://localhost:8081',
        });

        expect(getModuleOverride('someModule')).toBe('http://localhost:8081');
    });

    it('should read an override from the local storage', () => {
        window.localStorage.setItem(
            MODULE_OVERRIDES_STORAGE_KEY,
            JSON.stringify({ someModule: 'http://localhost:8082' }),
        );

        expect(getModuleOverride('someModule')).toBe('http://localhost:8082');
    });

    it('should prefer the local storage over the env variable', () => {
        process.env[MODULE_OVERRIDES_ENV_KEY] = JSON.stringify({
            someModule: 'http://localhost:8081',
            otherModule: 'http://localhost:9091',
        });
        window.localStorage.setItem(
            MODULE_OVERRIDES_STORAGE_KEY,
            JSON.stringify({ someModule: 'http://localhost:8082' }),
        );

        expect(getModuleOverride('someModule')).toBe('http://localhost:8082');
        // ключи, которых нет в localStorage, продолжают браться из env
        expect(getModuleOverride('otherModule')).toBe('http://localhost:9091');
    });

    it('should return undefined for a module without an override', () => {
        process.env[MODULE_OVERRIDES_ENV_KEY] = JSON.stringify({
            someModule: 'http://localhost:8081',
        });

        expect(getModuleOverride('anotherModule')).toBeUndefined();
    });

    it('should warn about an active override', () => {
        process.env[MODULE_OVERRIDES_ENV_KEY] = JSON.stringify({
            someModule: 'http://localhost:8081',
        });

        getModuleOverride('someModule');

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('someModule'),
            expect.stringContaining('http://localhost:8081'),
        );
    });

    it('should ignore malformed json and warn about it', () => {
        process.env[MODULE_OVERRIDES_ENV_KEY] = 'not a json';
        window.localStorage.setItem(MODULE_OVERRIDES_STORAGE_KEY, '{ also not a json');

        expect(getModuleOverride('someModule')).toBeUndefined();
        expect(warnSpy).toHaveBeenCalledTimes(2);
    });

    it('should ignore non-string override values', () => {
        process.env[MODULE_OVERRIDES_ENV_KEY] = JSON.stringify({ someModule: 42 });

        expect(getModuleOverride('someModule')).toBeUndefined();
    });

    it('should ignore a non-object overrides payload', () => {
        process.env[MODULE_OVERRIDES_ENV_KEY] = JSON.stringify(['http://localhost:8081']);

        expect(getModuleOverride('someModule')).toBeUndefined();
    });

    it('should not read anything in production', () => {
        process.env.NODE_ENV = 'production';
        process.env[MODULE_OVERRIDES_ENV_KEY] = JSON.stringify({
            someModule: 'http://localhost:8081',
        });
        window.localStorage.setItem(
            MODULE_OVERRIDES_STORAGE_KEY,
            JSON.stringify({ someModule: 'http://localhost:8082' }),
        );

        expect(getModuleOverride('someModule')).toBeUndefined();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should survive an unavailable local storage', () => {
        const getItemSpy = jest
            .spyOn(window.Storage.prototype, 'getItem')
            .mockImplementation(() => {
                throw new Error('localStorage is disabled');
            });

        process.env[MODULE_OVERRIDES_ENV_KEY] = JSON.stringify({
            someModule: 'http://localhost:8081',
        });

        expect(getModuleOverride('someModule')).toBe('http://localhost:8081');

        getItemSpy.mockRestore();
    });
});
