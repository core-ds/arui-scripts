import express from 'express';
import path from 'path';
import { readAssetsManifest } from '@alfalab/scripts-server';
import { createGetModulesExpress } from '@alfalab/scripts-server/build/express';
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


const moduleRouter = createGetModulesExpress({
    'ServerStateModuleCompat': {
        mountMode: 'compat',
        version: '1.0.0',
        getModuleState: async (getResourcesRequest, request) => {
            console.log('We can get some data from resource request here', getResourcesRequest);
            console.log('Or even from express request', request.url);
            return ({
                paramFromServer: 'This can be any data from server',
                asyncData: 'It can be constructed from async data, so you may perform some service calls here',
                baseUrl: 'http://localhost:8082',
                hostAppId: getResourcesRequest.hostAppId,
                stuffFromClient: getResourcesRequest.params
            });
        },
    },
    'ServerStateModule': {
        mountMode: 'default',
        version: '1.0.0',
        getModuleState: async (getResourcesRequest) => ({
            paramFromServer: 'This can be any data from server',
            asyncData: 'It can be constructed from async data, so you may perform some service calls here',
            baseUrl: 'http://localhost:8082',
            hostAppId: getResourcesRequest.hostAppId,
        }),
    },
});
app.use(moduleRouter);


app.listen(3001, () => {
    console.log('Test server is listening on :3001');
});
