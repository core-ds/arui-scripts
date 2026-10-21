import { createModuleNameMapper } from '../create-module-name-mapper';

describe('createModuleNameMapper', () => {
    it('maps wildcard aliases, exact imports and fallback paths', () => {
        const mapper = createModuleNameMapper({
            '@app/*': ['./src/*'],
            config: ['./config.ts'],
            'shared/*': ['./src/shared/*', '../shared/*'],
        });

        expect(mapper).toEqual({
            '^@app/(.*)$': '<rootDir>/src/$1',
            '^config$': '<rootDir>/config.ts',
            '^shared/(.*)$': ['<rootDir>/src/shared/$1', '<rootDir>/../shared/$1'],
        });
        expect('shared/utils').toMatch(new RegExp(Object.keys(mapper)[2]));
    });

    it('escapes regular expression characters and preserves suffixes', () => {
        const mapper = createModuleNameMapper({
            '@app.v2/*/entry': ['./src/*/index.ts'],
            'config.json': ['./config.json'],
        });
        const [pattern] = Object.keys(mapper);

        expect('@app.v2/button/entry'.replace(new RegExp(pattern), mapper[pattern] as string)).toBe(
            '<rootDir>/src/button/index.ts',
        );
        expect('@appXv2/button/entry').not.toMatch(new RegExp(pattern));
        expect('configXjson').not.toMatch(new RegExp(Object.keys(mapper)[1]));
    });

    it('skips aliases without targets and unsupported multiple wildcards', () => {
        expect(createModuleNameMapper({ empty: [], '*/*': ['./src/*/*'] })).toEqual({});
    });
});
