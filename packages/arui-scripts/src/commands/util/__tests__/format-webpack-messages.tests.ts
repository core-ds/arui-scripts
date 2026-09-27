import { formatWebpackMessages } from '../format-webpack-messages';

jest.mock('chalk', () => ({ inverse: (text: string) => text }));

describe('compiler diagnostics', () => {
    test('accepts missing stats and empty errors', () => {
        expect(formatWebpackMessages(undefined)).toEqual({ errors: [], warnings: [] });
        expect(formatWebpackMessages({})).toEqual({ errors: [], warnings: [] });
    });
    test('prioritizes syntax errors but retains warnings', () => {
        const result = formatWebpackMessages({
            errors: [
                { message: 'missing dependency' },
                { message: 'src/app.ts\nLine 3:7: Parsing error: Unexpected token' },
            ],
            warnings: [{ message: 'warning' }],
        });

        expect(result).toEqual({
            errors: ['src/app.ts\nSyntax error: Unexpected token (3:7)'],
            warnings: ['warning'],
        });
    });
    test.each([
        [
            "export 'name' was not found in 'pkg'",
            "Attempted import error: 'name' is not exported from 'pkg'.",
        ],
        [
            "export 'default' (imported as 'Name') was not found in 'pkg'",
            "Attempted import error: 'pkg' does not contain a default export (imported as 'Name').",
        ],
        [
            "export 'name' (imported as 'alias') was not found in 'pkg'",
            "Attempted import error: 'name' is not exported from 'pkg' (imported as 'alias').",
        ],
    ])('explains missing exports: %s', (input, output) => {
        expect(formatWebpackMessages({ errors: [{ message: input }] }).errors).toEqual([output]);
    });
    test('removes loader headers and internal stacks while retaining user code frames', () => {
        const result = formatWebpackMessages({
            errors: [
                {
                    message:
                        'src/app.ts 1:2-3\n\nModule build failed (from loader):\nfailure\n    at internal (/node_modules/loader.js:2:3)\n    at user (webpack:/src/app.ts:4:5)\n\n\n',
                },
            ],
        });

        expect(result.errors).toEqual([
            'src/app.ts\nfailure\n    at user (webpack:/src/app.ts:4:5)',
        ]);
    });
    test('shortens missing file errors', () => {
        expect(
            formatWebpackMessages({
                errors: [
                    {
                        message:
                            'app.ts\nModule not found: Error: Cannot find file: missing.ts\nresolution details',
                    },
                ],
            }).errors,
        ).toEqual(['app.ts\nCannot find file: missing.ts']);
    });
});
