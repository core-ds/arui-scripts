import { type Chunk, type Compiler, type OptimizationSplitChunksCacheGroup } from '@rspack/core';

import { TurnOffSplitRemoteEntry } from '../turn-off-split-remote-entry';

describe('remote entry chunk isolation', () => {
    function patch(splitChunks: unknown) {
        new TurnOffSplitRemoteEntry('remote').apply({
            options: { optimization: { splitChunks } },
        } as Compiler);
    }
    const chunk = (name: string | undefined, initial = false) =>
        ({ name, isOnlyInitial: () => initial } as Chunk);

    test.each([false, undefined, { chunks: 'async' }, {}])(
        'leaves inactive splitting unchanged: %j',
        (setting) => {
            const before = JSON.stringify(setting);

            patch(setting);
            expect(JSON.stringify(setting)).toBe(before);
        },
    );
    test.each(['all', 'initial'] as const)(
        'excludes remote entry from %s chunks and cache groups',
        (mode) => {
            const setting = {
                chunks: mode,
                cacheGroups: {
                    vendor: { chunks: mode },
                    disabled: false,
                    pattern: /vendor/,
                    inherited: {},
                },
            };

            patch(setting);
            const select = setting.chunks as unknown as (chunk: Chunk) => boolean;
            const vendor = setting.cacheGroups.vendor.chunks as unknown as (
                chunk: Chunk,
            ) => boolean;

            expect(select(chunk('remote', true))).toBe(false);
            expect(vendor(chunk('remote', true))).toBe(false);
            expect(select(chunk('main', true))).toBe(true);
            expect(select(chunk(undefined))).toBe(mode === 'all');
        },
    );
    test('preserves custom selection for other chunks', () => {
        const original = jest.fn((item: Chunk) => item.name === 'vendor');
        const setting: OptimizationSplitChunksCacheGroup = { chunks: original };

        patch(setting);
        const select = setting.chunks as (chunk: Chunk) => boolean;

        expect(select(chunk('remote'))).toBe(false);
        expect(original).not.toHaveBeenCalled();
        expect(select(chunk('vendor'))).toBe(true);
        expect(select(chunk('main'))).toBe(false);
    });
});
