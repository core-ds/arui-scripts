import path from 'path';

import express from 'express';

import { readAssetsManifest } from '@alfalab/scripts-server';

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
${assets.js.map((c) => `<script type='text/javascript' src='/${c}'></script>`).join('')}
</body>
</html>
`;

    res.send(response);
});

app.listen(3000, () => {
    console.log('Test server is listening on :3000');
});
