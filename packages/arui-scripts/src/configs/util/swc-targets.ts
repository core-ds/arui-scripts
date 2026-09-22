// browserslist — peer зависимость кучи других пакетов, поэтому не добавляем её себе в прямые (см. commands/util/load-browserslist.ts)
// eslint-disable-next-line import/no-extraneous-dependencies
import browserslist from 'browserslist';

import { configs } from '../app-configs';

/**
 * Цели компиляции в формате SWC (`env.targets`): минимальная версия для каждого браузера.
 */
export type SwcTargets = Record<string, string>;

/**
 * Соответствие имён браузеров из browserslist ключам, которые понимает SWC.
 * SWC хранит данные о поддержке фич только для этих ключей: неизвестный ключ ломает сборку,
 * а ключи без данных (and_chr, op_mob и т.п.) заставляют его включать все трансформации разом.
 * Маппинг повторяет @babel/helper-compilation-targets.
 */
const BROWSER_NAME_MAP: Record<string, string> = {
    and_chr: 'chrome',
    and_ff: 'firefox',
    android: 'android',
    chrome: 'chrome',
    edge: 'edge',
    firefox: 'firefox',
    ie: 'ie',
    ie_mob: 'ie',
    ios_saf: 'ios',
    node: 'node',
    op_mob: 'opera_mobile',
    opera: 'opera',
    safari: 'safari',
    samsung: 'samsung',
};

const VERSION_REGEXP = /^\d+(\.\d+)*$/;

function compareVersions(a: string, b: string) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    const length = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < length; i += 1) {
        const diff = (aParts[i] || 0) - (bParts[i] || 0);

        if (diff !== 0) {
            return diff;
        }
    }

    return 0;
}

/**
 * Преобразует результат browserslist (`['chrome 150', 'ios_saf 14.0-14.4', ...]`) в `env.targets` для SWC.
 * Для каждого браузера берётся минимальная версия, у диапазонов — нижняя граница.
 * Браузеры, о которых SWC ничего не знает, и версии вроде `all` или `TP` пропускаются.
 */
export function browserslistToSwcTargets(browsers: string[]): SwcTargets {
    const targets: SwcTargets = {};

    browsers.forEach((browser) => {
        const [name, rawVersion = ''] = browser.split(' ');
        const swcName = BROWSER_NAME_MAP[name];
        const version = rawVersion.split('-')[0];

        if (!swcName || !VERSION_REGEXP.test(version)) {
            return;
        }

        if (!targets[swcName] || compareVersions(version, targets[swcName]) < 0) {
            targets[swcName] = version;
        }
    });

    return targets;
}

/**
 * Резолвит browserslist-запросы JS-версией browserslist и отдаёт цели в формате SWC.
 * Встроенный в SWC browserslist-rs резолвит запросы иначе, чем JS-пакет, которым пользуются babel, postcss и rspack
 * (например, `Android >= 6` у него превращается в android 37, и весь код компилируется в ES5),
 * поэтому передаём SWC уже готовые версии, а не запросы.
 */
export function resolveSwcTargets(queries: string | string[]): SwcTargets {
    return browserslistToSwcTargets(browserslist(queries, { path: configs.cwd }));
}
