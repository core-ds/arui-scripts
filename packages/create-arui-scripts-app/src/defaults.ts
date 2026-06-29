import { type CodeLoader, type InitAnswers, type TestRunner } from './types';

export type CliFlags = {
    yes?: boolean;
    force?: boolean;
    name?: string;
    useRtk?: boolean;
    clientOnly?: boolean;
    codeLoader?: CodeLoader;
    testRunner?: TestRunner;
    cssModules?: boolean;
    clientServerPort?: number;
    serverPort?: number;
    dockerRegistry?: string;
    presets?: string;
    polyfills?: boolean;
    reactCompiler?: boolean;
    install?: boolean;
};

export function defaultAnswers(name: string): InitAnswers {
    return {
        name,
        useRtk: false,
        clientOnly: false,
        codeLoader: 'swc',
        testRunner: 'jest',
        cssModules: true,
        clientServerPort: 8080,
        serverPort: 3000,
        dockerRegistry: '',
        presets: '',
        polyfills: false,
        reactCompiler: false,
        install: false,
    };
}

const ANSWER_FLAG_KEYS: Array<keyof CliFlags> = [
    'name',
    'useRtk',
    'clientOnly',
    'codeLoader',
    'testRunner',
    'cssModules',
    'clientServerPort',
    'serverPort',
    'dockerRegistry',
    'presets',
    'polyfills',
    'reactCompiler',
    'install',
];

export function hasAnswerFlags(flags: CliFlags): boolean {
    return ANSWER_FLAG_KEYS.some((key) => flags[key] !== undefined);
}

/** Собирает ответы из флагов CLI (для --yes / non-interactive). */
export function answersFromFlags(defaultName: string, flags: CliFlags): InitAnswers {
    const base = defaultAnswers(flags.name?.trim() || defaultName);

    return {
        ...base,
        ...(flags.useRtk !== undefined ? { useRtk: flags.useRtk } : {}),
        ...(flags.clientOnly !== undefined ? { clientOnly: flags.clientOnly } : {}),
        ...(flags.codeLoader !== undefined ? { codeLoader: flags.codeLoader } : {}),
        ...(flags.testRunner !== undefined ? { testRunner: flags.testRunner } : {}),
        ...(flags.cssModules !== undefined ? { cssModules: flags.cssModules } : {}),
        ...(flags.clientServerPort !== undefined
            ? { clientServerPort: flags.clientServerPort }
            : {}),
        ...(flags.serverPort !== undefined ? { serverPort: flags.serverPort } : {}),
        ...(flags.dockerRegistry !== undefined ? { dockerRegistry: flags.dockerRegistry } : {}),
        ...(flags.presets !== undefined ? { presets: flags.presets } : {}),
        ...(flags.polyfills !== undefined ? { polyfills: flags.polyfills } : {}),
        ...(flags.reactCompiler !== undefined ? { reactCompiler: flags.reactCompiler } : {}),
        ...(flags.install !== undefined ? { install: flags.install } : {}),
        name: (flags.name?.trim() || defaultName).trim(),
    };
}
