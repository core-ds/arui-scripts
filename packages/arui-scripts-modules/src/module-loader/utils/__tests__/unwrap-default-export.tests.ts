import { unwrapDefaultExport } from '../unwrap-default-export';

describe('unwrapDefaultExport', () => {
    it('should return the default export if it exists', () => {
        const module = {
            default: 'default export',
        };

        const result = unwrapDefaultExport(module);

        expect(result).toBe('default export');
    });

    it('should return the module export if default export does not exist', () => {
        const module = {
            otherExport: 'other export',
        };

        const result = unwrapDefaultExport(module);

        expect(result).toBe(module);
    });

    it('should return the module export if default export is null', () => {
        const module = {
            default: null,
        };

        const result = unwrapDefaultExport(module);

        expect(result).toBe(module);
    });

    it('should return the module export if default export is undefined', () => {
        const module = {
            default: undefined,
        };

        const result = unwrapDefaultExport(module);

        expect(result).toBe(module);
    });
});
