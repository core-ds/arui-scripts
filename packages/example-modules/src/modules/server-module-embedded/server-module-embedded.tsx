import React from 'react';
import { BaseModuleParams } from '@arui-scripts/modules';

export const ServerModuleEmbedded = (props: BaseModuleParams) => (
    <div>
        Это модуль ServerModuleEmbedded, который был загружен в режиме embedded.
        Главное его отличие от ClientModuleEmbedded - это то, что при его загрузке на страницу, он сразу же получает
        данные с сервера.
        <div className="content">
            Например сейчаc виджет получил данные:
            <pre>
                {JSON.stringify(props, null, 4)}
            </pre>
        </div>
    </div>
)
