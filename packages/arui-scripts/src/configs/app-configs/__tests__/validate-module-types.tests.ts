import { getDefaultAppConfig, getDefaultAppContext } from '../get-defaults';
import { type AppContextWithConfigs } from '../types';
import { validateModuleTypes } from '../validate-module-types';

describe('validateModuleTypes', () => {
    const enabled = (): AppContextWithConfigs => ({
        ...getDefaultAppConfig(),
        ...getDefaultAppContext(),
        version: '1.2.3',
        tsconfig: '/project/tsconfig.json',
        modules: {
            shared: {},
            exposes: { Widget: './src/widget' },
            types: { packageName: '@team/widget-contracts' },
        },
    });

    it('accepts an explicit package name and preserves disabled projects', () => {
        expect(() => validateModuleTypes(enabled())).not.toThrow();
        expect(() => validateModuleTypes({ ...enabled(), modules: null })).not.toThrow();
    });

    it('leaves the application version to the build command', () => {
        expect(() => validateModuleTypes({ ...enabled(), version: 'next' })).not.toThrow();
    });

    it('leaves an explicit package version to the build command', () => {
        const config = enabled();

        if (!config.modules) throw new Error('Expected modules');
        config.modules.types = { packageName: '@team/widget-contracts', version: 'next' };
        expect(() => validateModuleTypes(config)).not.toThrow();
    });

    it.each(['', '../contracts', '@scope', '@Scope/contracts', 'node_modules'])(
        'rejects an invalid npm package name %s',
        (packageName) => {
            const config = enabled();

            if (!config.modules) throw new Error('Expected modules');
            config.modules.types = { packageName };
            expect(() => validateModuleTypes(config)).toThrow('packageName');
        },
    );

    it('requires a TS project and enabled exposes', () => {
        expect(() => validateModuleTypes({ ...enabled(), tsconfig: null })).toThrow(
            'tsconfig.json',
        );
        expect(() => validateModuleTypes({ ...enabled(), disableModulesSupport: true })).toThrow(
            'modules.exposes',
        );
        const config = enabled();

        if (!config.modules) throw new Error('Expected modules');
        config.modules.exposes = {};
        expect(() => validateModuleTypes(config)).toThrow('modules.exposes');
    });
});
