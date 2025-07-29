// TODO: remove eslint-disable-next-line
/* eslint-disable @typescript-eslint/no-var-requires */
const babelJest = require('babel-jest');
const babelPresets = require('../babel-server');

module.exports = babelJest.createTransformer(babelPresets.config);
