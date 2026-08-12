describe('dockerfile.template (normal mode)', () => {
    function getTemplate(deleteNpm: boolean) {
        jest.resetModules();
        jest.doMock('../../configs/app-configs', () => ({
            configs: {
                baseDockerImage: 'test-image',
                clientOnly: false,
                nginx: null,
                runFromNonRootUser: false,
                buildPath: '.build',
                overridesPath: [],
                deleteNpm,
            },
        }));

        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        return require('../dockerfile.template').dockerfileTemplate;
    }

    it('should add npm removal step when deleteNpm is enabled', () => {
        const template = getTemplate(true);

        expect(template).toContain(
            'RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx /usr/local/lib/node_modules/npm',
        );
    });

    it('should not add npm removal step when deleteNpm is disabled', () => {
        const template = getTemplate(false);

        expect(template).not.toContain('rm -rf /usr/local/bin/npm');
    });
});

describe('dockerfile-compiled.template (compiled mode)', () => {
    function getTemplate(deleteNpm: boolean) {
        jest.resetModules();

        jest.doMock('../../configs/app-configs', () => ({
            configs: {
                baseDockerImage: 'test-image',
                nginx: null,
                overridesPath: [],
                deleteNpm,
            },
        }));
        jest.doMock('../../commands/util/yarn', () => ({
            getInstallProductionCommand: () => 'npm install --production',
            getYarnVersion: () => 'unavailable',
            getYarnBinSymlinkCommand: () => '',
        }));

        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        return require('../dockerfile-compiled.template').dockerfileTemplate;
    }

    it('should add npm removal step when deleteNpm is enabled', () => {
        const template = getTemplate(true);

        expect(template).toContain(
            'RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx /usr/local/lib/node_modules/npm',
        );
    });

    it('should not add npm removal step when deleteNpm is disabled', () => {
        const template = getTemplate(false);

        expect(template).not.toContain('rm -rf /usr/local/bin/npm');
    });

    it('should place the removal step before USER nginx', () => {
        const template = getTemplate(true);
        const rmStep = template.indexOf('rm -rf /usr/local/bin/npm');
        const userNginx = template.indexOf('USER nginx');

        expect(rmStep).toBeGreaterThan(-1);
        expect(rmStep).toBeLessThan(userNginx);
    });
});

describe('dockerfile-compiled.template with yarn 2+ symlink', () => {
    function getTemplate(opts: {
        yarnPath?: string | null;
        yarnVersion?: '1' | '2+' | 'unavailable';
    }) {
        const { yarnPath = null, yarnVersion = '2+' } = opts;

        jest.resetModules();
        jest.doMock('../../configs/app-configs', () => ({
            configs: {
                baseDockerImage: 'test-image',
                nginx: null,
                overridesPath: [],
                deleteNpm: false,
            },
        }));
        jest.doMock('../../commands/util/yarn', () => ({
            getInstallProductionCommand: () =>
                yarnVersion === '2+'
                    ? 'yarn workspaces focus --production --all'
                    : 'npm install --production',
            getYarnVersion: () => yarnVersion,
            getYarnBinSymlinkCommand: () =>
                yarnPath ? `ln -s /src/${yarnPath} /usr/local/bin/yarn && \\\n    ` : '',
        }));

        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        return require('../dockerfile-compiled.template').dockerfileTemplate;
    }

    it('should add symlink when yarn 2+ with yarnPath', () => {
        const template = getTemplate({
            yarnPath: '.yarn/releases/yarn-4.18.0.cjs',
        });

        expect(template).toContain('ln -s /src/.yarn/releases/yarn-4.18.0.cjs /usr/local/bin/yarn');
        expect(template).toContain('yarn workspaces focus --production --all');
        expect(template).toContain('yarn cache clean --all');
    });

    it('should not add symlink when yarn 2+ without yarnPath', () => {
        const template = getTemplate({ yarnPath: null });

        expect(template).not.toContain('ln -s');
        expect(template).toContain('yarn workspaces focus --production --all');
    });

    it('should not add symlink when npm (unavailable)', () => {
        const template = getTemplate({ yarnVersion: 'unavailable' });

        expect(template).not.toContain('ln -s');
        expect(template).toContain('npm install --production');
        expect(template).toContain('npm cache clean --force');
    });
});
