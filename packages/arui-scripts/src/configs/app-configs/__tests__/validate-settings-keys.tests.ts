import { validateSettingsKeys } from '../validate-settings-keys';

describe('validate-settings-keys', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('warns once about an unknown setting key', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

        validateSettingsKeys({ clientServerPort: 9000, unknownOption: true });

        expect(warn).toHaveBeenCalledTimes(1);
    });

    it('does not warn about known keys', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

        validateSettingsKeys({ clientServerPort: 9000, debug: true });

        expect(warn).not.toHaveBeenCalled();
    });
});
