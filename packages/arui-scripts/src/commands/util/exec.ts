// TODO: remove eslint-disable-next-line
import shell from 'shelljs';

function exec(command: string) {
    return new Promise((resolve, reject) => {
        console.log(`Executing command: ${command}`);
        // eslint-disable-next-line consistent-return
        shell.exec(command, (code) => {
            if (code === 0) {
                return resolve(code);
            }
            reject(code);
        });
    });
}

export default exec;
