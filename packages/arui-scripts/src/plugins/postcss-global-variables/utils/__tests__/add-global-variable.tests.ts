import { Rule } from 'postcss';

import { addGlobalVariable } from '../utils';

describe('addGlobalVariable', () => {
    it('Должен добавлять переменные, найденные в cssValue, в rootSelector', () => {
        const mockRootSelector = new Rule({ selector: ':root' });
        const parsedVariables = {
            '--color-primary': '#ff0000',
        };

        addGlobalVariable('var(--color-primary)', mockRootSelector, parsedVariables);

        expect(mockRootSelector.nodes).toMatchObject([
            { prop: '--color-primary', value: '#ff0000' }
        ]);
    });

    it('Должен рекурсивно добавлять вложенные переменные', () => {
        const mockRootSelector = new Rule({ selector: ':root' });
        const parsedVariables = {
            '--color-primary': 'var(--color-secondary)',
            '--color-secondary': '#00ff00',
        };

        addGlobalVariable('var(--color-primary)', mockRootSelector, parsedVariables);

        expect(mockRootSelector.nodes).toMatchObject([
            { prop: '--color-primary', value: 'var(--color-secondary)' },
            { prop: '--color-secondary', value: '#00ff00' },
        ]);
    });

    it('Не должен добавлять переменные, если их нет в parsedVariables', () => {
        const mockRootSelector = new Rule({ selector: ':root' });
        const parsedVariables = {
            'color-primary': '#ff0000',
        };

        addGlobalVariable('var(--color-secondary)', mockRootSelector, parsedVariables);

        expect(mockRootSelector.nodes).toEqual([]);
    });
});
