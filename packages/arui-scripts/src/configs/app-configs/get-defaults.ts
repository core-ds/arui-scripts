import path from 'path';
import fs from 'fs';
import { AppConfigs } from './types';
import { tryResolve } from '../util/resolve';

export function getDefaults(): AppConfigs {
    const CWD = process.cwd();

    const appPackage = JSON.parse(fs.readFileSync(path.join(CWD, 'package.json'), 'utf8'));

    if (appPackage['arui-scripts']) {
        throw Error('arui-scripts in package.json is not supported. Use aruiScripts instead.');
    }
    const absoluteSrcPath = path.resolve(CWD, 'src');
    const absoluteNodeModulesPath = path.resolve(CWD, 'node_modules');
    const absoluteNodeModulesBinPath = path.resolve(absoluteNodeModulesPath, '.bin');
    const projectTsConfigPath = path.join(CWD, 'tsconfig.json');
    const yarnLockFilePath = path.join(CWD, 'yarn.lock');
    const overridesPath = tryResolve(path.join(CWD, 'arui-scripts.overrides'));
    const nginxConfFilePath = path.join(CWD, 'nginx.conf');
    const dockerfileFilePath = path.join(CWD, 'Dockerfile');

    return {
        appPackage,
        name: appPackage.name,
        version: appPackage.version,
        dockerRegistry: '',
        baseDockerImage: 'alfabankui/arui-scripts:latest',

        // general paths
        cwd: CWD,
        appSrc: absoluteSrcPath,
        appNodeModules: absoluteNodeModulesPath,
        appNodeModulesBin: absoluteNodeModulesBinPath,
        buildPath: '.build',
        assetsPath: 'assets',
        additionalBuildPath: ['config'],
        nginxRootPath: '/src',
        runFromNonRootUser: true,
        archiveName: 'build.tar',
        babelRuntimeVersion: '7.0.0-beta.0',

        // server compilation configs
        serverEntry: path.resolve(absoluteSrcPath, 'server/index'),
        serverOutput: 'server.js',

        // client compilation configs
        clientPolyfillsEntry: null,
        clientEntry: path.resolve(absoluteSrcPath, 'index'),
        keepPropTypes: false,

        // compilation configs locations
        tsconfig: fs.existsSync(projectTsConfigPath) ? projectTsConfigPath : null,
        localNginxConf: fs.existsSync(nginxConfFilePath) ? nginxConfFilePath : null,
        localDockerfile: fs.existsSync(dockerfileFilePath) ? dockerfileFilePath : null,

        devSourceMaps: 'eval',
        useTscLoader: false,
        useServerHMR: false,
        webpack4Compatibility: false,
        useYarn: fs.existsSync(yarnLockFilePath),
        clientServerPort: 8080,
        serverPort: 3000,
        installServerSourceMaps: false,

        debug: false,
        overridesPath: overridesPath ? [overridesPath] : [],
        statsOutputFilename: 'stats.json',

        removeDevDependenciesDuringDockerBuild: true,

        componentsTheme: undefined,
        keepCssVars: false,

        // ?????? ???????? ?????????????? ???? ???????????? ????????????????, ?????????????? ?????????? ???????? ???????????????????????????? ??????????????????????????
        publicPath: '',
        serverOutputPath: '',
        clientOutputPath: '',
        statsOutputPath: '',
        watchIgnorePath: [],

        // changelog paths
        changelogPath: path.resolve(CWD, './CHANGELOG.md'),
        changelogTmpPath: path.resolve(CWD, './CHANGELOG_TMP.md'),
        changelogFeaturesPath: path.resolve(CWD, './changelog_features.tmp'),
        changelogBugfixesPath: path.resolve(CWD, './changelog_bugfixes.tmp'),
        changelogBreakingChangesPath: path.resolve(CWD, './changelog_breaking_changes.tmp'),
    };
}
