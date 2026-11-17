import fs from 'fs';
import path from 'path';

import { parse } from 'semver';

type PackageMetadata = { name: string; version: string };

function packageForFile(filename: string): PackageMetadata | undefined {
    let directory = path.dirname(filename);

    while (directory !== path.dirname(directory)) {
        const metadata = path.join(directory, 'package.json');

        if (fs.existsSync(metadata)) {
            const { name, version } = JSON.parse(
                fs.readFileSync(metadata, 'utf8'),
            ) as Partial<PackageMetadata>;

            if (name && version) return { name, version };
        }
        directory = path.dirname(directory);
    }

    return undefined;
}

/** Строит диапазон совместимости по версии пакета в проекте микрофронта. */
function compatibleRange({ name, version }: PackageMetadata) {
    const parsed = parse(version);

    if (!parsed) throw new Error(`modules.types: некорректная версия ${name}@${version}.`);
    const { major, minor, prerelease } = parsed;

    return prerelease.length || (!major && !minor) ? `^${parsed.version}` : `^${major}.${minor}.0`;
}

/**
 * Собирает peerDependencies пакета контрактов: npm-пакеты, которые отдают декларации,
 * используемые публичными типами. Хост устанавливает их сам, поэтому копии типов не дублируются.
 */
export function createContractDependencies() {
    const peerDependencies: Record<string, string> = {};
    const addDependency = (specifier: string, resolvedFile: string | undefined) => {
        const owner = resolvedFile ? packageForFile(resolvedFile) : undefined;

        if (!owner) {
            throw new Error(
                `modules.types: не удалось определить npm-пакет с типами ${specifier}.`,
            );
        }
        peerDependencies[owner.name] = compatibleRange(owner);
    };

    return { peerDependencies, addDependency };
}
