import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const MARKER = '.arui-cache.json';
const GUARD = '.operation.lock';
const LEASE = '.writer.json';

function readJson(file: string) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function alive(pid: number): boolean {
    if (!Number.isSafeInteger(pid) || pid <= 0) return true;
    try {
        process.kill(pid, 0);

        return true;
    } catch (error) {
        return (error as NodeJS.ErrnoException).code !== 'ESRCH';
    }
}

function assertTree(directory: string): void {
    if (fs.lstatSync(directory).isSymbolicLink())
        throw new Error(`Refusing cache operation: symlink ${directory}`);
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
        const file = path.join(directory, entry.name);

        if (entry.isSymbolicLink()) throw new Error(`Refusing cache operation: symlink ${file}`);
        if (entry.isDirectory()) assertTree(file);
    });
}

function assertOwned(directory: string): void {
    const marker = readJson(path.join(directory, MARKER));

    if (marker.tool !== 'arui-scripts/rspack' || marker.schema !== 1)
        throw new Error(`Not an arui-scripts Rspack cache: ${directory}`);
}

function ownDirectory(directory: string): void {
    fs.mkdirSync(directory, { recursive: true });
    const marker = path.join(directory, MARKER);

    if (!fs.existsSync(marker)) {
        if (fs.readdirSync(directory).length)
            throw new Error(
                `Cache directory is not empty and has no ownership marker: ${directory}`,
            );
        try {
            fs.writeFileSync(marker, JSON.stringify({ schema: 1, tool: 'arui-scripts/rspack' }), {
                flag: 'wx',
            });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
        }
    }
    assertOwned(directory);
}

function withGuard<T>(directory: string, operation: () => T): T {
    const file = path.join(directory, GUARD);

    if (fs.existsSync(file) && !alive(readJson(file).pid)) fs.unlinkSync(file);
    fs.writeFileSync(file, JSON.stringify({ pid: process.pid }), { flag: 'wx' });
    try {
        return operation();
    } finally {
        fs.unlinkSync(file);
    }
}

export type CacheNamespace = {
    name: string;
    mode: string;
    target: string;
    fingerprint: string;
    dependencies: number;
    custom?: boolean;
    checkout?: string;
};

/** The lease lasts until native compiler.close has finished flushing, not just the shutdown hook. */
export function acquireCache(directory: string, info: CacheNamespace): () => void {
    ownDirectory(directory);

    return withGuard(directory, () => {
        const location = path.join(directory, info.name);

        if (fs.existsSync(location)) assertTree(location);
        fs.mkdirSync(location, { recursive: true });
        const file = path.join(location, LEASE);

        if (fs.existsSync(file)) {
            if (alive(readJson(file).pid))
                throw new Error(
                    `Cache "${info.name}" has an active writer; stop it before reusing this namespace`,
                );
            fs.unlinkSync(file);
        }
        const token = crypto.randomBytes(16).toString('hex');

        fs.writeFileSync(file, JSON.stringify({ pid: process.pid, token }), { flag: 'wx' });
        try {
            fs.writeFileSync(path.join(location, '.namespace.json'), JSON.stringify(info));
        } catch (error) {
            fs.unlinkSync(file);
            throw error;
        }

        return () => {
            if (fs.existsSync(file) && readJson(file).token === token) fs.unlinkSync(file);
        };
    });
}

export function inspectCache(directory: string): {
    exists: boolean;
    bytes: number;
    namespaces: CacheNamespace[];
} {
    if (!fs.existsSync(directory)) return { exists: false, bytes: 0, namespaces: [] };
    assertOwned(directory);
    assertTree(directory);
    let bytes = 0;
    const namespaces: CacheNamespace[] = [];
    const visit = (current: string) => {
        fs.readdirSync(current, { withFileTypes: true }).forEach((entry) => {
            const file = path.join(current, entry.name);

            if (entry.isDirectory()) visit(file);
            else {
                bytes += fs.statSync(file).size;
                if (entry.name === '.namespace.json') namespaces.push(readJson(file));
            }
        });
    };

    visit(directory);

    return { exists: true, bytes, namespaces };
}

export function clearCache(directory: string): void {
    if (!fs.existsSync(directory)) return;
    assertOwned(directory);
    assertTree(directory);
    withGuard(directory, () => {
        const entries = fs.readdirSync(directory).filter((name) => {
            const namespace = path.join(directory, name);
            const metadata = path.join(namespace, '.namespace.json');

            if (!fs.statSync(namespace).isDirectory() || !fs.existsSync(metadata)) return false;
            if (readJson(metadata).name !== name)
                throw new Error(`Invalid cache namespace marker: ${namespace}`);

            return true;
        });

        entries.forEach((name) => {
            const lease = path.join(directory, name, LEASE);

            if (fs.existsSync(lease) && alive(readJson(lease).pid))
                throw new Error(
                    'Cache has an active writer. Stop build/dev before running cache:clear.',
                );
        });
        entries.forEach((name) =>
            fs.rmSync(path.join(directory, name), { recursive: true, force: true }),
        );
    });
}
