import { readResourceTiming } from '../utils/resource-timing';

describe('resource-timing', () => {
    const originalGetEntriesByName = performance.getEntriesByName;

    afterEach(() => {
        performance.getEntriesByName = originalGetEntriesByName;
    });

    function mockEntries(entries: unknown[]) {
        performance.getEntriesByName = jest
            .fn()
            .mockReturnValue(entries) as unknown as typeof performance.getEntriesByName;
    }

    it('should return undefined when there is no entry', () => {
        mockEntries([]);

        expect(readResourceTiming('https://cdn.test/module.js')).toBeUndefined();
    });

    it('should return the last entry for a repeated load', () => {
        mockEntries([
            { duration: 10, transferSize: 100 },
            { duration: 25, transferSize: 200 },
        ]);

        expect(readResourceTiming('https://cdn.test/module.js')).toEqual({
            duration: 25,
            transferSize: 200,
        });
    });

    it('should not report a zero transfer size as a real one', () => {
        // браузер зануляет transferSize для кросс-доменных ресурсов без Timing-Allow-Origin,
        // и «0 КБ» в панели было бы враньём
        mockEntries([{ duration: 42, transferSize: 0 }]);

        expect(readResourceTiming('https://cdn.test/module.js')).toEqual({
            duration: 42,
            transferSize: undefined,
        });
    });

    it('should survive a throwing performance api', () => {
        performance.getEntriesByName = jest.fn(() => {
            throw new Error('nope');
        }) as unknown as typeof performance.getEntriesByName;

        expect(readResourceTiming('https://cdn.test/module.js')).toBeUndefined();
    });
});
