import { defineConfig } from '../../config-file';

export default defineConfig({
    docker: { baseImage: 'fixture/base:1.0.0' },
    nginx: { baseConf: { workerProcesses: 7 } },
    commands: {
        'docker-build:server': {
            docker: { variant: 'compiled' },
            serverOutput: 'server/index.js',
        },
    },
});
