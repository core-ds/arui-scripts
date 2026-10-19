import { type ViteUserConfig } from 'vitest/config';

// eslint-disable-next-line import/no-useless-path-segments
export { getVitestConfig } from './index.js';

declare const config: ViteUserConfig;

export default config;
