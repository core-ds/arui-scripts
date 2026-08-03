import { promises as fs } from 'fs';
import path from 'path';

/**
 * Очищает директорию: удаляет её содержимое, создавая директорию при отсутствии.
 * Нативная замена fs-extra.emptyDir.
 */
export async function emptyDir(dir: string): Promise<void> {
    await fs.rm(dir, { recursive: true, force: true });
    await fs.mkdir(dir, { recursive: true });
}

/**
 * Создаёт пустой файл (и родительские директории) если он ещё не существует.
 * Существующий файл не изменяется. Нативная замена fs-extra.createFile.
 */
export async function createFile(filePath: string): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const file = await fs.open(filePath, 'a');

    await file.close();
}
