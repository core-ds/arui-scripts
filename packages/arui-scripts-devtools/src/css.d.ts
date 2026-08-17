/**
 * Css-файлы приезжают в код строкой: пре-бандл (`scripts/bundle-mount.js`) подключает их
 * правилом `asset/source`, в jest то же самое делает трансформер `scripts/jest-css-transform.js`.
 */
declare module '*.css' {
    const content: string;

    export default content;
}
