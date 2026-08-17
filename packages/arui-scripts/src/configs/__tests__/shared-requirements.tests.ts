import { getSharedRequirements } from '../modules';

describe('getSharedRequirements', () => {
    it('should return nothing when the app shares nothing', () => {
        expect(getSharedRequirements(undefined)).toEqual({});
    });

    it('should read a config object', () => {
        expect(
            getSharedRequirements({
                react: { requiredVersion: '^18.0.0', singleton: true, eager: true },
            }),
        ).toEqual({
            react: {
                requiredVersion: '^18.0.0',
                singleton: true,
                strictVersion: undefined,
                eager: true,
            },
        });
    });

    it('should read a bare version string', () => {
        // `shared: { react: '^18.0.0' }` - такой же законный способ записи
        expect(getSharedRequirements({ react: '^18.0.0' })).toEqual({
            react: { requiredVersion: '^18.0.0' },
        });
    });

    it('should read a list of package names', () => {
        // при `shared: ['react']` требований нет, но сам факт шаринга знать полезно
        expect(getSharedRequirements(['react', 'react-dom'])).toEqual({
            react: {},
            'react-dom': {},
        });
    });

    it('should read a list of config objects', () => {
        expect(getSharedRequirements([{ react: { requiredVersion: '^18.0.0' } }])).toEqual({
            react: {
                requiredVersion: '^18.0.0',
                singleton: undefined,
                strictVersion: undefined,
                eager: undefined,
            },
        });
    });

    it('should drop a requiredVersion that is not a range', () => {
        // rspack принимает false, когда требование снимают намеренно
        expect(getSharedRequirements({ react: { requiredVersion: false } })).toEqual({
            react: {
                requiredVersion: undefined,
                singleton: undefined,
                strictVersion: undefined,
                eager: undefined,
            },
        });
    });

    it('should produce something serializable', () => {
        // значение уезжает в бандл через DefinePlugin, то есть через JSON.stringify
        const requirements = getSharedRequirements({ react: { requiredVersion: '^18.0.0' } });

        expect(() => JSON.stringify(requirements)).not.toThrow();
    });
});
