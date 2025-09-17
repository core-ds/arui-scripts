import React from 'react';

import styles from './server-state-module.module.css';

export const ServerStateModule = (props: {
    runParams: Record<string, unknown>;
    serverState: Record<string, unknown>;
}) => (
    <div>
        <h1>ServerStateModule</h1>

        <p>Данные, полученные из сервера:</p>

        <pre>{JSON.stringify(props.serverState, null, 4)}</pre>

        <p className={styles.redText}>Данные, полученные из клиента:</p>

        <pre>{JSON.stringify(props.runParams, null, 4)}</pre>
    </div>
);
