import { type InitAnswers, type TemplateContext } from './types';

const VERSIONS = {
    react: '^19.0.0',
    reactDom: '^19.0.0',
    typescript: '^6.0.0',
    typesReact: '^19.0.0',
    typesReactDom: '^19.0.0',
    typesNode: '^20.0.0',
    typesWebpackEnv: '^1.18.0',
    hapi: '^21.3.2',
    inert: '^7.1.0',
    coreComponents: '^42.1.0',
    scriptsServer: '^1.3.1',
    reduxToolkit: '^2.5.0',
    reactRedux: '^9.2.0',
    coreJs: '^3.32.0',
    reactCompilerRuntime: '^1.0.0',
    jest: '^29.7.0',
    tsJest: '^29.1.0',
    typesJest: '^29.5.0',
    vitest: '^4.1.5',
} as const;

export function buildContext(answers: InitAnswers, aruiScriptsVersion: string): TemplateContext {
    const dependencies: Record<string, string> = {
        react: VERSIONS.react,
        'react-dom': VERSIONS.reactDom,
        'arui-scripts': `^${aruiScriptsVersion}`,
        '@alfalab/core-components': VERSIONS.coreComponents,
    };

    const devDependencies: Record<string, string> = {
        typescript: VERSIONS.typescript,
        '@types/react': VERSIONS.typesReact,
        '@types/react-dom': VERSIONS.typesReactDom,
        '@types/node': VERSIONS.typesNode,
        '@types/webpack-env': VERSIONS.typesWebpackEnv,
    };

    if (!answers.clientOnly) {
        dependencies['@alfalab/scripts-server'] = VERSIONS.scriptsServer;
        dependencies['@hapi/hapi'] = VERSIONS.hapi;
        dependencies['@hapi/inert'] = VERSIONS.inert;
    }

    if (answers.useRtk) {
        dependencies['@reduxjs/toolkit'] = VERSIONS.reduxToolkit;
        dependencies['react-redux'] = VERSIONS.reactRedux;
    }

    if (answers.polyfills) {
        dependencies['core-js'] = VERSIONS.coreJs;
    }

    if (answers.reactCompiler) {
        dependencies['react-compiler-runtime'] = VERSIONS.reactCompilerRuntime;
    }

    if (answers.testRunner === 'jest') {
        devDependencies.jest = VERSIONS.jest;
        devDependencies['ts-jest'] = VERSIONS.tsJest;
        devDependencies['@types/jest'] = VERSIONS.typesJest;
    } else {
        devDependencies.vitest = VERSIONS.vitest;
    }

    return {
        name: answers.name,
        useRtk: answers.useRtk,
        clientOnly: answers.clientOnly,
        codeLoader: answers.codeLoader,
        testRunner: answers.testRunner,
        cssModules: answers.cssModules,
        clientServerPort: answers.clientServerPort,
        serverPort: answers.serverPort,
        dockerRegistry: answers.dockerRegistry.trim(),
        presets: answers.presets.trim(),
        polyfills: answers.polyfills,
        reactCompiler: answers.reactCompiler,
        aruiScriptsVersion,
        dependencies,
        devDependencies,
    };
}
