/* eslint-disable global-require, @typescript-eslint/no-var-requires */
/* eslint-disable no-template-curly-in-string -- These are literal runtime templates. */
import fs from 'fs';
import path from 'path';

import type * as HtmlTemplate from '../add-env-to-html-template';
import type * as EnvConfig from '../get-env-config';

jest.mock('../../app-configs', () => ({ configs: { cwd: '/project' } }));

describe('runtime environment config', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv, ARUI_TEST_VALUE: 'release' };
    });
    afterEach(() => {
        jest.restoreAllMocks();
        process.env = originalEnv;
    });

    test('replaces repeated values and removes unset template variables', () => {
        const { replaceTemplateVariables } = require('../get-env-config') as typeof EnvConfig;

        expect(
            replaceTemplateVariables('${HOST}/${HOST}/${PORT}/${MISSING}', {
                HOST: 'api',
                PORT: '0',
            }),
        ).toBe('api/api/0/');
        expect(replaceTemplateVariables('${EMPTY}', { EMPTY: '' })).toBe('');
    });

    test('missing file produces a cached empty config', () => {
        const exists = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const read = jest.spyOn(fs, 'readFileSync');
        const { getEnvConfigContent } = require('../get-env-config') as typeof EnvConfig;

        expect(getEnvConfigContent()).toBe('{}');
        expect(getEnvConfigContent()).toBe('{}');
        expect(exists).toHaveBeenCalledTimes(1);
        expect(read).not.toHaveBeenCalledWith(path.join('/project', 'env-config.json'), 'utf8');
    });

    test('reads the project template once and inserts it into HTML', () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const originalRead = fs.readFileSync.bind(fs);
        const read = jest.spyOn(fs, 'readFileSync');
        // The module imports must complete before replacing reads used by Jest itself.
        const { getEnvConfigContent } = require('../get-env-config') as typeof EnvConfig;
        const { addEnvToHtmlTemplate } =
            require('../add-env-to-html-template') as typeof HtmlTemplate;

        read.mockImplementation((filename, options) =>
            filename === path.join('/project', 'env-config.json')
                ? '{"release":"${ARUI_TEST_VALUE}"}'
                : originalRead(filename, options),
        );
        expect(getEnvConfigContent()).toBe('{"release":"release"}');
        process.env.ARUI_TEST_VALUE = 'changed';
        expect(addEnvToHtmlTemplate('<script><%= envConfig %></script>')).toBe(
            '<script>{"release":"release"}</script>',
        );
        expect(addEnvToHtmlTemplate('<html/>')).toBe('<html/>');
        expect(
            read.mock.calls.filter(
                ([filename]) => filename === path.join('/project', 'env-config.json'),
            ),
        ).toHaveLength(1);
    });

    test('propagates an unreadable config error', () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const { getEnvConfigContent } = require('../get-env-config') as typeof EnvConfig;

        jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
            throw new Error('EACCES');
        });
        expect(getEnvConfigContent).toThrow('EACCES');
    });
});
