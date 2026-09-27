import { type Assets } from 'assets-webpack-plugin';

import { configs } from '../app-configs';
import { modulesCssManifest } from '../modules-css-manifest';
import { processAssetsPluginOutput } from '../process-assets-plugin-output';

jest.mock('../app-configs', () => ({
    configs: {
        publicPath: '/assets/',
        name: 'app',
        normalizedName: 'company_app',
        version: '1.2.3',
        modules: { exposes: {} },
        compatModules: { exposes: {} },
    },
}));
jest.mock('../modules', () => ({ MODULES_ENTRY_NAME: 'remoteEntry.js' }));

describe('application assets manifest', () => {
    beforeEach(() => {
        configs.modules = { shared: {}, exposes: {} };
        configs.compatModules = { exposes: {} };
        modulesCssManifest.clear();
    });

    test('replaces only leading auto/ in strings and arrays, and adds release metadata', () => {
        const result = JSON.parse(
            processAssetsPluginOutput({
                main: { js: ['auto/main.js', '/cdn/auto/vendor.js'], css: 'auto/main.css' },
                other: { js: '/external/file.js' },
            } as unknown as Assets),
        );

        expect(result).toEqual({
            main: { js: ['/assets/main.js', '/cdn/auto/vendor.js'], css: '/assets/main.css' },
            other: { js: '/external/file.js' },
            __metadata__: { name: 'company_app', version: '1.2.3' },
        });
    });
    test('adds per-module CSS chunks without assigning CSS from another module', () => {
        configs.modules = { shared: {}, exposes: { card: 'card.ts', plain: 'plain.ts' } };
        modulesCssManifest.set('card', ['card.css', 'shared.css']);
        const result = JSON.parse(processAssetsPluginOutput({}));

        expect(result.card).toEqual({
            mode: 'default',
            js: '/assets/remoteEntry.js',
            css: ['/assets/card.css', '/assets/shared.css'],
        });
        expect(result.plain).toEqual({ mode: 'default', js: '/assets/remoteEntry.js' });
    });
    test('rejects conflicting module names', () => {
        configs.modules = { shared: {}, exposes: { card: 'card.ts' } };
        configs.compatModules = { exposes: { card: { entry: 'compat.ts' } } };
        expect(() => processAssetsPluginOutput({})).toThrow(
            'card определен как module и как compat',
        );
    });
});
