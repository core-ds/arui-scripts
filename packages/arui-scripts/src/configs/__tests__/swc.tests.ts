import { getSwcDependenciesOptions, swcClientConfig, swcJestConfig, swcServerConfig } from '../swc';

describe('swc configs', () => {
    it('compiles client code for the supported browsers instead of es5', () => {
        const { targets } = swcClientConfig.env ?? {};

        // iOS >= 14 из дефолтного списка браузеров
        expect(targets).toMatchObject({ ios: '14.0' });
        // `last 2 versions` даёт актуальный android, а не стоковый браузер android 4.x/37
        expect(Number(targets.android)).toBeGreaterThanOrEqual(100);
        expect(targets).not.toHaveProperty('and_chr');
        expect(targets).not.toHaveProperty('op_mob');
    });

    it('compiles server code for the current node', () => {
        expect(swcServerConfig.env?.targets).toEqual({ node: process.versions.node });
    });

    it('uses external helpers only for the client bundle', () => {
        expect(swcClientConfig.jsc?.externalHelpers).toBe(true);
        expect(swcServerConfig.jsc?.externalHelpers).toBeUndefined();
        expect(swcJestConfig.jsc?.externalHelpers).toBeUndefined();
    });

    it('compiles tests for the current node, not for browsers', () => {
        expect(swcJestConfig.env?.targets).toEqual({ node: process.versions.node });
    });
});

describe('swc module detection', () => {
    it('lets swc detect commonjs files instead of treating them as es modules', () => {
        // иначе при externalHelpers swc вставляет import в commonjs-файл и module.exports ломается в рантайме
        expect(swcClientConfig.isModule).toBe('unknown');
        expect(swcServerConfig.isModule).toBe('unknown');
    });
});

describe('getSwcDependenciesOptions', () => {
    it('passes targets, module detection and external helpers to node_modules', () => {
        expect(getSwcDependenciesOptions(swcClientConfig)).toEqual({
            isModule: 'unknown',
            env: swcClientConfig.env,
            jsc: { externalHelpers: true },
        });
    });

    it('omits helpers config when the base config does not use external helpers', () => {
        expect(getSwcDependenciesOptions(swcServerConfig)).toEqual({
            isModule: 'unknown',
            env: swcServerConfig.env,
        });
    });

    it('does not leak the application parser and transforms', () => {
        const options = getSwcDependenciesOptions(swcClientConfig);

        expect(options.jsc?.parser).toBeUndefined();
        expect(options.jsc?.transform).toBeUndefined();
    });
});
