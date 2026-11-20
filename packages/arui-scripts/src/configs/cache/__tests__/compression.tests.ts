import fs from 'fs';
import os from 'os';
import path from 'path';

import { CompressionCache } from '../compression';

let directory: string;
const input = Buffer.from('input bytes');
const compressed = Buffer.from('compressed bytes');
const entries = () =>
    fs
        .readdirSync(directory, { recursive: true, encoding: 'utf8' })
        .filter((name) => name.endsWith('.bin'))
        .map((name) => path.join(directory, name));

beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-compression-cache-'));
});
afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

it('reuses bytes in a fresh instance without running the compressor', async () => {
    const compress = jest.fn(async () => compressed);
    const cold = new CompressionCache({ directory, version: 'v1' });

    expect(await cold.get(input, 'gzip:level9', compress)).toEqual(compressed);
    const warm = new CompressionCache({ directory, version: 'v1' });

    expect(await warm.get(input, 'gzip:level9', compress)).toEqual(compressed);
    expect(compress).toHaveBeenCalledTimes(1);
    expect(warm.stats).toEqual({ hits: 1, misses: 0, writes: 0 });
});

it('invalidates changed input, algorithm/options, dictionary and implementation version', async () => {
    const compress = jest.fn(async () => compressed);
    const cache = new CompressionCache({ directory, version: 'v1' });

    await cache.get(input, 'gzip:level9', compress);
    await cache.get(Buffer.from('changed input'), 'gzip:level9', compress);
    await cache.get(input, 'gzip:level1', compress);
    await cache.get(input, 'brotli:quality11', compress);
    await cache.get(input, 'dcb:dictionary-a', compress);
    await cache.get(input, 'dcb:dictionary-b', compress);
    await new CompressionCache({ directory, version: 'v2' }).get(input, 'gzip:level9', compress);
    expect(compress).toHaveBeenCalledTimes(7);
});

it('coalesces concurrent requests for identical input', async () => {
    const cache = new CompressionCache({ directory, version: 'v1' });
    const compress = jest.fn(async () => compressed);

    await Promise.all(Array.from({ length: 10 }, () => cache.get(input, 'gzip', compress)));
    expect(compress).toHaveBeenCalledTimes(1);
    expect(entries()).toHaveLength(1);
});

it('detects corruption and regenerates the record', async () => {
    const compress = jest.fn(async () => compressed);
    const warn = jest.fn();

    await new CompressionCache({ directory, version: 'v1' }).get(input, 'gzip', compress);
    const [file] = entries();
    const record = fs.readFileSync(file);

    record[record.length - 1] = (record[record.length - 1] + 1) % 256;
    fs.writeFileSync(file, record);
    expect(
        await new CompressionCache({ directory, version: 'v1', warn }).get(input, 'gzip', compress),
    ).toEqual(compressed);
    expect(compress).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(1);
    await new CompressionCache({ directory, version: 'v1' }).get(input, 'gzip', compress);
    expect(compress).toHaveBeenCalledTimes(2);
});

it('refuses a valid record stored under another input key', async () => {
    const compress = jest.fn(async () => compressed);
    const cache = new CompressionCache({ directory, version: 'v1' });

    await cache.get(input, 'gzip', compress);
    const [first] = entries();

    await cache.get(input, 'brotli', compress);
    const second = entries().find((file) => file !== first)!;

    fs.copyFileSync(first, second);
    await new CompressionCache({ directory, version: 'v1' }).get(input, 'brotli', compress);
    expect(compress).toHaveBeenCalledTimes(3);
});

it('reads existing bytes and computes misses without writing in readonly mode', async () => {
    const compress = jest.fn(async () => compressed);

    await new CompressionCache({ directory, version: 'v1' }).get(input, 'gzip', compress);
    const readonly = new CompressionCache({ directory, version: 'v1', readonly: true });

    await readonly.get(input, 'gzip', compress);
    await readonly.get(input, 'brotli', compress);
    expect(readonly.stats).toEqual({ hits: 1, misses: 1, writes: 0 });
    expect(entries()).toHaveLength(1);
});

it('continues compressing when cache storage is unavailable', async () => {
    const file = path.join(directory, 'not-a-directory');

    fs.writeFileSync(file, 'keep');
    const warn = jest.fn();
    const cache = new CompressionCache({ directory: file, version: 'v1', warn });

    expect(await cache.get(input, 'gzip', async () => compressed)).toEqual(compressed);
    expect(fs.readFileSync(file, 'utf8')).toBe('keep');
    expect(warn).toHaveBeenCalledTimes(1);
});

it('does not cache compressor errors and retries the next request', async () => {
    const cache = new CompressionCache({ directory, version: 'v1' });
    const compress = jest
        .fn()
        .mockRejectedValueOnce(new Error('compression failed'))
        .mockResolvedValue(compressed);

    await expect(cache.get(input, 'gzip', compress)).rejects.toThrow('compression failed');
    expect(await cache.get(input, 'gzip', compress)).toEqual(compressed);
    expect(compress).toHaveBeenCalledTimes(2);
});

it('removes obsolete entries after seven days', async () => {
    const compress = jest.fn(async () => compressed);

    await new CompressionCache({ directory, version: 'v1' }).get(input, 'gzip', compress);
    const old = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

    entries().forEach((file) => fs.utimesSync(file, old, old));
    await new CompressionCache({ directory, version: 'v1' }).get(input, 'gzip', compress);
    expect(compress).toHaveBeenCalledTimes(2);
});
