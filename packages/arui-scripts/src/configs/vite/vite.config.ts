import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import { createLogger } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { configs } from '../app-configs';
import { MODULES_ENTRY_NAME } from '../modules';
import postcssConfig from '../postcss';
import applyOverrides from '../util/apply-overrides';

export const viteConfig = applyOverrides('vite', {
    server: {
        middlewareMode: true,
        hmr: {
            protocol: 'ws',
        },
    },
    customLogger: {
        ...createLogger('info'),
        warn(msg: string) {
            // ignore warning about css import, they are created incorrectly
            if (!msg.includes('Default and named imports from CSS files are deprecated.')) {
                console.log(msg);
            }
        }
    },
    appType: 'custom',
    build: {
        manifest: true,
        rollupOptions: {
            input: configs.clientEntry as any,
        },
    },
    plugins: [
        react({
            jsxRuntime: 'classic',
        }),
        tsconfigPaths(),
        configs.modules ? federation({
            name: configs.modules.name || configs.normalizedName,
            filename: configs.modules.exposes ? MODULES_ENTRY_NAME : undefined,
            shared: configs.modules.shared,
            exposes: configs.modules.exposes,
        }) : null,
    ].filter(Boolean),
    resolve: {
        alias: [
            {
                // vite занимается резолвингом сам, поэтому postcss-omit-import-tilda не работает
                find: /^~(.*)$/,
                replacement: '$1',
            },
            // При реквайре этого из css в вебаке оно резолвится в index.css, а в vite - в index.js
            {
                find: /^~?@alfalab\/core-components\/vars$/,
                replacement: '@alfalab/core-components/vars/index.css'
            },
        ],
    },
    define: {
        global: 'window',
        'process.env': {},
        module: {},
    },
    css: {
        postcss: {
            /* eslint-disable @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require */
            plugins: postcssConfig.map(pluginName => {
                if (Array.isArray(pluginName)) {
                    return require(pluginName[0])(pluginName[1]);
                }

                return require(pluginName as string)();
            })
            /* eslint-enable @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require */
        }
    }
});
