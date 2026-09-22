/* eslint-disable global-require, @typescript-eslint/no-var-requires */
const HELPERS_PACKAGE = '@swc/helpers';

function loadWithConfigs(configs: { cwd: string; codeLoader: string }) {
    jest.resetModules();
    jest.doMock('../../app-configs', () => ({ configs }));

    return require('../swc-helpers').getSwcHelpersAlias();
}

describe('getSwcHelpersAlias', () => {
    afterEach(() => {
        jest.dontMock('../../app-configs');
    });

    it('aliases helpers to the arui-scripts copy when the project cannot resolve them', () => {
        const alias = loadWithConfigs({ cwd: '/definitely/not/a/project', codeLoader: 'swc' });

        expect(Object.keys(alias)).toEqual([HELPERS_PACKAGE]);
        expect(require.resolve(`${alias[HELPERS_PACKAGE]}/package.json`)).toBe(
            require.resolve(`${HELPERS_PACKAGE}/package.json`),
        );
    });

    it('adds no alias when the project resolves helpers on its own', () => {
        expect(loadWithConfigs({ cwd: process.cwd(), codeLoader: 'swc' })).toEqual({});
    });

    it('adds no alias when swc is not used', () => {
        expect(loadWithConfigs({ cwd: '/definitely/not/a/project', codeLoader: 'babel' })).toEqual(
            {},
        );
    });
});
