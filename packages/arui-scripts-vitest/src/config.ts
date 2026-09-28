import { defineConfig, type ViteUserConfig } from 'vitest/config';

import { getVitestConfig } from './settings';

const config: ViteUserConfig = defineConfig(getVitestConfig());

export default config;
