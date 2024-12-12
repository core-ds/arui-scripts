import cluster from 'cluster';
import path from 'path';

import { type Compiler } from 'webpack';

const defaultOptions = {
    script: 'server.js',
};

export class ReloadServerPlugin {
    workers: cluster.Worker[] = [];

    done: null | (() => void) = null;

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

    apply(compiler: Compiler) {
        compiler.hooks.afterEmit.tapAsync('ReloadServerPlugin', (compilation, callback) => {
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
        });
    }
}
