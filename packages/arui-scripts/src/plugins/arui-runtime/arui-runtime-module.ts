import { RuntimeGlobals, RuntimeModule as RsPackRuntimeModule,Template } from '@rspack/core';

export const ARUI_RUNTIME_VARIABLE_NAME = '$ARUI';
export const FULL_ARUI_RUNTIME_PATH = `${RuntimeGlobals.require}.${ARUI_RUNTIME_VARIABLE_NAME}`;

export class RuntimeModule extends RsPackRuntimeModule {
    constructor() {
        super('AruiRuntimeModule', RsPackRuntimeModule.STAGE_BASIC);
    }

    // eslint-disable-next-line class-methods-use-this
    generate() {
        return Template.asString([
            "if (typeof __webpack_modules__ !== 'undefined' && typeof document !== 'undefined') {", // По какой-то причине вебпак пытается выполнить этот код не только в браузере, но и при сборке.
            `${FULL_ARUI_RUNTIME_PATH} = { scriptSource: document.currentScript };`,
            '}',
        ]);
    }
}
