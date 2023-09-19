import React from 'react';

export const ServerStateModuleCompat = (props: { runParams: any; serverState: any }) => (
    <div>
        Это модуль ServerStateModuleCompat, который был загружен в режиме compat. Главное его
        отличие от ModuleCompat - это то, что при его загрузке на страницу, он сразу же получает
        данные с сервера.
        <div>
            Например сейчаc виджет получил данные:
            <pre>{JSON.stringify(props.serverState, null, 4)}</pre>
            <p>Данные, полученные из клиента:</p>
            <pre>{JSON.stringify(props.runParams, null, 4)}</pre>
        </div>
    </div>
);
