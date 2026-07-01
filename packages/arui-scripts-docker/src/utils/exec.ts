import shell from 'shelljs';

/**
 * Выполняет shell-команду, резолвится кодом возврата при успехе и реджектится им при ошибке.
 */
export function exec(command: string): Promise<number> {
    return new Promise((resolve, reject) => {
        console.log(`Executing command: ${command}`);
        shell.exec(command, (code: number) => {
            if (code === 0) {
                return resolve(code);
            }

            return reject(code);
        });
    });
}

export default exec;
