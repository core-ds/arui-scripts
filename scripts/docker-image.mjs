import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const ROOT = new URL('../', import.meta.url);
export const CONSTANTS_PATH = 'packages/arui-scripts-artifacts/src/docker/constants.ts';

export function readDefaultImage(source) {
    const match = source.match(/export const DEFAULT_BASE_DOCKER_IMAGE = '([^']+)';/);

    if (!match) throw new Error(`Cannot read DEFAULT_BASE_DOCKER_IMAGE in ${CONSTANTS_PATH}.`);

    return match[1];
}

export async function defaultImage(root = ROOT) {
    return readDefaultImage(await readFile(new URL(CONSTANTS_PATH, root), 'utf8'));
}

export async function imageExists(image, run = execFileAsync) {
    try {
        await run('docker', ['buildx', 'imagetools', 'inspect', image], { timeout: 30_000 });

        return true;
    } catch (error) {
        // Only a missing manifest means "not published yet". Auth/network/tool errors must fail CI.
        if (
            error.code === 1 &&
            /manifest unknown|no such manifest|: not found/i.test(error.stderr)
        ) {
            return false;
        }

        throw new Error(`Cannot inspect Docker image ${image}: ${error.stderr || error.message}`, {
            cause: error,
        });
    }
}
