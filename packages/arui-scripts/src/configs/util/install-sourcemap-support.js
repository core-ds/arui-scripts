/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
try {
    require('source-map-support').install();
} catch (e) {
    console.error(
        'unable to install source map support. Please add `source-map-support` as a dependency.',
    );
}
