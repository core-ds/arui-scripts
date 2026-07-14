export function vitestConfigTemplate(): string {
    return `import { defineConfig, mergeConfig } from 'vitest/config';

import aruiConfig from 'arui-scripts/vitest';

export default mergeConfig(
    aruiConfig,
    defineConfig({
        test: {
            // тут можно переопределить настройки Vitest
        },
    }),
);
`;
}
