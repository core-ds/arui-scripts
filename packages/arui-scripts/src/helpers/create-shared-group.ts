import { type SharedConfig } from '@rspack/core';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute, join } from 'node:path';

export type SharedLibraryOptions = Pick<
    SharedConfig,
    'eager' | 'requiredVersion' | 'singleton' | 'strictVersion'
>;

export type SharedGroupOptions = {
    /** Absolute path to the application's package.json. */
    packageJson: string;
    /** Root package names whose exact installed versions define compatibility. */
    runtime: string[];
    /** Exact imports or prefixes ending in /. */
    libraries: string[] | Record<string, SharedLibraryOptions>;
    eager?: boolean;
};

function packageName(request: string): string {
    const parts = request.split('/');

    return request.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** Generate ordinary MF options without loading arui-scripts application configuration. */
export function createSharedGroup({
    packageJson,
    runtime,
    libraries,
    eager = false,
}: SharedGroupOptions): Record<string, SharedConfig> {
    if (!isAbsolute(packageJson) || !existsSync(packageJson)) {
        throw new Error('createSharedGroup: packageJson must point to an existing absolute path');
    }
    if (!runtime.length || runtime.some((name) => !name || packageName(name) !== name)) {
        throw new Error('createSharedGroup: runtime must contain root package names');
    }

    const requireFromApp = createRequire(packageJson);
    const versions = new Map<string, string>();
    const getVersion = (name: string): string => {
        const cached = versions.get(name);

        if (cached) return cached;

        let manifest: string | undefined;

        try {
            manifest = requireFromApp.resolve(`${name}/package.json`);
        } catch {
            // Exports may hide package.json or even the root import. Resolve metadata
            // directly from Node's package search paths without importing library code.
            manifest = requireFromApp.resolve
                .paths(name)
                ?.map((directory) => join(directory, name, 'package.json'))
                .find((candidate) => existsSync(candidate));
        }
        if (!manifest) {
            throw new Error(`createSharedGroup: cannot resolve ${name} relative to ${packageJson}`);
        }
        const data = JSON.parse(readFileSync(manifest, 'utf8')) as { version?: string };

        if (!data.version || typeof data.version !== 'string') {
            throw new Error(`createSharedGroup: missing version in ${manifest}`);
        }
        versions.set(name, data.version);

        return data.version;
    };

    const runtimeNames = [...new Set(runtime)].sort();
    const fingerprint = createHash('sha256')
        .update(JSON.stringify(runtimeNames.map((name) => [name, getVersion(name)])))
        .digest('hex');
    const prefix = `shared-group-v1-${fingerprint}/`;
    const shared: Record<string, SharedConfig> = {};

    runtimeNames.forEach((name) => {
        [name, `${name}/`].forEach((request) => {
            shared[request] = {
                shareKey: `${prefix}${request}`,
                packageName: name,
                version: getVersion(name),
                requiredVersion: getVersion(name),
                singleton: true,
                strictVersion: true,
                eager,
            };
        });
    });

    const entries = Array.isArray(libraries)
        ? libraries.map((request): [string, SharedLibraryOptions] => [request, {}])
        : Object.entries(libraries);

    entries.forEach(([request, options]) => {
        const name = packageName(request);

        if (!name || runtimeNames.includes(name)) {
            throw new Error(`createSharedGroup: library ${request} overlaps runtime or is empty`);
        }
        shared[request] = {
            shareKey: `${prefix}${request}`,
            packageName: name,
            version: getVersion(name),
            requiredVersion: getVersion(name),
            singleton: false,
            strictVersion: true,
            eager,
            ...options,
        };
    });

    return shared;
}
