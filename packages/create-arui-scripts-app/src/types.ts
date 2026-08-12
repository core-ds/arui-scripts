export type CodeLoader = 'swc' | 'babel' | 'tsc';
export type TestRunner = 'jest' | 'vitest';
export type E2eFramework = 'cypress' | 'playwright' | 'none';

export type InitAnswers = {
    name: string;
    // использовать стек React + Redux Toolkit
    useRtk: boolean;
    // Только клиентская часть (без серверного бандла)
    clientOnly: boolean;
    codeLoader: CodeLoader;
    testRunner: TestRunner;
    // e2e фреймворк (cypress / playwright / без e2e фреймворка)
    e2eFramework: E2eFramework;
    // Подключать ли пример с CSS-модулями
    cssModules: boolean;
    clientServerPort: number;
    serverPort: number;
    dockerRegistry: string;
    // Имя preset-пакета
    presets: string;
    // Добавить полифилы (core-js + entry)
    polyfills: boolean;
    // Включить experimentalReactCompiler
    reactCompiler: boolean;
    // Подключить arui-presets-lint
    useLint: boolean;
    // Установить зависимости сразу после генерации
    install: boolean;
};

export type TemplateContext = {
    name: string;
    useRtk: boolean;
    clientOnly: boolean;
    codeLoader: CodeLoader;
    testRunner: TestRunner;
    e2eFramework: E2eFramework;
    cssModules: boolean;
    clientServerPort: number;
    serverPort: number;
    dockerRegistry: string;
    presets: string;
    polyfills: boolean;
    reactCompiler: boolean;
    useLint: boolean;
    aruiScriptsVersion: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
};
