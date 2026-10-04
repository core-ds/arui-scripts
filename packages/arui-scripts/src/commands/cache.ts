/* eslint-disable global-require, @typescript-eslint/no-var-requires -- CLI loads optional configs only for info. */
import { configs } from '../configs/app-configs';
import { cacheDirectory, cacheSettings } from '../configs/cache/settings';
import { clearCache, inspectCache } from '../configs/cache/storage';
import { describeCompilerCaches } from '../configs/persistent-cache';

function configuredCaches(json: boolean) {
    const { log } = console;

    // Overrides may log while loading. Keep machine-readable stdout valid JSON.
    if (json) console.log = (...args: unknown[]) => console.error(...args);

    try {
        // Resolve overrides for diagnostics only; no compiler is created and no cache is written.
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const dev = require('../configs/rspack.client.dev').config;
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const prod = require('../configs/rspack.client.prod').webpackClientConfig;
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const serverDev = configs.clientOnly
            ? []
            : require('../configs/rspack.server.dev').webpackServerConfig;
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const serverProd = configs.clientOnly
            ? []
            : require('../configs/rspack.server.prod').webpackServerConfig;

        return [dev, prod, serverDev, serverProd].flatMap(describeCompilerCaches);
    } finally {
        console.log = log;
    }
}

export function cacheInfo(json: boolean): void {
    const directory = cacheDirectory(configs);
    const settings = cacheSettings(configs);
    const configured = configuredCaches(json);
    const info = {
        directory,
        enabled: !!settings,
        modes: settings ? settings.modes || ['dev', 'production'] : [],
        configured,
        portableCrossPathReuse: false,
        ...inspectCache(directory),
    };

    if (json) console.log(JSON.stringify(info, null, 2));
    else {
        console.log(
            `Rspack cache: ${directory}\nEnabled: ${info.enabled}\nModes: ${
                info.modes.join(', ') || 'none'
            }\nSize: ${info.bytes} bytes`,
        );
        info.namespaces.forEach((namespace) =>
            console.log(
                `  ${namespace.name}: ${
                    namespace.dependencies
                } dependencies, fingerprint ${namespace.fingerprint.slice(0, 12)}`,
            ),
        );
        configured
            .filter((cache) => cache.policy === 'custom')
            .forEach((cache) =>
                console.log(`  ${cache.name}/${cache.mode}: custom cache override (not managed)`),
            );
        if (!info.exists) console.log('Cache does not exist yet.');
        console.log('Raw Rspack cache overrides are custom and are not managed by cache:clear.');
    }
}

export function cacheClear(): void {
    const directory = cacheDirectory(configs);

    clearCache(directory);
    console.log(`Rspack cache cleared: ${directory}`);
}
