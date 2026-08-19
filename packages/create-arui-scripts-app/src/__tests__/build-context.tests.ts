import { buildContext } from '../build-context';
import { type InitAnswers } from '../types';

const base: InitAnswers = {
    name: 'my-app',
    useRtk: false,
    clientOnly: false,
    codeLoader: 'swc',
    testRunner: 'jest',
    e2eFramework: 'none',
    useRouter: false,
    moduleRole: 'none',
    cssModules: true,
    clientServerPort: 8080,
    serverPort: 3000,
    dockerRegistry: '',
    presets: '',
    polyfills: false,
    reactCompiler: false,
    useLint: false,
    install: false,
};

describe('buildContext', () => {
    it('включает базовые зависимости (React 19) и arui-scripts нужной версии', () => {
        const ctx = buildContext(base, '23.0.1');

        expect(ctx.dependencies.react).toBe('^19.0.0');
        expect(ctx.dependencies['react-dom']).toBe('^19.0.0');
        expect(ctx.dependencies).not.toHaveProperty('arui-scripts');
        expect(ctx.devDependencies['arui-scripts']).toBe('^23.0.1');
        expect(ctx.dependencies).toHaveProperty('@alfalab/core-components');
        expect(ctx.devDependencies).toHaveProperty('typescript');
    });

    it('добавляет обязательные peer-зависимости core-components', () => {
        const ctx = buildContext(base, '23.0.1');

        expect(ctx.dependencies).toHaveProperty('@alfalab/core-components-config');
        expect(ctx.dependencies).toHaveProperty('@alfalab/core-components-stack-context');
    });

    it('для SSR добавляет @hapi/hapi, @hapi/inert и scripts-server', () => {
        const ctx = buildContext({ ...base, clientOnly: false }, '23.0.1');

        expect(ctx.dependencies).toHaveProperty('@hapi/hapi');
        expect(ctx.dependencies).toHaveProperty('@hapi/inert');
        expect(ctx.dependencies).toHaveProperty('@alfalab/scripts-server');
    });

    it('для clientOnly не добавляет серверные зависимости', () => {
        const ctx = buildContext({ ...base, clientOnly: true }, '23.0.1');

        expect(ctx.dependencies).not.toHaveProperty('@hapi/hapi');
        expect(ctx.dependencies).not.toHaveProperty('@hapi/inert');
        expect(ctx.dependencies).not.toHaveProperty('@alfalab/scripts-server');
    });

    it('для RTK добавляет @reduxjs/toolkit и react-redux', () => {
        const ctx = buildContext({ ...base, useRtk: true }, '23.0.1');

        expect(ctx.dependencies).toHaveProperty('@reduxjs/toolkit');
        expect(ctx.dependencies).toHaveProperty('react-redux');
    });

    it('polyfills добавляют core-js', () => {
        expect(buildContext({ ...base, polyfills: true }, '1.0.0').dependencies).toHaveProperty(
            'core-js',
        );
    });

    it('reactCompiler добавляет react-compiler-runtime', () => {
        expect(buildContext({ ...base, reactCompiler: true }, '1.0.0').dependencies).toHaveProperty(
            'react-compiler-runtime',
        );
    });

    it('jest добавляет jest/ts-jest, vitest только vitest', () => {
        const jestCtx = buildContext({ ...base, testRunner: 'jest' }, '1.0.0');

        expect(jestCtx.devDependencies).toHaveProperty('jest');
        expect(jestCtx.devDependencies).toHaveProperty('ts-jest');

        const vitestCtx = buildContext({ ...base, testRunner: 'vitest' }, '1.0.0');

        expect(vitestCtx.devDependencies).toHaveProperty('vitest');
        expect(vitestCtx.devDependencies).not.toHaveProperty('ts-jest');
    });

    it('useLint добавляет arui-presets-lint', () => {
        const withLint = buildContext({ ...base, useLint: true }, '1.0.0');
        const withoutLint = buildContext({ ...base, useLint: false }, '1.0.0');

        expect(withLint.devDependencies['arui-presets-lint']).toBe('^11.0.0');
        expect(withLint.useLint).toBe(true);
        expect(withoutLint.devDependencies).not.toHaveProperty('arui-presets-lint');
    });

    it('playwright добавляет @playwright/test, cypress - cypress, а для none ничего', () => {
        const noneCtx = buildContext({ ...base, e2eFramework: 'none' }, '1.0.0');
        const playwrightCtx = buildContext({ ...base, e2eFramework: 'playwright' }, '1.0.0');
        const cypressCtx = buildContext({ ...base, e2eFramework: 'cypress' }, '1.0.0');

        expect(noneCtx.devDependencies).not.toHaveProperty('@playwright/test');
        expect(noneCtx.devDependencies).not.toHaveProperty('cypress');

        expect(playwrightCtx.devDependencies).toHaveProperty('@playwright/test');
        expect(playwrightCtx.devDependencies).not.toHaveProperty('cypress');

        expect(cypressCtx.devDependencies).toHaveProperty('cypress');
        expect(cypressCtx.devDependencies).not.toHaveProperty('@playwright/test');
    });

    it('useRouter добавляет react-router и react-router-dom', () => {
        const withRouter = buildContext({ ...base, useRouter: true }, '1.0.0');
        const withoutRouter = buildContext({ ...base, useRouter: false }, '1.0.0');

        expect(withRouter.dependencies).toHaveProperty('react-router-dom');
        expect(withRouter.dependencies).toHaveProperty('react-router');
        expect(withoutRouter.dependencies).not.toHaveProperty('react-router-dom');
    });

    it('host и remote добавляют @alfalab/scripts-modules', () => {
        const host = buildContext({ ...base, moduleRole: 'host' }, '1.0.0');
        const remote = buildContext({ ...base, moduleRole: 'remote' }, '1.0.0');
        const none = buildContext({ ...base, moduleRole: 'none' }, '1.0.0');

        expect(host.dependencies).toHaveProperty('@alfalab/scripts-modules');
        expect(remote.dependencies).toHaveProperty('@alfalab/scripts-modules');
        expect(none.dependencies).not.toHaveProperty('@alfalab/scripts-modules');
    });
});
