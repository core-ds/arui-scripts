export function cleanGlobal(globalVariableName: string) {
    if ((window as any)[globalVariableName]) {
        delete (window as any)[globalVariableName];
    }
}
