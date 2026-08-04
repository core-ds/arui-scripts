import { type Stats } from '@rspack/core';

import {
    createErrorSummary,
    formatError,
    formatErrorForTerminal,
    formatSummaryForTerminal,
    groupErrorsByTitle,
    handleCompilationResult,
} from '../error-formatter';
import { type FormattedError } from '../error-types';

jest.mock('chalk', () => {
    const mock = (text: string) => text;
    const chalkMock = Object.assign(mock, {
        red: (text: string) => text,
        yellow: (text: string) => text,
        cyan: (text: string) => text,
        gray: (text: string) => text,
        green: (text: string) => text,
        bold: { red: (text: string) => text, yellow: (text: string) => text },
    });

    return chalkMock;
});

describe('error-formatter', () => {
    describe('formatError', () => {
        it('formats "module not found" error', () => {
            const error = new Error("Cannot find module './Button'");

            const result = formatError(error);

            expect(result.category).toBe('module');
            expect(result.title).toBe('Module Error');
            expect(result.suggestions.length).toBeGreaterThan(0);
            expect(result.suggestions[0]?.type).toBe('typo');
        });

        it("formats bundler Can't resolve error", () => {
            const error = new Error("Module not found: Error: Can't resolve 'lodash' in '/src'");

            const result = formatError(error);

            expect(result.category).toBe('module');
            expect(result.title).toBe('Module Error');
            expect(result.suggestions.some((s) => s.command === 'npm install lodash')).toBe(true);
        });

        it('formats TS2307 as typescript, not module', () => {
            const error = new Error(
                "TS2307: Cannot find module 'lodash' or its corresponding type declarations.",
            );

            const result = formatError(error);

            expect(result.category).toBe('typescript');
            expect(result.title).toBe('TypeScript Error');
            expect(result.suggestions.some((s) => s.command === 'npx tsc --noEmit')).toBe(true);
        });

        it('uses moduleName from stats-like error object', () => {
            const result = formatError({
                message: "Module not found: Error: Can't resolve './Button'",
                moduleName: './src/components/index.tsx',
                loc: '5:10-25',
            });

            expect(result.location?.file).toBe('./src/components/index.tsx');
            expect(result.location?.line).toBe(5);
            expect(result.location?.column).toBe(10);
        });

        it('formats TypeScript error', () => {
            const error = new Error('TS2322: Type "string" is not assignable to type "number"');

            const result = formatError(error);

            expect(result.category).toBe('typescript');
            expect(result.title).toBe('TypeScript Error');
            expect(result.suggestions.some((s) => s.command === 'npx tsc --noEmit')).toBe(true);
        });

        it('formats CSS error', () => {
            const error = new Error('Unknown word (css烘托)');

            const result = formatError(error);

            expect(result.category).toBe('css');
            expect(result.suggestions.length).toBeGreaterThan(0);
        });

        it('formats Module Federation error', () => {
            const error = new Error('Remote module "./Button" not found in remote container');

            const result = formatError(error);

            expect(result.category).toBe('module-federation');
            expect(result.suggestions.some((s) => s.message.includes('remoteEntry.js'))).toBe(true);
        });

        it('suggests NODE_OPTIONS for memory issues', () => {
            const error = new Error('JavaScript heap out of memory');

            const result = formatError(error);

            expect(result.category).toBe('configuration');
            expect(result.suggestions.some((s) => s.command?.includes('max-old-space-size'))).toBe(
                true,
            );
        });

        it('handles unknown errors', () => {
            const error = new Error('Some error');

            const result = formatError(error);

            expect(result.category).toBe('unknown');
            expect(result.suggestions).toEqual([]);
        });

        it('extracts file path from stack trace', () => {
            const error = new Error("Cannot find module './utils'");

            error.stack =
                "Error: Cannot find module './utils'\n    at Function.Module (node:internal/modules/cjs/loader:1363:30)\n    at src/components/Button/index.tsx:5:15 (src/components/Button/index.tsx:5:15)";

            const result = formatError(error);

            expect(result.location).toBeDefined();
            expect(result.location?.file).toContain('Button');
        });

        it('handles error without stack trace', () => {
            const error = new Error('Test error');

            const result = formatError(error);

            expect(result.category).toBe('unknown');
        });
    });

    describe('groupErrorsByTitle', () => {
        it('groups errors by title', () => {
            const errors: FormattedError[] = [
                {
                    category: 'typescript',
                    severity: 'error',
                    title: 'TypeScript Error',
                    message: 'Error 1',
                    suggestions: [],
                    originalError: new Error(),
                },
                {
                    category: 'typescript',
                    severity: 'error',
                    title: 'TypeScript Error',
                    message: 'Error 2',
                    suggestions: [],
                    originalError: new Error(),
                },
                {
                    category: 'module',
                    severity: 'error',
                    title: 'Module Error',
                    message: 'Error 3',
                    suggestions: [],
                    originalError: new Error(),
                },
            ];

            const result = groupErrorsByTitle(errors);

            expect(Object.keys(result)).toHaveLength(2);
            expect(result['TypeScript Error']).toHaveLength(2);
            expect(result['Module Error']).toHaveLength(1);
        });

        it('returns empty object for empty array', () => {
            const result = groupErrorsByTitle([]);

            expect(result).toEqual({});
        });
    });

    describe('createErrorSummary', () => {
        it('creates summary with error count', () => {
            const errors: FormattedError[] = [
                {
                    category: 'typescript',
                    severity: 'error',
                    title: 'TypeScript Error',
                    message: 'Error 1',
                    suggestions: [],
                    originalError: new Error(),
                },
            ];
            const warnings: FormattedError[] = [
                {
                    category: 'unknown',
                    severity: 'warning',
                    title: 'Warnings',
                    message: 'Warning 1',
                    suggestions: [],
                    originalError: new Error(),
                },
            ];

            const result = createErrorSummary(errors, warnings);

            expect(result.totalErrors).toBe(1);
            expect(result.totalWarnings).toBe(1);
            expect(result.errorsByCategory).toBeDefined();
        });
    });

    describe('formatErrorForTerminal', () => {
        it('formats error for terminal output', () => {
            const error: FormattedError = {
                category: 'module',
                severity: 'error',
                title: 'Module Error',
                message: 'Cannot find module "./Button"',
                location: {
                    file: 'src/components/Button/index.tsx',
                    line: 5,
                    column: 10,
                },
                suggestions: [
                    {
                        type: 'typo',
                        message: 'Check import path',
                        command: 'npm ls @/Button',
                    },
                ],
                originalError: new Error(),
            };

            const result = formatErrorForTerminal(error, { maxSuggestions: 1, colorize: false });

            expect(result).toContain('Module Error');
            expect(result).toContain('Cannot find module "./Button"');
            expect(result).toContain('src/components/Button/index.tsx:5');
            expect(result).toContain('Check import path');
        });

        it('truncates long messages', () => {
            const error: FormattedError = {
                category: 'unknown',
                severity: 'error',
                title: 'Build Error',
                message: 'x'.repeat(100),
                suggestions: [],
                originalError: new Error(),
            };

            const result = formatErrorForTerminal(error, { colorize: false });

            expect(result).toContain('Build Error');
        });

        it('prints full multiline message from original error', () => {
            const originalError = new Error(
                'Module build failed:\n  × Unexpected token\n   ╭─[./src/App.tsx:5:1]',
            );
            const error: FormattedError = {
                category: 'syntax',
                severity: 'error',
                title: 'Syntax Error',
                message: 'Module build failed:',
                suggestions: [],
                originalError,
            };

            const result = formatErrorForTerminal(error, { colorize: false });

            expect(result).toContain('Unexpected token');
            expect(result).toContain('╭─[./src/App.tsx:5:1]');
        });

        it('limits number of suggestions', () => {
            const error: FormattedError = {
                category: 'unknown',
                severity: 'error',
                title: 'Build Error',
                message: 'Test',
                suggestions: [
                    { type: 'general', message: 'Suggestion 1' },
                    { type: 'general', message: 'Suggestion 2' },
                    { type: 'general', message: 'Suggestion 3' },
                ],
                originalError: new Error(),
            };

            const result = formatErrorForTerminal(error, { maxSuggestions: 2, colorize: false });

            expect(result).toContain('Suggestion 1');
            expect(result).toContain('Suggestion 2');
            expect(result).not.toContain('Suggestion 3');
        });
    });

    describe('formatSummaryForTerminal', () => {
        it('formats error summary', () => {
            const errorsByCategory: Record<string, FormattedError[]> = {
                'TypeScript Error': [
                    {
                        category: 'typescript',
                        severity: 'error',
                        title: 'TypeScript Error',
                        message: 'Cannot find name "foo"',
                        location: {
                            file: 'src/index.tsx',
                            line: 10,
                        },
                        suggestions: [],
                        originalError: new Error(),
                    },
                ],
            };

            const result = formatSummaryForTerminal(errorsByCategory, 1, 0);

            expect(result).toContain('Build failed');
            expect(result).toContain('1 error(s)');
            expect(result).toContain('TypeScript Error');
            expect(result).toContain('Cannot find name "foo"');
        });

        it('shows warnings section', () => {
            const errorsByCategory: Record<string, FormattedError[]> = {
                Warnings: [
                    {
                        category: 'unknown',
                        severity: 'warning',
                        title: 'Warnings',
                        message: 'Deprecated API usage',
                        suggestions: [],
                        originalError: new Error(),
                    },
                ],
            };

            const result = formatSummaryForTerminal(errorsByCategory, 0, 1);

            expect(result).toContain('warning(s)');
            expect(result).toContain('Deprecated API usage');
        });

        it('truncates long messages in summary', () => {
            const errorsByCategory: Record<string, FormattedError[]> = {
                'Build Error': [
                    {
                        category: 'unknown',
                        severity: 'error',
                        title: 'Build Error',
                        message: 'x'.repeat(100),
                        suggestions: [],
                        originalError: new Error(),
                    },
                ],
            };

            const result = formatSummaryForTerminal(errorsByCategory, 1, 0);

            expect(result).toContain('...');
        });

        it('shows "... and N more"', () => {
            const errors: FormattedError[] = Array.from({ length: 10 }, (_, i) => ({
                category: 'unknown' as const,
                severity: 'error' as const,
                title: 'Error' as const,
                message: `Error ${i + 1}`,
                suggestions: [],
                originalError: new Error(),
            }));

            const errorsByCategory = { Errors: errors };

            const result = formatSummaryForTerminal(errorsByCategory, 10, 0);

            expect(result).toContain('... and 5 more');
        });

        it('returns empty string when no errors', () => {
            const errorsByCategory: Record<string, FormattedError[]> = {};

            const result = formatSummaryForTerminal(errorsByCategory, 0, 0);

            expect(result).toBe('');
        });
    });

    describe('handleCompilationResult', () => {
        const makeStats = (errors: unknown[], warnings: unknown[]) =>
            ({ toJson: () => ({ errors, warnings }) }) as unknown as Stats;

        let consoleLogSpy: ReturnType<typeof jest.spyOn>;

        beforeEach(() => {
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
        });

        afterEach(() => {
            consoleLogSpy.mockRestore();
        });

        const getOutput = () =>
            consoleLogSpy.mock.calls.map((call: unknown[]) => call.join(' ')).join('\n');

        it('filters deprecation and node warnings by message field', () => {
            const stats = makeStats(
                [],
                [
                    { message: 'DeprecationWarning: something old' },
                    { message: 'node: assert module warning' },
                ],
            );

            handleCompilationResult(stats, 'Client');

            expect(getOutput()).toContain('Client: Build successful');
        });

        it('prints important warning text from message field', () => {
            const stats = makeStats([], [{ message: 'Circular dependency detected' }]);

            handleCompilationResult(stats, 'Client');

            const output = getOutput();

            expect(output).toContain('Client: 1 warning(s)');
            expect(output).toContain('Circular dependency detected');
        });

        it('prints grouped errors with location from stats fields', () => {
            const stats = makeStats(
                [
                    {
                        message: "Module not found: Error: Can't resolve './Button'",
                        moduleName: './src/index.tsx',
                        loc: '5:10-20',
                    },
                ],
                [],
            );

            handleCompilationResult(stats, 'Client');

            const output = getOutput();

            expect(output).toContain('Client: Build failed');
            expect(output).toContain('Module Error:');
            expect(output).toContain('./src/index.tsx');
        });
    });
});
