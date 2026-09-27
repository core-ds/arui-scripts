import * as artifacts from '@alfalab/arui-scripts-artifacts';

import { configs } from '../../../configs/app-configs';
import * as yarn from '../yarn';

jest.mock('@alfalab/arui-scripts-artifacts', () => ({
    getYarnVersion: jest.fn(),
    getPruningCommand: jest.fn(() => 'prune'),
    getInstallProductionCommand: jest.fn(() => 'install'),
    getYarnPathFromRc: jest.fn(() => '.yarn/releases/yarn.cjs'),
    getYarnBinSymlinkCommand: jest.fn(() => 'link'),
}));
jest.mock('../../../configs/app-configs', () => ({
    configs: { useYarn: true, clientOnly: false, cwd: '/project with spaces' },
}));

afterEach(() => jest.clearAllMocks());

test.each([true, false])(
    'passes clientOnly=%s and the detected Yarn version to pruning',
    (clientOnly) => {
        configs.clientOnly = clientOnly;
        jest.mocked(artifacts.getYarnVersion).mockReturnValue('2+');
        expect(yarn.getPruningCommand()).toBe('prune');
        expect(artifacts.getYarnVersion).toHaveBeenCalledWith({ useYarn: true });
        expect(artifacts.getPruningCommand).toHaveBeenCalledWith({ clientOnly, yarnVersion: '2+' });
    },
);

test('uses the project directory for yarnPath and symlink commands', () => {
    jest.mocked(artifacts.getYarnVersion).mockReturnValue('2+');
    expect(yarn.getYarnPathFromRc()).toBe('.yarn/releases/yarn.cjs');
    expect(artifacts.getYarnPathFromRc).toHaveBeenCalledWith('/project with spaces');
    expect(yarn.getYarnBinSymlinkCommand()).toBe('link');
    expect(artifacts.getYarnBinSymlinkCommand).toHaveBeenCalledWith({
        yarnVersion: '2+',
        cwd: '/project with spaces',
    });
});

test('delegates production installation using the detected package manager', () => {
    configs.useYarn = false;
    jest.mocked(artifacts.getYarnVersion).mockReturnValue('unavailable');
    expect(yarn.getInstallProductionCommand()).toBe('install');
    expect(artifacts.getYarnVersion).toHaveBeenCalledWith({ useYarn: false });
    expect(artifacts.getInstallProductionCommand).toHaveBeenCalledWith('unavailable');
    configs.useYarn = true;
});
