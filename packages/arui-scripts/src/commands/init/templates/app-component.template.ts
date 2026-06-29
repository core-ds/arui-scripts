import { type TemplateContext } from '../types';

export function appComponentTemplate(ctx: TemplateContext): string {
    const styleImport = ctx.cssModules
        ? "import styles from './app.module.css';"
        : "import './app.css';";

    const rootClass = ctx.cssModules ? '{styles.root}' : "'app'";
    const titleClass = ctx.cssModules ? '{styles.title}' : "'app__title'";

    const coreImports = `import { Button } from '@alfalab/core-components/button';
import { Gap } from '@alfalab/core-components/gap';
import { Typography } from '@alfalab/core-components/typography';`;

    const view = (count: string) => `        <div className=${rootClass}>
            <Typography.Title view='medium' tag='h1' className=${titleClass}>
                ${ctx.name}
            </Typography.Title>

            <Gap size='m' />

            <Typography.Text view='primary-medium'>Счетчик: {${count}}</Typography.Text>

            <Gap size='m' />`;

    if (ctx.useRtk) {
        return `import React from 'react';

${coreImports}

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { decrement, increment } from '../store/counter-slice';

${styleImport}

export function App() {
    const count = useAppSelector((state) => state.counter.value);
    const dispatch = useAppDispatch();

    return (
${view('count')}

            <Button view='accent' size='s' onClick={() => dispatch(increment())}>
                +1
            </Button>{' '}
            <Button view='secondary' size='s' onClick={() => dispatch(decrement())}>
                -1
            </Button>
        </div>
    );
}
`;
    }

    return `import React, { useState } from 'react';

${coreImports}

${styleImport}

export function App() {
    const [count, setCount] = useState(0);

    return (
${view('count')}

            <Button view='accent' size='s' onClick={() => setCount((prev) => prev + 1)}>
                +1
            </Button>{' '}
            <Button view='secondary' size='s' onClick={() => setCount((prev) => prev - 1)}>
                -1
            </Button>
        </div>
    );
}
`;
}
