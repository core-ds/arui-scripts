import { applyOverrides } from './util/apply-overrides';

// `Android >= 6` здесь не нужен: JS-browserslist и так резолвит его в актуальный android (он есть в `last 2 versions`),
// а browserslist-rs внутри SWC превращает его в android 37 и компилирует весь код в ES5.
export const supportingBrowsers = applyOverrides(
    ['browsers', 'supportingBrowsers'],
    ['last 2 versions', 'not dead', 'iOS >= 14'],
);
