export function createWatchIgnoreRegex(paths: string[]): RegExp {
    if (paths.length === 0) {
        return /(?!)/; // никогда не будет матчится
    }

    const patterns = paths.map((p) => {
        const escaped = escapeRegExp(p);

        return String.raw`(^|[\\/])${escaped}([\\/]|$)`;
    });

    return new RegExp(patterns.join('|'));
}

function escapeRegExp(str: string): string {
    return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}
