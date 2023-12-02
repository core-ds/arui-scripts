import webpack from 'webpack';

export const ARUI_RUNTIME_VARIABLE_NAME = '$ARUI';
export const FULL_ARUI_RUNTIME_PATH = `${webpack.RuntimeGlobals.require}.${ARUI_RUNTIME_VARIABLE_NAME}`;

export class RuntimeModule extends webpack.RuntimeModule {
    constructor() {
        super('AruiRuntimeModule', webpack.RuntimeModule.STAGE_BASIC);
    }

    generate() {
        return webpack.Template.asString([
            "if (typeof __webpack_modules__ !== 'undefined') {", // По какой-то причине вебпак пытается выполнить этот код не только в браузере, но и при сборке.
            `${FULL_ARUI_RUNTIME_PATH} = { scriptSource: document.currentScript };`,
            '}',
        ]);
    }
}
