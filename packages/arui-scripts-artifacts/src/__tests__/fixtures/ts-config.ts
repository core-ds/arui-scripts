import { defineConfig } from '../../config-file';

export default defineConfig({
    baseDockerImage: 'fixture/base:1.0.0',
    nginx: { workerProcesses: 7 },
    commands: {
        'docker-build:server': {
            variant: 'compiled',
            serverOutput: 'server/index.js',
        },
    },
});
