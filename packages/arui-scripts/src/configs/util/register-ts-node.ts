/* eslint-disable @typescript-eslint/no-var-requires */
// Мы используем ts-node для работы c конфигами, описаными на ts
require('ts-node').register({
    transpileOnly: true,
    ignore: [],
    compilerOptions: {
        target: 'esnext',
        module: 'esnext',
        skipLibCheck: true,
        allowJs: false,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'bundler',
        esModuleInterop: true,
    },
    skipProject: true,
});
