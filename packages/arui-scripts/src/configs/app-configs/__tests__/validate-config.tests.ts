import { type AppContextWithConfigs } from '../types';
import { validateConfig } from '../validate-config';

function createConfig(overrides: Partial<AppContextWithConfigs> = {}) {
    return {
        experimentalReactCompiler: 'disabled',
        codeLoader: 'swc',
        ...overrides,
    } as AppContextWithConfigs;
}

describe('validateConfig', () => {
    describe('experimentalReactCompiler', () => {
        it('требует codeLoader swc', () => {
            expect(() =>
                validateConfig(
                    createConfig({
                        experimentalReactCompiler: { target: '18' },
                        codeLoader: 'babel',
                    }),
                ),
            ).toThrow(/experimentalReactCompiler/);
        });

        it('пропускает связку с swc', () => {
            expect(() =>
                validateConfig(
                    createConfig({
                        experimentalReactCompiler: { target: '18' },
                        codeLoader: 'swc',
                    }),
                ),
            ).not.toThrow();
        });
    });
});
