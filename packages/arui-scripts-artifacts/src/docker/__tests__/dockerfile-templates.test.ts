import { resolveArtifactsConfig } from '../../config';
import { type ArtifactsOptions } from '../../config/types';
import { renderDockerfile } from '../templates/dockerfile.template';
import { renderDockerfileCompiled } from '../templates/dockerfile-compiled.template';

const baseOptions: ArtifactsOptions = { cwd: __dirname, name: 'app', version: '1.0.0' };

const NPM_REMOVAL_STEP =
    'RUN rm -rf /usr/local/bin/npm /usr/local/bin/npx /usr/local/lib/node_modules/npm';

describe('renderDockerfile (runtime)', () => {
    function render(deleteNpm: boolean, runFromNonRootUser = false) {
        return renderDockerfile(
            resolveArtifactsConfig({
                ...baseOptions,
                docker: { baseImage: 'test-image', deleteNpm, runFromNonRootUser },
            }),
        );
    }

    it('should add npm removal step when deleteNpm is enabled', () => {
        expect(render(true)).toContain(NPM_REMOVAL_STEP);
    });

    it('should not add npm removal step when deleteNpm is disabled', () => {
        expect(render(false)).not.toContain('rm -rf /usr/local/bin/npm');
    });

    it('should place the removal step before USER nginx when runFromNonRootUser is enabled', () => {
        const dockerfile = render(true, true);
        const rmStep = dockerfile.indexOf('rm -rf /usr/local/bin/npm');
        const userNginx = dockerfile.indexOf('USER nginx');

        expect(rmStep).toBeGreaterThan(-1);
        expect(userNginx).toBeGreaterThan(-1);
        expect(rmStep).toBeLessThan(userNginx);
    });
});

describe('renderDockerfileCompiled', () => {
    function render(options: ArtifactsOptions = {}) {
        return renderDockerfileCompiled(
            resolveArtifactsConfig({
                ...baseOptions,
                ...options,
                docker: { baseImage: 'test-image', ...options.docker },
                packageManager: { yarnVersion: 'unavailable', ...options.packageManager },
            }),
        );
    }

    it('should add npm removal step when deleteNpm is enabled', () => {
        expect(render({ docker: { deleteNpm: true } })).toContain(NPM_REMOVAL_STEP);
    });

    it('should not add npm removal step when deleteNpm is disabled', () => {
        expect(render({ docker: { deleteNpm: false } })).not.toContain('rm -rf /usr/local/bin/npm');
    });

    it('should place the removal step before USER nginx', () => {
        const dockerfile = render({ docker: { deleteNpm: true } });
        const rmStep = dockerfile.indexOf('rm -rf /usr/local/bin/npm');
        const userNginx = dockerfile.indexOf('USER nginx');

        expect(rmStep).toBeGreaterThan(-1);
        expect(rmStep).toBeLessThan(userNginx);
    });

    it('should add symlink when yarn 2+ with yarnPath', () => {
        const dockerfile = render({
            packageManager: {
                yarnVersion: '2+',
                yarnBinSymlinkCommand:
                    'ln -sf /src/.yarn/releases/yarn-4.18.0.cjs /usr/local/bin/yarn && \\\n    ',
            },
        });

        expect(dockerfile).toContain(
            'ln -sf /src/.yarn/releases/yarn-4.18.0.cjs /usr/local/bin/yarn',
        );
        expect(dockerfile).toContain('yarn workspaces focus --production --all');
        expect(dockerfile).toContain('yarn cache clean --all');
    });

    it('should not add symlink when yarn 2+ without yarnPath', () => {
        const dockerfile = render({ packageManager: { yarnVersion: '2+' } });

        expect(dockerfile).not.toContain('ln -s');
        expect(dockerfile).toContain('yarn workspaces focus --production --all');
    });

    it('should not add symlink when npm (unavailable)', () => {
        const dockerfile = render();

        expect(dockerfile).not.toContain('ln -s');
        expect(dockerfile).toContain('npm install --production');
        expect(dockerfile).toContain('npm cache clean --force');
    });
});
