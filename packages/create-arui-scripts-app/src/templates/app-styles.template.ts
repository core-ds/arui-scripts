import { type TemplateContext } from '../types';

export function appStylesFileName(ctx: TemplateContext): string {
    return ctx.cssModules ? 'app.module.css' : 'app.css';
}

export function appStylesTemplate(ctx: TemplateContext): string {
    if (ctx.cssModules) {
        return `.root {
    padding: 16px;
    font-family: sans-serif;
}

.title {
    margin: 0 0 12px;
    font-size: 24px;
}
`;
    }

    return `.app {
    padding: 16px;
    font-family: sans-serif;
}

.app__title {
    margin: 0 0 12px;
    font-size: 24px;
}
`;
}
