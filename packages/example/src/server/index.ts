import express from 'express';
import path from 'path';
import { readAssetsManifest } from '@arui-scripts/server';

const app = express();

app.use('/assets', express.static(path.join(process.cwd(), '.build', 'assets')))

app.get('/', async (req, res) => {
    const assets = await readAssetsManifest();

    const response = `
<html>
<head>
<base href="/" />
${assets.css.map(c => `<link rel='stylesheet' href='/${c}' />`).join('')}
</head>
<body>
<div id='app'></div>
${assets.js.map(c => `<script type='text/javascript' src='/${c}'></script>`).join('')}
</body>
</html>
`;

    res.send(response);
});

app.listen(3000, () => {
    console.log('Test server is listening on :3000');
});
