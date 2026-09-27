import { printBuildError } from '../print-build-error';

jest.mock('chalk', () => ({ yellow: (text: string) => text }));

describe('build error output', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    test.each([null, undefined, new Error('broken build')])(
        'handles missing and ordinary errors: %s',
        (error) => {
            printBuildError(error);
            expect(console.log).toHaveBeenNthCalledWith(1, `${error?.message || error}\n`);
            expect(console.log).toHaveBeenLastCalledWith();
        },
    );
    test.each([
        ['0', 'app.js:12'],
        ['5', 'app.js:12:5'],
    ])('formats Terser locations with column %s', (column, expected) => {
        const error = new Error('from Terser');

        error.stack = `Error [app.js:12,${column}][details]`;
        printBuildError(error);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining(expected));
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('https://cra.link/failed-to-minify'),
        );
    });
    test('retains the original error if a minifier stack cannot be parsed', () => {
        const error = new Error('from Terser');

        error.stack = 'unexpected stack';
        printBuildError(error);
        expect(console.log).toHaveBeenCalledWith('Failed to minify the bundle.', error);
    });
});
