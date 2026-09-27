/* eslint-disable no-underscore-dangle -- Webpack runtime globals retain their original names. */
import vm from 'vm';

import { type Compiler, RuntimeGlobals } from '@rspack/core';

import { AruiRuntimePlugin, getInsertCssRuntimeMethod } from '../arui-runtime';
import { RuntimeModule } from '../arui-runtime/arui-runtime-module';

describe('module runtime', () => {
    test('captures current script only in a browser runtime', () => {
        const code = new RuntimeModule().generate();

        expect(() => vm.runInNewContext(code, {})).not.toThrow();
        const script = {};
        const context = {
            __webpack_modules__: {},
            __webpack_require__: {} as { $ARUI?: unknown },
            document: { currentScript: script },
        };

        vm.runInNewContext(code, context);
        expect(context.__webpack_require__.$ARUI).toEqual({ scriptSource: script });
    });
    test('registers the runtime module when the require runtime is needed', () => {
        const tap = jest.fn();

        new AruiRuntimePlugin().apply({ hooks: { compilation: { tap } } } as unknown as Compiler);
        const requirementTap = jest.fn();
        const compilation = {
            hooks: { runtimeRequirementInTree: { for: jest.fn(() => ({ tap: requirementTap })) } },
            addRuntimeModule: jest.fn(),
        };

        tap.mock.calls[0][1](compilation);
        const chunk = {};

        expect(requirementTap.mock.calls[0][1](chunk)).toBe(true);
        expect(compilation.hooks.runtimeRequirementInTree.for).toHaveBeenCalledWith(
            RuntimeGlobals.require,
        );
        expect(compilation.addRuntimeModule).toHaveBeenCalledWith(chunk, expect.any(RuntimeModule));
    });
    test.each(['head', 'missing-selector', 'missing-target', 'target', 'shadow'])(
        'inserts styles into %s',
        (mode) => {
            const globals = globalThis as unknown as Record<string, unknown>;
            const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
            const oldRequire = Object.getOwnPropertyDescriptor(globalThis, '__webpack_require__');
            const head = { appendChild: jest.fn() };
            const target = {
                appendChild: jest.fn(),
                shadowRoot: mode === 'shadow' ? { appendChild: jest.fn() } : null,
            };
            const scriptSource =
                mode === 'head'
                    ? null
                    : { getAttribute: () => (mode === 'missing-selector' ? null : '#target') };

            globals.document = {
                head,
                querySelector: () => (mode === 'missing-target' ? null : target),
            };
            globals.__webpack_require__ = { $ARUI: { scriptSource } };
            try {
                const link = {} as HTMLLinkElement;

                getInsertCssRuntimeMethod()(link);
                let destination = head;

                if (mode === 'target') destination = target;
                if (mode === 'shadow' && target.shadowRoot) destination = target.shadowRoot;

                expect(destination?.appendChild).toHaveBeenCalledWith(link);
            } finally {
                if (oldDocument) Object.defineProperty(globalThis, 'document', oldDocument);
                else delete globals.document;
                if (oldRequire)
                    Object.defineProperty(globalThis, '__webpack_require__', oldRequire);
                else delete globals.__webpack_require__;
            }
        },
    );
});
