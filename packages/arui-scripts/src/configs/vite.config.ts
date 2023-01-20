import applyOverrides from './util/apply-overrides';
import configs from './app-configs';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import postcssConfig from './postcss';

export const viteConfig = applyOverrides('vite', {
    server: {
        middlewareMode: true,
        hmr: {
            protocol: 'ws',
        }
    },
    appType: 'custom',
    build: {
        manifest: true,
        rollupOptions: {
            input: configs.clientEntry,
        },
    },
    plugins: [
        react({
            jsxRuntime: 'classic',
        }),
        tsconfigPaths(),
    ],
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
            plugins: postcssConfig
        }
    }
});
