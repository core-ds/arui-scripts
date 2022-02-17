#! /usr/bin/env node
/* eslint import/no-dynamic-require: 0 */
import tsNode from 'ts-node';

// Мы используем ts-node для работы c конфигами, описаными на ts
tsNode.register({
    transpileOnly: true,
});

const commands = [
    'start',
    'build',
    'docker-build',
    'test',
    'ensure-yarn',
    'archive-build',
    'bundle-analyze',
];

const command = process.argv[2];

if (!command || commands.indexOf(command) === -1) {
    console.error(`Please specify one of available commands: ${commands.map(c => `"${c}"`).join(' ')}`);

    process.exit(-1);
}

require(`../commands/${command}`);
