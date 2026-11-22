import { type ModuleExports } from '../module-contract';

export function unwrapDefaultExport<ModuleExportType>(
    module: ModuleExports<ModuleExportType>,
): ModuleExportType {
    return module.default ?? (module as ModuleExportType);
}
