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
