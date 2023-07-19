import React from 'react';

export const ServerModuleMf = (props: { runParams: any; serverState: any }) => (
    <div>
        <h1>ServerModuleMf</h1>

        <p>
            Данные, полученные из сервера:
        </p>

        <pre>
            {JSON.stringify(props.serverState, null, 4)}
        </pre>

        <p>
            Данные, полученные из клиента:
        </p>

        <pre>
            {JSON.stringify(props.runParams, null, 4)}
        </pre>
    </div>
);
