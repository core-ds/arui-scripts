import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import { createLogger } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { configs } from '../app-configs';
import { MODULES_ENTRY_NAME } from '../modules';
import postcssConfig from '../postcss';
import applyOverrides from '../util/apply-overrides';

import { ExposeModulePlugin } from './expose-module-plugin';
import { WmfWrapperPlugin } from './wmf-wrapper-plugin';

export const viteConfig = applyOverrides('vite', {
    server: {
        middlewareMode: true,
        hmr: {
            protocol: 'ws',
        },
    },
    esbuild: {
        tsconfigRaw: {
            compilerOptions: {
                experimentalDecorators: true,
            }
        }
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
            babel: {
                parserOpts: {
                    plugins: ['decorators-legacy'],
                },
            },
        }),
        tsconfigPaths(),
        configs.modules ? federation({
            name: configs.modules.name || configs.normalizedName,
            filename: configs.modules.exposes ? MODULES_ENTRY_NAME : undefined,
            shared: configs.modules.shared,
            exposes: configs.modules.exposes,
            remotes: {},
        }) : null,
        configs.modules ? WmfWrapperPlugin() : null,
        configs.compatModules?.shared ? ExposeModulePlugin(configs.compatModules.shared) : null,
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
            // core-components поставляется сразу в виде esm и не esm. При резолве из разных зависимостей
            // rollup резолвит часть запросов в esm версию, а часть - в cjs. Из-за этого возникает дублирование стилей и кода
            // делаем так, чтобы все импорты из коров резолвились в одинаковое место
            {
                find: /@alfalab\/core-components\/(.*?)\/esm\/(.*)$/,
                replacement: '@alfalab/core-components/$1/$2',
            }
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
