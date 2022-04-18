import { AppConfigs } from './types';

/**
 * Эти ключи из конфига будут обновляться из package.json при их наличии
 */
export const availablePackageSettings = [
    'dockerRegistry',
    'baseDockerImage',
    'serverEntry',

    'buildPath',
    'assetsPath',
    'additionalBuildPath',
    'nginxRootPath',
    'runFromNonRootUser',
    'archiveName',

    'serverOutput',
    'clientPolyfillsEntry',
    'clientEntry',
    'keepPropTypes',

    'useTscLoader',
    'useServerHMR',
    'clientServerPort',
    'serverPort',

    'debug',
    'statsOutputFilename',
    'componentsTheme',
    'keepCssVars',
] as const;

type ArrayElementType<ArrayType extends ReadonlyArray<unknown>> = ArrayType[number];

export type PackageSettings = Partial<Pick<AppConfigs, ArrayElementType<typeof availablePackageSettings>>>;
