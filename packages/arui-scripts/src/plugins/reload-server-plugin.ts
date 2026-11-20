import cluster, { type Worker } from 'cluster';
import path from 'path';

import { type Compiler } from '@rspack/core';

const defaultOptions = {
    script: 'server.js',
};

export class ReloadServerPlugin {
    workers: Worker[] = [];

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
        compiler.hooks.shutdown.tapAsync('ReloadServerPlugin', (callback) => {
            const workers = this.workers.filter((worker) => !worker.isDead());

            if (!workers.length) {
                callback();

                return;
            }
            let remaining = workers.length;

            workers.forEach((worker) => {
                worker.once('exit', () => {
                    remaining -= 1;
                    if (!remaining) callback();
                });
                worker.kill('SIGTERM');
            });
        });

        compiler.hooks.afterEmit.tapAsync('ReloadServerPlugin', (compilation, callback) => {
            this.done = callback;
            this.workers.forEach((worker) => {
                try {
                    if (worker.process.pid) {
                        process.kill(worker.process.pid, 'SIGTERM');
                    }
                } catch (e) {
                    console.warn(`Unable to kill process #${worker.process.pid}`);
                }
            });

            this.workers = [];

            cluster.fork();
        });
    }
}
