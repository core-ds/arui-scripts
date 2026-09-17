/**
 * Разделяемое хранилище css module-federation модулей.
 *
 * `AttributeModuleCssPlugin` наполняет его во время сборки (обходя граф чанков),
 * а `processAssetsPluginOutput` читает при формировании json манифеста и
 * дописывает css в записи соответствующих модулей.
 *
 * Map живёт на уровне модуля, поскольку плагин сборки и обработчик манифеста
 * работают в одном процессе одной сборки (как и общий между сборками AssetsPlugin).
 */
export const modulesCssManifest = new Map<string, string[]>();
