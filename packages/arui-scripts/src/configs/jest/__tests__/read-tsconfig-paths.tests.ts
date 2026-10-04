import fs from 'fs';
import os from 'os';
import path from 'path';

import { readTsconfigPaths } from '../read-tsconfig-paths';

// Собираем символ кодом: литерал BOM в исходнике запрещён линтером (no-irregular-whitespace)
const BYTE_ORDER_MARK = String.fromCharCode(0xfeff);

describe('read-tsconfig-paths', () => {
    let tmpDir: string;

    function writeTsconfig(content: string) {
        const file = path.join(tmpDir, 'tsconfig.json');

        fs.writeFileSync(file, content);

        return file;
    }

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-scripts-tsconfig-paths-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should return empty object when there is no tsconfig', () => {
        expect(readTsconfigPaths(null)).toEqual({});
        expect(readTsconfigPaths(undefined)).toEqual({});
    });

    it('should return paths from compilerOptions', () => {
        const file = writeTsconfig(
            JSON.stringify({
                compilerOptions: { paths: { '#/*': ['./src/*'], 'shared/*': ['../shared/*'] } },
            }),
        );

        expect(readTsconfigPaths(file)).toEqual({
            '#/*': ['./src/*'],
            'shared/*': ['../shared/*'],
        });
    });

    it('should support comments and trailing commas, as tsc does', () => {
        const file = writeTsconfig(`{
    // алиасы для импортов
    "compilerOptions": {
        /* корень исходников */
        "paths": {
            "#/*": ["./src/*",],
        },
    },
}`);

        expect(readTsconfigPaths(file)).toEqual({ '#/*': ['./src/*'] });
    });

    it('should ignore byte order mark', () => {
        const file = writeTsconfig(
            `${BYTE_ORDER_MARK}{ "compilerOptions": { "paths": { "#/*": ["./src/*"] } } }`,
        );

        expect(readTsconfigPaths(file)).toEqual({ '#/*': ['./src/*'] });
    });

    it('should return empty object when compilerOptions or paths are missing', () => {
        expect(readTsconfigPaths(writeTsconfig('{}'))).toEqual({});
        expect(
            readTsconfigPaths(writeTsconfig('{ "compilerOptions": { "strict": true } }')),
        ).toEqual({});
        expect(readTsconfigPaths(writeTsconfig(''))).toEqual({});
    });

    it('should not throw on invalid tsconfig', () => {
        expect(readTsconfigPaths(writeTsconfig('{ not a json'))).toEqual({});
        expect(readTsconfigPaths(writeTsconfig('just text'))).toEqual({});
    });
});
