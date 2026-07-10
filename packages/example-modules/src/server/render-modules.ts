import React from 'react';
import { renderToString } from 'react-dom/server';

import { type BaseModuleState } from '@alfalab/scripts-modules';

import { ServerStateModule } from '../modules/server-state-module/server-state-module';
import { ServerStateModuleCompat } from '../modules/server-state-module-compat/server-state-module-compat';

type SsrRunParams = Record<string, unknown>;

const getRunParams = (ssrRunParams: unknown): SsrRunParams =>
    ssrRunParams && typeof ssrRunParams === 'object' ? (ssrRunParams as SsrRunParams) : {};

export function renderServerStateModuleHtml(moduleState: BaseModuleState, ssrRunParams: unknown) {
    return renderToString(
        React.createElement(ServerStateModule, {
            runParams: getRunParams(ssrRunParams),
            serverState: moduleState,
        }),
    );
}

export function renderServerStateModuleCompatHtml(
    moduleState: BaseModuleState,
    ssrRunParams: unknown,
) {
    return renderToString(
        React.createElement(ServerStateModuleCompat, {
            runParams: getRunParams(ssrRunParams),
            serverState: moduleState,
        }),
    );
}
