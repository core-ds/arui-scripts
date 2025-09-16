import {
    type GetModuleStateResult,
    type GetResourcesRequest,
    type MountMode,
} from '@alfalab/scripts-modules';

export type ModuleDescriptor<FrameworkParams extends unknown[] = [], GetResourcesParams = void> = {
    mountMode: MountMode;
    version?: string;
    getModuleState: (
        getResourcesRequest: GetResourcesRequest<GetResourcesParams>,
        ...params: FrameworkParams
    ) => Promise<GetModuleStateResult>;
};

export type ModulesConfig<FrameworkParams extends unknown[] = [], GetResourcesParams = void> = {
    [moduleId: string]: ModuleDescriptor<FrameworkParams, GetResourcesParams>;
};
