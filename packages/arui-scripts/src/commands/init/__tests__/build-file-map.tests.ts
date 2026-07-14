import { buildContext } from '../build-context';
import { buildFileMap } from '../build-file-map';
import { type InitAnswers } from '../types';

const base: InitAnswers = {
    name: 'my-app',
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
                'src/client/components/__tests__/app.test.tsx',
            ]),
        );
    });

    it('для SSR создает серверную точку входа', () => {
        expect(map({ clientOnly: false })['src/server/index.ts']).toBeDefined();
    });

    it('для SSR клиент лежит в src/client/, для clientOnly — в src/', () => {
        const ssr = map({ clientOnly: false });

        expect(ssr['src/client/index.tsx']).toBeDefined();
        expect(ssr['src/index.tsx']).toBeUndefined();
        expect(ssr['arui-scripts.config.ts']).toContain("clientEntry: './src/client'");

        const spa = map({ clientOnly: true });

        expect(spa['src/index.tsx']).toBeDefined();
        expect(spa['src/client/index.tsx']).toBeUndefined();
    });

    it('серверная точка входа на Hapi', () => {
        const server = map({ clientOnly: false })['src/server/index.ts'];

        expect(server).toContain('@hapi/hapi');
        expect(server).toContain('@hapi/inert');
    });

    it('для clientOnly не создает сервер и ставит clientOnly:true в конфиге', () => {
        const files = map({ clientOnly: true });

        expect(files['src/server/index.ts']).toBeUndefined();
        expect(files['arui-scripts.config.ts']).toContain('clientOnly: true');
    });

    it('выбранный codeLoader попадает в конфиг', () => {
        expect(map({ codeLoader: 'babel' })['arui-scripts.config.ts']).toContain(
            "codeLoader: 'babel'",
        );
    });

    it('package.json содержит react и arui-scripts', () => {
        const pkg = map()['package.json'];

        expect(pkg).toContain('"react"');
        expect(pkg).toContain('"arui-scripts"');
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
});
