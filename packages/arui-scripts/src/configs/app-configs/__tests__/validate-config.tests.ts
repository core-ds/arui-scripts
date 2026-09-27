import { type AppContextWithConfigs } from '../types';
import { validateConfig } from '../validate-config';

describe('React Compiler compatibility', () => {
    test.each(['babel', 'tsc'])('rejects enabled React Compiler with %s', (codeLoader) => {
        expect(() =>
            validateConfig({ codeLoader, experimentalReactCompiler: {} } as AppContextWithConfigs),
        ).toThrow('codeLoader: "swc"');
    });
    test.each(['swc', 'babel', 'tsc'])('accepts disabled React Compiler with %s', (codeLoader) => {
        expect(() =>
            validateConfig({
                codeLoader,
                experimentalReactCompiler: 'disabled',
            } as AppContextWithConfigs),
        ).not.toThrow();
    });
    test('accepts enabled React Compiler with SWC', () => {
        expect(() =>
            validateConfig({
                codeLoader: 'swc',
                experimentalReactCompiler: {},
            } as AppContextWithConfigs),
        ).not.toThrow();
    });
});
