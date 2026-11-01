import { type Compiler, type Configuration, type MultiCompiler, rspack } from '@rspack/core';

import { acquireCompilerCaches } from '../../configs/persistent-cache';

/** Keep cache ownership until native close completes, including the error path. */
export function createCompiler(configuration: Configuration): Compiler;
export function createCompiler(configuration: Configuration[]): MultiCompiler;
export function createCompiler(
    configuration: Configuration | Configuration[],
): Compiler | MultiCompiler;
export function createCompiler(configuration: Configuration | Configuration[]) {
    const releases = acquireCompilerCaches(configuration);
    const release = () => {
        releases.splice(0).forEach((callback) => callback());
    };

    try {
        const compiler = rspack(configuration);
        const close = compiler.close.bind(compiler);

        compiler.close = (callback: (error?: Error | null) => void) =>
            close((error) => {
                try {
                    release();
                } catch (releaseError) {
                    callback(error || (releaseError as Error));

                    return;
                }
                callback(error);
            });

        return compiler;
    } catch (error) {
        release();
        throw error;
    }
}
