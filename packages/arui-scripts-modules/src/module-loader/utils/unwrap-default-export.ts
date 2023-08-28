export function unwrapDefaultExport<ModuleExportType>(module: ModuleExportType): ModuleExportType {
    return (module as any).default ?? module;
}
