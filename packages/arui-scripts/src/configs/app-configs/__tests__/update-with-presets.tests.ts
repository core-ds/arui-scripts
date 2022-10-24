import { AppConfigs } from '../types';
import { updateWithPresets } from '../update-with-presets';
import { tryResolve } from '../../util/resolve';

jest.mock('../../util/resolve');
const mockedTryResolve = (tryResolve as unknown) as jest.Mock<typeof tryResolve>;

describe('update-with-presets', () => {
    it('should return config as is if "appPackage.aruiScripts.presets" field is not set', () => {
        const baseConfig = { dockerRegistry: 'docker.my-company.com', appPackage: {} } as AppConfigs;

        const updatedConfig = updateWithPresets(baseConfig);

        expect(updatedConfig).toBe(baseConfig);
    });

    it('should add overrides path if preset contain overrides', () => {
        mockedTryResolve.mockImplementation((path: string) => {
            if (path.includes('/arui-scripts.config')) {
                return undefined;
            }
            return path as any;
        });
        const baseConfig = {
            dockerRegistry: 'docker.my-company.com',
            overridesPath: ['package-overrides-path.js'],
            appPackage: { aruiScripts: { presets: 'presets' } },
        } as AppConfigs;

        const updatedConfig = updateWithPresets(baseConfig);

        expect(updatedConfig.overridesPath)
            .toEqual(['presets/arui-scripts.overrides', 'package-overrides-path.js']);
    });

    it('should merge config with config from presets', () => {
        jest.doMock('virtual-presets', () => {
            return {
                dockerRegistry: 'docker.from-presets.com',
            };
        }, { virtual: true });
        mockedTryResolve.mockImplementation((path: string) => {
            if (path.includes('/arui-scripts.config')) {
                return 'virtual-presets' as any;
            }
            return undefined;
        });
        const baseConfig = {
            dockerRegistry: 'docker.my-company.com',
            appPackage: { aruiScripts: { presets: 'presets' } },
        } as AppConfigs;

        const updatedConfig = updateWithPresets(baseConfig);

        expect(updatedConfig.dockerRegistry).toBe('docker.from-presets.com');
    });
});
