import { ERROR_PATTERNS } from '../error-patterns';

describe('error-patterns', () => {
    describe('ERROR_PATTERNS', () => {
        it('contains all required patterns', () => {
            expect(ERROR_PATTERNS.length).toBeGreaterThan(0);
        });

        it('each pattern has valid regex', () => {
            ERROR_PATTERNS.forEach((pattern) => {
                expect(pattern.pattern).toBeInstanceOf(RegExp);
            });
        });

        it('each pattern has category', () => {
            ERROR_PATTERNS.forEach((pattern) => {
                expect(pattern.category).toBeDefined();
            });
        });

        it('each pattern has getSuggestions function', () => {
            ERROR_PATTERNS.forEach((pattern) => {
                expect(typeof pattern.getSuggestions).toBe('function');
            });
        });

        it('contains pattern for module not found', () => {
            const modulePattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test("Cannot find module 'lodash'"),
            );

            expect(modulePattern).toBeDefined();
            expect(modulePattern?.category).toBe('module');
        });

        it("contains pattern for bundler Can't resolve errors", () => {
            const modulePattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test("Module not found: Error: Can't resolve './Button' in '/src'"),
            );

            expect(modulePattern).toBeDefined();
            expect(modulePattern?.category).toBe('module');
        });

        it('contains pattern for TypeScript errors', () => {
            const tsPattern = ERROR_PATTERNS.find((p) => p.pattern.test('TS2307: error'));

            expect(tsPattern).toBeDefined();
            expect(tsPattern?.category).toBe('typescript');
        });

        it('classifies TS2307 as typescript before module', () => {
            const matched = ERROR_PATTERNS.find((p) =>
                p.pattern.test("TS2307: Cannot find module 'lodash'"),
            );

            expect(matched?.category).toBe('typescript');
        });

        it('matches 5-digit TypeScript codes', () => {
            const matched = ERROR_PATTERNS.find((p) =>
                p.pattern.test("TS18048: 'user' is possibly 'undefined'."),
            );

            expect(matched?.category).toBe('typescript');
        });

        it('contains pattern for React element type', () => {
            const reactPattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test('Element type is invalid'),
            );

            expect(reactPattern).toBeDefined();
            expect(reactPattern?.category).toBe('runtime');
        });

        it('contains pattern for Module Federation', () => {
            const mfPattern = ERROR_PATTERNS.find((p) => p.pattern.test('Remote module not found'));

            expect(mfPattern).toBeDefined();
            expect(mfPattern?.category).toBe('module-federation');
        });

        it('contains pattern for heap out of memory', () => {
            const memoryPattern = ERROR_PATTERNS.find((p) => p.pattern.test('heap out of memory'));

            expect(memoryPattern).toBeDefined();
            expect(memoryPattern?.category).toBe('configuration');
        });

        it('contains pattern for syntax errors', () => {
            const syntaxPattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test('parsing error: unexpected token'),
            );

            expect(syntaxPattern).toBeDefined();
            expect(syntaxPattern?.category).toBe('syntax');
        });

        it('contains pattern for export not found', () => {
            const exportPattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test("'Button' is not exported from './Button'"),
            );

            expect(exportPattern).toBeDefined();
            expect(exportPattern?.category).toBe('module');
        });

        it('contains pattern for remote container not available', () => {
            const containerPattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test('Remote container is not available'),
            );

            expect(containerPattern).toBeDefined();
            expect(containerPattern?.category).toBe('module-federation');
        });

        it('contains pattern for unsupported target', () => {
            const targetPattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test('configuration for target "node14" not supported'),
            );

            expect(targetPattern).toBeDefined();
            expect(targetPattern?.category).toBe('configuration');
        });
    });

    describe('getSuggestions for module not found', () => {
        it('returns suggestions for npm package', () => {
            const pattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test("Cannot find module 'lodash'"),
            );

            const suggestions = pattern?.getSuggestions({
                message: "Cannot find module 'lodash'",
            });

            expect(suggestions).toBeDefined();
            expect(Array.isArray(suggestions)).toBe(true);
            expect(suggestions!.length).toBeGreaterThan(0);
            expect(suggestions![0].type).toBe('install');
            expect(suggestions!.some((s) => s.command === 'npm install lodash')).toBe(true);
        });

        it('returns suggestions for relative path', () => {
            const pattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test("Cannot find module './utils'"),
            );

            const suggestions = pattern?.getSuggestions({
                message: "Cannot find module './utils'",
            });

            expect(suggestions).toBeDefined();
            expect(suggestions!.length).toBeGreaterThan(0);
            expect(suggestions![0].type).toBe('typo');
            expect(suggestions!.some((s) => s.command?.includes('npm'))).toBe(false);
        });

        it("returns suggestions for Can't resolve relative path", () => {
            const pattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test("Module not found: Error: Can't resolve './Button'"),
            );

            const suggestions = pattern?.getSuggestions({
                message: "Module not found: Error: Can't resolve './Button' in '/src'",
            });

            expect(suggestions).toBeDefined();
            expect(suggestions![0].type).toBe('typo');
        });

        it('returns suggestions for alias path', () => {
            const pattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test("Cannot find module '@/components'"),
            );

            const suggestions = pattern?.getSuggestions({
                message: "Cannot find module '@/components'",
            });

            expect(suggestions).toBeDefined();
            expect(suggestions!.some((s) => s.type === 'config')).toBe(true);
        });
    });

    describe('getSuggestions for TypeScript errors', () => {
        it('returns tsc --noEmit command', () => {
            const pattern = ERROR_PATTERNS.find((p) => p.pattern.test('TS2307: error'));

            const suggestions = pattern?.getSuggestions({
                message: 'TS2307: Cannot find module',
            });

            expect(suggestions).toBeDefined();
            expect(suggestions!.some((s) => s.command === 'npx tsc --noEmit')).toBe(true);
        });
    });

    describe('getSuggestions for heap out of memory', () => {
        it('returns command to increase memory', () => {
            const pattern = ERROR_PATTERNS.find((p) => p.pattern.test('heap out of memory'));

            const suggestions = pattern?.getSuggestions({
                message: 'FATAL ERROR: JavaScript heap out of memory',
            });

            expect(suggestions).toBeDefined();
            expect(suggestions!.some((s) => s.command?.includes('--max-old-space-size'))).toBe(
                true,
            );
        });
    });

    describe('getSuggestions for module-federation', () => {
        it('returns suggestions for remote module not found', () => {
            const pattern = ERROR_PATTERNS.find((p) => p.pattern.test('Remote module not found'));

            const suggestions = pattern?.getSuggestions({
                message: 'Remote module not found',
            });

            expect(suggestions).toBeDefined();
            expect(suggestions!.some((s) => s.message.includes('remoteEntry'))).toBe(true);
        });

        it('returns suggestions for remote container not available', () => {
            const pattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test('Remote container is not available'),
            );

            const suggestions = pattern?.getSuggestions({
                message: 'Remote container is not available',
            });

            expect(suggestions).toBeDefined();
            expect(suggestions!.some((s) => s.message.includes('running'))).toBe(true);
        });
    });

    describe('getSuggestions for React errors', () => {
        it('returns suggestions for element type is invalid', () => {
            const pattern = ERROR_PATTERNS.find((p) => p.pattern.test('Element type is invalid'));

            const suggestions = pattern?.getSuggestions({
                message: 'Element type is invalid',
            });

            expect(suggestions).toBeDefined();
            expect(suggestions!.length).toBeGreaterThan(0);
        });
    });

    describe('getSuggestions for CSS errors', () => {
        it('returns suggestions for unknown word', () => {
            const pattern = ERROR_PATTERNS.find((p) => p.pattern.test('Unknown word'));

            const suggestions = pattern?.getSuggestions({
                message: 'Unknown word (css烘托)',
            });

            expect(suggestions).toBeDefined();
            expect(suggestions!.some((s) => s.type === 'syntax')).toBe(true);
        });

        it('does not treat SyntaxError as CSS', () => {
            const cssPattern = ERROR_PATTERNS.find((p) => p.pattern.test('Unknown word'));
            const syntaxMessage = 'SyntaxError: Unexpected token }';

            expect(cssPattern?.pattern.test(syntaxMessage)).toBe(false);

            const syntaxPattern = ERROR_PATTERNS.find((p) => p.pattern.test(syntaxMessage));

            expect(syntaxPattern?.category).toBe('syntax');
        });
    });

    describe('getSuggestions for syntax errors', () => {
        it('returns suggestions for parsing error', () => {
            const pattern = ERROR_PATTERNS.find((p) => p.pattern.test('parsing error'));

            const suggestions = pattern?.getSuggestions({
                message: 'Parsing error: unexpected token',
            });

            expect(suggestions).toBeDefined();
            expect(suggestions!.length).toBeGreaterThan(0);
        });
    });

    describe('getSuggestions for configuration errors', () => {
        it('returns suggestions for unsupported target', () => {
            const pattern = ERROR_PATTERNS.find((p) =>
                p.pattern.test('configuration for target "node14" not supported'),
            );

            const suggestions = pattern?.getSuggestions({
                message: 'Configuration for target "node14" not supported',
            });

            expect(suggestions).toBeDefined();
            expect(suggestions!.length).toBeGreaterThan(0);
        });
    });
});
