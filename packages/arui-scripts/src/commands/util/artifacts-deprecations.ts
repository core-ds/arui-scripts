import { configs } from '../../configs/app-configs';
import { hasOverride } from '../../configs/util/apply-overrides';

/**
 * Настройки сборки артефактов, которые остались в arui-scripts только ради обратной совместимости.
 * В следующей мажорной версии они будут удалены — их место в конфиге `arui-scripts-artifacts.ts`.
 *
 * Значение — путь до той же настройки в @alfalab/arui-scripts-artifacts.
 */
const DEPRECATED_SETTINGS = {
    dockerRegistry: 'docker.registry',
    baseDockerImage: 'docker.baseImage',
    runFromNonRootUser: 'docker.runFromNonRootUser',
    nginxRootPath: 'nginx.rootPath',
    nginx: 'nginx.baseConf',
    archiveName: 'archive.name',
    additionalBuildPath: 'archive.additionalPaths',
    removeDevDependenciesDuringDockerBuild: 'build.removeDevDependencies',
} as const;

/**
 * Ключи оверрайдов шаблонов из `arui-scripts.overrides.ts` и их замена в конфиге артефактов.
 *
 * Напоминание: в arui-scripts `nginx` — это server-блок, а `nginxConf` — базовый http-блок; в
 * @alfalab/arui-scripts-artifacts они названы по смыслу, поэтому имена не совпадают.
 */
const DEPRECATED_OVERRIDES = {
    Dockerfile: 'overrides.dockerfile',
    DockerfileCompiled: 'overrides.dockerfileCompiled',
    nginx: 'overrides.nginxConf',
    nginxConf: 'overrides.baseNginxConf',
    'start.sh': 'overrides.startScript',
} as const;

let warned = false;

/**
 * Предупреждает о настройках и оверрайдах сборки артефактов, которые задает проект. Вызывается из
 * команд сборки (docker-build, docker-build:compiled, archive-build), поэтому при обычной разработке
 * в консоль ничего не сыпется.
 *
 * Дефолты этих настроек живут в @alfalab/arui-scripts-artifacts, а в конфиге arui-scripts они
 * `undefined` — так что «настройка задана» здесь означает именно «проект ее переопределил».
 */
export function warnAboutArtifactsDeprecations() {
    if (warned) {
        return;
    }
    warned = true;

    const usedSettings = (
        Object.keys(DEPRECATED_SETTINGS) as Array<keyof typeof DEPRECATED_SETTINGS>
    )
        .filter((setting) => configs[setting] !== undefined)
        .map((setting) => `  ${setting} → ${DEPRECATED_SETTINGS[setting]}`);

    const usedOverrides = (
        Object.keys(DEPRECATED_OVERRIDES) as Array<keyof typeof DEPRECATED_OVERRIDES>
    )
        .filter((key) => hasOverride(key))
        .map((key) => `  оверрайд ${key} → ${DEPRECATED_OVERRIDES[key]}`);

    if (!usedSettings.length && !usedOverrides.length) {
        return;
    }

    console.warn(
        [
            'Настройки сборки артефактов в arui-scripts объявлены устаревшими и будут удалены в следующей мажорной версии.',
            'Перенесите их в конфиг @alfalab/arui-scripts-artifacts (arui-scripts-artifacts.ts в корне проекта):',
            ...usedSettings,
            ...usedOverrides,
            'Подробнее: https://github.com/core-ds/arui-scripts/tree/master/packages/arui-scripts-artifacts#миграция-с-arui-scripts-docker-build',
        ].join('\n'),
    );
}
