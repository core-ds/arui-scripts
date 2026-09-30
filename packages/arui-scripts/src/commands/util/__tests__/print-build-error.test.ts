import { printBuildError } from '../print-build-error';

jest.mock('chalk', () => {
    const mock = (text: string) => text;
    const chalkMock = Object.assign(mock, {
        red: (text: string) => text,
        yellow: (text: string) => text,
        cyan: (text: string) => text,
        gray: (text: string) => text,
        green: (text: string) => text,
        bold: { red: (text: string) => text },
    });

    return chalkMock;
});

describe('print-build-error', () => {
    let consoleLogSpy: ReturnType<typeof jest.spyOn>;
    let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('printBuildError', () => {
        it('does nothing for null error', () => {
            printBuildError(null);

            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('does nothing for undefined error', () => {
            printBuildError(undefined);

            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('formats Terser error', () => {
            const error = new Error('Minification error from Terser');

            error.stack =
                'Error: Minification error\n    at (file.js:1:2)[file.js:1,2,3][file.js:1,2]';

            printBuildError(error);

            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it.each(['0', '7'])('prints the Terser file location for column %s', (column) => {
            const error = new Error('Error from Terser');

            error.stack = `Error [bundle.js:12,${column}][details]`;
            printBuildError(error);

            const output = consoleLogSpy.mock.calls.flat().join('\n');

            expect(output).toContain(column === '0' ? 'bundle.js:12\n' : 'bundle.js:12:7');
            expect(output).not.toContain('bundle.js:12:0');
        });

        it.each([true, false])(
            'handles an unrecognized Terser stack with showStack=%s',
            (showStack) => {
                const error = new Error('Error from Terser');

                error.stack = 'Unrecognized minifier stack';
                printBuildError(error, { showStack });

                expect(consoleLogSpy.mock.calls.flat().join('\n')).toContain(
                    'Failed to minify the bundle.',
                );

                if (showStack) {
                    expect(consoleLogSpy).toHaveBeenCalledWith(error.stack);
                } else {
                    expect(consoleLogSpy).not.toHaveBeenCalledWith(error.stack);
                }
            },
        );

        it('preserves diagnostics and can disable suggestions', () => {
            const error = new Error("Cannot find module 'lodash/debounce'\nResolver details");

            printBuildError(error, { showSuggestions: false });

            const output = consoleLogSpy.mock.calls.flat().join('\n');

            expect(output).toContain('Module Error');
            expect(output).toContain('Resolver details');
            expect(output).not.toContain('Suggestions:');
            expect(output).not.toContain('npm install');
        });

        it('outputs regular errors', () => {
            const error = new Error('Test error');

            printBuildError(error);

            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('shows stack trace when showStack=true', () => {
            const error = new Error('Test error');

            error.stack = 'Error: Test error\n    at test.ts:1:1';

            printBuildError(error, { showStack: true });

            expect(consoleLogSpy).toHaveBeenCalledWith(error.stack);
            expect(consoleLogSpy.mock.calls.flat().join('\n')).toContain('Stack trace:');
        });

        it('does not show stack trace by default', () => {
            const error = new Error('Test error');

            error.stack = 'Error: Test error\n    at test.ts:1:1';

            printBuildError(error);

            const output = consoleLogSpy.mock.calls.map((c: unknown[]) => c.join(' ')).join(' ');

            expect(output).not.toContain('Stack trace:');
        });
    });
});
