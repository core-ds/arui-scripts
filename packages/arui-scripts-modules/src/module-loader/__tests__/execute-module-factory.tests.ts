import { executeModuleFactory } from '../execute-module-factory';
import type { FactoryModule } from '../module-types';

describe('executeModuleFactory', () => {
    it('should work when module have default export', async () => {
        const mockModule = {
            default: jest.fn().mockResolvedValue('result'),
        };

        const result = await executeModuleFactory(
            mockModule as unknown as FactoryModule<unknown, unknown>,
            { baseUrl: 'example.com', hostAppId: 'app' },
            'runParams',
        );

        expect(mockModule.default).toHaveBeenCalledWith('runParams', { baseUrl: 'example.com', hostAppId: 'app' });
        expect(result).toBe('result');
    });

    it('should work when module is a function', async () => {
        const mockModule = jest.fn().mockResolvedValue('result');

        const result = await executeModuleFactory(
            mockModule as unknown as FactoryModule<unknown, unknown>,
            { baseUrl: 'example.com', hostAppId: 'app' },
            'runParams',
        );

        expect(mockModule).toHaveBeenCalledWith('runParams', { baseUrl: 'example.com', hostAppId: 'app' });
        expect(result).toBe('result');
    });

    it('should work when module has a factory field', async () => {
        const mockModule = {
            factory: jest.fn().mockResolvedValue('result'),
        };

        const result = await executeModuleFactory(
            mockModule as unknown as FactoryModule<unknown, unknown>,
            { baseUrl: 'example.com', hostAppId: 'app' },
            'runParams',
        );

        expect(mockModule.factory).toHaveBeenCalledWith('runParams', { baseUrl: 'example.com', hostAppId: 'app' });
        expect(result).toBe('result');
    });

    it('should throw an error when module has no default export, factory field or is a function', () => {
        const mockModule = {};

        const res = executeModuleFactory(
            mockModule as unknown as FactoryModule<unknown, unknown>,
            { baseUrl: 'example.com', hostAppId: 'app' },
            'runParams',
        );

        expect(res).rejects.toThrowError();
    });
});
