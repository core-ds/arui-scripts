import { type TemplateContext } from '../types';

export function gitignoreTemplate(ctx?: TemplateContext): string {
    let e2eIgnores = '';

    if (ctx?.e2eFramework === 'playwright') {
        e2eIgnores = `
test-results/
playwright-report/
blob-report/
playwright/.cache/
`;
    } else if (ctx?.e2eFramework === 'cypress') {
        e2eIgnores = `
cypress/videos/
cypress/screenshots/
cypress/downloads/
`;
    }

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
${e2eIgnores}`;
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

    let e2eSection = '';

    if (ctx.e2eFramework === 'playwright') {
        e2eSection = `
## E2E (Playwright)

Перед первым запуском установите браузеры:

    yarn playwright install

Команды:

    yarn e2e      - headless-прогон
    yarn e2e:ui   - UI-режим Playwright

Dev-сервер поднимается автоматически через webServer в playwright.config.ts.
`;
    } else if (ctx.e2eFramework === 'cypress') {
        e2eSection = `
## E2E (Cypress)

Сначала запустите приложение (\`yarn start\`), затем в другом терминале:

    yarn e2e       - headless-прогон
    yarn e2e:open  - интерактивный Cypress
`;
    }

    const routerSection = ctx.useRouter
        ? `
## Маршруты

    /       - главная (Home)
    /about  - о проекте (About)
`
        : '';

    return `# ${ctx.name}

Проект создан с помощью arui-scripts.

## Команды

    arui-scripts start              - запуск dev-сервера
    arui-scripts start:prod         - dev-сервер с production-конфигом
    arui-scripts build              - production-сборка
    ${testCommand}${' '.repeat(Math.max(1, 32 - testCommand.length))}- запуск тестов
    arui-scripts bundle-analyze     - анализ клиентского бандла
    arui-scripts archive-build      - архив production-сборки
    arui-scripts docker-build:compiled - docker-образ из уже собранного .build${lintSection}
## Установка

    yarn install
${routerSection}${e2eSection}`;
}
