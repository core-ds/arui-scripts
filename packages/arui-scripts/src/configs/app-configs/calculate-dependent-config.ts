import path from 'path';
import merge from 'lodash.merge';
import { AppConfigs } from './types';
import { getPolyfills } from '../util/get-polyfills';

/**
 * Обновление ключей конфига, зависящих от других. Это нужно делать в самый последний момент
 */
export function calculateDependentConfig(config: AppConfigs) {
    let babelRuntimeVersion = '7.0.0-beta.0'; // default value for plugin-transform-runtime
    try {
        babelRuntimeVersion = require(path.resolve(config.cwd, 'node_modules/@babel/runtime/package.json')).version
    } catch (e) {
        babelRuntimeVersion = require('@babel/runtime/package.json').version;
    }

    return merge(config, {
        publicPath: `${config.assetsPath}/`,
        serverOutputPath: path.resolve(config.cwd, config.buildPath),
        clientOutputPath: path.resolve(config.cwd, config.buildPath, config.assetsPath),
        clientPolyfillsEntry: getPolyfills(config),
        statsOutputPath: path.resolve(config.cwd, config.buildPath, config.statsOutputFilename),
        babelRuntimeVersion,
    });
}
