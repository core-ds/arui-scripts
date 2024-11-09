import { insertPlugin } from '../insert-plugin';

describe('insertPlugin', () => {
    it('Должен корректно добавить плагин перед искомым плагином', () => {
        const plugins = ['plugin1', 'plugin2', 'plugin3', 'plugin4'];

        const newPlugins = insertPlugin(plugins, 'plugin4', 'plugin777');

        expect(newPlugins).toEqual(['plugin1', 'plugin2', 'plugin3', 'plugin777', 'plugin4']);
    });

    it('Должен корректно добавить плагин перед искомым плагином, если искомый плагин в массиве', () => {
        const plugins = ['plugin1', 'plugin2', ['plugin3', {}], 'plugin4'];

        const newPlugins = insertPlugin(plugins, 'plugin3', 'plugin777');

        expect(newPlugins).toEqual(['plugin1', 'plugin2', 'plugin777', ['plugin3', {}], 'plugin4']);
    });
});
