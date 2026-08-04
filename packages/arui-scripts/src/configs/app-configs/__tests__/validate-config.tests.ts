import { type AppContextWithConfigs, DEVTOOLS_MODES, type DevtoolsMode } from '../types';
import { validateConfig } from '../validate-config';

function createConfig(overrides: Partial<AppContextWithConfigs> = {}) {
    return {
        experimentalReactCompiler: 'disabled',
        codeLoader: 'swc',
        devtools: 'dev',
        ...overrides,
    } as AppContextWithConfigs;
}

describe('validateConfig', () => {
    describe('devtools', () => {
        it.each(DEVTOOLS_MODES)('пропускает допустимый режим %s', (mode) => {
            expect(() => validateConfig(createConfig({ devtools: mode }))).not.toThrow();
        });

        // `devtools` - единственное, что стоит между незнакомым значением и прод-бандлом
        // с кодом панели, поэтому проверяем весь набор способов промахнуться
        it.each([
            ['true', true],
            ['null', null],
            ['undefined', undefined],
            ['строка в другом регистре', 'DEV'],
            ['незнакомый режим', 'stand'],
            ['объект', {}],
            ['пустая строка', ''],
        ])('отвергает %s', (_name, value) => {
            expect(() => validateConfig(createConfig({ devtools: value as DevtoolsMode }))).toThrow(
                /devtools/,
            );
        });

        it('показывает в ошибке и полученное значение, и список допустимых', () => {
            expect(() =>
                validateConfig(createConfig({ devtools: 'stand' as DevtoolsMode })),
            ).toThrow(/"stand"[\s\S]*"dev", "always", "off"/);
        });
    });

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
