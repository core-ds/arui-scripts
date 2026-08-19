import { appComponentTemplate } from './templates/app-component.template';
import { appStylesFileName, appStylesTemplate } from './templates/app-styles.template';
import { appTestTemplate } from './templates/app-test.template';
import { aruiScriptsConfigTemplate } from './templates/arui-scripts-config.template';
import { clientEntryTemplate } from './templates/client-entry.template';
import {
    cypressConfigTemplate,
    cypressExampleSpecTemplate,
    cypressSupportCommandsTemplate,
    cypressSupportE2eTemplate,
} from './templates/e2e-cypress.template';
import {
    playwrightConfigTemplate,
    playwrightExampleSpecTemplate,
    playwrightHelpersTemplate,
} from './templates/e2e-playwright.template';
import {
    eslintConfigTemplate,
    knipConfigTemplate,
    lefthookConfigTemplate,
    secretlintConfigTemplate,
} from './templates/lint.template';
import {
    gitignoreTemplate,
    globalDefinitionsTemplate,
    polyfillsTemplate,
    readmeTemplate,
    yarnrcTemplate,
} from './templates/misc.template';
import { hostModuleMounterTemplate, remoteModuleTemplate } from './templates/modules.template';
import { packageJsonTemplate } from './templates/package-json.template';
import {
    aboutPageTemplate,
    homePageTemplate,
    layoutTemplate,
    routesTemplate,
} from './templates/router.template';
import { serverEntryTemplate } from './templates/server-entry.template';
import {
    counterSliceTemplate,
    storeHooksTemplate,
    storeIndexTemplate,
} from './templates/store.template';
import { tsconfigTemplate } from './templates/tsconfig.template';
import { vitestConfigTemplate } from './templates/vitest-config.template';
import { type TemplateContext } from './types';

export function clientBaseDir(ctx: TemplateContext): string {
    return ctx.clientOnly ? 'src' : 'src/client';
}

export function buildFileMap(ctx: TemplateContext): Record<string, string> {
    const client = clientBaseDir(ctx);

    const files: Record<string, string> = {
        'package.json': packageJsonTemplate(ctx),
        'arui-scripts.config.ts': aruiScriptsConfigTemplate(ctx),
        'tsconfig.json': tsconfigTemplate(ctx),
        '.gitignore': gitignoreTemplate(ctx),
        '.yarnrc.yml': yarnrcTemplate(),
        'global-definitions.d.ts': globalDefinitionsTemplate(),
        'README.md': readmeTemplate(ctx),
        [`${client}/index.tsx`]: clientEntryTemplate(ctx),
        [`${client}/components/app.tsx`]: appComponentTemplate(ctx),
        [`${client}/components/${appStylesFileName(ctx)}`]: appStylesTemplate(ctx),
        [`${client}/components/__tests__/app.test.ts`]: appTestTemplate(ctx),
    };

    if (!ctx.clientOnly) {
        files['src/server/index.tsx'] = serverEntryTemplate(ctx);
    }

    if (ctx.testRunner === 'vitest') {
        files['vitest.config.ts'] = vitestConfigTemplate();
    }

    if (ctx.polyfills) {
        files[`${client}/polyfills.ts`] = polyfillsTemplate();
    }

    if (ctx.useRtk) {
        files[`${client}/store/index.ts`] = storeIndexTemplate();
        files[`${client}/store/hooks.ts`] = storeHooksTemplate();
        files[`${client}/store/counter-slice.ts`] = counterSliceTemplate();
    }

    if (ctx.useRouter) {
        files[`${client}/routes.tsx`] = routesTemplate();
        files[`${client}/components/layout.tsx`] = layoutTemplate(ctx);
        files[`${client}/pages/home.tsx`] = homePageTemplate(ctx);
        files[`${client}/pages/about.tsx`] = aboutPageTemplate(ctx);
    }

    if (ctx.useLint) {
        files['eslint.config.mts'] = eslintConfigTemplate();
        files['knip.ts'] = knipConfigTemplate();
        files['.secretlintrc.json'] = secretlintConfigTemplate();
        files['lefthook.yml'] = lefthookConfigTemplate();
    }

    if (ctx.e2eFramework === 'playwright') {
        files['playwright.config.ts'] = playwrightConfigTemplate(ctx);
        files['e2e/helpers/index.ts'] = playwrightHelpersTemplate();
        files['e2e/example.spec.ts'] = playwrightExampleSpecTemplate();
    } else if (ctx.e2eFramework === 'cypress') {
        files['cypress.config.ts'] = cypressConfigTemplate(ctx);
        files['cypress/support/e2e.ts'] = cypressSupportE2eTemplate();
        files['cypress/support/commands.ts'] = cypressSupportCommandsTemplate();
        files['cypress/e2e/example.cy.ts'] = cypressExampleSpecTemplate();
    }

    if (ctx.moduleRole === 'host') {
        files[`${client}/components/remote-module.tsx`] = hostModuleMounterTemplate(ctx);
    } else if (ctx.moduleRole === 'remote') {
        files['src/modules/example/index.tsx'] = remoteModuleTemplate();
    }

    return files;
}
