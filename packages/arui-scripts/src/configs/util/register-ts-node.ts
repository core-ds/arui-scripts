/* eslint-disable @typescript-eslint/no-var-requires */
// Мы используем ts-node для работы c конфигами, описаными на ts
require('ts-node').register({
    transpileOnly: true,
    ignore: [],
    compilerOptions: {
        target: 'esnext',
        // Конфиги и overrides загружаются через require(), включая их локальные импорты.
        module: 'Node16',
        skipLibCheck: true,
        allowJs: false,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node16',
        esModuleInterop: true,
    },
    skipProject: true,
});
