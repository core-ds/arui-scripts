export function justSomeRandomFunctionThatWeWantToExport() {
  return 'hello';
}

export const someRandomVariableThatWeWantToExport = 'hello';

(window as any).ClientModuleAbstract = {
    justSomeRandomFunctionThatWeWantToExport,
    someRandomVariableThatWeWantToExport,
};
