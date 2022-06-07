// Мы используем ts-node для работы c конфигами, описаными на ts
require('ts-node')
    .register({
        transpileOnly: true,
        ignore: [],
        compilerOptions: {
            target: 'ES2016',
            module: 'CommonJS',
            skipLibCheck: true,
            allowJs: false,
            allowSyntheticDefaultImports: true,
            moduleResolution: 'node',
            esModuleInterop: true,
        },
        skipProject: true,
    });
