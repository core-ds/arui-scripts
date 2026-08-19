import { EventEmitter } from 'events';

const spawnMock = jest.fn();

jest.mock('child_process', () => ({
    spawn: (...args: unknown[]) => spawnMock(...args),
}));

// eslint-disable-next-line import/first
import {
    createInitialCommit,
    initGitRepository,
    INITIAL_COMMIT_MESSAGE,
    installDependencies,
    installLefthook,
} from '../install-dependencies';

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

    it('installLefthook вызывает npx --no-install lefthook install', async () => {
        setPlatform('linux');
        spawnMock.mockImplementation(() => fakeChild(0));

        await installLefthook('/target');

        expect(spawnMock).toHaveBeenCalledWith(
            'npx',
            ['--no-install', 'lefthook', 'install'],
            expect.objectContaining({ cwd: '/target', shell: false }),
        );
    });

    it('initGitRepository вызывает git init', async () => {
        setPlatform('linux');
        spawnMock.mockImplementation(() => fakeChild(0));

        await initGitRepository('/target');

        expect(spawnMock).toHaveBeenCalledWith(
            'git',
            ['init'],
            expect.objectContaining({ cwd: '/target', shell: false }),
        );
    });

    it('createInitialCommit делает git add и commit', async () => {
        setPlatform('linux');
        spawnMock.mockImplementation(() => fakeChild(0));

        await createInitialCommit('/target');

        expect(spawnMock).toHaveBeenNthCalledWith(
            1,
            'git',
            ['add', '-A'],
            expect.objectContaining({ cwd: '/target' }),
        );
        expect(spawnMock).toHaveBeenNthCalledWith(
            2,
            'git',
            expect.arrayContaining(['commit', '--no-verify', '-m', INITIAL_COMMIT_MESSAGE]),
            expect.objectContaining({ cwd: '/target' }),
        );
    });
});
