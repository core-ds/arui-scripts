import { execSync, spawn } from 'child_process';

export function exec(command: string) {
    return new Promise((resolve, reject) => {
        console.log(`Executing command: ${command}`);
        const child = spawn(command, { shell: true, stdio: 'inherit' });

        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                return resolve(code);
            }

            return reject(code);
        });
    });
}

/**
 * Синхронно выполняет команду и возвращает её stdout (без вывода в консоль).
 * Возвращает пустую строку, если команда завершилась с ошибкой или не найдена.
 */
export function getCommandOutput(command: string): string {
    try {
        return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
            .toString()
            .trim();
    } catch {
        return '';
    }
}
