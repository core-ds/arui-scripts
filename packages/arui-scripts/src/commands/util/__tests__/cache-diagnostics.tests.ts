import { type Compiler, type Configuration } from '@rspack/core';

import { describeCompilerCaches } from '../../../configs/persistent-cache';
import { getCompressionCache } from '../../../plugins/compression-cache';
import { attachCacheDiagnostics, summarizeNativeCache } from '../cache-diagnostics';

jest.mock('../../../configs/persistent-cache', () => ({ describeCompilerCaches: jest.fn() }));
jest.mock('../../../plugins/compression-cache', () => ({ getCompressionCache: jest.fn() }));

const unchanged = 'snapshot restored with no changed dependencies';
const readSnapshot = 'read snapshot from persistent cache: 0.3 ms';

it.each([
    [['make persistent cache recovery succeeded'], 'unknown', 'no-native-evidence'],
    [[unchanged], 'hit', 'snapshot-unchanged'],
    [[readSnapshot], 'cold', 'no-restored-snapshot'],
    [
        ['snapshot restored with detected changed dependencies: secret file'],
        'invalidated',
        'dependencies-changed',
    ],
    [['persistent cache version does not match'], 'invalidated', 'version-changed'],
    [['build dependencies are invalid'], 'invalidated', 'build-dependencies-changed'],
    [['meta persistent cache recovery failed: secret error'], 'unavailable', 'native-cache-error'],
])(
    'classifies native evidence without treating generic recovery as a hit: %j',
    (messages, snapshot, reason) => {
        expect(summarizeNativeCache(messages as string[])).toMatchObject({ snapshot, reason });
    },
);

it('preserves error evidence even when part of the cache recovered', () => {
    expect(
        summarizeNativeCache([
            unchanged,
            'source map persistent cache decode failed: secret',
            'build dependencies are valid (42 tracked)',
        ]),
    ).toEqual({
        snapshot: 'hit',
        reason: 'snapshot-unchanged',
        errors: 1,
        trackedBuildDependencies: 42,
    });
});

describe('diagnostic lifecycle', () => {
    const originalFlag = process.env.ARUI_SCRIPTS_CACHE_DEBUG;
    let output: jest.SpyInstance;

    beforeEach(() => {
        process.env.ARUI_SCRIPTS_CACHE_DEBUG = '1';
        output = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.mocked(describeCompilerCaches).mockReturnValue([
            {
                name: 'main',
                mode: 'production',
                policy: 'arui',
                target: 'client',
                namespace: 'client-main-test',
                fingerprint: 'public-hash',
                reason: undefined,
            },
        ]);
        jest.mocked(getCompressionCache).mockReturnValue(undefined);
    });
    afterEach(() => {
        if (originalFlag === undefined) delete process.env.ARUI_SCRIPTS_CACHE_DEBUG;
        else process.env.ARUI_SCRIPTS_CACHE_DEBUG = originalFlag;
        output.mockRestore();
        jest.clearAllMocks();
    });

    function harness() {
        let done: (stats: unknown) => void = () => {};
        let failed: () => void = () => {};
        const compiler = {
            options: {
                cache: {
                    type: 'persistent',
                    version: 'secret-version',
                    storage: { type: 'filesystem', location: '/tmp/cache' },
                },
            },
            hooks: {
                done: {
                    tap: (_name: string, callback: typeof done) => {
                        done = callback;
                    },
                },
                failed: {
                    tap: (_name: string, callback: typeof failed) => {
                        failed = callback;
                    },
                },
            },
        } as unknown as Compiler;
        const stats = {
            toJson: jest.fn(() => ({
                logging: {
                    'rspack.persistentCache': {
                        entries: [{ message: unchanged }, { message: 'secret-native-payload' }],
                    },
                },
            })),
            hasErrors: () => false,
            startTime: 10,
            endTime: 30,
        };
        const close = attachCacheDiagnostics(compiler, {} as Configuration);
        const records = () =>
            output.mock.calls.map(([line]) =>
                JSON.parse(line.slice('[arui-scripts cache] '.length)),
            );

        return { complete: () => done(stats), fail: () => failed(), close, records, stats };
    }

    it('is silent and does not read stats when disabled', () => {
        process.env.ARUI_SCRIPTS_CACHE_DEBUG = '0';
        const fixture = harness();

        fixture.complete();
        expect(fixture.close).toBeUndefined();
        expect(fixture.stats.toJson).not.toHaveBeenCalled();
        expect(describeCompilerCaches).not.toHaveBeenCalled();
        expect(output).not.toHaveBeenCalled();
    });

    it('reports reuse, counters and close without leaking native messages or raw versions', () => {
        jest.mocked(getCompressionCache).mockReturnValue({
            stats: { hits: 7, misses: 0, writes: 0 },
        } as ReturnType<typeof getCompressionCache>);
        const fixture = harness();

        fixture.complete();
        fixture.close?.(undefined, 4);
        fixture.close?.(undefined, 1);
        const records = fixture.records();

        expect(records.map((record) => record.event)).toEqual([
            'configured',
            'compilation',
            'close',
        ]);
        expect(records[0]).toMatchObject({
            cacheType: 'persistent',
            location: '/tmp/cache',
            fingerprint: 'public-hash',
            compression: true,
        });
        expect(records[1]).toMatchObject({
            durationMs: 20,
            native: { snapshot: 'hit' },
            compression: { enabled: true, hits: 7, misses: 0, writes: 0 },
        });
        expect(records[2]).toMatchObject({
            result: 'completed',
            persistence: 'read-write',
            durationMs: 4,
        });
        expect(JSON.stringify(records)).not.toContain('secret');
    });

    it('distinguishes subsequent in-process rebuilds from disk restoration', () => {
        const fixture = harness();

        fixture.complete();
        fixture.complete();
        expect(fixture.records()[2]).toMatchObject({ run: 2, native: { snapshot: 'in-process' } });
        expect(fixture.stats.toJson).toHaveBeenCalledTimes(1);
    });

    it('reports a failed compilation and failed close', () => {
        const fixture = harness();

        fixture.fail();
        fixture.close?.(new Error('secret-error'), 2);
        expect(fixture.records().slice(1)).toMatchObject([
            { event: 'compilation', result: 'failed' },
            { event: 'close', result: 'failed' },
        ]);
        expect(JSON.stringify(fixture.records())).not.toContain('secret');
    });
});
