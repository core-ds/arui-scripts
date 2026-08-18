import path from 'path';

import express from 'express';

import { readAssetsManifest } from '@alfalab/scripts-server';

import svgIcon from '../clock.svg';

import icon from './server.png';

const app = express();

app.use('/assets', express.static(path.join(process.cwd(), '.build', 'assets')));

app.get('/', async (req, res) => {
    const assets = await readAssetsManifest();

    const response = `
<html>
<head>
<base href="/" />
${assets.css.map((c) => `<link rel='stylesheet' href='/${c}' />`).join('')}
</head>
<body>
<div id='react-app'></div>

<p>Картинка с сервера:</p>
<img src="${icon}" alt="Картика с сервера" width="200" />
<img src="${svgIcon}" alt="svg с сервера" />
${assets.js.map((c) => `<script type='text/javascript' src='/${c}'></script>`).join('')}
</body>
</html>
`;

    res.send(response);
});

// порт настраивается: 3000 бывает занят соседним проектом, а поднимать пример
// ради этого на другой машине - перебор
const port = Number(process.env.SERVER_PORT) || 3000;

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Test server is listening on :${port}`);
});
