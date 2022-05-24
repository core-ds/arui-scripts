export type AppConfigs = {
    appPackage: any; // todo;
    name: string;
    version: string;
    dockerRegistry: string;
    baseDockerImage: string;

    cwd: string;
    appSrc: string;
    appNodeModules: string;
    buildPath: string;
    assetsPath: string;
    additionalBuildPath: string[];
    nginxRootPath: string;
    runFromNonRootUser: boolean;
    archiveName: string;

    serverEntry: string | string[] | Record<string, string | string[]>;
    serverOutput: string;

    clientPolyfillsEntry: null | string | string[];
    clientEntry: string;
    keepPropTypes: boolean;

    tsconfig: string | null;
    localNginxConf: string | null;
    localDockerfile: string | null;

    useTscLoader: boolean;
    useServerHMR: boolean;
    useYarn: boolean;

    clientServerPort: number;
    serverPort: number;

    debug: boolean;
    overridesPath: string[];
    statsOutputFilename: string;

    removeDevDependenciesDuringDockerBuild: boolean;

    componentsTheme: string | undefined;
    keepCssVars: boolean;

    publicPath: string;
    serverOutputPath: string;
    clientOutputPath: string;
    statsOutputPath: string;
};
