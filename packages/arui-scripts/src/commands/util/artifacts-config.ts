import { defineConfig, mergeConfigFiles, resolveConfigFile } from '@alfalab/arui-scripts-artifacts';

import { configs } from '../../configs/app-configs';

import { getArtifactsOptions } from './artifacts-options';

/**
 * Конфиг сборки артефактов, который arui-scripts возит с собой.
 *
 * Команды `docker-build`, `docker-build:compiled` и `archive-build` не зовут либу напрямую, а
 * запускают ее CLI с этим файлом в `-c` — тот же прием, что и `rsbuild build -c ...`. Поэтому
 * заводить свой `arui-scripts-artifacts.ts` в корне проекта не обязательно: без него настройки
 * берутся из конфига arui-scripts.
 *
 * Если такой файл в проекте есть, он подхватывается по стандартным правилам либы и кладется
 * поверх — именно туда deprecated-настройки arui-scripts и просят перенести.
 *
 * Экспортируется функция, а не объект: `configs` читает package.json и файлы проекта, и делать это
 * нужно в момент запуска команды, а не при загрузке модуля.
 */
export default defineConfig(async () => {
    const aruiScriptsConfig = {
        ...getArtifactsOptions(),

        commands: {
            'archive-build': {
                // archive-build исторически всегда удаляет dev-зависимости, независимо от
                // removeDevDependenciesDuringDockerBuild
                build: { removeDevDependencies: true },
            },
        },
    };

    return mergeConfigFiles(aruiScriptsConfig, await resolveConfigFile(configs.cwd));
});
