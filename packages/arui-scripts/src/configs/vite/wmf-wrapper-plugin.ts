import { Plugin } from 'vite';

const runtimePublicPath = '/@wmf-wrapper';

/**
 * Плагин, добавляющий глобал для работы с wmf в vite. Поскольку мы хотим управлять wmf из библиотеки - нам нельзя просто импортировать всякие
 * виртуальные модули vite - такие импорты сломаются при сборке в других бандлерах. Делаем глобал, который экспозит
 * апи виртуального модуля из vite-federation
 */
export function WmfWrapperPlugin(): Plugin {
    let devBase = '/';
    const htmlImportCode = `import "__BASE__${ runtimePublicPath.slice(1) }"`;
    const runtimeCode = `
const viteFederation = await import('virtual:__federation__');

window.__vite_federation_wrapper__ = {
    getRemote(containerId, moduleId) {
        viteFederation.__federation_method_setRemote(containerId, {
            format: 'var',
            inited: true,
            from: 'webpack',
            lib: window[containerId],
        });
        return viteFederation.__federation_method_getRemote(containerId, moduleId);
    }
};`

    return {
        name: 'vite-expose-module',
        // eslint-disable-next-line consistent-return
        resolveId(id) {
            if (id === runtimePublicPath) {
                return id;
            }
        },
        // eslint-disable-next-line consistent-return
        load(id) {
            if (id === runtimePublicPath) {
                return runtimeCode;
            }
        },
        transformIndexHtml() {
            return [
                {
                    tag: 'script',
                    attrs: {type: 'module'},
                    children: htmlImportCode.replace('__BASE__', devBase),
                },
            ];
        },
        configResolved(config) {
            devBase = config.base;
        },
    }
}
