import { validateBuildSizeBudgets } from '../validate-build-size-budgets';

describe('validateBuildSizeBudgets', () => {
    it.each([
        null,
        undefined,
        {},
        { js: {} },
        { js: { raw: 0, gzip: 409600 }, css: { gzip: 20480 } },
    ])('accepts %j', (value) => {
        expect(() => validateBuildSizeBudgets(value)).not.toThrow();
    });

    it.each([
        false,
        [],
        '400kb',
        42,
        { html: { raw: 1 } },
        { js: null },
        { js: [] },
        { js: { brotli: 1 } },
        { js: { raw: -1 } },
        { js: { gzip: '400kb' } },
        { css: { raw: 1.5 } },
        { css: { raw: Infinity } },
        { css: { raw: NaN } },
        { js: { raw: Number.MAX_SAFE_INTEGER + 1 } },
    ])('rejects invalid settings %j', (value) => {
        expect(() => validateBuildSizeBudgets(value)).toThrow('buildSizeBudgets');
    });
});
