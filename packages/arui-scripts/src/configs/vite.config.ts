import applyOverrides from './util/apply-overrides';
import configs from './app-configs';
import react from '@vitejs/plugin-react';
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
    ],
    resolve: {
        alias: {
            '#': configs.appSrc,
            '@alfalab/core-components/vars': '@alfalab/core-components/vars/index.css',
        },
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
