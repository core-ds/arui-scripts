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
const tscConfig: Config = { ...swcConfig, codeLoader: 'tsc', jestCodeTransformer: 'tsc' };

describe('assert-typescript-support', () => {
    describe('assertTypescriptSupport', () => {
        it('should not throw for swc and babel on typescript 7', () => {
            const babelConfig: Config = {
                ...swcConfig,
                codeLoader: 'babel',
                jestCodeTransformer: 'babel',
            };

            expect(() => assertTypescriptSupport(swcConfig, '7.0.2')).not.toThrow();
            expect(() => assertTypescriptSupport(babelConfig, '7.0.2')).not.toThrow();
        });

        it.each(['5.9.3', '6.0.2', '6.0.0-beta'])(
            'should not throw for tsc loaders on typescript %s',
            (version) => {
                expect(() => assertTypescriptSupport(tscConfig, version)).not.toThrow();
            },
        );

        it.each(['7.0.2', '7.0.1-rc', '7.1.0-dev.20260928.1', '8.0.0'])(
            'should throw for codeLoader tsc on typescript %s',
            (version) => {
                const config: Config = { ...swcConfig, codeLoader: 'tsc' };

                expect(() => assertTypescriptSupport(config, version)).toThrow(
                    `Настройка \`codeLoader: "tsc"\` не работает с TypeScript ${version}`,
                );
            },
        );

        it('should throw for jestCodeTransformer tsc on typescript 7', () => {
            const config: Config = { ...swcConfig, jestCodeTransformer: 'tsc' };

            expect(() => assertTypescriptSupport(config, '7.0.2')).toThrow(
                'Настройка `jestCodeTransformer: "tsc"` не работает с TypeScript 7.0.2',
            );
        });

        it('should suggest alternatives in the message', () => {
            expect(() => assertTypescriptSupport(tscConfig, '7.0.2')).toThrow(
                'Используйте `codeLoader: "swc"` или `"babel"`, либо оставайтесь на TypeScript 6',
            );
            expect(() => assertTypescriptSupport(tscConfig, '7.0.2')).toThrow(
                'Используйте `jestCodeTransformer: "swc"` или `"babel"`, либо оставайтесь на TypeScript 6',
            );
        });

        it('should report both settings at once', () => {
            expect(() => assertTypescriptSupport(tscConfig, '7.0.2')).toThrow(
                /codeLoader: "tsc"[\s\S]*jestCodeTransformer: "tsc"/,
            );
        });

        it('should not throw for codeLoader tsc without tsconfig, as ts-loader is not used then', () => {
            const config: Config = { ...swcConfig, codeLoader: 'tsc', tsconfig: null };

            expect(() => assertTypescriptSupport(config, '7.0.2')).not.toThrow();
        });

        it('should throw for jestCodeTransformer tsc even without tsconfig', () => {
            const config: Config = { ...swcConfig, jestCodeTransformer: 'tsc', tsconfig: null };

            expect(() => assertTypescriptSupport(config, '7.0.2')).toThrow('jestCodeTransformer');
        });

        it('should not throw when typescript is not installed', () => {
            expect(() => assertTypescriptSupport(tscConfig, null)).not.toThrow();
        });
    });

    describe('getInstalledTypescriptVersion', () => {
        it('should return the version of the installed typescript', () => {
            expect(getInstalledTypescriptVersion()).toMatch(/^\d+\.\d+\.\d+/);
        });
    });
});
