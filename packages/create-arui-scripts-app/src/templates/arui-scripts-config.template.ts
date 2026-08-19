import { type TemplateContext } from '../types';

// Безопасная вставка строки в конфиг (одинарные кавычки как у prettier)
function tsString(value: string): string {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

export function aruiScriptsConfigTemplate(ctx: TemplateContext): string {
    const lines: string[] = [];

    const clientBase = ctx.clientOnly ? './src' : './src/client';

    if (ctx.clientOnly) {
        lines.push('    clientOnly: true,');
    }

    if (ctx.dualEntries) {
        lines.push(`    clientEntry: {
        mobile: ${tsString(`${clientBase}/mobile`)},
        desktop: ${tsString(`${clientBase}/desktop`)},
    },`);
    } else if (!ctx.clientOnly) {
        lines.push(`    clientEntry: ${tsString(clientBase)},`);
    }

    lines.push(
        `    componentsTheme: ${tsString(
            './node_modules/@alfalab/core-components/themes/corp.css',
        )},`,
    );

    if (ctx.codeLoader !== 'swc') {
        lines.push(`    codeLoader: ${tsString(ctx.codeLoader)},`);
    }

    if (ctx.clientServerPort !== 8080) {
        lines.push(`    clientServerPort: ${ctx.clientServerPort},`);
    }

    if (!ctx.clientOnly && ctx.serverPort !== 3000) {
        lines.push(`    serverPort: ${ctx.serverPort},`);
    }

    if (ctx.dockerRegistry) {
        lines.push(`    dockerRegistry: ${tsString(ctx.dockerRegistry)},`);
    }

    if (ctx.presets) {
        lines.push(`    presets: ${tsString(ctx.presets)},`);
    }

    if (ctx.polyfills) {
        lines.push(`    clientPolyfillsEntry: ${tsString(`${clientBase}/polyfills`)},`);
    }

    if (ctx.reactCompiler) {
        lines.push("    experimentalReactCompiler: { target: '19' },");
    }

    if (ctx.moduleRole === 'host') {
        lines.push(`    modules: {
        shared: {
            react: { eager: true, requiredVersion: '^19.0.0' },
            'react-dom': { eager: true, requiredVersion: '^19.0.0' },
        },
    },`);
    } else if (ctx.moduleRole === 'remote') {
        lines.push(`    modules: {
        shared: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
        },
        exposes: {
            ExampleModule: './src/modules/example/index',
        },
    },`);
    }

    const body = lines.length > 0 ? `\n${lines.join('\n')}\n` : '';

    return `import { type PackageSettings } from 'arui-scripts';

const config: PackageSettings = {${body}};

export default config;
`;
}
