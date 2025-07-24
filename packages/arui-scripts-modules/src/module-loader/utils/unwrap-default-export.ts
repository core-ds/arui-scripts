type ModuleWithDefaultField<T> = {
    default: T;
};

export function unwrapDefaultExport<ModuleExportType>(module: ModuleExportType): ModuleExportType {
    return (module as ModuleWithDefaultField<ModuleExportType>).default ?? module;
}
