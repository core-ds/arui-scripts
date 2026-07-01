import { resolveDockerConfig } from '../config';
import {
    applyCommandLineArguments,
    getBuildParams,
    getDockerBuildCommand,
    getPlatformFlag,
} from '../utils/docker-build';

const baseOptions = { cwd: '/tmp/project', name: 'app', version: '1.0.0' };

describe('getBuildParams', () => {
    it('should build image name without registry', () => {
        const config = resolveDockerConfig(baseOptions);

        expect(getBuildParams(config).imageFullName).toBe('app:1.0.0');
    });

    it('should build image name with registry', () => {
        const config = resolveDockerConfig({
            ...baseOptions,
            dockerRegistry: 'registry.example.com',
        });

        expect(getBuildParams(config).imageFullName).toBe('registry.example.com/app:1.0.0');
    });

    it('should place temp dir inside cwd', () => {
        const config = resolveDockerConfig(baseOptions);

        expect(getBuildParams(config).pathToTempDir).toBe('/tmp/project/.docker-build');
    });
});

describe('applyCommandLineArguments', () => {
    it('should override name/version/registry from args', () => {
        const config = resolveDockerConfig(baseOptions);
        const next = applyCommandLineArguments(config, [
            'name=other',
            'version=2.0.0',
            'registry=r.example.com',
        ]);

        expect(getBuildParams(next).imageFullName).toBe('r.example.com/other:2.0.0');
    });
});

describe('getPlatformFlag', () => {
    it('should return empty string when platform is false', () => {
        const config = resolveDockerConfig({ ...baseOptions, platform: false });

        expect(getPlatformFlag(config)).toBe('');
    });

    it('should use explicit platform', () => {
        const config = resolveDockerConfig({ ...baseOptions, platform: 'linux/arm64' });

        expect(getPlatformFlag(config)).toBe('--platform linux/arm64');
    });
});

describe('getDockerBuildCommand', () => {
    it('should include dockerfile, build-args and context', () => {
        const config = resolveDockerConfig({ ...baseOptions, platform: false });
        const command = getDockerBuildCommand(config);

        expect(command).toContain('-f "./.docker-build/Dockerfile"');
        expect(command).toContain('--build-arg START_SH_LOCATION="./.docker-build/start.sh"');
        expect(command).toContain('-t app:1.0.0 .');
    });

    it('should include extra build args', () => {
        const config = resolveDockerConfig({
            ...baseOptions,
            platform: false,
            extraBuildArgs: { COMMIT_SHA: 'abc123' },
        });

        expect(getDockerBuildCommand(config)).toContain('--build-arg COMMIT_SHA="abc123"');
    });
});
