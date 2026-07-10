import { createEmbeddedModuleFetcher } from '../create-embedded-module-fetcher';
import { type GetResourcesRequest, type ModuleResources } from '../types';
import {
    MODULE_SSR_INSTANCE_ATTRIBUTE,
    MODULE_SSR_PAYLOAD_ATTRIBUTE,
} from '../utils/get-embedded-module-resources';

const MODULE_ID = 'test-module';

const buildResources = (overrides: Partial<ModuleResources> = {}): ModuleResources => ({
    scripts: ['main.js'],
    styles: ['main.css'],
    moduleVersion: '1.0.0',
    appName: 'module-app',
    mountMode: 'compat',
    moduleState: { baseUrl: '/', hostAppId: 'host' },
    ...overrides,
});

const buildRequest = (): GetResourcesRequest<undefined> => ({
    moduleId: MODULE_ID,
    hostAppId: 'host',
    params: undefined,
});

function appendPayload(moduleId: string, resources: ModuleResources, instanceId?: string) {
    const script = document.createElement('script');

    script.type = 'application/json';
    script.setAttribute(MODULE_SSR_PAYLOAD_ATTRIBUTE, moduleId);
    if (instanceId !== undefined) {
        script.setAttribute(MODULE_SSR_INSTANCE_ATTRIBUTE, instanceId);
    }
    script.textContent = JSON.stringify(resources);
    document.body.appendChild(script);
}

describe('createEmbeddedModuleFetcher', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should return the embedded payload when present', async () => {
        const resources = buildResources();

        appendPayload(MODULE_ID, resources);

        const fetcher = createEmbeddedModuleFetcher();

        await expect(fetcher(buildRequest())).resolves.toEqual(resources);
    });

    it('should read the payload for the requested instanceId', async () => {
        const first = buildResources({ moduleState: { baseUrl: '/a', hostAppId: 'host' } });
        const second = buildResources({ moduleState: { baseUrl: '/b', hostAppId: 'host' } });

        appendPayload(MODULE_ID, first, 'a1');
        appendPayload(MODULE_ID, second, 'a2');

        const fetcher = createEmbeddedModuleFetcher({ instanceId: 'a2' });

        await expect(fetcher(buildRequest())).resolves.toEqual(second);
    });

    it('should fall back to the fallback fetcher when no payload is present', async () => {
        const fallbackResources = buildResources({ appName: 'from-fallback' });
        const fallback = jest.fn().mockResolvedValue(fallbackResources);

        const fetcher = createEmbeddedModuleFetcher({ fallback });

        const request = buildRequest();
        const options = { signal: new AbortController().signal };

        await expect(fetcher(request, options)).resolves.toEqual(fallbackResources);
        expect(fallback).toHaveBeenCalledWith(request, options);
    });

    it('should prefer the embedded payload over the fallback', async () => {
        const embedded = buildResources({ appName: 'from-embedded' });
        const fallback = jest.fn();

        appendPayload(MODULE_ID, embedded);

        const fetcher = createEmbeddedModuleFetcher({ fallback });

        await expect(fetcher(buildRequest())).resolves.toEqual(embedded);
        expect(fallback).not.toHaveBeenCalled();
    });

    it('should reject with a descriptive error when there is no payload and no fallback', async () => {
        const fetcher = createEmbeddedModuleFetcher({ instanceId: 'a1' });

        await expect(fetcher(buildRequest())).rejects.toThrow(/test-module.*instanceId: "a1"/);
    });
});
