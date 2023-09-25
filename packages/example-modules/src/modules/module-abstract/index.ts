/**
 * Этот модуль является "абстрактным", то есть он не имеет какой-либо заданной структуры. Он может содержать любые
 * функции, переменные, классы, интерфейсы, типы и т.д.
 */

export function justSomeRandomFunctionThatWeWantToExport() {
    return 'hello';
}

export const someRandomVariableThatWeWantToExport = 'hello';

(window as any).ModuleAbstract = {
    justSomeRandomFunctionThatWeWantToExport,
    someRandomVariableThatWeWantToExport,
};
