import { AppConfigs } from '../../app-configs/types';
import { getPolyfills } from '../get-polyfills';

describe('getPolyfills', () => {
    it('should return array when original config contain string as polyfills entry', () => {
        const appConfig: Partial<AppConfigs> = {
            clientPolyfillsEntry: 'custom-polyfills',
        };

        const polyfills = getPolyfills(appConfig as AppConfigs);

        expect(polyfills).toMatchObject(['custom-polyfills']);
    });

    it('should return array when original config contains multiple polyfills entry', () => {
        const appConfig: Partial<AppConfigs> = {
            clientPolyfillsEntry: ['custom1', 'custom2'],
        };

        const polyfills = getPolyfills(appConfig as AppConfigs);

        expect(polyfills).toMatchObject(['custom1', 'custom2']);
    });

    it('should return empty array when original config is empty', () => {
        const appConfig: Partial<AppConfigs> = {
            clientPolyfillsEntry: null,
        };

        const polyfills = getPolyfills(appConfig as AppConfigs);

        expect(polyfills).toMatchObject([]);
    });

    it('should not add feather polyfills when original config has any polyfills', () => {
        const appConfig: Partial<AppConfigs> = {
            clientPolyfillsEntry: [],
        };
        const requireResolve = jest.fn(() => 'feather-polyfills-path');

        const polyfills = getPolyfills(
            appConfig as AppConfigs,
            requireResolve as unknown as typeof require.resolve,
        );

        expect(polyfills).toMatchObject([]);
        expect(requireResolve).not.toHaveBeenCalled();
    });
});
