import { type TemplateContext } from '../types';

export function serverEntryTemplate(ctx: TemplateContext): string {
    return `import path from 'path';

import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';

import { readAssetsManifest } from '@alfalab/scripts-server';

const PORT = ${ctx.serverPort};

async function start() {
    const server = Hapi.server({
        port: PORT,
        routes: {
            files: {
                relativeTo: path.join(process.cwd(), '.build'),
            },
        },
    });

    await server.register(Inert);

    server.route({
        method: 'GET',
        path: '/assets/{param*}',
        handler: {
            directory: {
                path: 'assets',
            },
        },
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: async () => {
            const assets = await readAssetsManifest();

            const css = assets.css
                .map((href) => '<link rel="stylesheet" href="/' + href + '" />')
                .join('');
            const js = assets.js.map((src) => '<script src="/' + src + '"></script>').join('');

            return (
                '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8" /><base href="/" />' +
                css +
                '</head><body><div id="react-app"></div>' +
                js +
                '</body></html>'
            );
        },
    });

    await server.start();
    // eslint-disable-next-line no-console
    console.log('Server is listening on ' + server.info.uri);
}

start();
`;
}
