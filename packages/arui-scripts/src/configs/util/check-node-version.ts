export function checkNodeVersion(majorVersion: number) {
    const actualVersion = process.versions.node.split('.');

    return parseInt(actualVersion[0], 10) >= majorVersion;
}
