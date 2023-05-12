import express from 'express';
import path from 'path';
import { readAssetsManifest, WidgetsConfig } from '@arui-scripts/server';
import { createGetWidgetsExpress } from '@arui-scripts/server/build/express';
import bodyParser from 'body-parser';

const app = express();

app.use('/assets', express.static(path.join(process.cwd(), '.build', 'assets')));
app.use(bodyParser.json());

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



const widgets: WidgetsConfig = {
    'ServerWidgetLegacy': {
        mountMode: 'legacy',
        mountFunctionName: '__mountServerWidgetLegacy',
        unmountFunctionName: '__unmountServerWidgetLegacy',
        version: '1.0.0',
        getRunParams: async () => ({
            paramFromServer: 'This can be any data from server',
            asyncData: 'It can be constructed from async data, so you may perform some service calls here',
            contextRoot: 'http://localhost:8081',
        }),
    },
    'ServerWidgetMF': {
        mountMode: 'mf',
        version: '1.0.0',
        getRunParams: async () => ({
            paramFromServer: 'This can be any data from server',
            asyncData: 'It can be constructed from async data, so you may perform some service calls here',
            contextRoot: 'http://localhost:8081',
        }),
    },
};

const widgetRouter = createGetWidgetsExpress(widgets);
app.use(widgetRouter);


app.listen(3001, () => {
    console.log('Test server is listening on :3001');
});
