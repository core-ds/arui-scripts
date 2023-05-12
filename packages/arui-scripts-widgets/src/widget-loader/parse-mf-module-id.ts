export function parseMfModuleId(moduleId: string) {
    if (moduleId.indexOf('/') === -1) {
        return {
            containerId: moduleId,
            moduleName: moduleId,
        }
    }
    const [containerId, moduleName] = moduleId.split('/');
    return {
        containerId,
        moduleName,
    };
}
