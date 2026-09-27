import * as artifacts from '@alfalab/arui-scripts-artifacts';

import { patchMainRspackConfigForModules } from '../configs/modules';
import * as api from '..';

describe('public compatibility exports', () => {
    test.each([
        'buildDockerImage',
        'getBuildParams',
        'renderBaseNginxConf',
        'renderDockerfile',
        'renderDockerfileCompiled',
        'renderTemplates',
        'renderNginxConf',
        'renderStartScript',
        'resolveArtifactsConfig',
    ] as const)('re-exports %s from the artifacts package', (name) => {
        expect(api[name]).toBe(artifacts[name]);
    });
    test.each([
        'prepareFilesForDocker',
        'getBuildParamsFromArgs',
        'getDockerBuildCommand',
        'getArtifactsOptions',
        'getResolvedArtifactsConfig',
    ] as const)('keeps the legacy %s entry point callable', (name) => {
        expect(typeof api[name]).toBe('function');
    });
    test('keeps the historical webpack modules alias', () => {
        expect(api.patchMainWebpackConfigForModules).toBe(patchMainRspackConfigForModules);
        expect(api.patchMainRspackConfigForModules).toBe(patchMainRspackConfigForModules);
    });
});
