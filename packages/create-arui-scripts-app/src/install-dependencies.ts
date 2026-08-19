import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

import shell from 'shelljs';

export type PackageManager = 'yarn' | 'npm';

export function detectPackageManager(): PackageManager {
    return shell.which('yarn') ? 'yarn' : 'npm';
}

function runCommand(command: string, args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
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
                        `${command} ${args.join(' ')} завершился с кодом ${code}\n${output.trim()}`,
                    ),
                );
            }
        });
    });
}

export function installDependencies(
    targetDir: string,
    packageManager: PackageManager = detectPackageManager(),
): Promise<void> {
    const args = packageManager === 'yarn' ? [] : ['install'];

    return runCommand(packageManager, args, targetDir);
}

export function hasGitRepository(targetDir: string): boolean {
    return fs.existsSync(path.join(targetDir, '.git'));
}

export function installLefthook(targetDir: string): Promise<void> {
    return runCommand('npx', ['--no-install', 'lefthook', 'install'], targetDir);
}

export function hasGitBinary(): boolean {
    return Boolean(shell.which('git'));
}

export const INITIAL_COMMIT_MESSAGE = 'Initial commit from create-arui-scripts-app';

export function initGitRepository(targetDir: string): Promise<void> {
    return runCommand('git', ['init'], targetDir);
}

export async function createInitialCommit(targetDir: string): Promise<void> {
    await runCommand('git', ['add', '-A'], targetDir);
    await runCommand(
        'git',
        [
            '-c',
            'user.name=create-arui-scripts-app',
            '-c',
            'user.email=create-arui-scripts-app@users.noreply.github.com',
            'commit',
            '--no-verify',
            '-m',
            INITIAL_COMMIT_MESSAGE,
        ],
        targetDir,
    );
}
