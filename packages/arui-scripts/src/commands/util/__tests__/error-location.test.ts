import { extractErrorMessage, extractLocation } from '../error-location';

describe('error-location', () => {
    describe('extractLocation', () => {
        it('extracts location from stack trace', () => {
            const error = {
                message: 'Error',
                stack: 'Error at Object.<anonymous> (/path/to/file.js:10:5)',
            };

            const result = extractLocation(error);

            expect(result).toEqual({
                file: '/path/to/file.js',
                line: 10,
                column: 5,
            });
        });

        it('extracts location from rspack message', () => {
            const error = {
                message: '/path/to/file.ts:25:10 some error message',
            };

            const result = extractLocation(error);

            expect(result).toEqual({
                file: '/path/to/file.ts',
                line: 25,
                column: 10,
            });
        });

        it('uses error.loc if available', () => {
            const error = {
                message: 'Error',
                loc: '10:15-20',
                moduleName: '/path/to/Component.tsx',
            };

            const result = extractLocation(error);

            expect(result).toEqual({
                file: '/path/to/Component.tsx',
                line: 10,
                column: 15,
            });
        });

        it('parses multiline loc "startLine:startCol-endLine:endCol"', () => {
            const error = {
                message: 'Error',
                loc: '5:10-6:2',
                moduleName: './src/App.tsx',
            };

            const result = extractLocation(error);

            expect(result).toEqual({
                file: './src/App.tsx',
                line: 5,
                column: 10,
            });
        });

        it('parses line-range loc "5-10" without columns', () => {
            const error = {
                message: 'Error',
                loc: '5-10',
                moduleName: './src/App.tsx',
            };

            const result = extractLocation(error);

            expect(result).toEqual({
                file: './src/App.tsx',
                line: 5,
                column: undefined,
            });
        });

        it('prefers moduleName/loc over stack internals', () => {
            const error = {
                message: 'Error',
                moduleName: './src/components/Button.tsx',
                loc: '5:10-25',
                stack: 'Error\n    at Object.<anonymous> (/path/to/node_modules/loader.js:1:1)',
            };

            const result = extractLocation(error);

            expect(result).toEqual({
                file: './src/components/Button.tsx',
                line: 5,
                column: 10,
            });
        });

        it('prefers user file over node_modules in stack', () => {
            const error = {
                message: 'Error',
                stack: `Error: fail
    at Object.<anonymous> (/project/node_modules/loader/index.js:1:1)
    at Module (/project/src/app.tsx:12:3)`,
            };

            const result = extractLocation(error);

            expect(result).toEqual({
                file: '/project/src/app.tsx',
                line: 12,
                column: 3,
            });
        });

        it('uses error.file if moduleName is missing', () => {
            const error = {
                message: 'Error',
                loc: '5:10-25',
                file: '/path/to/image.png',
            };

            const result = extractLocation(error);

            expect(result).toEqual({
                file: '/path/to/image.png',
                line: 5,
                column: 10,
            });
        });

        it('returns null if location not found', () => {
            const error = {
                message: 'Some generic error without location',
            };

            const result = extractLocation(error);

            expect(result).toBeNull();
        });

        it('handles multiline stack trace', () => {
            const error = {
                message: 'Error',
                stack: `Error: Something went wrong
    at Function.module.exports (/path/to/utils.js:42:8)
    at async Promise.all (index)
    at Module._compile (node:internal/modules/cjs/loader:1150:10)`,
            };

            const result = extractLocation(error);

            expect(result).toEqual({
                file: '/path/to/utils.js',
                line: 42,
                column: 8,
            });
        });
    });

    describe('extractErrorMessage', () => {
        it('extracts main message from error', () => {
            const error = {
                message: 'Cannot find module ./Button',
            };

            const result = extractErrorMessage(error);

            expect(result).toBe('Cannot find module ./Button');
        });

        it('removes "Error:" prefix', () => {
            const error = {
                message: 'Error: Something went wrong',
            };

            const result = extractErrorMessage(error);

            expect(result).toBe('Something went wrong');
        });

        it('removes "Module Error:" prefix', () => {
            const error = {
                message: 'Module Error: Cannot find module',
            };

            const result = extractErrorMessage(error);

            expect(result).toBe('Cannot find module');
        });

        it('takes only first line from multiline message', () => {
            const error = {
                message: 'First line of error\nSecond line with details\nThird line',
            };

            const result = extractErrorMessage(error);

            expect(result).toBe('First line of error');
        });

        it('trims leading and trailing spaces', () => {
            const error = {
                message: '   Error: Message with spaces   ',
            };

            const result = extractErrorMessage(error);

            expect(result).toBe('Message with spaces');
        });
    });
});
