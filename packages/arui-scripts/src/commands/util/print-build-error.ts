import chalk from 'chalk';

export function printBuildError(err: Error | null | undefined): void {
    const message = err?.message;
    const stack = err?.stack;

    if (stack && typeof message === 'string' && message.includes('from Terser')) {
        try {
            const matched = /(.+)\[(.+):(.+),(.+)\]\[.+\]/.exec(stack);

            if (!matched) {
                throw new Error('Using errors for control flow is bad.');
            }

            const problemPath = matched[2];
            const line = matched[3];
            const column = matched[4];

            const columnFormatted = column === '0' ? '' : `:${column}`;

            console.log(
                `Failed to minify the code from this file: \n\n${chalk.yellow(
                    `\t${problemPath}:${line}${columnFormatted}`,
                )}\n`,
            );
        } catch (ignored) {
            console.log('Failed to minify the bundle.', err);
        }
        console.log('Read more here: https://cra.link/failed-to-minify');
    } else {
        console.log(`${message || err}\n`);
    }
    console.log();
}
