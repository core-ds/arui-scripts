import { type Configuration, type StatsCompilation } from '@rspack/core';
import chalk from 'chalk';

import { createCompiler } from '../util/create-compiler';
import { formatWebpackMessages } from '../util/format-webpack-messages';

type BuildResult = {
    assets: StatsCompilation[];
    warnings: string[];
    previousFileSizes: unknown;
};

function build(config: Configuration | Configuration[], previousFileSizes?: unknown) {
    const compiler = createCompiler(config);

    return new Promise<BuildResult>((resolve, reject) => {
        compiler.run((runError, stats) => {
            // Native Rspack Stats cannot be accessed after close; snapshot before flushing.
            let snapshot: StatsCompilation | undefined;
            let snapshotError: Error | undefined;

            try {
                snapshot = stats?.toJson({
                    all: false,
                    errors: true,
                    warnings: true,
                    children: true,
                    assets: true,
                });
            } catch (error) {
                snapshotError = error as Error;
            }
            const messages = formatWebpackMessages(snapshot || {});
            const compilationError = messages.errors.length
                ? new Error(messages.errors[0])
                : undefined;

            compiler.close((closeError) => {
                const err = runError || snapshotError || compilationError || closeError;

                if (err) return reject(err);
                if (!stats || !snapshot)
                    return reject(new Error('Compiler did not return build statistics'));

                if (
                    process.env.CI &&
                    process.env.CI.toLowerCase() !== 'false' &&
                    messages.warnings.length
                ) {
                    console.log(
                        chalk.yellow(
                            '\nTreating warnings as errors because process.env.CI = true.\n' +
                                'Most CI servers set it automatically.\n',
                        ),
                    );

                    return reject(new Error(messages.warnings.join('\n\n')));
                }

                return resolve({
                    assets: Array.isArray(config) ? snapshot.children || [] : [snapshot],
                    warnings: messages.warnings,
                    previousFileSizes,
                });
            });
        });
    });
}

export default build;
