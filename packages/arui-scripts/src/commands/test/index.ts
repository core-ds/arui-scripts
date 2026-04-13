import * as jestRunner from 'jest';

import { getJestConfig } from './get-config';
import { hasProjectVitestConfig, runVitest } from '../util/run-vitest';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw err;
});

const argv = process.argv.slice(3);

type RunnerType = 'jest' | 'vitest';

function extractRunnerArgs(args: string[]): { runner: RunnerType | 'auto'; passThroughArgs: string[] } {
    const passThroughArgs: string[] = [];
    let runner: RunnerType | 'auto' = 'auto';

    args.forEach((arg) => {
        if (arg.startsWith('--runner=')) {
            const value = arg.split('=')[1];

            if (value === 'jest' || value === 'vitest' || value === 'auto') {
                runner = value;
            } else {
                throw new Error(`Unknown test runner "${value}". Expected one of: jest, vitest, auto.`);
            }

            return;
        }

        passThroughArgs.push(arg);
    });

    return { runner, passThroughArgs };
}

function resolveRunner(runner: RunnerType | 'auto') {
    if (runner !== 'auto') {
        return runner;
    }

    return hasProjectVitestConfig(process.cwd()) ? 'vitest' : 'jest';
}

const runJest = async (args: string[]) => {
    const jestConfig = await getJestConfig();

    args.push('--config', JSON.stringify(jestConfig));

    jestRunner.run(args);
};

const runTests = async () => {
    const { runner, passThroughArgs } = extractRunnerArgs(argv);
    const resolvedRunner = resolveRunner(runner);

    if (resolvedRunner === 'vitest') {
        const code = await runVitest({ args: passThroughArgs });
        process.exit(code);
    }

    await runJest(passThroughArgs);
};

runTests().catch((error) => {
    console.error('Error running tests:', error);
    process.exit(1);
});
