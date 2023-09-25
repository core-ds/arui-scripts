// TODO: remove eslint-disable
/* eslint-disable @typescript-eslint/no-var-requires */
const cluster = require('cluster');
const path = require('path');

const defaultOptions = {
    script: 'server.js',
};

module.exports = class ReloadServerPlugin {
    constructor({ script } = defaultOptions) {
        this.done = null;
        this.workers = [];

        cluster.setupMaster({
            exec: path.resolve(process.cwd(), script),
        });

        cluster.on('online', (worker) => {
            this.workers.push(worker);

            if (this.done) {
                this.done();
            }
        });
    }

    apply(compiler) {
        const afterEmit = (compilation, callback) => {
            this.done = callback;
            this.workers.forEach((worker) => {
                try {
                    process.kill(worker.process.pid, 'SIGTERM');
                } catch (e) {
                    console.warn(`Unable to kill process #${worker.process.pid}`);
                }
            });

            this.workers = [];

            cluster.fork();
        };

        if (compiler.hooks) {
            compiler.hooks.afterEmit.tapAsync('ReloadServerPlugin', afterEmit);
        } else {
            compiler.plugin('after-emit', afterEmit);
        }
    }
};
