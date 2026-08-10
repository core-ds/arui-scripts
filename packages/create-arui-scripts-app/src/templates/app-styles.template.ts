import { type TemplateContext } from '../types';

export function appStylesFileName(ctx: TemplateContext): string {
    return ctx.cssModules ? 'app.module.css' : 'app.css';
}

export function appStylesTemplate(ctx: TemplateContext): string {
    if (ctx.cssModules) {
        return `.root {
    padding: var(--gap-16);
}

.title {
    margin: var(--gap-0) var(--gap-0) var(--gap-12);
    @mixin headline_small;
}
`;
    }

    return `.app {
    padding: var(--gap-16);
}

.app__title {
    margin: var(--gap-0) var(--gap-0) var(--gap-12);
    @mixin headline_small;
}
`;
}
