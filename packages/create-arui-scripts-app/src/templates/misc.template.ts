import { type TemplateContext } from '../types';

export function gitignoreTemplate(): string {
    return `node_modules
.build
build.tar
.cache-loader

.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
`;
}

export function globalDefinitionsTemplate(): string {
    return `declare module '*.png' {
    const url: string;
    export default url;
}

declare module '*.svg' {
    const url: string;
    export default url;
}

declare module '*.module.css' {
    const styles: Record<string, string>;
    export default styles;
}

declare module '*.css';
`;
}

export function polyfillsTemplate(): string {
    return "import 'core-js/stable';\n";
}

export function yarnrcTemplate(): string {
    return `nodeLinker: node-modules

npmRegistryServer: "http://binary/artifactory/api/npm/npm/"

unsafeHttpWhitelist:
  - binary

yarnPath: .yarn/releases/yarn-4.9.1.cjs

defaultSemverRangePrefix: ""
`;
}

export function readmeTemplate(ctx: TemplateContext): string {
    const testCommand =
        ctx.testRunner === 'jest' ? 'arui-scripts test' : 'arui-scripts test:vitest';
    const lintSection = ctx.useLint
        ? `
    yarn lint         - eslint, stylelint, prettier, knip, secretlint
    yarn lint:fix    - автофикс eslint/stylelint + format
    yarn format       - prettier
`
        : '';

    return `# ${ctx.name}

Проект создан с помощью arui-scripts.

## Команды

    arui-scripts start - запуск dev-сервера
    arui-scripts build - production-сборка
    ${testCommand}${' '.repeat(Math.max(1, 20 - testCommand.length))}- запуск тестов${lintSection}
## Установка

    yarn install
`;
}
