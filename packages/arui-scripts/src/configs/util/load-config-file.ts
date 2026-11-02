import { createJiti } from 'jiti';

// Compile TS as CommonJS so conditional exports keep selecting "require" on newer Node versions.
const loadTypeScript = createJiti(__filename, { interopDefault: true, tryNative: false });

// Keep JavaScript dependencies on Node's native loader, including dynamic ESM chunks.
export function loadConfigFile(filename: string) {
    if (/\.[cm]?tsx?$/.test(filename)) {
        return loadTypeScript(filename);
    }

    // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
    return require(filename);
}
