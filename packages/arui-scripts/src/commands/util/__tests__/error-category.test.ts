import { getErrorCategory, getErrorTitle } from '../error-category';

describe('error-category', () => {
    describe('getErrorCategory', () => {
        it('returns module category for "Cannot find module" error', () => {
            const error = { message: "Cannot find module 'lodash'" };

            const result = getErrorCategory(error);

            expect(result).toBe('module');
        });

        it('returns module category for "Cannot find file" error', () => {
            const error = { message: 'Cannot find file ./utils.ts' };

            const result = getErrorCategory(error);

            expect(result).toBe('module');
        });

        it('returns module category for "Can\'t resolve" bundler error', () => {
            const error = {
                message: "Module not found: Error: Can't resolve './Button' in '/src/components'",
            };

            const result = getErrorCategory(error);

            expect(result).toBe('module');
        });

        it('returns typescript category for TS error codes', () => {
            const error = { message: 'TS2322: Type "string" is not assignable to type "number"' };

            const result = getErrorCategory(error);

            expect(result).toBe('typescript');
        });

        it('returns typescript category for TS2307 cannot find module', () => {
            const error = {
                message:
                    "TS2307: Cannot find module 'lodash' or its corresponding type declarations.",
            };

            const result = getErrorCategory(error);

            expect(result).toBe('typescript');
        });

        it('returns runtime category for TypeError', () => {
            const error = { message: 'TypeError: Cannot read properties of undefined' };

            const result = getErrorCategory(error);

            expect(result).toBe('runtime');
        });

        it('returns runtime category for ReferenceError', () => {
            const error = { message: 'ReferenceError: foo is not defined' };

            const result = getErrorCategory(error);

            expect(result).toBe('runtime');
        });

        it('returns css category for CSS errors', () => {
            const error = { message: 'Unknown word (css烘托)' };

            const result = getErrorCategory(error);

            expect(result).toBe('css');
        });

        it('returns syntax category for SyntaxError, not css', () => {
            const error = { message: 'SyntaxError: Unexpected token' };

            const result = getErrorCategory(error);

            expect(result).toBe('syntax');
        });

        it('returns configuration category for heap out of memory', () => {
            const error = { message: 'FATAL ERROR: JavaScript heap out of memory' };

            const result = getErrorCategory(error);

            expect(result).toBe('configuration');
        });

        it('does not treat short "config" substring as configuration', () => {
            const error = { message: "Can't resolve './config'" };

            const result = getErrorCategory(error);

            expect(result).toBe('module');
        });

        it('returns unknown for unknown errors', () => {
            const error = { message: 'Something went wrong' };

            const result = getErrorCategory(error);

            expect(result).toBe('unknown');
        });
    });

    describe('getErrorTitle', () => {
        it('returns title by category, not by file extension', () => {
            const error = { message: 'error', moduleName: '/path/to/file.ts' };

            expect(getErrorTitle(error, 'module')).toBe('Module Error');
            expect(getErrorTitle(error, 'typescript')).toBe('TypeScript Error');
            expect(
                getErrorTitle({ message: 'error', moduleName: '/path/to/styles.css' }, 'module'),
            ).toBe('Module Error');
        });

        it('returns Module Error for module category', () => {
            const error = { message: 'error', moduleName: undefined };
            const category = 'module';

            const result = getErrorTitle(error, category);

            expect(result).toBe('Module Error');
        });

        it('returns Runtime Error for runtime category', () => {
            const error = { message: 'error', moduleName: undefined };
            const category = 'runtime';

            const result = getErrorTitle(error, category);

            expect(result).toBe('Runtime Error');
        });

        it('returns Build Error for unknown category', () => {
            const error = { message: 'error', moduleName: undefined };
            const category = 'unknown';

            const result = getErrorTitle(error, category);

            expect(result).toBe('Build Error');
        });

        it('returns Module Federation Error for module-federation category', () => {
            const error = { message: 'error', moduleName: undefined };
            const category = 'module-federation';

            const result = getErrorTitle(error, category);

            expect(result).toBe('Module Federation Error');
        });

        it('returns Configuration Error for configuration category', () => {
            const error = { message: 'error', moduleName: undefined };
            const category = 'configuration';

            const result = getErrorTitle(error, category);

            expect(result).toBe('Configuration Error');
        });

        it('returns Syntax Error for syntax category', () => {
            const error = { message: 'error' };
            const category = 'syntax';

            const result = getErrorTitle(error, category);

            expect(result).toBe('Syntax Error');
        });
    });
});
