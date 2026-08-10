import { type InitAnswers, type TemplateContext } from './types';

const VERSIONS = {
    react: '^19.0.0',
    reactDom: '^19.0.0',
    typescript: '^6.0.0',
    typesReact: '^19.0.0',
    typesReactDom: '^19.0.0',
    typesNode: '^24.0.0',
    typesWebpackEnv: '^1.18.0',
    hapi: '^21.3.2',
    inert: '^7.1.0',
    coreComponents: '^50.24.0',
    coreComponentsConfig: '^1.1.0',
    coreComponentsStackContext: '^1.0.1',
    scriptsServer: '^1.3.1',
    reduxToolkit: '^2.5.0',
    reactRedux: '^9.2.0',
    coreJs: '^3.32.0',
    reactCompilerRuntime: '^1.0.0',
    jest: '^29.7.0',
    tsJest: '^29.1.0',
    typesJest: '^29.5.0',
    vitest: '^4.1.5',
    aruiPresetsLint: '^11.0.0',
} as const;

export function buildContext(answers: InitAnswers, aruiScriptsVersion: string): TemplateContext {
    const dependencies: Record<string, string> = {
        react: VERSIONS.react,
        'react-dom': VERSIONS.reactDom,
        '@alfalab/core-components': VERSIONS.coreComponents,
        '@alfalab/core-components-config': VERSIONS.coreComponentsConfig,
        '@alfalab/core-components-stack-context': VERSIONS.coreComponentsStackContext,
    };

    const devDependencies: Record<string, string> = {
        'arui-scripts': `^${aruiScriptsVersion}`,
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

    if (answers.useLint) {
        devDependencies['arui-presets-lint'] = VERSIONS.aruiPresetsLint;
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
        useLint: answers.useLint,
        aruiScriptsVersion,
        dependencies,
        devDependencies,
    };
}
