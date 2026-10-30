import { defineConfig } from '@alfalab/arui-scripts-artifacts';

import { getArtifactsOptions } from './artifacts-config';

/**
 * Внутренний конфиг для запуска CLI artifacts командами arui-scripts.
 * Использует только конфигурацию arui-scripts; standalone-конфиг проекта не загружается.
 * Функция откладывает построение опций до запуска команды.
 */
export default defineConfig(() => getArtifactsOptions());
