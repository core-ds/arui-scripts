// это peer зависимость кучи других пакетов. Не будем добавлять её себе в прямые чтобы не ломать дерево
// eslint-disable-next-line import/no-extraneous-dependencies
import { loadConfig } from 'browserslist';

import { configs } from '../../configs/app-configs';
import { supportingBrowsers } from '../../configs/supporting-browsers';

export function loadBrowserslist() {
    if (loadConfig({ path: configs.cwd })) {
        // если проект уже как то определяет список поддерживаемых браузеров - не делаем ничего
        return;
    }

    process.env.BROWSERSLIST = process.env.BROWSERSLIST || supportingBrowsers.join(',');
}
