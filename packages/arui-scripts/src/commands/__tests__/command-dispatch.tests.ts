/* eslint-disable global-require, @typescript-eslint/no-var-requires, import/no-dynamic-require */
import path from 'path';

const flush = () =>
    new Promise<void>((resolve) => {
        setImmediate(resolve);
    });

describe('command process selection', () => {
    const oldEnv = process.env;
    const oldArgv = process.argv;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...oldEnv };
    });
    afterEach(() => {
        process.env = oldEnv;
        process.argv = oldArgv;
        jest.restoreAllMocks();
    });

    test.each(['start', 'start-prod', 'build'])(
        '%s selects client, server and type checker',
        (command) => {
            const run = jest.fn();

            jest.doMock('../../configs/app-configs', () => ({
                configs: {
                    clientOnly: false,
                    tsconfig: '/project/tsconfig.json',
                    disableDevRspackTypecheck: true,
                },
            }));
            jest.doMock('../util/run-compilers', () => ({ runCompilers: run }));
            require(`../${command}`);
            const scripts = run.mock.calls[0][0];

            expect(scripts.slice(0, 2)).toEqual([
                require.resolve(`../${command}/client`),
                require.resolve(`../${command}/server`),
            ]);
            if (command !== 'build')
                expect(scripts[2]).toEqual([
                    require.resolve('typescript/lib/tsc.js'),
                    '--watch',
                    '--noEmit',
                    '--project',
                    '/project/tsconfig.json',
                    '--skipLibCheck',
                ]);
            else expect(process.env.NODE_ENV).toBe('production');
        },
    );
    test.each(['start', 'start-prod', 'build'])(
        '%s respects client-only mode without separate type checking',
        (command) => {
            const run = jest.fn();

            jest.doMock('../../configs/app-configs', () => ({
                configs: { clientOnly: true, tsconfig: null, disableDevRspackTypecheck: false },
            }));
            jest.doMock('../util/run-compilers', () => ({ runCompilers: run }));
            require(`../${command}`);
            expect(run).toHaveBeenCalledWith([require.resolve(`../${command}/client`)]);
        },
    );
    test.each(['archive-build', 'docker-build', 'docker-build-compiled'])(
        'delegates %s to artifacts without executing Docker',
        async (command) => {
            const run = jest.fn().mockResolvedValue(undefined);

            jest.doMock('../util/run-artifacts-cli', () => ({ runArtifactsCli: run }));
            require(`../${command}`);
            await flush();
            expect(run).toHaveBeenCalledWith(
                command === 'docker-build-compiled' ? 'docker-build:compiled' : command,
            );
        },
    );
    test.each(['start', 'start-prod'])(
        '%s selects the matching client/server development config',
        (command) => {
            const client = jest.fn();
            const server = jest.fn();
            const browsers = jest.fn();

            jest.doMock('../util/run-client-dev-server', () => ({ runClientDevServer: client }));
            jest.doMock('../util/run-server-watch-compiler', () => ({
                runServerWatchCompiler: server,
            }));
            jest.doMock('../util/load-browserslist', () => ({ loadBrowserslist: browsers }));
            jest.doMock('../../configs/supporting-node', () => ({ supportingNode: ['node 22'] }));
            const mode = command === 'start' ? 'dev' : 'prod';

            jest.doMock(`../../configs/rspack.client.${mode}`, () => ({
                config: { target: 'client' },
                webpackClientConfig: { target: 'client' },
            }));
            jest.doMock(`../../configs/rspack.server.${mode}`, () => ({
                webpackServerConfig: { target: 'server' },
            }));
            require(`../${command}/client`);
            require(`../${command}/server`);
            expect(client).toHaveBeenCalledWith({ target: 'client' });
            expect(server).toHaveBeenCalledWith({ target: 'server' });
            expect(browsers).toHaveBeenCalledTimes(1);
            expect(process.env.BROWSERSLIST).toBe('node 22');
        },
    );
    test.each(['yarn/4.0', undefined])('ensure-yarn accepts %s', (agent) => {
        const exit = jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('exit');
        });

        if (agent) process.env.npm_config_user_agent = agent;
        else delete process.env.npm_config_user_agent;
        require('../ensure-yarn');
        expect(exit).not.toHaveBeenCalled();
    });
    test('ensure-yarn rejects a different package manager', () => {
        process.env.npm_config_user_agent = 'npm/10';
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('exit');
        });
        expect(() => require('../ensure-yarn')).toThrow('exit');
        expect(process.exit).toHaveBeenCalledWith(1);
    });
    test.each([0, 2, 'error'] as const)(
        'Vitest command forwards arguments and exit status %s',
        async (outcome) => {
            const run = jest.fn();

            if (outcome === 'error') run.mockRejectedValue(new Error('failed'));
            else run.mockResolvedValue(outcome);
            jest.doMock('../util/run-vitest', () => ({ runVitest: run }));
            process.argv = ['node', path.join('/app', 'arui-scripts'), 'test:vitest', '--coverage'];
            jest.spyOn(process, 'exit').mockImplementation((() => {}) as never);
            jest.spyOn(console, 'error').mockImplementation(() => {});
            require('../test-vitest');
            await flush();
            expect(run).toHaveBeenCalledWith({ args: ['--coverage'] });
            expect(process.exit).toHaveBeenCalledWith(outcome === 'error' ? 1 : outcome);
            expect(process.env.NODE_ENV).toBe('test');
        },
    );
});
