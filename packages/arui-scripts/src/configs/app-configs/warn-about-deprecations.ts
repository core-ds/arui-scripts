import { type RspackDevServer } from '@rspack/dev-server';

import { type AppContextWithConfigs } from './types';

type ProxyConfigArrayItem = NonNullable<RspackDevServer['options']['proxy']>[0];

export function warnAboutDeprecations(config: AppContextWithConfigs) {
    if (!Array.isArray(config.proxy) && config.proxy) {
        console.warn(
            'Передача config.proxy как объекта больше не поддерживается. ',
            'arui-scripts попробует привести конфигурацию к корректному виду, но это не всегда может работать корректно',
            'Правильный формат конфигурации можно посмотреть в документации rspack: https://rspack.dev/guide/features/dev-server#proxy',
        );

        // eslint-disable-next-line no-param-reassign
        config.proxy = convertObjectProxyConfigurationToArray(config.proxy);
    }
}

function convertObjectProxyConfigurationToArray(
    proxyConfiguration: Record<string, ProxyConfigArrayItem>,
) {
    const arrayProxy: ProxyConfigArrayItem[] = [];

    Object.keys(proxyConfiguration).forEach((context) => {
        const itemConfig = proxyConfiguration[context];

        arrayProxy.push({
            context,
            ...(typeof itemConfig === 'string'
                ? {
                      target: itemConfig,
                  }
                : itemConfig),
        });
    });

    return arrayProxy;
}
