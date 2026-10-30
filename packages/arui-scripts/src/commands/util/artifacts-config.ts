import {
    type ArtifactsConfigFile,
    type ArtifactTemplateOverrides,
    mergeConfigFiles,
    resolveArtifactsConfig,
    type ResolvedArtifactsConfig,
} from '@alfalab/arui-scripts-artifacts';

import { configs } from '../../configs/app-configs';
import { applyOverrides } from '../../configs/util/apply-overrides';

import { mapArtifactsConfig } from './map-artifacts-config';

/**
 * Подключает arui-scripts.overrides к шаблонам artifacts.
 * Исторически nginx — server-блок, а nginxConf — базовый http-блок.
 * Разницу имён локализуем в этой таблице.
 */
const templateOverrides: ArtifactTemplateOverrides = {
    dockerfile: (generated) => applyOverrides('Dockerfile', generated),
    dockerfileCompiled: (generated) => applyOverrides('DockerfileCompiled', generated),
    nginxConf: (generated) => applyOverrides('nginx', generated),
    baseNginxConf: (generated) => applyOverrides('nginxConf', generated),
    startScript: (generated) => applyOverrides('start.sh', generated),
};

/**
 * Опции сборки из конфигурации arui-scripts с его оверрайдами шаблонов.
 * Дополнительные программные опции имеют приоритет; проектный artifacts-конфиг не читается.
 */
export function getArtifactsOptions(extraOptions: ArtifactsConfigFile = {}): ArtifactsConfigFile {
    return mergeConfigFiles(
        { ...mapArtifactsConfig(configs), overrides: templateOverrides },
        extraOptions,
    );
}

let cachedConfig: ResolvedArtifactsConfig | null = null;

/**
 * Донасыщенный конфиг сборки, построенный из `configs`. Мемоизирован, потому что резолв читает
 * package.json и версию yarn.
 *
 * Резолвится только верхний уровень: командные секции разбирает CLI, когда знает, какую команду
 * запустили.
 */
export function getResolvedArtifactsConfig(): ResolvedArtifactsConfig {
    if (!cachedConfig) {
        const { commands, ...sharedOptions } = getArtifactsOptions();

        cachedConfig = resolveArtifactsConfig(sharedOptions);
    }

    return cachedConfig;
}
