import { readShareScopes } from '../share-scope';

type GlobalWithScopes = typeof globalThis & {
    __webpack_share_scopes__?: unknown;
};

const globalWithScopes = globalThis as GlobalWithScopes;

function putScopes(scopes: unknown) {
    globalWithScopes.__webpack_share_scopes__ = scopes;
}

describe('readShareScopes', () => {
    afterEach(() => {
        delete globalWithScopes.__webpack_share_scopes__;
    });

    it('should return nothing when module federation is not used', () => {
        expect(readShareScopes()).toEqual([]);
    });

    it('should return nothing when the share runtime is there but empty', () => {
        putScopes(undefined);

        expect(readShareScopes()).toEqual([]);
    });

    it('should read packages and versions of every scope', () => {
        putScopes({
            default: {
                react: {
                    '18.3.1': {
                        from: 'example',
                        loaded: 1,
                        shareConfig: {
                            singleton: true,
                            requiredVersion: '^18.0.0',
                            eager: true,
                            strictVersion: true,
                        },
                    },
                },
            },
            custom: { lodash: { '4.17.21': { from: 'provider' } } },
        });

        expect(readShareScopes()).toEqual([
            {
                name: 'default',
                packages: [
                    {
                        name: 'react',
                        versions: [
                            {
                                version: '18.3.1',
                                from: 'example',
                                loaded: true,
                                eager: true,
                                singleton: true,
                                requiredVersion: '^18.0.0',
                                strictVersion: true,
                            },
                        ],
                    },
                ],
            },
            {
                name: 'custom',
                packages: [
                    {
                        name: 'lodash',
                        versions: [
                            {
                                version: '4.17.21',
                                from: 'provider',
                                loaded: false,
                                eager: undefined,
                                singleton: undefined,
                                requiredVersion: undefined,
                                strictVersion: undefined,
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    it('should treat loaded as a flag whatever the runtime put there', () => {
        // в разных версиях рантайма это то флаг, то счётчик, то функция-геттер
        putScopes({
            default: {
                a: { '1.0.0': { loaded: 1 } },
                b: { '1.0.0': { loaded: 0 } },
                c: { '1.0.0': { loaded: () => undefined } },
                d: { '1.0.0': {} },
            },
        });

        const [scope] = readShareScopes();
        const loaded = scope.packages.map((item) => item.versions[0].loaded);

        expect(loaded).toEqual([true, false, true, false]);
    });

    it('should fall back to the entry eager flag when shareConfig has none', () => {
        putScopes({ default: { react: { '18.3.1': { eager: true } } } });

        expect(readShareScopes()[0].packages[0].versions[0].eager).toBe(true);
    });

    it('should drop a requiredVersion that is not a range', () => {
        // rspack кладёт сюда false, когда требование не объявлено
        putScopes({
            default: { react: { '18.3.1': { shareConfig: { requiredVersion: false } } } },
        });

        expect(readShareScopes()[0].packages[0].versions[0].requiredVersion).toBeUndefined();
    });

    it('should keep the snapshot serializable', () => {
        // снимок уезжает в sessionStorage и в расширение браузера через JSON:
        // функции рантайма (get, factory) не должны в него попадать
        putScopes({
            default: {
                react: {
                    '18.3.1': {
                        from: 'example',
                        loaded: 1,
                        get: () => undefined,
                        factory: () => undefined,
                        scope: ['default'],
                    },
                },
            },
        });

        const snapshot = readShareScopes();

        expect(JSON.parse(JSON.stringify(snapshot))).toEqual([
            {
                name: 'default',
                packages: [
                    {
                        name: 'react',
                        versions: [{ version: '18.3.1', from: 'example', loaded: true }],
                    },
                ],
            },
        ]);
    });

    it('should never call get of a shared entry', () => {
        // вызов исполнил бы шаренный модуль: диагностика изменила бы поведение приложения
        const get = jest.fn();

        putScopes({ default: { react: { '18.3.1': { get } } } });

        readShareScopes();

        expect(get).not.toHaveBeenCalled();
    });

    it('should survive a broken scope object', () => {
        putScopes({
            get default(): never {
                throw new Error('скоуп сломан');
            },
        });

        expect(readShareScopes()).toEqual([]);
    });
});
