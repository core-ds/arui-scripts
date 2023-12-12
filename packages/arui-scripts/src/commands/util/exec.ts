import shell from 'shelljs';

function exec(command: string) {
    return new Promise((resolve, reject) => {
        console.log(`Executing command: ${command}`);

        shell.exec(command, (code) => {
            if (code === 0) {
                resolve(code);
            }
            reject(code);
        });
    });
}

export default exec;
