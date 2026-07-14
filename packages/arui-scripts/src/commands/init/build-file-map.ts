import { appComponentTemplate } from './templates/app-component.template';
import { appStylesFileName, appStylesTemplate } from './templates/app-styles.template';
import { appTestTemplate } from './templates/app-test.template';
import { aruiScriptsConfigTemplate } from './templates/arui-scripts-config.template';
import { clientEntryTemplate } from './templates/client-entry.template';
import {
    gitignoreTemplate,
    globalDefinitionsTemplate,
    polyfillsTemplate,
    readmeTemplate,
} from './templates/misc.template';
import { packageJsonTemplate } from './templates/package-json.template';
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
        '.gitignore': gitignoreTemplate(),
        'global-definitions.d.ts': globalDefinitionsTemplate(),
        'README.md': readmeTemplate(ctx),
        [`${client}/index.tsx`]: clientEntryTemplate(ctx),
        [`${client}/components/app.tsx`]: appComponentTemplate(ctx),
        [`${client}/components/${appStylesFileName(ctx)}`]: appStylesTemplate(ctx),
        [`${client}/components/__tests__/app.test.tsx`]: appTestTemplate(ctx),
    };

    if (!ctx.clientOnly) {
        files['src/server/index.ts'] = serverEntryTemplate(ctx);
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

    return files;
}
