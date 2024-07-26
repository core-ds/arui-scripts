import { Plugin } from 'vite';

type ExposeConfiguration = {
    [packageName: string]: string;
};

const runtimePublicPath = '/@expose-loader';

/**
 * Плагин, работающий аналогично expose-loader из webpack. Выставляет в window библиотеки по указаным названиям.
 */
export function ExposeModulePlugin(configuration: ExposeConfiguration): Plugin {
    let devBase = '/';
    const htmlImportCode = `import "__BASE__${ runtimePublicPath.slice(1) }"`;
    const runtimeCode = Object.keys(configuration)
        .map((packageName) => (
            `import ${ configuration[packageName] } from '${ packageName }';
                        window['${ configuration[packageName] }'] = ${ configuration[packageName] };`
        ))
        .join('\n');

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
