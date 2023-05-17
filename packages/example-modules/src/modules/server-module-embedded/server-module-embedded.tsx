import React from 'react';

export const ServerModuleEmbedded = (props: { runParams: any, serverState: any }) => (
    <div>
        Это модуль ServerModuleEmbedded, который был загружен в режиме embedded.
        Главное его отличие от ClientModuleEmbedded - это то, что при его загрузке на страницу, он сразу же получает
        данные с сервера.
        <div className="content">
            Например сейчаc виджет получил данные:
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
    </div>
)
