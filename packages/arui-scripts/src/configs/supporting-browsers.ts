import applyOverrides from './util/apply-overrides';

const supportingBrowsers = applyOverrides(
    ['browsers', 'supportingBrowsers'],
    ['last 2 versions', 'ie >= 10', 'Android >= 4', 'iOS >= 9'],
);

export default supportingBrowsers;
