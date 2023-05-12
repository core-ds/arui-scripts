import React from 'react';
import { BaseModuleParams } from '@arui-scripts/widgets';

export const ServerWidgetMf = (props: BaseModuleParams) => (
    <div>
        <h1>ServerWidgetMf</h1>

        <p>
            Данные, полученные из сервера:
        </p>

        <pre>
            {JSON.stringify(props, null, 4)}
        </pre>
    </div>
);
