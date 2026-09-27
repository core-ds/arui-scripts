/* eslint-disable global-require, @typescript-eslint/no-var-requires, import/no-dynamic-require */
import { commands } from '../commands-registry';

const routes = [
    ['start', 'start'],
    ['start:prod', 'start-prod'],
    ['build', 'build'],
    ['docker-build', 'docker-build'],
    ['docker-build:compiled', 'docker-build-compiled'],
    ['test', 'test'],
    ['test:vitest', 'test-vitest'],
    ['ensure-yarn', 'ensure-yarn'],
    ['archive-build', 'archive-build'],
    ['bundle-analyze', 'bundle-analyze'],
    ['changelog', 'changelog'],
];

describe('CLI command registry', () => {
    test('has unique documented command names', () => {
        expect(commands.map(({ name }) => name)).toEqual(routes.map(([name]) => name));
        expect(new Set(commands.map(({ name }) => name)).size).toBe(commands.length);
        commands.forEach((command) => expect(command.description.length).toBeGreaterThan(0));
    });
    test.each(routes)('loads %s only when invoked', (name, module) => {
        const factory = jest.fn(() => ({ selected: module }));

        jest.doMock(`../../commands/${module}`, factory);
        expect(factory).not.toHaveBeenCalled();
        expect(commands.find((command) => command.name === name)?.load()).toEqual({
            selected: module,
        });
        expect(factory).toHaveBeenCalledTimes(1);
    });
});
