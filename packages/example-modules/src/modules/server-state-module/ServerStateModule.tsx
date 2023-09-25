/* eslint-disable unicorn/filename-case */
// TODO: remove eslint-disable
import React from 'react';

export const ServerStateModule = (props: { runParams: any; serverState: any }) => (
    <div>
        <h1>ServerStateModule</h1>

        <p>Данные, полученные из сервера:</p>

        <pre>{JSON.stringify(props.serverState, null, 4)}</pre>

        <p>Данные, полученные из клиента:</p>

        <pre>{JSON.stringify(props.runParams, null, 4)}</pre>
    </div>
);
