import shell from 'shelljs';

/** Ошибка выполнения shell-команды. Код возврата доступен в `exitCode`. */
export class ExecError extends Error {
    public readonly exitCode: number;

    public readonly command: string;

    constructor(command: string, exitCode: number) {
        super(`Command failed with exit code ${exitCode}: ${command}`);
        this.name = 'ExecError';
        this.command = command;
        this.exitCode = exitCode;
    }
}

/**
 * Выполняет shell-команду, резолвится кодом возврата при успехе и реджектится {@link ExecError}
 * при ошибке.
 */
export function exec(command: string): Promise<number> {
    return new Promise((resolve, reject) => {
        console.log(`Executing command: ${command}`);
        shell.exec(command, (code: number) => {
            if (code === 0) {
                return resolve(code);
            }

            return reject(new ExecError(command, code));
        });
    });
}

export default exec;
