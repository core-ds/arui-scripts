import { type Stats } from '@rspack/core';

import { formatError, handleCompilationResult } from '../error-formatter';

describe('module resolution suggestions', () => {
    test.each([
        ['lodash', 'lodash'],
        ['lodash/debounce', 'lodash'],
        ['@scope/package', '@scope/package'],
        ['@scope/package/nested/file.js', '@scope/package'],
    ])('installs the package root for %s', (request, packageName) => {
        const { suggestions } = formatError(new Error(`Can't resolve '${request}'`));

        expect(
            suggestions
                .filter((suggestion) => suggestion.command)
                .map((suggestion) => suggestion.command),
        ).toEqual([`npm ls ${packageName}`, `npm install ${packageName}`]);
    });

    test.each([
        './Button',
        '../Button',
        '/project/Button',
        'C:\\project\\Button',
        '\\\\server\\share\\Button',
    ])('checks local paths without installation commands: %s', (request) => {
        const { suggestions } = formatError(new Error(`Can't resolve '${request}'`));

        expect(suggestions[0].message).toBe('Check that the file path is correct');
        expect(suggestions.some((suggestion) => suggestion.command)).toBe(false);
    });

    test.each(['@/components/Button', '~/Button', '#components/Button'])(
        'shows the alias hint within the default watch limit: %s',
        (request) => {
            const stats = {
                toJson: () => ({
                    errors: [{ message: `Can't resolve '${request}'` }],
                    warnings: [],
                }),
            } as unknown as Stats;
            const log = jest.spyOn(console, 'log').mockImplementation(() => {});

            try {
                handleCompilationResult(stats, 'Client');
                const output = log.mock.calls.flat().join('\n');

                expect(output).toContain('paths');
                expect(output).not.toContain('npm install');
            } finally {
                log.mockRestore();
            }
        },
    );

    test.each(['node:fs', 'https://example.test/module', '--flag', 'pkg;echo bad'])(
        'does not invent an install command for %s',
        (request) => {
            const { suggestions } = formatError(new Error(`Can't resolve '${request}'`));

            expect(suggestions.some((suggestion) => suggestion.command)).toBe(false);
        },
    );
});

test.each([
    ['@/components/Header', 'paths'],
    ['lodash/debounce', 'npm install lodash'],
    ['@scope/package/subpath', 'npm install @scope/package'],
    ['./Button', 'file path'],
])('recognizes colored Rspack imports: %s', (request, hint) => {
    const message = `Module not found: Can't resolve \u001b[33m'${request}'\u001b[39m in '/src'`;
    const result = formatError({ message });

    expect(JSON.stringify(result.suggestions)).toContain(hint);
    expect(result.originalError.message).toBe(message);
});
