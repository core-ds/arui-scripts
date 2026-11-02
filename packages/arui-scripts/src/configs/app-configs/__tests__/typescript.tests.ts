import fs from 'fs';
import os from 'os';
import path from 'path';

import { getDefaultAppConfig, getDefaultAppContext } from '../get-defaults';
import { type AppContextWithConfigs } from '../types';
import { validateConfig } from '../validate-config';
import { warnAboutDeprecations } from '../warn-about-deprecations';

describe('TypeScript transformation compatibility', () => {
    let cwd: string;
    let config: AppContextWithConfigs;

    function installTypeScript(version: string) {
        const directory = path.join(cwd, 'node_modules/typescript');

        fs.mkdirSync(directory, { recursive: true });
        fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ version }));
    }

    beforeEach(() => {
        cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-ts-version-'));
        config = { ...getDefaultAppConfig(), ...getDefaultAppContext(), cwd };
    });

    afterEach(() => {
        fs.rmSync(cwd, { recursive: true, force: true });
        jest.restoreAllMocks();
    });

    it.each(['codeLoader', 'jestCodeTransformer'] as const)(
        'rejects %s=tsc with TypeScript 7 and explains migration',
        (key) => {
            installTypeScript('7.0.2');
            config[key] = 'tsc';
            expect(() => validateConfig(config)).toThrow(new RegExp(`${key}.*swc.*babel`));
        },
    );

    it.each(['5.9.3', '6.0.2'])('preserves both tsc modes with TypeScript %s', (version) => {
        installTypeScript(version);
        config.codeLoader = 'tsc';
        config.jestCodeTransformer = 'tsc';
        expect(() => validateConfig(config)).not.toThrow();
    });

    it.each(['swc', 'babel'] as const)('accepts %s with TypeScript 7', (loader) => {
        installTypeScript('7.0.2');
        config.codeLoader = loader;
        config.jestCodeTransformer = loader;
        expect(() => validateConfig(config)).not.toThrow();
    });

    it.each(['codeLoader', 'jestCodeTransformer'] as const)(
        'warns that %s=tsc is deprecated on TypeScript 6',
        (key) => {
            installTypeScript('6.0.2');
            config[key] = 'tsc';
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

            warnAboutDeprecations(config);
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(new RegExp(`${key}.*deprecated`)),
            );
        },
    );

    it('does not warn for default SWC settings', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        warnAboutDeprecations(config);
        expect(warn).not.toHaveBeenCalled();
    });
});
