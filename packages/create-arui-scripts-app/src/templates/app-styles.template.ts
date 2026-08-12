import { type TemplateContext } from '../types';

export function appStylesFileName(ctx: TemplateContext): string {
    return ctx.cssModules ? 'app.module.css' : 'app.css';
}

export function appStylesTemplate(ctx: TemplateContext): string {
    if (ctx.cssModules) {
        const nav = ctx.useRouter
            ? `
.nav {
    display: flex;
    align-items: center;
    padding: var(--gap-16);
}

.navLink {
    color: var(--color-light-text-primary);
    text-decoration: none;
}
`
            : '';

        return `.root {
    padding: var(--gap-16);
}

.title {
    margin: var(--gap-0) var(--gap-0) var(--gap-12);
    @mixin headline_small;
}
${nav}`;
    }

    const nav = ctx.useRouter
        ? `
.app__nav {
    display: flex;
    align-items: center;
    padding: var(--gap-16);
}

.app__nav-link {
    color: var(--color-light-text-primary);
    text-decoration: none;
}
`
        : '';

    return `.app {
    padding: var(--gap-16);
}

.app__title {
    margin: var(--gap-0) var(--gap-0) var(--gap-12);
    @mixin headline_small;
}
${nav}`;
}
