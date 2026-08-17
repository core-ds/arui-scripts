import {
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    SUPPORTED_DEVTOOLS_VERSION,
    SUPPORTED_MODULES_VERSION,
} from '../constants';

/**
 * Выражение, которое расширение выполняет на инспектируемой странице.
 *
 * Это тот же разбор, что делает `readStoreState` у инжектнутой панели, только выполняться
 * ему приходится на той стороне: `chrome.devtools.inspectedWindow.eval` возвращает результат
 * структурным клоном, поэтому наружу должны уехать данные, а не сам стор с его функциями.
 *
 * Собрано из тех же констант, что и остальной пакет: разъехаться версиям и ключу неоткуда.
 * Внутри - ES5 без стрелок и опциональных цепочек: выражение исполняется в контексте страницы,
 * а её движок нам не подконтролен.
 */
export const SNAPSHOT_EXPRESSION = `(function () {
    try {
        var root = window[${JSON.stringify(DEVTOOLS_GLOBAL_KEY)}];

        if (!root) {
            return { status: 'waiting' };
        }

        if (root.version !== ${SUPPORTED_DEVTOOLS_VERSION}) {
            return {
                status: 'unsupported',
                found: root.version,
                supported: ${SUPPORTED_DEVTOOLS_VERSION},
            };
        }

        var store = root[${JSON.stringify(DEVTOOLS_MODULES_NAMESPACE)}];

        if (!store) {
            return { status: 'waiting' };
        }

        if (store.version !== ${SUPPORTED_MODULES_VERSION}) {
            return {
                status: 'unsupported',
                found: store.version,
                supported: ${SUPPORTED_MODULES_VERSION},
            };
        }

        if (typeof store.getSnapshot !== 'function') {
            return { status: 'waiting' };
        }

        return { status: 'ready', snapshot: store.getSnapshot() };
    } catch (error) {
        return { status: 'waiting' };
    }
})()`;
