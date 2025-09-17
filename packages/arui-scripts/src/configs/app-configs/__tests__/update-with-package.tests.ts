import { type AppConfigs, type AppContext } from '../types';
import { updateWithPackage } from '../update-with-package';

describe('update-with-package', () => {
    it('should merge keys from "appPackage.aruiScripts" field into base config', () => {
        const baseConfig = {
            dockerRegistry: 'docker.my-company.com',
            compatModules: {
                shared: {
                    react: 'react',
                },
            },
        } as unknown as AppConfigs;
        const context = {
            appPackage: {
                aruiScripts: {
                    dockerRegistry: 'docker.other-company.com',
                    compatModules: {
                        exposes: {
                            example: {
                                entry: 'foo.js',
                            },
                        },
                    },
                },
            },
        } as AppContext;

        const updatedConfig = updateWithPackage(baseConfig, context);

        expect(updatedConfig.dockerRegistry).toBe('docker.other-company.com');
        expect(updatedConfig.compatModules).toEqual({
            shared: {
                react: 'react',
            },
            exposes: {
                example: {
                    entry: 'foo.js',
                },
            },
        });
    });
});
