import { SmartErrorsPlugin } from '../smart-errors-plugin';

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

describe('SmartErrorsPlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('creates plugin with default options', () => {
            const plugin = new SmartErrorsPlugin();

            expect(plugin.name).toBe('SmartErrorsPlugin');
        });

        it('accepts ignoreWarnings option', () => {
            const plugin = new SmartErrorsPlugin({
                ignoreWarnings: true,
            });

            expect(plugin.name).toBe('SmartErrorsPlugin');
        });
    });

    describe('apply', () => {
        it('registers only done hook', () => {
            const doneTap = jest.fn();
            const mockCompiler = {
                hooks: {
                    compilation: { tap: jest.fn() },
                    done: { tap: doneTap },
                },
            };
            const plugin = new SmartErrorsPlugin();

            plugin.apply(mockCompiler as unknown as import('@rspack/core').Compiler);

            expect(doneTap).toHaveBeenCalledWith('SmartErrorsPlugin', expect.any(Function));
        });
    });

    describe('error handling', () => {
        it('does not output anything when no errors', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
            const doneTap = jest.fn();
            const mockCompiler = {
                hooks: {
                    compilation: { tap: jest.fn() },
                    done: { tap: doneTap },
                },
            };

            const plugin = new SmartErrorsPlugin();

            plugin.apply(mockCompiler as unknown as import('@rspack/core').Compiler);

            const doneHook = doneTap.mock.calls[0]?.[1] as (stats: {
                toJson: () => { errors: []; warnings: [] };
            }) => void;

            if (doneHook) {
                doneHook({
                    toJson: () => ({ errors: [], warnings: [] }),
                });
            }

            expect(consoleSpy).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('outputs errors when present', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
            const doneTap = jest.fn();
            const mockCompiler = {
                hooks: {
                    compilation: { tap: jest.fn() },
                    done: { tap: doneTap },
                },
            };

            const plugin = new SmartErrorsPlugin();

            plugin.apply(mockCompiler as unknown as import('@rspack/core').Compiler);

            const doneHook = doneTap.mock.calls[0]?.[1] as (stats: {
                toJson: () => { errors: [{ error: Error }]; warnings: [] };
            }) => void;

            if (doneHook) {
                doneHook({
                    toJson: () => ({
                        errors: [{ error: new Error('Test error') }],
                        warnings: [],
                    }),
                });
            }

            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('ignores warnings when ignoreWarnings=true', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
            const doneTap = jest.fn();
            const mockCompiler = {
                hooks: {
                    compilation: { tap: jest.fn() },
                    done: { tap: doneTap },
                },
            };

            const plugin = new SmartErrorsPlugin({ ignoreWarnings: true });

            plugin.apply(mockCompiler as unknown as import('@rspack/core').Compiler);

            const doneHook = doneTap.mock.calls[0]?.[1] as (stats: {
                toJson: () => { errors: []; warnings: [{ warning: Error }] };
            }) => void;

            if (doneHook) {
                doneHook({
                    toJson: () => ({
                        errors: [],
                        warnings: [{ warning: new Error('Warning') }],
                    }),
                });
            }

            expect(consoleSpy).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });
});

describe('createSmartErrorsPlugin', () => {
    it('creates SmartErrorsPlugin instance', () => {
        const { createSmartErrorsPlugin } = require('../smart-errors-plugin');
        const plugin = createSmartErrorsPlugin({
            ignoreWarnings: true,
        });

        expect(plugin).toBeInstanceOf(SmartErrorsPlugin);
    });
});

describe('formatBuildError', () => {
    it('formats simple error', () => {
        const { formatBuildError } = require('../smart-errors-plugin');
        const error = new Error("Cannot find module './Button.tsx'");

        const result = formatBuildError(error);

        expect(result).toContain('Module Error');
        expect(result).toContain('Cannot find module');
    });
});
