import { defineConfig, mergeConfigFiles, resolveConfigFile } from '@alfalab/arui-scripts-artifacts';

import { configs } from '../../configs/app-configs';

import { getArtifactsOptions } from './artifacts-config';

/**
 * `arui-scripts-artifacts.ts`, который arui-scripts возит с собой. Назван так же, как конфиг в
 * корне проекта, потому что это он и есть — просто дефолтный, собранный из настроек arui-scripts.
 *
 * Команды `docker-build`, `docker-build:compiled` и `archive-build` не зовут либу напрямую, а
 * запускают ее CLI с этим файлом в `-c` — тот же прием, что и `rsbuild build -c ...`. Поэтому
 * заводить свой конфиг в корне проекта не обязательно: без него настройки берутся отсюда.
 *
 * Если такой файл в проекте есть, он подхватывается по стандартным правилам либы и кладется
 * поверх — именно туда deprecated-настройки arui-scripts и просят перенести.
 *
 * Экспортируется функция, а не объект: `configs` читает package.json и файлы проекта, и делать это
 * нужно в момент запуска команды, а не при загрузке модуля.
 */
export default defineConfig(async () =>
    mergeConfigFiles(getArtifactsOptions(), await resolveConfigFile(configs.cwd)),
);
