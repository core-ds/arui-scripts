import { getEntry } from '../get-entry';

describe('entry point normalization', () => {
    const withRuntime = (entries: string[], runtime: string) => [runtime, ...entries];

    test.each(['src/index.ts', ['src/index.ts', 'src/polyfills.ts']])(
        'normalizes %j and forwards extra arguments',
        (entry) => {
            const expected = typeof entry === 'string' ? [entry] : entry;

            expect(getEntry(entry, withRuntime, 'runtime')).toEqual(['runtime', ...expected]);
        },
    );

    test('adds runtime to each named entry without changing the input', () => {
        const entries = { main: 'main.ts', admin: ['polyfills.ts', 'admin.ts'] };

        expect(getEntry(entries, withRuntime, 'runtime')).toEqual({
            main: ['runtime', 'main.ts'],
            admin: ['runtime', 'polyfills.ts', 'admin.ts'],
        });
        expect(entries).toEqual({ main: 'main.ts', admin: ['polyfills.ts', 'admin.ts'] });
    });

    test('handles no named entries without calling the transformer', () => {
        const transform = jest.fn();

        expect(getEntry({}, transform)).toEqual({});
        expect(transform).not.toHaveBeenCalled();
    });

    test('propagates transformer errors', () => {
        expect(() =>
            getEntry('entry', () => {
                throw new Error('bad entry');
            }),
        ).toThrow('bad entry');
    });
});
