import {
    assertTypescriptSupport,
    getInstalledTypescriptVersion,
} from '../assert-typescript-support';

type Config = Parameters<typeof assertTypescriptSupport>[0];

const swcConfig: Config = {
    codeLoader: 'swc',
    jestCodeTransformer: 'swc',
    tsconfig: '/app/tsconfig.json',
};

describe('assert-typescript-support', () => {
    it.each(['swc', 'babel'] as const)('supports %s on TypeScript 7', (transformer) => {
        expect(() =>
            assertTypescriptSupport(
                { ...swcConfig, codeLoader: transformer, jestCodeTransformer: transformer },
                '7.0.2',
            ),
        ).not.toThrow();
    });

    it.each(['5.9.3', '6.0.2', '8.0.0', 'invalid', null])(
        'rejects unsupported or missing TypeScript %s',
        (version) => {
            expect(() => assertTypescriptSupport(swcConfig, version)).toThrow('TypeScript 7');
        },
    );

    it.each(['codeLoader', 'jestCodeTransformer'] as const)(
        'rejects removed %s tsc in an existing JSON config',
        (setting) => {
            const config = JSON.parse(JSON.stringify({ ...swcConfig, [setting]: 'tsc' }));

            expect(() => assertTypescriptSupport(config, '7.0.2')).toThrow(
                `Настройка \`${setting}: "tsc"\` удалена`,
            );
            expect(() => assertTypescriptSupport(config, '7.0.2')).toThrow('"swc" или "babel"');
        },
    );

    it('rejects removed tsc mode even for JavaScript projects', () => {
        const config = JSON.parse(
            '{"codeLoader":"tsc","jestCodeTransformer":"swc","tsconfig":null}',
        );

        expect(() => assertTypescriptSupport(config, '7.0.2')).toThrow('codeLoader');
    });

    it('resolves the installed native TypeScript 7', () => {
        expect(getInstalledTypescriptVersion()).toMatch(/^7\./);
    });
});
