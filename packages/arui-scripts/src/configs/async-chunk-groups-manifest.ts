import { type ChunkGroupFiles } from '../plugins/async-chunk-groups';

/**
 * Разделяемое хранилище файлов async чанк-групп.
 *
 * `AsyncChunkGroupsPlugin` наполняет его во время сборки, а `processAssetsPluginOutput`
 * читает при формировании json манифеста и дописывает в него записи чанк-групп.
 *
 * Map живет на уровне модуля, поскольку плагин сборки и обработчик манифеста
 * работают в одном процессе (как и общий между сборками AssetsPlugin).
 */
export const asyncChunkGroupsManifest = new Map<string, ChunkGroupFiles>();
