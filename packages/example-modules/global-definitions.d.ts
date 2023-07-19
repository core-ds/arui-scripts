declare module '*.png' {
    const url: string;
    export default url;
}

declare module '*.svg' {
    const url: string;
    export default url;
}

declare module '*.module.css' {
    const styles: Record<string, string>;
    export default styles;
}
