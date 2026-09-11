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

        it('outputs regular errors', () => {
            const error = new Error('Test error');

            printBuildError(error);

            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('shows stack trace when showStack=true', () => {
            const error = new Error('Test error');

            error.stack = 'Error: Test error\n    at test.ts:1:1';

            printBuildError(error, { showStack: true });

            expect(consoleLogSpy).toHaveBeenCalled();
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
