export const SHUTDOWN_TIMEOUT = 10000;

/** A second signal forces termination; the first allows native cache writes to finish. */
export function registerShutdown(stop: () => Promise<void>): () => void {
    let stopping = false;
    let timer: NodeJS.Timeout | undefined;
    const dispose = () => {
        process.removeListener('SIGINT', onSignal);
        process.removeListener('SIGTERM', onSignal);
        if (timer) clearTimeout(timer);
    };

    function onSignal() {
        if (stopping) {
            console.error('Shutdown interrupted by a second signal; cache may not be saved.');
            dispose();
            process.exit(1);

            return;
        }
        stopping = true;
        timer = setTimeout(() => {
            console.error('Compiler shutdown timed out after 10 seconds; cache may not be saved.');
            dispose();
            process.exit(1);
        }, SHUTDOWN_TIMEOUT);
        stop().then(
            () => {
                dispose();
                process.exit(0);
            },
            (error) => {
                console.error('Compiler shutdown failed:', error);
                dispose();
                process.exit(1);
            },
        );
    }

    process.on('SIGINT', onSignal);
    process.on('SIGTERM', onSignal);

    return dispose;
}

export function closeCompiler(compiler: {
    close: (callback: (error?: Error | null) => void) => void;
}): Promise<void> {
    return new Promise((resolve, reject) => {
        compiler.close((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}
