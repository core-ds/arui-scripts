import { type Stats } from '@rspack/core';

import { printAssetsSizes } from '../client-assets-sizes';

jest.mock('../../../configs/app-configs', () => ({
    configs: {
        dictionaryCompression: { dictionaryPath: [] },
    },
}));

describe('printAssetsSizes', () => {
    it('prints gzip and brotli sizes of their own compressed assets', () => {
        const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
        const stats = {
            toJson: () => ({
                assets: [
                    { type: 'asset', name: 'main.abcdef12.js', size: 1000 },
                    { type: 'asset', name: 'main.abcdef12.js.gz', size: 300 },
                    { type: 'asset', name: 'main.abcdef12.js.br', size: 200 },
                ],
            }),
        } as unknown as Stats;

        printAssetsSizes(stats);

        const output = log.mock.calls.map((args) => args.join(' ')).join('\n');

        log.mockRestore();

        expect(output).toContain('1000 B (300 B gzip, 200 B br)');
    });
});
