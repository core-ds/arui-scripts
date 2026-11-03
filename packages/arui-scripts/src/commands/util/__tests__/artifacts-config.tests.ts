import fs from 'fs';
import os from 'os';
import path from 'path';

import { resolveArtifactsConfig, resolveCommandOptions } from '@alfalab/arui-scripts-artifacts';

import { configs } from '../../../configs/app-configs';
import { getArtifactsOptions } from '../artifacts-config';
import artifactsConfig from '../arui-scripts-artifacts';

jest.mock('../../../configs/app-configs', () => ({
    configs: {
        cwd: '',
        name: 'app',
        version: '1.2.3',
        dockerRegistry: 'registry.example.com',
        baseDockerImage: 'company/base:1',
        removeDevDependenciesDuringDockerBuild: false,
        useYarn: false,
        dictionaryCompression: { enablePreviousVersionHeaders: true },
        overridesPath: ['artifact-overrides'],
    },
}));

jest.mock(
    'artifact-overrides',
    () => ({
        Dockerfile: (content: string) => `${content}:docker`,
        DockerfileCompiled: (content: string) => `${content}:compiled`,
        nginx: (content: string) => `${content}:server`,
        nginxConf: (content: string) => `${content}:base`,
        'start.sh': (content: string) => `${content}:start`,
    }),
    { virtual: true },
);

let cwd: string;

beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-artifacts-config-'));
    configs.cwd = cwd;
});

afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
    jest.restoreAllMocks();
});

it('keeps artifact settings and overrides supported without deprecation warnings', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const options = getArtifactsOptions();

    expect(options.docker).toMatchObject({
        registry: 'registry.example.com',
        baseImage: 'company/base:1',
    });
    expect(warn).not.toHaveBeenCalled();
});

it.each(['docker-build', 'docker-build:compiled', 'archive-build'])(
    '%s ignores the standalone artifacts config in the project',
    async (command) => {
        fs.writeFileSync(
            path.join(cwd, 'arui-scripts-artifacts.ts'),
            "throw new Error('Standalone artifacts config must not be loaded');",
        );
        if (typeof artifactsConfig !== 'function') {
            throw new Error('The built-in config must be evaluated lazily');
        }
        const configFile = await artifactsConfig();
        const options = resolveCommandOptions(command, configFile);

        expect(options).not.toBeNull();
        expect(options?.docker?.registry).toBe('registry.example.com');
        expect(options?.docker?.baseImage).toBe('company/base:1');
        expect(options?.artifact).toBe(command === 'archive-build' ? 'archive' : 'docker');
        const variants: Record<string, string> = {
            'docker-build': 'runtime',
            'docker-build:compiled': 'compiled',
        };

        expect(options?.docker?.variant).toBe(variants[command]);
        expect(options?.build?.removeDevDependencies).toBe(command === 'archive-build');
    },
);

it('maps the historical nginx override names to the correct templates', () => {
    const { overrides } = getArtifactsOptions();
    const config = resolveArtifactsConfig({ cwd, packageManager: { useYarn: false } });

    expect(overrides?.dockerfile?.('generated', config)).toBe('generated:docker');
    expect(overrides?.dockerfileCompiled?.('generated', config)).toBe('generated:compiled');
    expect(overrides?.nginxConf?.('generated', config)).toBe('generated:server');
    expect(overrides?.baseNginxConf?.('generated', config)).toBe('generated:base');
    expect(overrides?.startScript?.('generated', config)).toBe('generated:start');
});

it('preserves explicit programmatic overrides without replacing unrelated fields', () => {
    const options = getArtifactsOptions({ docker: { registry: 'other.example.com' } });

    expect(options.docker).toMatchObject({
        registry: 'other.example.com',
        baseImage: 'company/base:1',
    });
});
