import { resolveDockerConfig } from '../config';
import { renderDockerTemplates } from '../render';

const baseOptions = { cwd: __dirname, name: 'app', version: '1.0.0' };

describe('renderDockerTemplates', () => {
    it('should render runtime dockerfile with the base image and start.sh', () => {
        const config = resolveDockerConfig({ ...baseOptions, baseDockerImage: 'my/base:1.0.0' });
        const templates = renderDockerTemplates({ config, variant: 'runtime' });

        expect(templates.dockerfile).toContain('FROM my/base:1.0.0');
        expect(templates.dockerfile).toContain('ADD $START_SH_LOCATION /src/start.sh');
        expect(templates.startScript).toContain('#!/bin/sh');
    });

    it('should render compiled dockerfile with install command', () => {
        const config = resolveDockerConfig({ ...baseOptions, yarnVersion: 'unavailable' });
        const templates = renderDockerTemplates({ config, variant: 'compiled' });

        expect(templates.dockerfile).toContain('npm install --production');
        expect(templates.dockerfile).toContain('npm cache clean --force');
    });

    it('should not render base nginx conf when nginx is disabled', () => {
        const config = resolveDockerConfig({ ...baseOptions, nginx: false });
        const templates = renderDockerTemplates({ config });

        expect(templates.nginxBaseConf).toBe('');
    });

    it('should render base nginx conf with custom worker processes', () => {
        const config = resolveDockerConfig({ ...baseOptions, nginx: { workerProcesses: 9 } });
        const templates = renderDockerTemplates({ config });

        expect(templates.nginxBaseConf).toContain('worker_processes            9;');
    });

    it('should render client-only start script when clientOnly is set', () => {
        const config = resolveDockerConfig({ ...baseOptions, clientOnly: true });
        const templates = renderDockerTemplates({ config });

        expect(templates.startScript).toContain('env-config.json');
        expect(templates.startScript).not.toContain('max-old-space-size');
    });

    it('should apply full template replacement via templates', () => {
        const config = resolveDockerConfig(baseOptions);
        const templates = renderDockerTemplates({
            config,
            templates: { nginxConf: () => 'CUSTOM NGINX' },
        });

        expect(templates.nginxConf).toBe('CUSTOM NGINX');
    });

    it('should apply point overrides on top of generated template', () => {
        const config = resolveDockerConfig(baseOptions);
        const templates = renderDockerTemplates({
            config,
            variant: 'runtime',
            overrides: { dockerfile: (generated) => `${generated}\nLABEL team="web"` },
        });

        expect(templates.dockerfile).toContain('FROM');
        expect(templates.dockerfile).toContain('LABEL team="web"');
    });

    it('should route overrides to dockerfileCompiled key for compiled variant', () => {
        const config = resolveDockerConfig(baseOptions);
        const templates = renderDockerTemplates({
            config,
            variant: 'compiled',
            overrides: { dockerfileCompiled: () => 'COMPILED OVERRIDE' },
        });

        expect(templates.dockerfile).toBe('COMPILED OVERRIDE');
    });
});
