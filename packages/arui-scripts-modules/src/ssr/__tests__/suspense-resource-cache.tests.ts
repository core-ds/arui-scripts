import { readSuspenseResource } from '../suspense-resource-cache';

function deferred() {
    let resolve!: (value: unknown) => void;

    const promise = new Promise((res) => {
        resolve = res;
    });

    return { promise, resolve };
}

describe('readSuspenseResource', () => {
    it('throws the pending promise, then returns the value on retry', async () => {
        const cache = new Map();
        const load = jest.fn(() => Promise.resolve('result'));

        expect(() => readSuspenseResource(cache, 'key', load)).toThrow();

        await Promise.resolve();

        expect(readSuspenseResource(cache, 'key', load)).toBe('result');
        expect(load).toHaveBeenCalledTimes(1);
    });

    it('dedupes concurrent reads with the same key into one load', async () => {
        const cache = new Map();
        const { promise, resolve } = deferred();
        const load = jest.fn(() => promise);

        expect(() => readSuspenseResource(cache, 'key', load)).toThrow();
        expect(() => readSuspenseResource(cache, 'key', load)).toThrow();

        resolve('result');
        await promise;

        expect(readSuspenseResource(cache, 'key', load)).toBe('result');
        expect(load).toHaveBeenCalledTimes(1);
    });

    it('throws the load error and removes the entry', async () => {
        const cache = new Map();
        const load = jest.fn(() => Promise.reject(new Error('boom')));

        expect(() => readSuspenseResource(cache, 'key', load)).toThrow();

        await Promise.resolve();

        expect(() => readSuspenseResource(cache, 'key', load)).toThrow('boom');
        expect(cache.size).toBe(0);
    });

    it('evicts the entry on the next microtask after a successful read', async () => {
        const cache = new Map();
        const load = jest.fn(() => Promise.resolve('result'));

        expect(() => readSuspenseResource(cache, 'key', load)).toThrow();

        await Promise.resolve();

        expect(readSuspenseResource(cache, 'key', load)).toBe('result');
        expect(cache.size).toBe(1);

        await Promise.resolve();

        expect(cache.size).toBe(0);
    });

    it('does not share entries between two different caches', async () => {
        const firstCache = new Map();
        const secondCache = new Map();
        const load = jest.fn(() => Promise.resolve('result'));

        expect(() => readSuspenseResource(firstCache, 'key', load)).toThrow();

        await Promise.resolve();

        expect(readSuspenseResource(firstCache, 'key', load)).toBe('result');

        // вторая cache не имеет записи — нужен свой throw → retry цикл
        expect(() => readSuspenseResource(secondCache, 'key', load)).toThrow();

        await Promise.resolve();

        expect(readSuspenseResource(secondCache, 'key', load)).toBe('result');
        expect(load).toHaveBeenCalledTimes(2);
    });
});
