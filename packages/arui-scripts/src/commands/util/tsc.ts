export function getTscWatchCommand(tsconfig: string) {
    return [
        require.resolve('typescript/lib/tsc.js'),
        '--watch',
        '--noEmit',
        '--project',
        tsconfig,
        '--skipLibCheck',
    ];
}
