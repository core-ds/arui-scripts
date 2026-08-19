import { buildContext } from '../build-context';
import { buildFileMap } from '../build-file-map';
import { type InitAnswers } from '../types';

const base: InitAnswers = {
    name: 'my-app',
    useRtk: false,
    clientOnly: false,
    codeLoader: 'swc',
    testRunner: 'jest',
    e2eFramework: 'none',
    useRouter: false,
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

function map(overrides: Partial<InitAnswers> = {}): Record<string, string> {
    return buildFileMap(buildContext({ ...base, ...overrides }, '23.0.1'));
}

describe('buildFileMap', () => {
    it('создает общий набор файлов', () => {
        const keys = Object.keys(map());

        expect(keys).toEqual(
            expect.arrayContaining([
                'package.json',
                'arui-scripts.config.ts',
                'tsconfig.json',
                '.gitignore',
                'global-definitions.d.ts',
                'README.md',
                'src/client/index.tsx',
                'src/client/components/app.tsx',
                'src/client/components/__tests__/app.test.ts',
            ]),
        );
    });

    it('.yarnrc.yml содержит нужные настройки yarn', () => {
        const yarnrc = map()['.yarnrc.yml'];

        expect(yarnrc).toContain('nodeLinker: node-modules');
        expect(yarnrc).toContain('npmRegistryServer: "http://binary/artifactory/api/npm/npm/"');
        expect(yarnrc).toContain('unsafeHttpWhitelist:');
        expect(yarnrc).toContain('- binary');
        expect(yarnrc).toContain('yarnPath: .yarn/releases/yarn-4.9.1.cjs');
        expect(yarnrc).toContain('defaultSemverRangePrefix: ""');
    });

    it('.gitignore игнорирует yarn файлы', () => {
        const gitignore = map()['.gitignore'];

        expect(gitignore).toContain('node_modules');
        expect(gitignore).toContain('.pnp.*');
        expect(gitignore).toContain('.yarn/*');
        expect(gitignore).toContain('!.yarn/patches');
        expect(gitignore).toContain('!.yarn/plugins');
        expect(gitignore).toContain('!.yarn/releases');
        expect(gitignore).toContain('!.yarn/sdks');
        expect(gitignore).toContain('!.yarn/versions');
    });

    it('для SSR создает серверную точку входа', () => {
        expect(map({ clientOnly: false })['src/server/index.tsx']).toBeDefined();
    });

    it('для SSR клиент лежит в src/client/, для clientOnly в src/', () => {
        const ssr = map({ clientOnly: false });

        expect(ssr['src/client/index.tsx']).toBeDefined();
        expect(ssr['src/index.tsx']).toBeUndefined();
        expect(ssr['arui-scripts.config.ts']).toContain("clientEntry: './src/client'");

        const spa = map({ clientOnly: true });

        expect(spa['src/index.tsx']).toBeDefined();
        expect(spa['src/client/index.tsx']).toBeUndefined();
    });

    it('серверная точка входа на Hapi', () => {
        const server = map({ clientOnly: false })['src/server/index.tsx'];

        expect(server).toContain('@hapi/hapi');
        expect(server).toContain('@hapi/inert');
    });

    it('SSR сервер рендерит приложение, клиент гидрирует разметку', () => {
        const files = map({ clientOnly: false });

        expect(files['src/server/index.tsx']).toContain('renderToString');
        expect(files['src/server/index.tsx']).toContain(
            "import { App } from '../client/components/app'",
        );
        expect(files['src/client/index.tsx']).toContain('hydrateRoot');
    });

    it('SSR с RTK передает состояние store клиенту', () => {
        const files = map({ clientOnly: false, useRtk: true });

        expect(files['src/server/index.tsx']).toContain('makeStore');
        expect(files['src/server/index.tsx']).toContain('__PRELOADED_STATE__');
        expect(files['src/client/index.tsx']).toContain('makeStore(window.__PRELOADED_STATE__)');
        expect(files['src/client/store/index.ts']).toContain('makeStore');
    });

    it('clientOnly клиент рендерит с нуля через createRoot', () => {
        expect(map({ clientOnly: true })['src/index.tsx']).toContain('createRoot');
    });

    it('для clientOnly не создает сервер и ставит clientOnly:true в конфиге', () => {
        const files = map({ clientOnly: true });

        expect(files['src/server/index.tsx']).toBeUndefined();
        expect(files['arui-scripts.config.ts']).toContain('clientOnly: true');
    });

    it('выбранный codeLoader попадает в конфиг', () => {
        expect(map({ codeLoader: 'babel' })['arui-scripts.config.ts']).toContain(
            "codeLoader: 'babel'",
        );
    });

    it('package.json кладёт arui-scripts в devDependencies', () => {
        const pkg = JSON.parse(map()['package.json']) as {
            dependencies: Record<string, string>;
            devDependencies: Record<string, string>;
            engines: { node: string };
            scripts: Record<string, string>;
        };

        expect(pkg.dependencies).toHaveProperty('react');
        expect(pkg.dependencies).not.toHaveProperty('arui-scripts');
        expect(pkg.devDependencies['arui-scripts']).toBe('^23.0.1');
        expect(pkg.engines.node).toBe('>=24.11.1');
        expect(pkg.scripts['start:prod']).toBe('arui-scripts start:prod');
        expect(pkg.scripts['bundle-analyze']).toBe('arui-scripts bundle-analyze');
        expect(pkg.scripts['archive-build']).toBe('arui-scripts archive-build');
        expect(pkg.scripts['docker-build:compiled']).toBe('arui-scripts docker-build:compiled');
        expect(pkg.scripts['docker-build']).toBeUndefined();
    });

    it('при dockerRegistry добавляет docker-build рядом с docker-build:compiled', () => {
        const pkg = JSON.parse(map({ dockerRegistry: 'reg.example' })['package.json']) as {
            scripts: Record<string, string>;
        };

        expect(pkg.scripts['docker-build']).toBe('arui-scripts docker-build');
        expect(pkg.scripts['docker-build:compiled']).toBe('arui-scripts docker-build:compiled');
    });

    it('экранирует dockerRegistry и presets в конфиге', () => {
        const config = map({
            dockerRegistry: "reg.io/org's",
            presets: 'my-preset\\name',
        })['arui-scripts.config.ts'];

        expect(config).toContain("dockerRegistry: 'reg.io/org\\'s'");
        expect(config).toContain("presets: 'my-preset\\\\name'");
    });

    it('экранирует имя проекта в JSX', () => {
        const app = map({ name: "O'Reilly <App>" })['src/client/components/app.tsx'];

        expect(app).toContain("const appName = 'O\\'Reilly <App>';");
        expect(app).toContain('{appName}');
    });

    it('App построен на core-components, конфиг подключает тему', () => {
        const files = map();

        expect(files['src/client/components/app.tsx']).toContain('@alfalab/core-components/button');
        expect(files['src/client/components/app.tsx']).toContain(
            '@alfalab/core-components/typography',
        );
        expect(files['arui-scripts.config.ts']).toContain('componentsTheme');
    });

    it('cssModules:true создает app.module.css и импорт styles', () => {
        const files = map({ cssModules: true });

        expect(files['src/client/components/app.module.css']).toBeDefined();
        expect(files['src/client/components/app.css']).toBeUndefined();
        expect(files['src/client/components/app.tsx']).toContain(
            "import styles from './app.module.css'",
        );
    });

    it('стили импортируют vars, чтобы были доступны миксины core-components', () => {
        const modulesCss = map({ cssModules: true })['src/client/components/app.module.css'];
        const globalCss = map({ cssModules: false })['src/client/components/app.css'];

        expect(modulesCss).toContain("@import '@alfalab/core-components/vars'");
        expect(modulesCss).toContain('@mixin headline_small');
        expect(globalCss).toContain("@import '@alfalab/core-components/vars'");
        expect(globalCss).toContain('@mixin headline_small');
    });

    it('cssModules:false создает app.css и глобальный импорт', () => {
        const files = map({ cssModules: false });

        expect(files['src/client/components/app.css']).toBeDefined();
        expect(files['src/client/components/app.module.css']).toBeUndefined();
        expect(files['src/client/components/app.tsx']).toContain("import './app.css'");
    });

    it('polyfills создают polyfills.ts и clientPolyfillsEntry в конфиге', () => {
        const files = map({ polyfills: true });

        expect(files['src/client/polyfills.ts']).toBeDefined();
        expect(files['arui-scripts.config.ts']).toContain(
            "clientPolyfillsEntry: './src/client/polyfills'",
        );
    });

    it('useRtk создает store/* и оборачивает index.tsx в Provider', () => {
        const files = map({ useRtk: true });

        expect(files['src/client/store/index.ts']).toBeDefined();
        expect(files['src/client/store/hooks.ts']).toBeDefined();
        expect(files['src/client/store/counter-slice.ts']).toBeDefined();
        expect(files['src/client/index.tsx']).toContain('Provider');
    });

    it('без RTK store-файлы не создаются', () => {
        expect(map({ useRtk: false })['src/client/store/index.ts']).toBeUndefined();
    });

    it('vitest создает vitest.config.ts и ставит скрипт test:vitest', () => {
        const files = map({ testRunner: 'vitest' });

        expect(files['vitest.config.ts']).toBeDefined();
        expect(files['package.json']).toContain('arui-scripts test:vitest');
    });

    it('jest добавляет preset и не создает vitest.config.ts', () => {
        const files = map({ testRunner: 'jest' });

        expect(files['vitest.config.ts']).toBeUndefined();
        expect(files['package.json']).toContain('"preset": "arui-scripts"');
    });

    it('useLint создает конфиги и scripts arui-presets-lint', () => {
        const files = map({ useLint: true });
        const pkg = JSON.parse(files['package.json']) as {
            prettier: string;
            stylelint: { extends: string };
            commitlint: { extends: string };
            scripts: Record<string, string>;
            devDependencies: Record<string, string>;
        };

        expect(files['eslint.config.mts']).toContain('arui-presets-lint/eslint');
        expect(files['knip.ts']).toContain("import baseConfig from 'arui-presets-lint/knip'");
        expect(files['knip.ts']).toContain("'ts-jest'");
        expect(files['.secretlintrc.json']).toContain(
            '@secretlint/secretlint-rule-preset-recommend',
        );
        expect(files['lefthook.yml']).toContain(
            './node_modules/arui-presets-lint/lefthook/index.yml',
        );
        expect(pkg.prettier).toBe('arui-presets-lint/prettier');
        expect(pkg.stylelint.extends).toBe('arui-presets-lint/stylelint');
        expect(pkg.commitlint.extends).toBe('./node_modules/arui-presets-lint/commitlint');
        expect(pkg.scripts.lint).toContain('yarn lint:scripts');
        expect(pkg.scripts['lint:styles']).toBe('arui-presets-lint styles --max-warnings=0');
        expect(pkg.scripts['lint:scripts']).toBe('arui-presets-lint scripts --max-warnings=0');
        expect(pkg.devDependencies).toHaveProperty('arui-presets-lint');
        expect(files['README.md']).toContain('yarn lint');
    });

    it('без useLint не создает lint-конфиги', () => {
        const files = map({ useLint: false });

        expect(files['eslint.config.mts']).toBeUndefined();
        expect(files['knip.ts']).toBeUndefined();
        expect(files['.secretlintrc.json']).toBeUndefined();
        expect(files['lefthook.yml']).toBeUndefined();
        expect(files['package.json']).not.toContain('arui-presets-lint');
    });

    it('playwright создает конфиг, helpers, smoke тест и скрипты', () => {
        const files = map({ e2eFramework: 'playwright', clientServerPort: 9090 });
        const pkg = JSON.parse(files['package.json']) as {
            scripts: Record<string, string>;
            devDependencies: Record<string, string>;
        };

        expect(files['playwright.config.ts']).toContain("testDir: './e2e'");
        expect(files['playwright.config.ts']).toContain("baseURL: 'http://localhost:9090'");
        expect(files['playwright.config.ts']).toContain("command: 'yarn start'");
        expect(files['e2e/helpers/index.ts']).toContain('gotoHome');
        expect(files['e2e/example.spec.ts']).toContain("from './helpers'");
        expect(files['.gitignore']).toContain('playwright-report/');
        expect(files['README.md']).toContain('yarn playwright install');
        expect(pkg.scripts.e2e).toBe('playwright test');
        expect(pkg.scripts['e2e:ui']).toBe('playwright test --ui');
        expect(pkg.devDependencies).toHaveProperty('@playwright/test');
        expect(files['cypress.config.ts']).toBeUndefined();
    });

    it('cypress создает конфиг, support, smoke тест и скрипты', () => {
        const files = map({ e2eFramework: 'cypress', clientServerPort: 7070 });
        const pkg = JSON.parse(files['package.json']) as {
            scripts: Record<string, string>;
            devDependencies: Record<string, string>;
        };

        expect(files['cypress.config.ts']).toContain("baseUrl: 'http://localhost:7070'");
        expect(files['cypress/support/e2e.ts']).toContain("import './commands'");
        expect(files['cypress/support/commands.ts']).toBeDefined();
        expect(files['cypress/e2e/example.cy.ts']).toContain("cy.visit('/')");
        expect(files['.gitignore']).toContain('cypress/videos/');
        expect(files['README.md']).toContain('yarn e2e:open');
        expect(pkg.scripts.e2e).toBe('cypress run');
        expect(pkg.scripts['e2e:open']).toBe('cypress open');
        expect(pkg.devDependencies).toHaveProperty('cypress');
        expect(files['playwright.config.ts']).toBeUndefined();
    });

    it('без e2e не создает e2e файлы и скрипты', () => {
        const files = map({ e2eFramework: 'none' });
        const pkg = JSON.parse(files['package.json']) as { scripts: Record<string, string> };

        expect(files['playwright.config.ts']).toBeUndefined();
        expect(files['cypress.config.ts']).toBeUndefined();
        expect(files['e2e/example.spec.ts']).toBeUndefined();
        expect(files['cypress/e2e/example.cy.ts']).toBeUndefined();
        expect(pkg.scripts.e2e).toBeUndefined();
        expect(files['README.md']).not.toContain('## E2E');
    });

    it('useRouter создает routes, layout, pages и BrowserRouter/StaticRouter', () => {
        const files = map({ useRouter: true, clientOnly: false });
        const pkg = JSON.parse(files['package.json']) as {
            dependencies: Record<string, string>;
        };

        expect(files['src/client/routes.tsx']).toContain('AppRoutes');
        expect(files['src/client/components/layout.tsx']).toContain('Outlet');
        expect(files['src/client/pages/home.tsx']).toContain('HomePage');
        expect(files['src/client/pages/about.tsx']).toContain('AboutPage');
        expect(files['src/client/components/app.tsx']).toContain('AppRoutes');
        expect(files['src/client/index.tsx']).toContain('BrowserRouter');
        expect(files['src/server/index.tsx']).toContain('StaticRouter');
        expect(files['src/server/index.tsx']).toContain('/{path*}');
        expect(files['README.md']).toContain('/about');
        expect(pkg.dependencies).toHaveProperty('react-router-dom');
    });

    it('без useRouter не создает routes/pages', () => {
        const files = map({ useRouter: false });

        expect(files['src/client/routes.tsx']).toBeUndefined();
        expect(files['src/client/pages/home.tsx']).toBeUndefined();
        expect(files['src/client/index.tsx']).not.toContain('BrowserRouter');
        expect(files['package.json']).not.toContain('react-router-dom');
    });
});
