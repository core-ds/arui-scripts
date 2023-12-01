import { ModuleFederationContainer } from '../../types';
import { getCompatModule, getModule } from '../get-module';

const windowVarName = 'my-container';

afterEach(() => {
    delete (window as unknown as Record<string, unknown>)[windowVarName];
})

describe('getModule', () => {
    const globalScope = global as unknown as Record<string, unknown>;
    const typedWindow = window as unknown as Record<string, ModuleFederationContainer>;

    beforeEach(() => {
        globalScope.__webpack_init_sharing__ = jest.fn(() => Promise.resolve());
        globalScope.__webpack_share_scopes__ = {
            default: {},
        };
    });

    afterEach(() => {
        delete globalScope.__webpack_init_sharing__;
        delete globalScope.__webpack_share_scopes__;
    });

    it('should return the module factory function', async () => {
        const moduleId = 'my-module';
        const factory = jest.fn(() => 'module content');
        const container = {
            init: jest.fn(),
            get: jest.fn(() => Promise.resolve(factory)),
        } as ModuleFederationContainer;

        typedWindow[windowVarName] = container;

        const result = await getModule(windowVarName, moduleId);

        expect(container.init).toHaveBeenCalledWith(expect.any(Object));
        expect(container.get).toHaveBeenCalledWith(moduleId);
        expect(factory).toHaveBeenCalled();
        expect(result).toBe('module content');
    });

    it('should throw an error if the container is not initialized', async () => {
        const moduleId = 'my-module';

        typedWindow[windowVarName] = {} as unknown as ModuleFederationContainer;

        await expect(getModule(windowVarName, moduleId)).rejects.toThrow(
            `Cannot load external remote: ${windowVarName}, unable to locate module federation init function`,
        );
    });

    it('should throw an error if the module is not found in the container', async () => {
        const moduleId = 'my-module';

        (window as any)[windowVarName] = {
            init: jest.fn(),
            get: jest.fn(() => Promise.resolve(undefined)),
        };

        await expect(getModule(windowVarName, moduleId)).rejects.toThrow(
            `Cannot load external remote: ${moduleId}, unable to locate module inside a container`,
        );
    });
});

describe('getCompatModule', () => {
    it('should return the module if it exists', () => {
        const module = jest.fn();

        (window as unknown as Record<string, unknown>)[windowVarName] = module;

        expect(getCompatModule(windowVarName)).toBe(module);
    });

    it('should throw an error if the module is not found', () => {
        const moduleId = 'my-module';

        expect(() => getCompatModule(moduleId)).toThrow(
            `Cannot load compat module: ${moduleId}, unable to locate module in window`,
        );
    });
});
