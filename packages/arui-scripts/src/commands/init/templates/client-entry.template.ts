import { type TemplateContext } from '../types';

export function clientEntryTemplate(ctx: TemplateContext): string {
    const providerImports = ctx.useRtk
        ? "import { Provider } from 'react-redux';\n\nimport { store } from './store';\n"
        : '';

    const renderBody = ctx.useRtk
        ? `        <Provider store={store}>
            <AppComponent />
        </Provider>,`
        : '        <AppComponent />,';

    return `import React from 'react';
import { createRoot } from 'react-dom/client';

${providerImports}import { App } from './components/app';

const targetElement = document.getElementById('react-app');
const root = createRoot(targetElement!);

function render(AppComponent: typeof App) {
    root.render(
${renderBody}
    );
}

render(App);

if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./components/app', () => {
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const NextApp = require('./components/app').App;

        render(NextApp);
    });
}
`;
}
