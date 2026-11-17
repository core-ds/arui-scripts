import { type AppContextWithConfigs } from './types';

export function validateModuleTypes(config: AppContextWithConfigs) {
    const settings = config.modules?.types;

    if (settings === undefined || settings === false) {
        return;
    }

    if (
        !settings ||
        typeof settings.packageName !== 'string' ||
        settings.packageName.length > 214 ||
        !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(settings.packageName) ||
        ['node_modules', 'favicon.ico'].includes(settings.packageName)
    ) {
        throw new Error('modules.types.packageName: укажите корректное имя npm-пакета.');
    }

    if (config.disableModulesSupport || !Object.keys(config.modules?.exposes || {}).length) {
        throw new Error('modules.types: нужны включенные modules.exposes.');
    }

    if (!config.tsconfig) {
        throw new Error('modules.types: нужен tsconfig.json проекта');
    }
}
