#! /usr/bin/env node
// TODO: remove eslint-disable and eslint-disable-next-line
/* eslint-disable global-require */
/* eslint import/no-dynamic-require: 0 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const commands: Record<string, () => void> = {
    start: () => require('../commands/start'),
    'start:prod': () => require('../commands/start-prod'),
    build: () => require('../commands/build'),
    'docker-build': () => require('../commands/docker-build'),
    'docker-build:compiled': () => require('../commands/docker-build-compiled'),
    test: () => require('../commands/test'),
    'ensure-yarn': () => require('../commands/ensure-yarn'),
    'archive-build': () => require('../commands/archive-build'),
    'bundle-analyze': () => require('../commands/bundle-analyze'),
    changelog: () => require('../commands/changelog'),
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const command = process.argv[2] as string;

if (!command || !commands[command]) {
    console.error(
        `Please specify one of available commands: ${Object.keys(commands)
            .map((c) => `"${c}"`)
            .join(' ')}`,
    );

    process.exit(-1);
}

commands[command]();
