// TODO: remove eslint-disable-next-line

const babelJest = require('babel-jest');
const babelPresets = require('../babel-server');

module.exports = babelJest.createTransformer(babelPresets.config);
