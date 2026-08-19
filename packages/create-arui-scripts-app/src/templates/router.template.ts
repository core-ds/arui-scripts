import { type TemplateContext } from '../types';

function tsString(value: string): string {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

export function layoutTemplate(ctx: TemplateContext): string {
    const styleImport = ctx.cssModules
        ? "import styles from './app.module.css';"
        : "import './app.css';";
    const navClass = ctx.cssModules ? '{styles.nav}' : "'app__nav'";
    const linkClass = ctx.cssModules ? '{styles.navLink}' : "'app__nav-link'";

    return `import React from 'react';
import { Link, Outlet } from 'react-router-dom';

${styleImport}

export function Layout() {
    return (
        <div>
            <nav className=${navClass}>
                <Link to='/' className=${linkClass}>
                    Главная
                </Link>
                <span aria-hidden={true}> · </span>
                <Link to='/about' className=${linkClass}>
                    О проекте
                </Link>
            </nav>
            <Outlet />
        </div>
    );
}
`;
}

export function homePageTemplate(ctx: TemplateContext): string {
    const styleImport = ctx.cssModules
        ? "import styles from '../components/app.module.css';"
        : "import '../components/app.css';";
    const rootClass = ctx.cssModules ? '{styles.root}' : "'app'";
    const titleClass = ctx.cssModules ? '{styles.title}' : "'app__title'";
    const appNameLiteral = tsString(ctx.name);

    const coreImports = `import { Button } from '@alfalab/core-components/button';
import { Gap } from '@alfalab/core-components/gap';
import { Typography } from '@alfalab/core-components/typography';`;
    const hostImport =
        ctx.moduleRole === 'host'
            ? "\nimport { RemoteModule } from '../components/remote-module';"
            : '';
    const hostBlock =
        ctx.moduleRole === 'host'
            ? `
            <Gap size={16} />
            <RemoteModule />`
            : '';

    if (ctx.useRtk) {
        return `import React from 'react';

${coreImports}
${hostImport}

import { decrement, increment } from '../store/counter-slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

${styleImport}

const appName = ${appNameLiteral};

export function HomePage() {
    const count = useAppSelector((state) => state.counter.value);
    const dispatch = useAppDispatch();

    return (
        <div className=${rootClass}>
            <Typography.Title view='medium' tag='h1' className=${titleClass}>
                {appName}
            </Typography.Title>
            <Gap size={16} />
            <Typography.Text view='primary-medium'>Счетчик: {count}</Typography.Text>
            <Gap size={16} />
            <Button view='accent' size={48} onClick={() => dispatch(increment())}>
                +1
            </Button>{' '}
            <Button view='secondary' size={48} onClick={() => dispatch(decrement())}>
                -1
            </Button>${hostBlock}
        </div>
    );
}
`;
    }

    return `import React, { useState } from 'react';

${coreImports}
${hostImport}

${styleImport}

const appName = ${appNameLiteral};

export function HomePage() {
    const [count, setCount] = useState(0);

    return (
        <div className=${rootClass}>
            <Typography.Title view='medium' tag='h1' className=${titleClass}>
                {appName}
            </Typography.Title>
            <Gap size={16} />
            <Typography.Text view='primary-medium'>Счетчик: {count}</Typography.Text>
            <Gap size={16} />
            <Button view='accent' size={48} onClick={() => setCount((prev) => prev + 1)}>
                +1
            </Button>{' '}
            <Button view='secondary' size={48} onClick={() => setCount((prev) => prev - 1)}>
                -1
            </Button>${hostBlock}
        </div>
    );
}
`;
}

export function aboutPageTemplate(ctx: TemplateContext): string {
    const styleImport = ctx.cssModules
        ? "import styles from '../components/app.module.css';"
        : "import '../components/app.css';";
    const rootClass = ctx.cssModules ? '{styles.root}' : "'app'";
    const titleClass = ctx.cssModules ? '{styles.title}' : "'app__title'";

    return `import React from 'react';

import { Typography } from '@alfalab/core-components/typography';

${styleImport}

export function AboutPage() {
    return (
        <div className=${rootClass}>
            <Typography.Title view='medium' tag='h1' className=${titleClass}>
                О проекте
            </Typography.Title>
            <Typography.Text view='primary-medium'>
                Страница для React Router
            </Typography.Text>
        </div>
    );
}
`;
}

export function routesTemplate(): string {
    return `import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Layout } from './components/layout';
import { AboutPage } from './pages/about';
import { HomePage } from './pages/home';

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index={true} element={<HomePage />} />
                <Route path='about' element={<AboutPage />} />
            </Route>
        </Routes>
    );
}
`;
}
