import fs from 'fs';
import os from 'os';
import path from 'path';

import { type Compiler, type Configuration, rspack, type Stats } from '@rspack/core';

import { formatError, handleCompilationResult } from '../error-formatter';

async function compile(source: string, overrides: Configuration = {}): Promise<Stats> {
    const compiler = rspack({
        mode: 'production',
        entry: `data:text/javascript,${encodeURIComponent(source)}`,
        ...overrides,
        plugins: [
            {
                apply(instance: Compiler) {
                    instance.hooks.shouldEmit.tap('NoEmit', () => false);
                },
            },
        ],
    });

    try {
        return await new Promise<Stats>((resolve, reject) => {
            compiler.run((error, stats) => {
                if (error) reject(error);
                else if (stats) resolve(stats);
                else reject(new Error('Missing compilation stats'));
            });
        });
    } finally {
        await new Promise<void>((resolve, reject) => {
            compiler.close((error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}

describe('native Rspack diagnostics', () => {
    test('watch retains the parse error, code frame and suggestions', async () => {
        const stats = await compile('const broken = ;');
        const log = jest.spyOn(console, 'log').mockImplementation(() => {});

        try {
            handleCompilationResult(stats, 'Server');
            const output = log.mock.calls.flat().join('\n');

            expect(output).toContain('Syntax Error:');
            expect(output).toContain('Expression expected');
            expect(output).toContain('const broken = ;');
            expect(output).toContain('Check JavaScript/TypeScript syntax');
        } finally {
            log.mockRestore();
        }
    });

    test('recognizes missing exports from real compilation stats', async () => {
        const stats = await compile(
            "import { nope } from 'data:text/javascript,export default 1'; console.log(nope);",
        );
        const { errors } = stats.toJson({ all: false, errors: true });

        expect(errors).toHaveLength(1);
        const formatted = formatError(errors?.[0]);

        expect(formatted.category).toBe('module');
        expect(formatted.suggestions).toContainEqual({
            type: 'typo',
            message: 'Check for typos in import: "nope"',
        });
        expect(formatted.suggestions).toContainEqual({
            type: 'typo',
            message: 'Verify export exists in source module',
        });
    });
});

test('classifies native css-loader syntax diagnostics as CSS', async () => {
    const stats = await compile('', {
        entry: 'data:text/css,.button%20%7B%20color:%20red;',
        module: { rules: [{ mimetype: 'text/css', use: [require.resolve('css-loader')] }] },
    });
    const { errors } = stats.toJson({ all: false, errors: true });

    expect(errors).toHaveLength(1);
    expect(errors?.[0].message).toContain('Unclosed block');
    const result = formatError(errors?.[0]);

    expect(result.category).toBe('css');
    expect(result.suggestions[0].message).toBe('Check CSS syntax for errors');
    expect(JSON.stringify(result.suggestions)).not.toContain('JavaScript');
});

test('preserves native warning details and location', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-warning-'));
    const filename = path.join(directory, 'index.cjs');

    fs.writeFileSync(filename, 'const thing = process.env.FOO; require(thing);');
    const stats = await compile('', { context: directory, entry: filename }).finally(() => {
        fs.rmSync(directory, { recursive: true, force: true });
    });

    expect(stats.hasErrors()).toBe(false);
    const { warnings } = stats.toJson({ all: false, warnings: true });

    expect(warnings).toHaveLength(1);
    const warning = warnings?.[0];
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    try {
        handleCompilationResult(stats, 'Server');
        const output = log.mock.calls.flat().join('\n');

        expect(output).toContain('Server: 1 warning(s)');
        expect(output).toContain('const thing = process.env.FOO; require(thing);');
        expect(output).toContain(`at ${warning?.moduleName}:1:32`);
        expect(output).not.toContain('pr...');
        log.mockClear();
        handleCompilationResult(stats, 'Server', { stats: { warnings: false, errors: true } });
        expect(log).not.toHaveBeenCalled();
        handleCompilationResult(stats, 'Server', { stats: { all: false, warnings: true } });
        expect(log.mock.calls.flat().join('\n')).toContain(`at ${warning?.moduleName}:1:32`);
        log.mockClear();
        handleCompilationResult(stats, 'Server', { maxWarnings: 0 });
        expect(log.mock.calls.flat().join('\n')).toContain('1 more');
        expect(log.mock.calls.flat().join('\n')).not.toContain('Build successful');
    } finally {
        log.mockRestore();
    }
});

test('respects stats visibility, presets and color settings', async () => {
    const stats = await compile('const broken = ;');
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    try {
        for (const settings of [
            false,
            'none',
            { all: false },
            { errors: false, warnings: false },
            { errors: false, warnings: true },
        ] as const) {
            handleCompilationResult(stats, 'Server', { stats: settings });
            expect(log).not.toHaveBeenCalled();
        }
        handleCompilationResult(stats, 'Server', { stats: 'errors-only' });
        expect(log.mock.calls.flat().join('\n')).toContain('Expression expected');
        log.mockClear();
        const json = stats.toJson({ all: false, errors: true });

        jest.spyOn(stats, 'toJson').mockReturnValue({
            ...json,
            errors: [{ message: '\u001b[31mSyntaxError: colored\u001b[39m' }],
        });
        handleCompilationResult(stats, 'Server', {
            stats: { all: false, errors: true, colors: false },
        });
        expect(log.mock.calls.flat().join('\n')).toContain('Syntax Error');
        expect(log.mock.calls.flat().join('\n')).not.toContain('\u001b[');
    } finally {
        log.mockRestore();
    }
});
