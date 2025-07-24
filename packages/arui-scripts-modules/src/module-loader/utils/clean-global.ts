type WindowWithGlobals = typeof window & Record<string, unknown>;

export function cleanGlobal(globalVariableName: string) {
    if ((window as WindowWithGlobals)[globalVariableName]) {
        delete (window as WindowWithGlobals)[globalVariableName];
    }
}
