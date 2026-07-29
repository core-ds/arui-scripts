import { type TemplateContext } from '../types';

export function gitignoreTemplate(): string {
    return `node_modules
.build
build.tar
.cache-loader
`;
}

export function globalDefinitionsTemplate(): string {
    return `declare module '*.png' {
    const url: string;
    export default url;
}

declare module '*.svg' {
    const url: string;
    export default url;
}

declare module '*.module.css' {
    const styles: Record<string, string>;
    export default styles;
}

declare module '*.css';
`;
}

export function polyfillsTemplate(): string {
    return "import 'core-js/stable';\n";
}

export function readmeTemplate(ctx: TemplateContext): string {
    const testCommand =
        ctx.testRunner === 'jest' ? 'arui-scripts test' : 'arui-scripts test:vitest';

    return `# ${ctx.name}

Проект создан с помощью arui-scripts.

## Команды

    arui-scripts start - запуск dev-сервера
    arui-scripts build - production-сборка
    ${testCommand}${' '.repeat(Math.max(1, 20 - testCommand.length))}- запуск тестов

## Установка

    yarn install
`;
}
