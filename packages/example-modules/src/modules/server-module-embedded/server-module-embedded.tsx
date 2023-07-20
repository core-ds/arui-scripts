import React, { Suspense } from 'react';

const Runtime = React.lazy( () => import('./runtime-chunk') );

export const ServerModuleEmbedded = (props: { runParams: any, serverState: any }) => (
    <div>
        Это модуль ServerModuleEmbedded, который был загружен в режиме embedded.
        Главное его отличие от ClientModuleEmbedded - это то, что при его загрузке на страницу, он сразу же получает
        данные с сервера.
        <div>
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

            <Suspense fallback={<div>Loading...</div>}>
                <Runtime />
            </Suspense>
        </div>
    </div>
)
