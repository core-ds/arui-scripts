import { type ModuleResources } from '../../types';
import {
    getEmbeddedModuleResources,
    MODULE_SSR_INSTANCE_ATTRIBUTE,
    MODULE_SSR_PAYLOAD_ATTRIBUTE,
} from '../get-embedded-module-resources';

const buildResources = (overrides: Partial<ModuleResources> = {}): ModuleResources => ({
    scripts: ['main.js'],
    styles: ['main.css'],
    moduleVersion: '1.0.0',
    appName: 'module-app',
    mountMode: 'compat',
    moduleState: { baseUrl: '/', hostAppId: 'host' },
    ...overrides,
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

    return script;
}

describe('getEmbeddedModuleResources', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should return undefined when no payload present', () => {
        expect(getEmbeddedModuleResources('test')).toBeUndefined();
    });

    it('should read the payload for the requested moduleId', () => {
        const resources = buildResources();

        appendPayload('test', resources);

        expect(getEmbeddedModuleResources('test')).toEqual(resources);
    });

    it('should not return a payload of a different module', () => {
        appendPayload('other', buildResources());

        expect(getEmbeddedModuleResources('test')).toBeUndefined();
    });

    it('should distinguish instances by instanceId', () => {
        const first = buildResources({ moduleState: { baseUrl: '/a', hostAppId: 'host' } });
        const second = buildResources({ moduleState: { baseUrl: '/b', hostAppId: 'host' } });

        appendPayload('test', first, 'a1');
        appendPayload('test', second, 'a2');

        expect(getEmbeddedModuleResources('test', 'a1')).toEqual(first);
        expect(getEmbeddedModuleResources('test', 'a2')).toEqual(second);
    });

    it('should return undefined when instanceId does not match', () => {
        appendPayload('test', buildResources(), 'a1');

        expect(getEmbeddedModuleResources('test', 'a2')).toBeUndefined();
    });

    it('should return the first matching payload when instanceId is omitted', () => {
        const first = buildResources({ moduleState: { baseUrl: '/a', hostAppId: 'host' } });

        appendPayload('test', first, 'a1');
        appendPayload(
            'test',
            buildResources({ moduleState: { baseUrl: '/b', hostAppId: 'host' } }),
            'a2',
        );

        expect(getEmbeddedModuleResources('test')).toEqual(first);
    });

    it('should return undefined for malformed JSON', () => {
        const script = document.createElement('script');

        script.type = 'application/json';
        script.setAttribute(MODULE_SSR_PAYLOAD_ATTRIBUTE, 'test');
        script.textContent = '{ broken';
        document.body.appendChild(script);

        expect(getEmbeddedModuleResources('test')).toBeUndefined();
    });
});
