import { spawn } from 'child_process';

import shell from 'shelljs';

export type PackageManager = 'yarn' | 'npm';

export function detectPackageManager(): PackageManager {
    return shell.which('yarn') ? 'yarn' : 'npm';
}

export function installDependencies(
    targetDir: string,
    packageManager: PackageManager = detectPackageManager(),
): Promise<void> {
    const args = packageManager === 'yarn' ? [] : ['install'];

    return new Promise((resolve, reject) => {
        const child = spawn(packageManager, args, {
            cwd: targetDir,
            stdio: ['ignore', 'pipe', 'pipe'],
            // для windows
            shell: process.platform === 'win32',
        });

        let output = '';

        const collect = (chunk: Buffer) => {
            output += chunk.toString();
        };

        child.stdout?.on('data', collect);
        child.stderr?.on('data', collect);
        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(
                    new Error(
                        `${packageManager} ${args.join(
                            ' ',
                        )} завершился с кодом ${code}\n${output.trim()}`,
                    ),
                );
            }
        });
    });
}
