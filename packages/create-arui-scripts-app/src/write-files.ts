import path from 'path';

import fs from 'fs-extra';

export async function findConflictingFiles(
    targetDir: string,
    files: Record<string, string>,
    extraPaths: string[] = [],
): Promise<string[]> {
    const conflicts: string[] = [];

    await Promise.all(
        [...Object.keys(files), ...extraPaths].map(async (relPath) => {
            if (await fs.pathExists(path.join(targetDir, relPath))) {
                conflicts.push(relPath);
            }
        }),
    );

    return conflicts.sort();
}

export async function writeFiles(targetDir: string, files: Record<string, string>): Promise<void> {
    await fs.ensureDir(targetDir);

    await Promise.all(
        Object.keys(files).map((relPath) =>
            fs.outputFile(path.join(targetDir, relPath), files[relPath]),
        ),
    );
}

// статические ассеты, которые копируются в проект как есть (к примеру, .yarn/releases)
const STATIC_ASSETS_DIR = path.join(__dirname, '../assets');

// пути, которые создает copyStaticAssets в целевой директории (для проверки конфликтов)
export const STATIC_ASSET_PATHS = ['.yarn'];

async function countFiles(dir: string): Promise<number> {
    const entries = await fs.readdir(dir);
    const counts = await Promise.all(
        entries.map(async (entry) => {
            const entryPath = path.join(dir, entry);
            const stat = await fs.stat(entryPath);

            return stat.isDirectory() ? countFiles(entryPath) : 1;
        }),
    );

    return counts.reduce((sum, count) => sum + count, 0);
}

// копирует статические ассеты и возвращает количество скопированных файлов
export async function copyStaticAssets(targetDir: string): Promise<number> {
    await fs.copy(STATIC_ASSETS_DIR, targetDir);

    return countFiles(STATIC_ASSETS_DIR);
}
