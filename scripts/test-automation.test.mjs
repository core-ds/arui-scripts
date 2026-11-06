import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

const runner = new URL('./test-automation.mjs', import.meta.url).href;

async function runFixture(t, source) {
    const directory = await mkdtemp(join(tmpdir(), 'automation-runner-test-'));
    const env = { ...process.env };

    delete env.NODE_TEST_CONTEXT;

    t.after(() => rm(directory, { recursive: true, force: true }));
    if (source !== undefined) {
        await writeFile(join(directory, 'fixture.test.mjs'), source);
    }

    return spawnSync(
        process.execPath,
        [
            '--input-type=module',
            '-e',
            `import { runAutomationTests } from ${JSON.stringify(
                runner,
            )}; process.exitCode = runAutomationTests(new URL(process.argv[1]));`,
            pathToFileURL(`${directory}/`).href,
        ],
        { encoding: 'utf8', env },
    );
}

test('automation runner fails when no test files exist', async (t) => {
    const result = await runFixture(t);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /No automation test files found/);
});

test('automation runner fails when matching files execute zero tests', async (t) => {
    const result = await runFixture(
        t,
        "import { describe } from 'node:test'; describe('empty suite', () => {});",
    );

    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /# tests 0/);
    assert.match(result.stderr, /No automation tests were executed/);
});

test('automation runner succeeds when tests pass', async (t) => {
    const result = await runFixture(
        t,
        "import { test } from 'node:test'; test('passes', () => {});",
    );

    assert.equal(result.status, 0);
    assert.match(result.stdout, /# tests 1/);
    assert.match(result.stdout, /# pass 1/);
});

test('automation runner propagates test failures', async (t) => {
    const result = await runFixture(
        t,
        "import { test } from 'node:test'; test('fails', () => { throw new Error('regression'); });",
    );

    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /# fail 1/);
});
