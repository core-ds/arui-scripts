import applyOverrides from './util/apply-overrides';

const supportingBrowsers = applyOverrides(
    ['browsers', 'supportingBrowsers'],
    ['last 2 versions', 'not dead', 'Android >= 6', 'iOS >= 14'],
);

export default supportingBrowsers;
