import path from 'path';
import fs from 'fs';
import { AppConfigs, AppContext } from './types';
import { tryResolve } from '../util/resolve';

const CWD = process.cwd();
const absoluteSrcPath = path.resolve(CWD, 'src');

export function getDefaultAppConfig(): AppConfigs {
    const appPackage = getPackageJson();
    return {
        /// general settings
        clientServerPort: 8080,
        serverPort: 3000,
        debug: false,
        devSourceMaps: 'eval',
        devServerCors: false,
        useServerHMR: false,
        presets: appPackage.aruiScripts?.presets || null,
        proxy: appPackage.proxy || null,

        // paths
        buildPath: '.build',
        assetsPath: 'assets',
        additionalBuildPath: ['config'],
        statsOutputFilename: 'stats.json',
        serverEntry: path.resolve(absoluteSrcPath, 'server/index'),
        serverOutput: 'server.js',
        clientPolyfillsEntry: null,
        clientEntry: path.resolve(absoluteSrcPath, 'index'),

        // docker compilation configs
        dockerRegistry: '',
        baseDockerImage: 'alfabankui/arui-scripts:latest',
        nginxRootPath: '/src',
        runFromNonRootUser: true,
        removeDevDependenciesDuringDockerBuild: true,
        // archive compilation configs
        archiveName: 'build.tar',

        // build tuning
        keepPropTypes: false,
        useTscLoader: false,
        webpack4Compatibility: false,
        installServerSourceMaps: false,

        // image processing
        dataUrlMaxSize: 1536,
        imageMinimizer: {
            svg: {
                enabled: true,
            },
            gif: {
                enabled: false,
                optimizationLevel: 1,
            },
            jpg: {
                enabled: false,
                quality: 75,
            },
            png: {
                enabled: false,
                optimizationLevel: 3,
                bitDepthReduction: false,
                colorTypeReduction: false,
                paletteReduction: false,
            },
        },

        // CSS
        componentsTheme: null,
        keepCssVars: false,

        // Modules
        compatModules: null,
        modules: null,
    };
}

function getPackageJson() {
    const appPackage = JSON.parse(fs.readFileSync(path.join(CWD, 'package.json'), 'utf8'));

    if (appPackage['arui-scripts']) {
        throw Error('arui-scripts in package.json is not supported. Use aruiScripts instead.');
    }

    return appPackage;
}

export function getDefaultAppContext(): AppContext {
    const appPackage = getPackageJson();

    const absoluteNodeModulesPath = path.resolve(CWD, 'node_modules');
    const absoluteNodeModulesBinPath = path.resolve(absoluteNodeModulesPath, '.bin');
    const projectTsConfigPath = path.join(CWD, 'tsconfig.json');
    const yarnLockFilePath = path.join(CWD, 'yarn.lock');
    const overridesPath = tryResolve(path.join(CWD, 'arui-scripts.overrides'));
    const nginxConfFilePath = path.join(CWD, 'nginx.conf');
    const dockerfileFilePath = path.join(CWD, 'Dockerfile');
    const startScriptFilePath = path.join(CWD, 'start.sh');

    return {
        appPackage,
        name: appPackage.name,
        normalizedName: appPackage.name.replace(/-/g, '_'), // для использования в качестве имени переменной
        version: appPackage.version,

        // general paths
        cwd: CWD,
        appSrc: absoluteSrcPath,
        appNodeModules: absoluteNodeModulesPath,
        appNodeModulesBin: absoluteNodeModulesBinPath,
        overridesPath: overridesPath ? [overridesPath] : [],

        // tools availability
        babelRuntimeVersion: '7.0.0-beta.0',
        useYarn: fs.existsSync(yarnLockFilePath),

        // compilation configs locations
        tsconfig: fs.existsSync(projectTsConfigPath) ? projectTsConfigPath : null,
        localNginxConf: fs.existsSync(nginxConfFilePath) ? nginxConfFilePath : null,
        localDockerfile: fs.existsSync(dockerfileFilePath) ? dockerfileFilePath : null,
        localStartScript: fs.existsSync(startScriptFilePath) ? startScriptFilePath : null,

        // Эти пути зависят от других настроек, которые могут быть переопределены пользователем
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
