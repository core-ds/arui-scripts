import { AppContextWithConfigs } from './types';

export function warnAboutDeprecations(config: AppContextWithConfigs) {
    if (config.useTscLoader) {
        console.warn(
            'Использование опции `useTscLoader` не рекомендуется и будет удалено в будущих версиях. ',
            'Обратитесь к документации https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/settings.md#usetscloader',
            'для получения дополнительной информации.'
        );
    }

    if (config.useSwcLoader && config.useTscLoader) {
        console.warn('Одновременное использование опций `useSwcLoader` и `useTscLoader` не поддерживается, выберите что-то одно');
    }

    if (config.jestUseSwc && config.jestUseTsJest) {
        console.warn('Одновременное использование опций `jestUseSwc` и `jestUseTsJest` не поддерживается, выберите что-то одно');
    }
}
