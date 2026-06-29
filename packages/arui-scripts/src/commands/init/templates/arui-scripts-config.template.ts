import { type TemplateContext } from '../types';

export function aruiScriptsConfigTemplate(ctx: TemplateContext): string {
    const lines: string[] = [];

    const clientBase = ctx.clientOnly ? './src' : './src/client';

    if (ctx.clientOnly) {
        lines.push('    clientOnly: true,');
    } else {
        lines.push(`    clientEntry: '${clientBase}',`);
    }

    lines.push("    componentsTheme: './node_modules/@alfalab/core-components/themes/corp.css',");

    if (ctx.codeLoader !== 'swc') {
        lines.push(`    codeLoader: '${ctx.codeLoader}',`);
    }

    if (ctx.clientServerPort !== 8080) {
        lines.push(`    clientServerPort: ${ctx.clientServerPort},`);
    }

    if (!ctx.clientOnly && ctx.serverPort !== 3000) {
        lines.push(`    serverPort: ${ctx.serverPort},`);
    }

    if (ctx.dockerRegistry) {
        lines.push(`    dockerRegistry: '${ctx.dockerRegistry}',`);
    }

    if (ctx.presets) {
        lines.push(`    presets: '${ctx.presets}',`);
    }

    if (ctx.polyfills) {
        lines.push(`    clientPolyfillsEntry: '${clientBase}/polyfills',`);
    }

    if (ctx.reactCompiler) {
        lines.push("    experimentalReactCompiler: { target: '19' },");
    }

    const body = lines.length > 0 ? `\n${lines.join('\n')}\n` : '';

    return `import { type PackageSettings } from 'arui-scripts';

const config: PackageSettings = {${body}};

export default config;
`;
}
