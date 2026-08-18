import { type DevtoolsShareScope } from '../types';
import { analyzeShareScopes, countShareProblems } from '../utils/share-scope';

function scope(packages: DevtoolsShareScope['packages']): DevtoolsShareScope[] {
    return [{ name: 'default', packages }];
}

describe('analyzeShareScopes', () => {
    it('should return nothing when the loader put no snapshot', () => {
        // старый загрузчик поля не кладёт вовсе - это не повод падать
        expect(analyzeShareScopes(undefined)).toEqual([]);
    });

    it('should return nothing for anything that is not a list', () => {
        expect(analyzeShareScopes({} as unknown as DevtoolsShareScope[])).toEqual([]);
    });

    it('should keep scopes and packages as they came', () => {
        const result = analyzeShareScopes(
            scope([{ name: 'react', versions: [{ version: '18.3.1', loaded: true }] }]),
        );

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('default');
        expect(result[0].packages[0].name).toBe('react');
        expect(result[0].packages[0].versions[0].version).toBe('18.3.1');
    });

    it('should sort versions numerically', () => {
        // при строковом сравнении 10.0.0 встаёт перед 9.0.0, и список выглядит
        // откатившимся на мажор назад
        const result = analyzeShareScopes(
            scope([
                {
                    name: 'react',
                    versions: [
                        { version: '10.0.0', loaded: false },
                        { version: '9.0.0', loaded: false },
                    ],
                },
            ]),
        );

        expect(result[0].packages[0].versions.map((item) => item.version)).toEqual([
            '9.0.0',
            '10.0.0',
        ]);
    });

    it('should not mutate the snapshot it was given', () => {
        const versions = [
            { version: '10.0.0', loaded: false },
            { version: '9.0.0', loaded: false },
        ];

        analyzeShareScopes(scope([{ name: 'react', versions }]));

        expect(versions.map((item) => item.version)).toEqual(['10.0.0', '9.0.0']);
    });

    it('should report several versions of one package', () => {
        const result = analyzeShareScopes(
            scope([
                {
                    name: 'react',
                    versions: [
                        { version: '17.0.2', loaded: false },
                        { version: '18.3.1', loaded: false },
                    ],
                },
            ]),
        );

        expect(result[0].packages[0].problems).toEqual([
            {
                type: 'multiple-versions',
                message: expect.stringContaining('17.0.2, 18.3.1'),
            },
        ]);
    });

    it('should report singletons whose majors diverge', () => {
        const result = analyzeShareScopes(
            scope([
                {
                    name: 'react',
                    versions: [
                        { version: '17.0.2', loaded: false, singleton: true },
                        { version: '18.3.1', loaded: false, singleton: true },
                    ],
                },
            ]),
        );

        expect(result[0].packages[0].problems.map((problem) => problem.type)).toEqual([
            'multiple-versions',
            'singleton-major-mismatch',
        ]);
    });

    it('should not report a singleton with several patch versions', () => {
        const result = analyzeShareScopes(
            scope([
                {
                    name: 'react',
                    versions: [
                        { version: '18.3.0', loaded: false, singleton: true },
                        { version: '18.3.1', loaded: false, singleton: true },
                    ],
                },
            ]),
        );

        expect(result[0].packages[0].problems.map((problem) => problem.type)).toEqual([
            'multiple-versions',
        ]);
    });

    it('should see no problem in a single version', () => {
        const result = analyzeShareScopes(
            scope([
                { name: 'react', versions: [{ version: '18.3.1', loaded: true, singleton: true }] },
            ]),
        );

        expect(result[0].packages[0].problems).toEqual([]);
    });

    it('should survive a package without versions', () => {
        const result = analyzeShareScopes(
            scope([{ name: 'react' } as unknown as DevtoolsShareScope['packages'][number]]),
        );

        expect(result[0].packages[0].versions).toEqual([]);
        expect(result[0].packages[0].problems).toEqual([]);
    });
});

describe('analyzeShareScopes with declared requirements', () => {
    it('should attach the requirement the application declared', () => {
        // требования приходят из сборки: в самом скоупе их нет и быть не может
        const result = analyzeShareScopes(
            scope([{ name: 'react', versions: [{ version: '18.3.1', loaded: true }] }]),
            { react: [{ from: 'приложение', requiredVersion: '^18.0.0', singleton: true }] },
        );

        expect(result[0].packages[0].requirements).toEqual([
            { from: 'приложение', requiredVersion: '^18.0.0', singleton: true },
        ]);
    });

    it('should report a requirement nothing in the scope satisfies', () => {
        // ровно тот случай, который из скоупа не виден: хост просит одно, лежит другое
        const result = analyzeShareScopes(
            scope([{ name: 'react', versions: [{ version: '17.0.2', loaded: true }] }]),
            { react: [{ from: 'приложение', requiredVersion: '^18.0.0' }] },
        );

        expect(result[0].packages[0].problems.map((problem) => problem.type)).toEqual([
            'requirement-unsatisfied',
        ]);
    });

    it('should stay quiet when a version satisfies the range', () => {
        const result = analyzeShareScopes(
            scope([{ name: 'react', versions: [{ version: '18.3.1', loaded: true }] }]),
            { react: [{ from: 'приложение', requiredVersion: '^18.0.0' }] },
        );

        expect(result[0].packages[0].problems).toEqual([]);
    });

    it('should be satisfied when at least one version fits', () => {
        const result = analyzeShareScopes(
            scope([
                {
                    name: 'react',
                    versions: [
                        { version: '17.0.2', loaded: false },
                        { version: '18.3.1', loaded: true },
                    ],
                },
            ]),
            { react: [{ from: 'приложение', requiredVersion: '^18.0.0' }] },
        );

        expect(result[0].packages[0].problems.map((problem) => problem.type)).toEqual([
            'multiple-versions',
        ]);
    });

    it('should stay quiet about ranges it cannot parse', () => {
        // ложная тревога хуже молчания: полноценный semver пакету не по средствам
        const result = analyzeShareScopes(
            scope([{ name: 'react', versions: [{ version: '18.3.1', loaded: true }] }]),
            { react: [{ from: 'приложение', requiredVersion: '*' }] },
        );

        expect(result[0].packages[0].problems).toEqual([]);
    });

    it('should not invent a problem for a package nobody declared', () => {
        const result = analyzeShareScopes(
            scope([{ name: 'lodash', versions: [{ version: '4.17.21', loaded: true }] }]),
            { react: [{ from: 'приложение', requiredVersion: '^18.0.0' }] },
        );

        expect(result[0].packages[0].problems).toEqual([]);
        expect(result[0].packages[0].requirements).toEqual([]);
    });

    it('should report a provider whose requirement the scope does not satisfy', () => {
        // ровно тот случай, ради которого требования и возят: в скоупе одна версия,
        // хосту она подходит, а провайдер тихо получает собственную копию
        const result = analyzeShareScopes(
            scope([{ name: 'react', versions: [{ version: '18.3.1', loaded: true }] }]),
            {
                react: [
                    { from: 'приложение', requiredVersion: '^18.0.0' },
                    { from: 'example_modules', requiredVersion: '^17.0.0' },
                ],
            },
        );

        const { problems } = result[0].packages[0];

        expect(problems.map((problem) => problem.type)).toEqual(['requirement-unsatisfied']);
        expect(problems[0].message).toContain('example_modules просит react ^17.0.0');
    });

    it('should name every party that asked for a package', () => {
        const result = analyzeShareScopes(
            scope([{ name: 'react', versions: [{ version: '18.3.1', loaded: true }] }]),
            {
                react: [
                    { from: 'приложение', requiredVersion: '^18.0.0' },
                    { from: 'example_modules', requiredVersion: '^18.0.0' },
                ],
            },
        );

        expect(result[0].packages[0].requirements.map((item) => item.from)).toEqual([
            'приложение',
            'example_modules',
        ]);
    });

    it('should work without requirements at all', () => {
        // старый загрузчик поля не кладёт
        const result = analyzeShareScopes(
            scope([{ name: 'react', versions: [{ version: '18.3.1', loaded: true }] }]),
        );

        expect(result[0].packages[0].problems).toEqual([]);
    });
});

describe('countShareProblems', () => {
    it('should count nothing in an empty snapshot', () => {
        expect(countShareProblems([])).toBe(0);
    });

    it('should count problems across every scope and package', () => {
        const scopes = analyzeShareScopes([
            {
                name: 'default',
                packages: [
                    {
                        name: 'react',
                        versions: [
                            { version: '17.0.2', loaded: false, singleton: true },
                            { version: '18.3.1', loaded: false, singleton: true },
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
                            { version: '4.17.20', loaded: false },
                            { version: '4.17.21', loaded: false },
                        ],
                    },
                ],
            },
        ]);

        // две у react (версии + мажоры singleton) и одна у lodash
        expect(countShareProblems(scopes)).toBe(3);
    });
});
