import configs from '../../configs/app-configs';

export function getTsWatchCommand() {
    return [
        require.resolve('typescript/lib/tsc.js'),
        '--watch',
        '--noEmit',
        '--project',
        configs.tsconfig,
        '--skipLibCheck',
    ] as string[];
}
