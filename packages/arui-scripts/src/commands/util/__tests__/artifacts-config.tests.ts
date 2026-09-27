import {
    resolveArtifactsConfig,
    type ResolvedArtifactsConfig,
} from '@alfalab/arui-scripts-artifacts';

import { applyOverrides } from '../../../configs/util/apply-overrides';
import { getArtifactsOptions, getResolvedArtifactsConfig } from '../artifacts-config';

jest.mock('@alfalab/arui-scripts-artifacts', () => ({
    ...jest.requireActual('@alfalab/arui-scripts-artifacts'),
    resolveArtifactsConfig: jest.fn(),
}));
jest.mock('../../../configs/app-configs', () => ({
    configs: {
        name: 'app',
        version: '1.2.3',
        cwd: '/project',
        clientOnly: true,
        serverPort: 3000,
        clientServerPort: 8080,
        dictionaryCompression: { enablePreviousVersionHeaders: true },
        nginx: 'custom nginx',
        dockerRegistry: 'registry',
        archiveName: 'app.tgz',
        additionalBuildPath: ['config'],
        useYarn: true,
        localNginxConf: 'nginx.conf',
        localNginxBaseConf: 'base.conf',
        removeDevDependenciesDuringDockerBuild: false,
    },
}));
jest.mock('../../../configs/util/apply-overrides', () => ({
    applyOverrides: jest.fn((_name, value) => `${value}:overridden`),
}));
jest.mock('../artifacts-deprecations', () => ({ warnAboutArtifactsDeprecations: jest.fn() }));

describe('legacy artifacts configuration bridge', () => {
    test('maps build options and keeps archive pruning independent from Docker', () => {
        const result = getArtifactsOptions();

        expect(result).toMatchObject({
            name: 'app',
            version: '1.2.3',
            cwd: '/project',
            clientOnly: true,
            docker: { registry: 'registry' },
            nginx: { port: 8080, enablePreviousVersionHeaders: true, baseConf: 'custom nginx' },
            archive: { name: 'app.tgz', additionalPaths: ['config'] },
            build: { removeDevDependencies: false },
            commands: { 'archive-build': { build: { removeDevDependencies: true } } },
            localFiles: { nginxConf: 'nginx.conf', nginxBaseConf: 'base.conf' },
        });
    });
    test('merges explicit nested options without losing inherited values', () => {
        const result = getArtifactsOptions({
            docker: { baseImage: 'node:22' },
            commands: { 'archive-build': { archive: { name: 'custom.tgz' } } },
        });

        expect(result.docker).toMatchObject({ registry: 'registry', baseImage: 'node:22' });
        expect(result.commands?.['archive-build']).toMatchObject({
            build: { removeDevDependencies: true },
            archive: { name: 'custom.tgz' },
        });
    });
    test('keeps historical nginx template names correctly mapped', () => {
        const { overrides } = getArtifactsOptions();
        const mapping = {
            dockerfile: 'Dockerfile',
            dockerfileCompiled: 'DockerfileCompiled',
            nginxConf: 'nginx',
            baseNginxConf: 'nginxConf',
            startScript: 'start.sh',
        };

        Object.entries(mapping).forEach(([key, legacy]) => {
            const override = overrides?.[key as keyof typeof mapping];

            if (!override) throw new Error('Missing override');
            expect(override('generated', {} as never)).toBe('generated:overridden');
            expect(applyOverrides).toHaveBeenCalledWith(legacy, 'generated');
        });
    });
    test('resolves shared settings once, without applying command-specific sections', () => {
        const resolved = { name: 'resolved' } as ResolvedArtifactsConfig;

        jest.mocked(resolveArtifactsConfig).mockReturnValue(resolved);
        expect(getResolvedArtifactsConfig()).toBe(resolved);
        expect(getResolvedArtifactsConfig()).toBe(resolved);
        expect(resolveArtifactsConfig).toHaveBeenCalledTimes(1);
        expect(jest.mocked(resolveArtifactsConfig).mock.calls[0][0]).not.toHaveProperty('commands');
    });
});
