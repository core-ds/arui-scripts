import { EventEmitter } from 'events';

const spawnMock = jest.fn();

jest.mock('child_process', () => ({
    spawn: (...args: unknown[]) => spawnMock(...args),
}));

// eslint-disable-next-line import/first
import { installDependencies } from '../install-dependencies';

function fakeChild(exitCode: number) {
    const child = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter;
        stderr: EventEmitter;
    };

    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();

    setImmediate(() => {
        child.stderr.emit('data', Buffer.from('some output'));
        child.emit('close', exitCode);
    });

    return child;
}

const originalPlatform = process.platform;

function setPlatform(platform: string) {
    Object.defineProperty(process, 'platform', { value: platform });
}

describe('installDependencies', () => {
    afterEach(() => {
        setPlatform(originalPlatform);
        spawnMock.mockReset();
    });

    it('на windows запускает пакетный менеджер через shell (yarn/npm — это .cmd)', async () => {
        setPlatform('win32');
        spawnMock.mockImplementation(() => fakeChild(0));

        await installDependencies('/target', 'yarn');

        expect(spawnMock).toHaveBeenCalledWith(
            'yarn',
            [],
            expect.objectContaining({ cwd: '/target', shell: true }),
        );
    });

    it('на остальных платформах не использует shell', async () => {
        setPlatform('linux');
        spawnMock.mockImplementation(() => fakeChild(0));

        await installDependencies('/target', 'npm');

        expect(spawnMock).toHaveBeenCalledWith(
            'npm',
            ['install'],
            expect.objectContaining({ shell: false }),
        );
    });

    it('при ненулевом коде выхода реджектится с выводом процесса', async () => {
        setPlatform('linux');
        spawnMock.mockImplementation(() => fakeChild(1));

        await expect(installDependencies('/target', 'npm')).rejects.toThrow(
            /кодом 1[\s\S]*some output/,
        );
    });
});
