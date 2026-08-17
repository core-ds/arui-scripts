import { type ChromeApi, type DeclarativeNetRequestRule } from '../extension/chrome-api';
import {
    applyOverrides,
    hasOriginPermission,
    isValidOverride,
    requestOriginPermission,
    toRule,
} from '../extension/overrides';

function createChrome(existing: DeclarativeNetRequestRule[] = []) {
    const calls: Array<{ removeRuleIds?: number[]; addRules?: DeclarativeNetRequestRule[] }> = [];
    let granted = false;
    let requested: string[] | undefined;

    const api: ChromeApi = {
        permissions: {
            contains: (permissions, callback) => callback(granted),
            request: (permissions, callback) => {
                requested = permissions.origins;
                granted = true;
                callback(true);
            },
        },
        declarativeNetRequest: {
            getSessionRules: (callback) => callback(existing),
            updateSessionRules: (options, callback) => {
                calls.push(options);
                callback?.();
            },
        },
    };

    return {
        api,
        calls,
        get requested() {
            return requested;
        },
        grant() {
            granted = true;
        },
    };
}

describe('isValidOverride', () => {
    it('should accept two different http origins', () => {
        expect(
            isValidOverride({ from: 'http://cdn.example.com', to: 'http://localhost:8082' }),
        ).toBe(true);
    });

    it('should refuse an empty target', () => {
        expect(isValidOverride({ from: 'http://cdn.example.com', to: '' })).toBe(false);
    });

    it('should refuse a target that is not a url', () => {
        expect(isValidOverride({ from: 'http://cdn.example.com', to: 'localhost:8082' })).toBe(
            false,
        );
    });

    it('should refuse a scheme the browser will not redirect to', () => {
        expect(
            // eslint-disable-next-line no-script-url -- это и есть предмет проверки
            isValidOverride({ from: 'http://cdn.example.com', to: 'javascript:alert(1)' }),
        ).toBe(false);
    });

    it('should refuse redirecting an origin onto itself', () => {
        expect(
            isValidOverride({ from: 'http://localhost:8082', to: 'http://localhost:8082/' }),
        ).toBe(false);
    });
});

describe('toRule', () => {
    it('should redirect only scheme, host and port', () => {
        // путь модуля обязан остаться прежним, иначе локальный сервер не найдёт ни манифест,
        // ни бандлы
        const rule = toRule({ from: 'https://cdn.example.com', to: 'http://localhost:8082' }, 0);

        expect(rule?.action.redirect.transform).toEqual({
            scheme: 'http',
            host: 'localhost',
            port: '8082',
        });
    });

    it('should match the whole origin and nothing else', () => {
        const rule = toRule({ from: 'https://cdn.example.com', to: 'http://localhost:8082' }, 0);

        expect(rule?.condition.urlFilter).toBe('|https://cdn.example.com/');
    });

    it('should cover the resource types a module is made of', () => {
        const rule = toRule({ from: 'https://cdn.example.com', to: 'http://localhost:8082' }, 0);

        expect(rule?.condition.resourceTypes).toEqual(
            expect.arrayContaining(['script', 'stylesheet', 'xmlhttprequest']),
        );
    });

    it('should give every override its own id', () => {
        const first = toRule({ from: 'https://a.example.com', to: 'http://localhost:1' }, 0);
        const second = toRule({ from: 'https://b.example.com', to: 'http://localhost:2' }, 1);

        expect(first?.id).not.toBe(second?.id);
    });

    it('should refuse to build a rule from a broken override', () => {
        expect(toRule({ from: 'not a url', to: 'http://localhost:8082' }, 0)).toBeUndefined();
    });
});

describe('applyOverrides', () => {
    it('should replace the whole rule set', async () => {
        // набор подмен - это состояние: держать его в одном месте проще, чем сводить дельты
        const chrome = createChrome([
            { id: 4200, priority: 1 } as DeclarativeNetRequestRule,
            { id: 4201, priority: 1 } as DeclarativeNetRequestRule,
        ]);

        await applyOverrides(
            [{ from: 'https://cdn.example.com', to: 'http://localhost:8082' }],
            chrome.api,
        );

        expect(chrome.calls[0].removeRuleIds).toEqual([4200, 4201]);
        expect(chrome.calls[0].addRules).toHaveLength(1);
    });

    it('should not touch rules outside its own id range', async () => {
        // в браузере могут жить чужие расширения со своими правилами
        const chrome = createChrome([
            { id: 1, priority: 1 } as DeclarativeNetRequestRule,
            { id: 4200, priority: 1 } as DeclarativeNetRequestRule,
        ]);

        await applyOverrides([], chrome.api);

        expect(chrome.calls[0].removeRuleIds).toEqual([4200]);
    });

    it('should skip overrides that cannot be applied', async () => {
        const chrome = createChrome();

        await applyOverrides(
            [
                { from: 'https://cdn.example.com', to: '' },
                { from: 'https://cdn.example.com', to: 'http://localhost:8082' },
            ],
            chrome.api,
        );

        expect(chrome.calls[0].addRules).toHaveLength(1);
    });

    it('should clear every rule when there is nothing to override', async () => {
        const chrome = createChrome([{ id: 4200, priority: 1 } as DeclarativeNetRequestRule]);

        await applyOverrides([], chrome.api);

        expect(chrome.calls[0].addRules).toEqual([]);
    });

    it('should degrade outside of an extension', async () => {
        await expect(applyOverrides([], undefined)).resolves.toBeUndefined();
    });
});

describe('origin permissions', () => {
    it('should report a permission that was never granted', async () => {
        await expect(
            hasOriginPermission('https://cdn.example.com', createChrome().api),
        ).resolves.toBe(false);
    });

    it('should report a granted permission', async () => {
        const chrome = createChrome();

        chrome.grant();

        await expect(hasOriginPermission('https://cdn.example.com', chrome.api)).resolves.toBe(
            true,
        );
    });

    it('should ask for the origin it is about to redirect', async () => {
        const chrome = createChrome();

        await expect(requestOriginPermission('https://cdn.example.com', chrome.api)).resolves.toBe(
            true,
        );
        expect(chrome.requested).toEqual(['https://cdn.example.com/*']);
    });

    it('should say no outside of an extension instead of throwing', async () => {
        await expect(hasOriginPermission('https://cdn.example.com', undefined)).resolves.toBe(
            false,
        );
        await expect(requestOriginPermission('https://cdn.example.com', undefined)).resolves.toBe(
            false,
        );
    });
});
