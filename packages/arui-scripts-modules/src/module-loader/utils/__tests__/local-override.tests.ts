import { getLocalModuleOverride, LOCAL_OVERRIDE_STORAGE_KEY } from '../local-override';

describe('getLocalModuleOverride', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('returns the override url for a known module', () => {
        window.localStorage.setItem(
            LOCAL_OVERRIDE_STORAGE_KEY,
            JSON.stringify({ 'module-A': 'http://localhost:8080' }),
        );

        expect(getLocalModuleOverride('module-A')).toBe('http://localhost:8080');
    });

    it('returns undefined if the key is missing', () => {
        expect(getLocalModuleOverride('module-A')).toBeUndefined();
    });

    it('returns undefined on invalid JSON', () => {
        window.localStorage.setItem(LOCAL_OVERRIDE_STORAGE_KEY, '{not-json');

        expect(getLocalModuleOverride('module-A')).toBeUndefined();
    });

    it('returns undefined if the value is not an object', () => {
        window.localStorage.setItem(LOCAL_OVERRIDE_STORAGE_KEY, '"string"');
        expect(getLocalModuleOverride('module-A')).toBeUndefined();

        window.localStorage.setItem(LOCAL_OVERRIDE_STORAGE_KEY, '42');
        expect(getLocalModuleOverride('module-A')).toBeUndefined();
    });

    it('returns undefined if the value is null or an array', () => {
        window.localStorage.setItem(LOCAL_OVERRIDE_STORAGE_KEY, 'null');
        expect(getLocalModuleOverride('module-A')).toBeUndefined();

        window.localStorage.setItem(LOCAL_OVERRIDE_STORAGE_KEY, '["module-A"]');
        expect(getLocalModuleOverride('module-A')).toBeUndefined();
    });

    it('returns undefined for non-string or empty values', () => {
        window.localStorage.setItem(
            LOCAL_OVERRIDE_STORAGE_KEY,
            JSON.stringify({ 'module-A': 123, 'module-B': '', 'module-C': '   ' }),
        );

        expect(getLocalModuleOverride('module-A')).toBeUndefined();
        expect(getLocalModuleOverride('module-B')).toBeUndefined();
        expect(getLocalModuleOverride('module-C')).toBeUndefined();
    });

    it('does not throw when localStorage access fails', () => {
        const originalGetItem = Storage.prototype.getItem;

        Storage.prototype.getItem = () => {
            throw new Error('SecurityError');
        };

        expect(getLocalModuleOverride('module-A')).toBeUndefined();

        Storage.prototype.getItem = originalGetItem;
    });
});
