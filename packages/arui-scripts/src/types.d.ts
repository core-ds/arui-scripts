declare module 'reload-server-webpack-plugin' {
    import { Plugin } from 'webpack';

    export default class ReloadServerWebpackPlugin extends Plugin {
        constructor(options?: { script: string });
    }
}
