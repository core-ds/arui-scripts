import { resolveArtifactsConfig } from '../../config';
import { renderTemplates } from '../render';

const baseOptions = { cwd: __dirname, name: 'app', version: '1.0.0' };

describe('renderTemplates', () => {
    it('should render runtime dockerfile with the base image and start.sh', () => {
        const config = resolveArtifactsConfig({
            ...baseOptions,
            docker: { baseImage: 'my/base:1.0.0' },
        });
        const templates = renderTemplates({ config, variant: 'runtime' });

        expect(templates.dockerfile).toContain('FROM my/base:1.0.0');
        expect(templates.dockerfile).toContain('ADD $START_SH_LOCATION /src/start.sh');
        expect(templates.startScript).toContain('#!/bin/sh');
    });

    it('should render compiled dockerfile with install command', () => {
        const config = resolveArtifactsConfig({
            ...baseOptions,
            packageManager: { yarnVersion: 'unavailable' },
        });
        const templates = renderTemplates({ config, variant: 'compiled' });

        expect(templates.dockerfile).toContain('npm install --production');
        expect(templates.dockerfile).toContain('npm cache clean --force');
    });

    it('should not render base nginx conf when it is disabled', () => {
        const config = resolveArtifactsConfig({ ...baseOptions, nginx: { baseConf: false } });
        const templates = renderTemplates({ config });

        expect(templates.nginxBaseConf).toBe('');
    });

    it('should render base nginx conf with custom worker processes', () => {
        const config = resolveArtifactsConfig({
            ...baseOptions,
            nginx: { baseConf: { workerProcesses: 9 } },
        });
        const templates = renderTemplates({ config });

        expect(templates.nginxBaseConf).toContain('worker_processes            9;');
        // остальные значения донасыщаются дефолтами
        expect(templates.nginxBaseConf).toContain('worker_connections      19000;');
    });

    it('should render nginx server block with the nginx port and root path', () => {
        const config = resolveArtifactsConfig({
            ...baseOptions,
            nginx: { port: 9090, rootPath: '/app' },
        });
        const { nginxConf } = renderTemplates({ config });

        expect(nginxConf).toContain('listen 9090;');
        expect(nginxConf).toContain('root /app/.build;');
    });

    it('should render client-only start script when clientOnly is set', () => {
        const config = resolveArtifactsConfig({ ...baseOptions, clientOnly: true });
        const templates = renderTemplates({ config });

        expect(templates.startScript).toContain('env-config.json');
        expect(templates.startScript).not.toContain('max-old-space-size');
    });

    it.each([
        ['serverful', {}],
        ['clientOnly', { clientOnly: true }],
    ])('should not produce a duplicate "location /" in %s mode', (_name, extraOptions) => {
        const config = resolveArtifactsConfig({ ...baseOptions, ...extraOptions });
        const { nginxConf } = renderTemplates({ config });

        const rootLocations = nginxConf
            .split('\n')
            .filter((line) => /^\s*location\s+\/\s*\{/.test(line));

        // два `location /` в одном server-блоке — это `nginx: [emerg] duplicate location "/"`
        expect(rootLocations).toHaveLength(1);
        expect(nginxConf).toContain('location /assets/ {');
    });

    it('should use compiled dockerfile when the variant comes from the config', () => {
        const config = resolveArtifactsConfig({
            ...baseOptions,
            docker: { variant: 'compiled' },
        });
        const templates = renderTemplates({ config });

        expect(templates.dockerfile).toContain('ADD --chown=nginx:nginx package.json');
    });

    it('should apply full template replacement via templates', () => {
        const config = resolveArtifactsConfig(baseOptions);
        const templates = renderTemplates({
            config,
            templates: { nginxConf: () => 'CUSTOM NGINX' },
        });

        expect(templates.nginxConf).toBe('CUSTOM NGINX');
    });

    it('should apply point overrides on top of generated template', () => {
        const config = resolveArtifactsConfig(baseOptions);
        const templates = renderTemplates({
            config,
            variant: 'runtime',
            overrides: { dockerfile: (generated) => `${generated}\nLABEL team="web"` },
        });

        expect(templates.dockerfile).toContain('FROM');
        expect(templates.dockerfile).toContain('LABEL team="web"');
    });

    it('should route overrides to dockerfileCompiled key for compiled variant', () => {
        const config = resolveArtifactsConfig(baseOptions);
        const templates = renderTemplates({
            config,
            variant: 'compiled',
            overrides: { dockerfileCompiled: () => 'COMPILED OVERRIDE' },
        });

        expect(templates.dockerfile).toBe('COMPILED OVERRIDE');
    });
});
