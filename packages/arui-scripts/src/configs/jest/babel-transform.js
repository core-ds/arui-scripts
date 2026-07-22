// TODO: remove eslint-disable-next-line
/* eslint-disable @typescript-eslint/no-var-requires */
const babelJest = require('babel-jest');
const babelPresets = require('../babel-server');

const transformer = babelJest.createTransformer(babelPresets.config);

module.exports = /** @type {import('@jest/transform').SyncTransformer} */ (transformer);
