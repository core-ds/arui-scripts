import { resolveArtifactsConfig } from '../config';
import {
    applyCommandLineArguments,
    getBuildParams,
    getDockerBuildCommand,
    getPlatformFlag,
    shellQuote,
} from '../utils/docker-build';

const baseOptions = { cwd: '/tmp/project', name: 'app', version: '1.0.0' };

describe('getBuildParams', () => {
    it('should build image name without registry', () => {
        const config = resolveArtifactsConfig(baseOptions);

        expect(getBuildParams(config).imageFullName).toBe('app:1.0.0');
    });

    it('should build image name with registry', () => {
        const config = resolveArtifactsConfig({
            ...baseOptions,
            dockerRegistry: 'registry.example.com',
        });

        expect(getBuildParams(config).imageFullName).toBe('registry.example.com/app:1.0.0');
    });

    it('should place temp dir inside cwd', () => {
        const config = resolveArtifactsConfig(baseOptions);

        expect(getBuildParams(config).pathToTempDir).toBe('/tmp/project/.docker-build');
    });
});

describe('applyCommandLineArguments', () => {
    it('should override name/version/registry from args', () => {
        const config = resolveArtifactsConfig(baseOptions);
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
        const config = resolveArtifactsConfig({ ...baseOptions, platform: false });

        expect(getPlatformFlag(config)).toBe('');
    });

    it('should use explicit platform', () => {
        const config = resolveArtifactsConfig({ ...baseOptions, platform: 'linux/arm64' });

        expect(getPlatformFlag(config)).toBe('--platform linux/arm64');
    });
});

describe('getDockerBuildCommand', () => {
    it('should include dockerfile, build-args and context', () => {
        const config = resolveArtifactsConfig({ ...baseOptions, platform: false });
        const command = getDockerBuildCommand(config);

        expect(command).toContain('-f ./.docker-build/Dockerfile');
        expect(command).toContain('--build-arg START_SH_LOCATION=./.docker-build/start.sh');
        expect(command).toContain('-t app:1.0.0 .');
    });

    it('should include extra build args', () => {
        const config = resolveArtifactsConfig({
            ...baseOptions,
            platform: false,
            extraBuildArgs: { COMMIT_SHA: 'abc123' },
        });

        expect(getDockerBuildCommand(config)).toContain('--build-arg COMMIT_SHA=abc123');
    });

    it('should escape extra build args so they cannot break out of the command', () => {
        const config = resolveArtifactsConfig({
            ...baseOptions,
            platform: false,
            extraBuildArgs: { EVIL: 'a"; touch /tmp/pwned; #' },
        });

        const command = getDockerBuildCommand(config);

        expect(command).toContain("--build-arg EVIL='a\"; touch /tmp/pwned; #'");
        expect(command).not.toContain('--build-arg EVIL=a";');
    });

    it('should escape image name and context', () => {
        const config = resolveArtifactsConfig({
            ...baseOptions,
            platform: false,
            name: 'app; rm -rf /',
            context: './my context',
        });

        const command = getDockerBuildCommand(config);

        expect(command).toContain("-t 'app; rm -rf /:1.0.0' './my context'");
    });
});

describe('shellQuote', () => {
    it('should leave safe values untouched', () => {
        expect(shellQuote('registry.example.com/app:1.0.0')).toBe('registry.example.com/app:1.0.0');
        expect(shellQuote('./.docker-build/Dockerfile')).toBe('./.docker-build/Dockerfile');
    });

    it('should quote values with shell metacharacters', () => {
        expect(shellQuote('a b')).toBe("'a b'");
        expect(shellQuote('$(whoami)')).toBe("'$(whoami)'");
    });

    it('should escape embedded single quotes', () => {
        expect(shellQuote("it's")).toBe("'it'\\''s'");
    });
});
