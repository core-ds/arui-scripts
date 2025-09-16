// TODO: remove eslint-disable-next-line
import { tryResolve } from '../../util/resolve';
import { type AppConfigs, type AppContext } from '../types';
import { updateWithPresets } from '../update-with-presets';

jest.mock('../../util/resolve');
const mockedTryResolve = tryResolve as unknown as jest.Mock;

describe('update-with-presets', () => {
    it('should return config as is if "appPackage.aruiScripts.presets" field is not set', () => {
        const baseConfig = { dockerRegistry: 'docker.my-company.com' } as AppConfigs;

        const updatedConfig = updateWithPresets(baseConfig, {
            appPackage: { aruiScripts: {} },
        } as AppContext);

        expect(updatedConfig).toBe(baseConfig);
    });

    it('should add overrides path if preset contain overrides', () => {
        mockedTryResolve.mockImplementation((path: string) => {
            if (path.includes('/arui-scripts.config')) {
                return undefined;
            }

            return path;
        });
        const baseConfig = {
            presets: 'presets',
            dockerRegistry: 'docker.my-company.com',
        } as AppConfigs;
        const context = {
            appPackage: { aruiScripts: { presets: 'presets' } },
            overridesPath: ['package-overrides-path.js'],
        } as AppContext;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const updatedConfig = updateWithPresets(baseConfig, context);

        expect(context.overridesPath).toEqual([
            'presets/arui-scripts.overrides',
            'package-overrides-path.js',
        ]);
    });

    it('should merge config with config from presets', () => {
        jest.doMock(
            'virtual-presets',
            () => ({
                dockerRegistry: 'docker.from-presets.com',
            }),
            { virtual: true },
        );
        mockedTryResolve.mockImplementation((path: string) => {
            if (path.includes('/arui-scripts.config')) {
                return 'virtual-presets';
            }

            return undefined;
        });
        const baseConfig = {
            presets: 'presets',
            dockerRegistry: 'docker.my-company.com',
        } as AppConfigs;
        const context = {
            appPackage: { aruiScripts: { presets: 'presets' } },
        } as AppContext;

        const updatedConfig = updateWithPresets(baseConfig, context);

        expect(updatedConfig.dockerRegistry).toBe('docker.from-presets.com');
    });
});
