import { AppContextWithConfigs } from './types';

export function warnAboutDeprecations(config: AppContextWithConfigs) {
    if (config.useTscLoader) {
        // eslint-disable-next-line no-console
        console.warn(
            'Использование опции `useTscLoader` не рекомендуется и будет удалено в будущих версиях. ',
            'Обратитесь к документации https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/settings.md#usetscloader',
            'для получения дополнительной информации.'
        );
    }
}
