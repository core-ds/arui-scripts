jest.mock('../../app-configs', () => ({
    configs: {
        cwd: process.cwd(),
    },
}));

// eslint-disable-next-line import/first
import { browserslistToSwcTargets, resolveSwcTargets } from '../swc-targets';

describe('browserslistToSwcTargets', () => {
    it('maps browserslist names to swc keys and keeps the lowest version per browser', () => {
        expect(
            browserslistToSwcTargets([
                'chrome 151',
                'chrome 150',
                'and_chr 151',
                'firefox 154',
                'and_ff 153',
                'ios_saf 26.6',
                'ios_saf 14.0-14.4',
                'op_mob 80',
                'samsung 30',
                'android 151',
                'node 22.14.0',
            ]),
        ).toEqual({
            chrome: '150',
            firefox: '153',
            ios: '14.0',
            opera_mobile: '80',
            samsung: '30',
            android: '151',
            node: '22.14.0',
        });
    });

    it('skips browsers unknown to swc and non-numeric versions', () => {
        expect(
            browserslistToSwcTargets([
                'op_mini all',
                'kaios 2.5',
                'and_uc 15.5',
                'and_qq 14.9',
                'safari TP',
                'safari 26.5',
            ]),
        ).toEqual({ safari: '26.5' });
    });

    it('compares versions numerically', () => {
        expect(browserslistToSwcTargets(['chrome 100', 'chrome 99', 'chrome 9'])).toEqual({
            chrome: '9',
        });
        expect(browserslistToSwcTargets(['ios_saf 14.5-14.8', 'ios_saf 14.0-14.4'])).toEqual({
            ios: '14.0',
        });
    });
});

describe('resolveSwcTargets', () => {
    it('resolves browserslist queries with the js browserslist', () => {
        expect(resolveSwcTargets(['chrome 150', 'iOS >= 14'])).toEqual({
            chrome: '150',
            ios: '14.0',
        });
    });

    it('does not turn "Android >= 6" into the legacy android browser', () => {
        const { android } = resolveSwcTargets(['Android >= 6']);

        expect(Number(android)).toBeGreaterThanOrEqual(100);
    });

    it('resolves node queries', () => {
        expect(resolveSwcTargets(['current node'])).toEqual({ node: process.versions.node });
    });
});
