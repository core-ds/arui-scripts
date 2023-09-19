import { AppConfigs } from '../types';
import { updateWithEnv } from '../update-with-env';

describe('update-with-env', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('should return unmodified config if env `ARUI_SCRIPTS_CONFIG` is not set', () => {
        process.env.ARUI_SCRIPTS_CONFIG = undefined;
        const baseConfig = { dockerRegistry: 'docker.my-company.com' } as AppConfigs;

        const updatedConfig = updateWithEnv(baseConfig);

        expect(baseConfig).toEqual(updatedConfig);
    });

    it('should throw an error if env `ARUI_SCRIPTS_CONFIG` contains not valid JSON', () => {
        process.env.ARUI_SCRIPTS_CONFIG = 'not a valid json';
        const baseConfig = { dockerRegistry: 'docker.my-company.com' } as AppConfigs;

        expect(() => {
            updateWithEnv(baseConfig);
        }).toThrowError();
    });

    it('should update config keys with values from env', () => {
        process.env.ARUI_SCRIPTS_CONFIG = JSON.stringify({
            dockerRegistry: 'docker.other-company.com',
        });
        const baseConfig = { dockerRegistry: 'docker.my-company.com' } as AppConfigs;

        const updatedConfig = updateWithEnv(baseConfig);

        expect(updatedConfig.dockerRegistry).toEqual('docker.other-company.com');
    });
});
