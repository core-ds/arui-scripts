import { type Configuration, type MultiStats, type Stats } from '@rspack/core';
import chalk from 'chalk';

import { createCompiler } from '../util/create-compiler';
import { formatRspackMessages } from '../util/format-rspack-messages';
import { closeCompiler } from '../util/graceful-shutdown';

type CompilationResult = {
    stats: Stats | MultiStats;
    warnings: string[];
};

async function build(
    config: Configuration | Configuration[],
    beforeClose?: (result: CompilationResult) => void | Promise<void>,
) {
    const compiler = createCompiler(config);
    let failed = false;
    let failure: unknown;
    let warnings: string[] = [];

    try {
        const result = await new Promise<CompilationResult>((resolve, reject) => {
            compiler.run((err, stats) => {
                try {
                    if (err) return reject(err);
                    if (!stats)
                        return reject(new Error('Compiler did not return build statistics'));
                    const messages = formatRspackMessages(stats.toJson({}));

                    if (messages.errors.length) {
                        return reject(new Error(messages.errors[0]));
                    }
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

                    return resolve({ stats, warnings: messages.warnings });
                } catch (error) {
                    return reject(error);
                }
            });
        });

        // Native Stats/Compilation become invalid after close(). Consume them before flushing.
        await beforeClose?.(result);

        warnings = result.warnings;
    } catch (error) {
        failed = true;
        failure = error;
    }

    try {
        await closeCompiler(compiler);
    } catch (error) {
        if (failed) {
            console.error('Failed to close Rspack compiler:', error);
        } else {
            failed = true;
            failure = error;
        }
    }

    if (failed) throw failure;

    return { warnings };
}

export default build;
