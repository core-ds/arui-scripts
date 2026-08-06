import { buildArchive } from './build-archive';
import { buildDockerImage, type BuildDockerImageOptions } from './build-docker-image';

export type BuildArtifactOptions = BuildDockerImageOptions;

/**
 * Собирает артефакт поставки согласно `artifact` в опциях: docker-образ (по умолчанию) или tar-архив.
 * Именно эту функцию вызывает CLI, поэтому любая команда из конфига проекта может собирать любой тип
 * артефакта.
 */
export async function buildArtifact(options: BuildArtifactOptions = {}): Promise<void> {
    if (options.artifact === 'archive') {
        return buildArchive(options);
    }

    return buildDockerImage(options);
}
