import { registerShutdown, SHUTDOWN_TIMEOUT } from '../graceful-shutdown';

let dispose: () => void;
let exit: jest.SpyInstance;

beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    exit = jest.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
    dispose();
    jest.useRealTimers();
    jest.restoreAllMocks();
});

it('waits for the compiler to flush before exit', async () => {
    let finish: () => void = () => {};

    dispose = registerShutdown(
        () =>
            new Promise<void>((resolve) => {
                finish = resolve;
            }),
    );
    process.emit('SIGTERM');
    expect(exit).not.toHaveBeenCalled();
    finish();
    await Promise.resolve();
    expect(exit).toHaveBeenCalledWith(0);
});

it('preserves close failure', async () => {
    dispose = registerShutdown(() => Promise.reject(new Error('disk flush')));
    process.emit('SIGINT');
    await Promise.resolve();
    expect(exit).toHaveBeenCalledWith(1);
});

it('bounds shutdown to ten seconds', () => {
    dispose = registerShutdown(() => new Promise(() => {}));
    process.emit('SIGTERM');
    jest.advanceTimersByTime(SHUTDOWN_TIMEOUT);
    expect(exit).toHaveBeenCalledWith(1);
});

it('allows a second signal to force exit', () => {
    dispose = registerShutdown(() => new Promise(() => {}));
    process.emit('SIGINT');
    process.emit('SIGTERM');
    expect(exit).toHaveBeenCalledWith(1);
});
