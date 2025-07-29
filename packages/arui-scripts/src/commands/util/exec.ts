import shell from 'shelljs';

export function exec(command: string) {
    return new Promise((resolve, reject) => {
        console.log(`Executing command: ${command}`);
        shell.exec(command, (code) => {
            if (code === 0) {
                return resolve(code);
            }

            return reject(code);
        });
    });
}
