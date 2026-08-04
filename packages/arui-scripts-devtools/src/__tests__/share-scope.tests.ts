import { countShareProblems, readShareScopes } from '../share-scope';

type Scopes = Record<string, Record<string, Record<string, unknown>>>;

const globalWithScopes = globalThis as typeof globalThis & { __webpack_share_scopes__?: Scopes };

function putScopes(scopes: Scopes) {
    globalWithScopes.__webpack_share_scopes__ = scopes;
}

describe('readShareScopes', () => {
    afterEach(() => {
        delete globalWithScopes.__webpack_share_scopes__;
    });

    it('should return an empty list when module federation is not used', () => {
        expect(readShareScopes()).toEqual([]);
    });

    it('should read package versions with their share config', () => {
        putScopes({
            default: {
                react: {
                    '18.3.1': {
                        from: 'example',
                        loaded: 1,
                        shareConfig: {
                            singleton: true,
                            requiredVersion: '^18.0.0',
                            strictVersion: true,
                            eager: true,
                        },
                    },
                },
            },
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
                        problems: [],
                    },
                ],
            },
        ]);
    });

    it('should never execute a shared module', () => {
        const get = jest.fn();

        putScopes({ default: { react: { '18.3.1': { get, loaded: 0 } } } });

        readShareScopes();

        // вызов get() исполнил бы шаренный модуль - панель не имеет права менять поведение приложения
        expect(get).not.toHaveBeenCalled();
    });

    it('should report several versions of the same package', () => {
        putScopes({
            default: {
                react: {
                    '17.0.2': { from: 'example-modules' },
                    '18.3.1': { from: 'example' },
                },
            },
        });

        const [scope] = readShareScopes();
        const { problems } = scope.packages[0];

        expect(problems).toHaveLength(1);
        expect(problems[0].type).toBe('multiple-versions');
        expect(problems[0].message).toContain('17.0.2, 18.3.1');
    });

    it('should report a singleton with mismatching majors', () => {
        putScopes({
            default: {
                react: {
                    '17.0.2': { shareConfig: { singleton: true } },
                    '18.3.1': { shareConfig: { singleton: true } },
                },
            },
        });

        const [scope] = readShareScopes();

        expect(scope.packages[0].problems.map((problem) => problem.type)).toEqual([
            'multiple-versions',
            'singleton-major-mismatch',
        ]);
    });

    it('should not report a singleton with several patch versions as a major mismatch', () => {
        putScopes({
            default: {
                react: {
                    '18.2.0': { shareConfig: { singleton: true } },
                    '18.3.1': { shareConfig: { singleton: true } },
                },
            },
        });

        const [scope] = readShareScopes();

        expect(scope.packages[0].problems.map((problem) => problem.type)).toEqual([
            'multiple-versions',
        ]);
    });

    it('should sort versions as numbers, not as text', () => {
        putScopes({ default: { lodash: { '9.0.0': {}, '10.0.0': {} } } });

        const [scope] = readShareScopes();

        // лексикографически «10.0.0» меньше «9.0.0», и в списке версий пакет выглядел бы
        // откатившимся на мажор назад
        expect(scope.packages[0].versions.map((item) => item.version)).toEqual(['9.0.0', '10.0.0']);
        expect(scope.packages[0].problems[0].message).toContain('9.0.0, 10.0.0');
    });

    it('should survive a broken scope', () => {
        putScopes({ default: null as unknown as Record<string, Record<string, unknown>> });

        expect(readShareScopes()).toEqual([{ name: 'default', packages: [] }]);
    });

    it('should count problems across scopes', () => {
        putScopes({
            default: { react: { '17.0.2': {}, '18.3.1': {} } },
            other: { lodash: { '4.17.21': {} } },
        });

        expect(countShareProblems(readShareScopes())).toBe(1);
    });
});
