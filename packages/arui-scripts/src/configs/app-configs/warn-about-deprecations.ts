import { type ProxyConfigMap,ProxyConfigArrayItem } from 'webpack-dev-server';

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

    if (!Array.isArray(config.proxy) && config.proxy) {
        console.warn(
            'Передача config.proxy как объекта больше не поддерживается. ',
            'arui-scripts попробует привести конфигурацию к корректному виду, но это не всегда может работать корректно',
            'См документацию webpack https://webpack.js.org/configuration/dev-server/#devserverproxy'
        );

        // eslint-disable-next-line no-param-reassign
        config.proxy = convertObjectProxyConfigurationToArray(config.proxy);
    }
}

function convertObjectProxyConfigurationToArray(proxyConfiguration: ProxyConfigMap) {
    const arrayProxy: ProxyConfigArrayItem[] = [];

    Object.keys(proxyConfiguration).forEach((context) => {
        const itemConfig = proxyConfiguration[context];

        arrayProxy.push({
            context,
            ...(typeof itemConfig === 'string' ? {
                target: itemConfig,
            }: itemConfig),
        });
    });

    return arrayProxy;
}
