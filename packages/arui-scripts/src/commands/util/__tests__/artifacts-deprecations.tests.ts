/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock('../../../configs/app-configs', () => ({
    configs: {
        overridesPath: ['overrides'],
        // настройки сборки артефактов, которые проект не задавал, приезжают сюда как undefined
        dockerRegistry: undefined,
        baseDockerImage: 'my/base:1.0.0',
        nginx: undefined,
    },
}));

beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

it('should warn about deprecated settings the project actually sets', () => {
    jest.doMock('overrides', () => ({}), { virtual: true });

    const { warnAboutArtifactsDeprecations } = require('../artifacts-deprecations');

    warnAboutArtifactsDeprecations();

    expect(console.warn).toHaveBeenCalledTimes(1);

    const message = (console.warn as jest.Mock).mock.calls[0][0];

    expect(message).toContain('baseDockerImage → docker.baseImage');
    // не заданные проектом настройки в предупреждение не попадают
    expect(message).not.toContain('dockerRegistry');
});

it('should warn about deprecated template override keys', () => {
    jest.doMock('overrides', () => ({ 'start.sh': (config: string) => config }), {
        virtual: true,
    });

    const { warnAboutArtifactsDeprecations } = require('../artifacts-deprecations');

    warnAboutArtifactsDeprecations();

    const message = (console.warn as jest.Mock).mock.calls[0][0];

    expect(message).toContain('оверрайд start.sh → overrides.startScript');
});

it('should warn only once per process', () => {
    jest.doMock('overrides', () => ({}), { virtual: true });

    const { warnAboutArtifactsDeprecations } = require('../artifacts-deprecations');

    warnAboutArtifactsDeprecations();
    warnAboutArtifactsDeprecations();

    expect(console.warn).toHaveBeenCalledTimes(1);
});
