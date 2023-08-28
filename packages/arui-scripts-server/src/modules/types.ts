import type { MountMode, GetResourcesRequest, ModuleResources, GetModuleStateResult } from '@alfalab/scripts-modules';

export type ModuleDescriptor<FrameworkParams extends unknown[] = []> = {
    mountMode: MountMode;
    version?: string;
    getModuleState: (getResourcesRequest: GetResourcesRequest, ...params: FrameworkParams) => Promise<GetModuleStateResult>;
}

export type ModulesConfig<FrameworkParams extends unknown[] = []> = {
    [moduleId: string]: ModuleDescriptor<FrameworkParams>;
};
