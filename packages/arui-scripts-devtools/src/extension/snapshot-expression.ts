import {
    DEVTOOLS_EVENT_BUS_NAMESPACE,
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    SUPPORTED_DEVTOOLS_VERSION,
    SUPPORTED_EVENT_BUS_VERSION,
    SUPPORTED_MODULES_VERSION,
} from '../constants';

/**
 * Выражение, которое расширение выполняет на инспектируемой странице.
 *
 * `chrome.devtools.inspectedWindow.eval` возвращает результат структурным клоном, поэтому
 * наружу должны уехать данные, а не сам стор с его функциями: разбор версий и вызов
 * `getSnapshot` происходят на той стороне.
 *
 * Оба неймспейса читаются одним запросом: они независимы (загрузчик модулей и шина - разные
 * пакеты), но спрашивать страницу дважды за то же самое незачем.
 *
 * Вместе с данными уезжает начало отсчёта времени страницы: у документа панели свой
 * `performance`, и без этой засечки панель не может ни отличить записи прошлой загрузки
 * страницы, ни сказать, сколько уже висит незавершённая стадия.
 *
 * Собрано из тех же констант, что и остальной пакет: разъехаться версиям и ключам неоткуда.
 * Внутри - ES5 без стрелок и опциональных цепочек: выражение исполняется в контексте страницы,
 * а её движок нам не подконтролен.
 */
export const SNAPSHOT_EXPRESSION = `(function () {
    function readNamespace(root, name, supported) {
        try {
            if (!root) {
                return { status: 'waiting' };
            }

            var store = root[name];

            if (!store) {
                return { status: 'waiting' };
            }

            if (store.version !== supported) {
                return { status: 'unsupported', found: store.version, supported: supported };
            }

            if (typeof store.getSnapshot !== 'function') {
                return { status: 'waiting' };
            }

            return { status: 'ready', snapshot: store.getSnapshot() };
        } catch (error) {
            return { status: 'waiting' };
        }
    }

    function readPageClock() {
        try {
            return typeof performance !== 'undefined' &&
                typeof performance.timeOrigin === 'number' &&
                isFinite(performance.timeOrigin)
                ? { timeOrigin: performance.timeOrigin }
                : undefined;
        } catch (error) {
            return undefined;
        }
    }

    try {
        var page = readPageClock();
        var root = window[${JSON.stringify(DEVTOOLS_GLOBAL_KEY)}];

        if (root && root.version !== ${SUPPORTED_DEVTOOLS_VERSION}) {
            var unsupported = {
                status: 'unsupported',
                found: root.version,
                supported: ${SUPPORTED_DEVTOOLS_VERSION},
            };

            return { modules: unsupported, eventBus: unsupported, page: page };
        }

        return {
            modules: readNamespace(
                root,
                ${JSON.stringify(DEVTOOLS_MODULES_NAMESPACE)},
                ${SUPPORTED_MODULES_VERSION},
            ),
            eventBus: readNamespace(
                root,
                ${JSON.stringify(DEVTOOLS_EVENT_BUS_NAMESPACE)},
                ${SUPPORTED_EVENT_BUS_VERSION},
            ),
            page: page,
        };
    } catch (error) {
        return { modules: { status: 'waiting' }, eventBus: { status: 'waiting' } };
    }
})()`;
