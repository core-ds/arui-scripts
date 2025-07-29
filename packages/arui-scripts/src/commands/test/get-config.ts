import fs from 'fs';
import path from 'path';

import { replaceRootDirInPath } from 'jest-config';
import Resolver from 'jest-resolve';
import merge from 'lodash.merge';

import { configs } from '../../configs/app-configs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import defaultJestConfig from '../../configs/jest/settings';

const PRESET_EXTENSIONS = ['.json', '.js', '.cjs', '.mjs'];
const PRESET_NAME = 'jest-preset';

export const getJestConfig = async () => {
    const { preset, ...appJestConfig } = await getAppJestConfig();

    let presetConfig = {};

    if (preset) {
        presetConfig = await getPresetConfig(preset);
    }

    return merge(defaultJestConfig, presetConfig, appJestConfig);
};

async function getAppJestConfig() {
    const jestConfigPath = path.resolve(process.cwd(), 'jest.config.js');

    if (fs.existsSync(jestConfigPath)) {
        return (await import(jestConfigPath)).default;
    }

    if (configs.appPackage.jest) {
        return configs.appPackage.jest;
    }

    return {};
}

async function getPresetConfig(presetPath?: string) {
    if (!presetPath) {
        return {};
    }
    const rootDir = process.cwd();

    const normalizedPresetPath = replaceRootDirInPath(rootDir, presetPath);
    const presetModule = Resolver.findNodeModule(
        normalizedPresetPath.startsWith('.')
            ? normalizedPresetPath
            : path.join(normalizedPresetPath, PRESET_NAME),
        {
            basedir: rootDir,
            extensions: PRESET_EXTENSIONS,
        },
    );

    if (!presetModule) {
        throw new Error(`Cannot find module '${normalizedPresetPath}'`);
    }

    const { preset: subPreset, ...preset } = (await import(presetModule)).default;

    if (subPreset) {
        console.warn(`Jest can't handle preset chaining. Preset "${subPreset}" will be ignored.`);
    }

    return preset;
}
