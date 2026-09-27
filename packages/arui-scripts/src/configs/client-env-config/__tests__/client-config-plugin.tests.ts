import { type Compiler, sources } from '@rspack/core';

import { getEnvConfigContent } from '../get-env-config';
import { ClientConfigPlugin, ENV_CONFIG_FILENAME } from '..';

jest.mock('../get-env-config', () => ({ getEnvConfigContent: jest.fn(() => '{"api":"/api"}') }));

test('emits runtime configuration next to the assets directory at the summarize stage', () => {
    const tap = jest.fn();
    const compiler = {
        hooks: { thisCompilation: { tap } },
        webpack: { Compilation: { PROCESS_ASSETS_STAGE_SUMMARIZE: 1000 }, sources },
    };

    new ClientConfigPlugin().apply(compiler as unknown as Compiler);
    const processTap = jest.fn();
    const compilation = { hooks: { processAssets: { tap: processTap } }, emitAsset: jest.fn() };

    tap.mock.calls[0][1](compilation);
    expect(processTap.mock.calls[0][0]).toMatchObject({ stage: 1000 });
    processTap.mock.calls[0][1]();
    expect(getEnvConfigContent).toHaveBeenCalledTimes(1);
    expect(compilation.emitAsset.mock.calls[0][0]).toBe(`../${ENV_CONFIG_FILENAME}`);
    expect(compilation.emitAsset.mock.calls[0][1].source()).toBe('{"api":"/api"}');
});
