#! /usr/bin/env node
/* eslint import/no-dynamic-require: 0 */

const commands: Record<string, () => void> = {
    start: () => require('../commands/start'),
    'start-vite': () => require('../commands/start-vite'),
    build: () => require('../commands/build'),
    'docker-build': () => require('../commands/docker-build'),
    'docker-build:compiled': () => require('../commands/docker-build-compiled'),
    test: () => require('../commands/test'),
    'ensure-yarn': () => require('../commands/ensure-yarn'),
    'archive-build': () => require('../commands/archive-build'),
    'bundle-analyze': () => require('../commands/bundle-analyze'),
};

const command = process.argv[2] as string;

if (!command || !commands[command]) {
    console.error(`Please specify one of available commands: ${Object.keys(commands).map(c => `"${c}"`).join(' ')}`);

    process.exit(-1);
}

commands[command]();
