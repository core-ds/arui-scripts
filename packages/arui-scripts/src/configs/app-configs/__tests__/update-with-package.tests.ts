import { AppConfigs, AppContext } from '../types';
import { updateWithPackage } from '../update-with-package';

describe('update-with-package', () => {
    it('should merge keys from "appPackage.aruiScripts" field into base config', () => {
        const baseConfig = {
            dockerRegistry: 'docker.my-company.com',
        } as AppConfigs;
        const context = {
            appPackage: {
                aruiScripts: {
                    dockerRegistry: 'docker.other-company.com',
                },
            },
        } as AppContext;

        const updatedConfig = updateWithPackage(baseConfig, context);

        expect(updatedConfig.dockerRegistry).toBe('docker.other-company.com');
    });
});
