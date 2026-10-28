import { type ComponentType } from 'react';

import { type BaseModuleState } from '../module-loader/types';

export type ReactModuleProps<
    RunParams = void,
    ServerState extends BaseModuleState = BaseModuleState,
> = {
    runParams: RunParams;
    serverState: ServerState;
};

export type CreateReactModuleOptions<
    RunParams = void,
    ServerState extends BaseModuleState = BaseModuleState,
> = {
    Component: ComponentType<ReactModuleProps<RunParams, ServerState>>;
    /** По умолчанию готовность наступает после первого commit. */
    readiness?: 'auto' | 'explicit';
};
