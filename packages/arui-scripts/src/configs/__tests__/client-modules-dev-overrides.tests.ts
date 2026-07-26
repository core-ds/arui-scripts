import { type Configuration } from '@rspack/core';

import { configs } from '../app-configs';
import { getDevModuleOverrides, MODULE_OVERRIDES_DEFINE_KEY } from '../modules';
import { createClientWebpackConfig } from '../rspack.client';

/**
 * rspack хранит аргументы конструктора плагина в `_args`, а не в `definitions`,
 * как это было в webpack. Публичного способа прочитать определения нет.
 */
function getDefineDefinitions(config: Configuration): Record<string, string> {
    const definePlugin = config.plugins?.find(
        (plugin) => plugin?.constructor.name === 'DefinePlugin',
    ) as unknown as { _args: [Record<string, string>] } | undefined;

    // eslint-disable-next-line no-underscore-dangle -- это внутреннее поле rspack, других вариантов нет
    return definePlugin?._args[0] ?? {};
}

function getMainClientConfig(mode: 'dev' | 'prod') {
    // createClientWebpackConfig возвращает массив только когда сборок несколько
    // (отдельный wmf-билд или compat-модули), иначе - один конфиг
    const clientConfig = createClientWebpackConfig(mode);

    return (
        Array.isArray(clientConfig) ? clientConfig.find((config) => !config.name) : clientConfig
    ) as Configuration;
}

describe('dev module overrides in the client config', () => {
    const originalModules = configs.modules;
    const originalEnvValue = process.env.ARUI_MODULE_OVERRIDES;

    beforeEach(() => {
        delete process.env.ARUI_MODULE_OVERRIDES;
        configs.modules = null;
    });

    afterEach(() => {
        configs.modules = originalModules;
        if (originalEnvValue === undefined) {
            delete process.env.ARUI_MODULE_OVERRIDES;
        } else {
            process.env.ARUI_MODULE_OVERRIDES = originalEnvValue;
        }
    });

    describe('getDevModuleOverrides', () => {
        it('should return an empty object when nothing is configured', () => {
            expect(getDevModuleOverrides()).toEqual({});
        });

        it('should read overrides from the config file', () => {
            configs.modules = { shared: {}, devOverrides: { someModule: 'http://localhost:8081' } };

            expect(getDevModuleOverrides()).toEqual({ someModule: 'http://localhost:8081' });
        });

        it('should let the env variable win over the config file', () => {
            configs.modules = {
                shared: {},
                devOverrides: {
                    someModule: 'http://localhost:8081',
                    otherModule: 'http://localhost:9091',
                },
            };
            process.env.ARUI_MODULE_OVERRIDES = JSON.stringify({
                someModule: 'http://localhost:7071',
            });

            expect(getDevModuleOverrides()).toEqual({
                someModule: 'http://localhost:7071',
                otherModule: 'http://localhost:9091',
            });
        });

        it('should ignore a malformed env variable and warn about it', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

            process.env.ARUI_MODULE_OVERRIDES = 'not a json';

            expect(getDevModuleOverrides()).toEqual({});
            expect(warnSpy).toHaveBeenCalled();

            warnSpy.mockRestore();
        });

        it('should ignore non-string values', () => {
            process.env.ARUI_MODULE_OVERRIDES = JSON.stringify({ someModule: 42 });

            expect(getDevModuleOverrides()).toEqual({});
        });
    });

    describe('DefinePlugin wiring', () => {
        it('should define the overrides in dev mode', () => {
            process.env.ARUI_MODULE_OVERRIDES = JSON.stringify({
                someModule: 'http://localhost:8081',
            });

            const definitions = getDefineDefinitions(getMainClientConfig('dev'));

            // DefinePlugin подставляет значение как код, поэтому в бандле должен оказаться
            // строковый литерал с json внутри
            expect(definitions[MODULE_OVERRIDES_DEFINE_KEY]).toBe(
                JSON.stringify(JSON.stringify({ someModule: 'http://localhost:8081' })),
            );
        });

        it('should define an empty object in dev mode when nothing is configured', () => {
            const definitions = getDefineDefinitions(getMainClientConfig('dev'));

            expect(definitions[MODULE_OVERRIDES_DEFINE_KEY]).toBe(JSON.stringify('{}'));
        });

        it('should not define anything in prod mode', () => {
            process.env.ARUI_MODULE_OVERRIDES = JSON.stringify({
                someModule: 'http://localhost:8081',
            });

            const definitions = getDefineDefinitions(getMainClientConfig('prod'));

            expect(definitions).not.toHaveProperty(MODULE_OVERRIDES_DEFINE_KEY);
        });
    });
});
