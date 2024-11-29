import type { Declaration,Root } from 'postcss';

import { parseVariables } from '../utils';

describe('parseVariables', () => {
    it('Должен корректно заполнять объект переменными на основе импортируемого файла', () => {
        const parsedVariables: Record<string, string> = {};

        const mockImportedFile = {
            walkDecls: (callback: (decl: Declaration, index: number) => false | void) => {
                const mockDeclarations: Declaration[] = [
                    { prop: '--color-primary', value: '#3498db' } as Declaration,
                    { prop: '--font-size', value: 'var(--gap-24)' } as Declaration,
                ];

                mockDeclarations.forEach(callback);

                return false;
            }
        };

        parseVariables(mockImportedFile as Root, parsedVariables);

        expect(parsedVariables).toEqual({
            '--color-primary': '#3498db',
            '--font-size': 'var(--gap-24)',
        });
    });
});
