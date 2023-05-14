import React from 'react';
import { BaseModuleParams } from '@arui-scripts/modules';

export const ServerModuleMf = (props: BaseModuleParams) => (
    <div>
        <h1>ServerModuleMf</h1>

        <p>
            Данные, полученные из сервера:
        </p>

        <pre>
            {JSON.stringify(props, null, 4)}
        </pre>
    </div>
);
