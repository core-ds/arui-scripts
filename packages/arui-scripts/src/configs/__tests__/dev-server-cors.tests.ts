import { configs } from '../app-configs';
import { isDevServerCorsEnabled } from '../dev-server';
import { isModulesProvider } from '../modules';

describe('dev server cors', () => {
    const originalModules = configs.modules;
    const originalCompatModules = configs.compatModules;
    const originalDevServerCors = configs.devServerCors;
    const originalDisableModulesSupport = configs.disableModulesSupport;

    beforeEach(() => {
        configs.modules = null;
        configs.compatModules = null;
        configs.disableModulesSupport = false;
    });

    afterEach(() => {
        configs.modules = originalModules;
        configs.compatModules = originalCompatModules;
        configs.devServerCors = originalDevServerCors;
        configs.disableModulesSupport = originalDisableModulesSupport;
    });

    describe('isModulesProvider', () => {
        it('should be false for an app without exposed modules', () => {
            expect(isModulesProvider()).toBe(false);
        });

        it('should be false when modules section has no exposes', () => {
            configs.modules = { shared: { react: '^18.0.0' } };

            expect(isModulesProvider()).toBe(false);
        });

        it('should be false for an empty exposes', () => {
            configs.modules = { shared: {}, exposes: {} };

            expect(isModulesProvider()).toBe(false);
        });

        it('should be true when default modules are exposed', () => {
            configs.modules = { shared: {}, exposes: { SomeModule: './src/modules/some-module' } };

            expect(isModulesProvider()).toBe(true);
        });

        it('should be true when compat modules are exposed', () => {
            configs.compatModules = {
                exposes: { SomeModule: { entry: './src/modules/some-module' } },
            };

            expect(isModulesProvider()).toBe(true);
        });

        it('should be false when the app opted out of modules support', () => {
            configs.modules = { shared: {}, exposes: { SomeModule: './src/modules/some-module' } };
            configs.disableModulesSupport = true;

            expect(isModulesProvider()).toBe(false);
        });
    });

    describe('isDevServerCorsEnabled', () => {
        it('should respect an explicit true', () => {
            configs.devServerCors = true;

            expect(isDevServerCorsEnabled()).toBe(true);
        });

        it('should respect an explicit false even for a provider', () => {
            configs.devServerCors = false;
            configs.modules = { shared: {}, exposes: { SomeModule: './src/modules/some-module' } };

            expect(isDevServerCorsEnabled()).toBe(false);
        });

        it('should enable cors for a provider in auto mode', () => {
            configs.devServerCors = 'auto';
            configs.modules = { shared: {}, exposes: { SomeModule: './src/modules/some-module' } };

            expect(isDevServerCorsEnabled()).toBe(true);
        });

        it('should not enable cors for a non-provider in auto mode', () => {
            configs.devServerCors = 'auto';

            expect(isDevServerCorsEnabled()).toBe(false);
        });
    });

    describe('dev server config', () => {
        /**
         * devServerConfig вычисляется на импорте модуля, поэтому его нужно перечитать в изоляции.
         * isolateModules перечитывает и app-configs, так что мутации `configs` до него не доедут -
         * конфигурацию приходится подменять моком.
         */
        function buildDevServerConfig(configOverrides: Partial<typeof configs>) {
            let result: unknown;

            jest.isolateModules(() => {
                jest.doMock('../app-configs', () => ({
                    configs: { ...configs, ...configOverrides },
                }));
                // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
                result = require('../dev-server').devServerConfig;
            });
            jest.dontMock('../app-configs');

            return result as { headers: Record<string, string> };
        }

        it('should send cors headers for a provider in auto mode', () => {
            const devServerConfig = buildDevServerConfig({
                devServerCors: 'auto',
                modules: { shared: {}, exposes: { SomeModule: './src/modules/some-module' } },
            });

            expect(devServerConfig.headers).toMatchObject({
                'Access-Control-Allow-Origin': '*',
            });
        });

        it('should not send cors headers for a non-provider in auto mode', () => {
            const devServerConfig = buildDevServerConfig({
                devServerCors: 'auto',
                modules: null,
                compatModules: null,
            });

            expect(devServerConfig.headers).toEqual({});
        });
    });
});
