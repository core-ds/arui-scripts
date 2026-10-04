import { rspack } from '@rspack/core';

import build from '../../build/build-wrapper';

jest.mock('../../../configs/persistent-cache', () => ({ acquireCompilerCaches: () => [] }));

jest.mock('@rspack/core', () => ({ rspack: jest.fn() }));

it('waits for cache flush before reporting success', async () => {
    let finishClose: (error?: Error) => void = () => {};
    const stats = { toJson: () => ({ errors: [], warnings: [] }) };
    const close = jest.fn((callback) => {
        finishClose = callback;
    });

    (rspack as unknown as jest.Mock).mockReturnValue({
        run: (callback: (error: Error | null, stats?: unknown) => void) => callback(null, stats),
        close,
    });
    let settled = false;
    const result = build({}).then(() => {
        settled = true;
    });

    await Promise.resolve();
    expect(close).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);
    finishClose();
    await result;
    expect(settled).toBe(true);
});

it('closes after a compiler error and preserves it', async () => {
    const error = new Error('build failed');
    const close = jest.fn((callback) => callback(new Error('close failed')));

    (rspack as unknown as jest.Mock).mockReturnValue({
        run: (callback: (error: Error | null, stats?: unknown) => void) => callback(error),
        close,
    });
    await expect(build({})).rejects.toBe(error);
    expect(close).toHaveBeenCalledTimes(1);
});

it('fails when flushing the compiler fails', async () => {
    const error = new Error('flush failed');

    (rspack as unknown as jest.Mock).mockReturnValue({
        run: (callback: (error: Error | null, stats?: unknown) => void) =>
            callback(null, { toJson: () => ({}) }),
        close: (callback: (error?: Error) => void) => callback(error),
    });
    await expect(build({})).rejects.toBe(error);
});
