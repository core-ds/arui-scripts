import { AppContextWithConfigs } from './types';

export function warnAboutDeprecations(config: AppContextWithConfigs) {
    if (config.useTscLoader) {
        console.warn(
            'Использование опции `useTscLoader` не рекомендуется и будет удалено в будущих версиях. ',
            'Обратитесь к документации https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/settings.md#usetscloader',
            'для получения дополнительной информации.'
        );
    }

    if (config.webpack4Compatibility) {
        console.warn(
            'Опция `webpack4Compatibility` будет удалена в будущих версиях arui-scripts.',
            'Обратитесь к issue в webpack https://github.com/webpack/webpack/issues/14580 для получения дополнительной информации',
        );
    }
}
