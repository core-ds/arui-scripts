// eslint-disable-next-line import/no-extraneous-dependencies -- Same transitive browserslist used by the implementation.
import { loadConfig } from 'browserslist';

import { loadBrowserslist } from '../load-browserslist';

jest.mock('browserslist', () => ({ loadConfig: jest.fn() }));
jest.mock('../../../configs/app-configs', () => ({ configs: { cwd: '/project' } }));
jest.mock('../../../configs/supporting-browsers', () => ({
    supportingBrowsers: ['last 2 Chrome versions', 'Firefox ESR'],
}));

describe('browser targets fallback', () => {
    const oldEnv = process.env;

    beforeEach(() => {
        process.env = { ...oldEnv };
        delete process.env.BROWSERSLIST;
    });
    afterEach(() => {
        process.env = oldEnv;
        jest.clearAllMocks();
    });
    test('respects the project browserslist', () => {
        jest.mocked(loadConfig).mockReturnValue(['last 1 Chrome version']);
        loadBrowserslist();
        expect(loadConfig).toHaveBeenCalledWith({ path: '/project' });
        expect(process.env.BROWSERSLIST).toBeUndefined();
    });
    test('sets defaults when the project has no browser targets', () => {
        jest.mocked(loadConfig).mockReturnValue(undefined);
        loadBrowserslist();
        expect(process.env.BROWSERSLIST).toBe('last 2 Chrome versions,Firefox ESR');
    });
    test('does not overwrite an explicit environment override', () => {
        jest.mocked(loadConfig).mockReturnValue(undefined);
        process.env.BROWSERSLIST = 'node 22';
        loadBrowserslist();
        expect(process.env.BROWSERSLIST).toBe('node 22');
    });
});
