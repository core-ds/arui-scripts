import { configs } from '../app-configs';
import { getImageMinLoader } from '../config-extras/minimizers/imagemin/imagemin';

jest.mock('../app-configs', () => ({ configs: {} }));

describe('image optimization selection', () => {
    test.each([
        undefined,
        {},
        {
            svg: { enabled: false },
            jpg: { enabled: false, quality: 70 },
            png: { enabled: false },
            gif: { enabled: false },
        },
    ])('does not create a loader when disabled: %j', (settings) => {
        configs.imageMinimizer = settings;
        expect(getImageMinLoader()).toBe(false);
    });
    test.each(['svg', 'jpg', 'png', 'gif'] as const)(
        'limits optimization to enabled %s assets',
        (format) => {
            configs.imageMinimizer = { [format]: { enabled: true } };
            const loader = getImageMinLoader();

            expect(loader).not.toBe(false);
            if (!loader) throw new Error('Expected image loader');
            expect(loader.test.test(`image.${format}`)).toBe(true);
            expect(loader.test.test('image.webp')).toBe(false);
            expect(loader.use[0].options.minimizer.options.plugins).toHaveLength(1);
        },
    );
    test('passes image quality settings to the matching optimizers', () => {
        configs.imageMinimizer = {
            svg: { enabled: true },
            jpg: { enabled: true, quality: 70 },
            png: {
                enabled: true,
                optimizationLevel: 3,
                bitDepthReduction: false,
                colorTypeReduction: false,
                paletteReduction: false,
                interlaced: true,
            },
            gif: { enabled: true, optimizationLevel: 2 },
        };
        const loader = getImageMinLoader();

        if (!loader) throw new Error('Expected image loader');
        expect(loader.test.test('photo.jpeg')).toBe(true);
        expect(loader.use[0].options.minimizer.options.plugins).toEqual([
            ['mozjpeg', { quality: 70, progressive: true }],
            [
                'optipng',
                {
                    optimizationLevel: 3,
                    bitDepthReduction: false,
                    colorTypeReduction: false,
                    paletteReduction: false,
                    interlaced: true,
                },
            ],
            ['svgo'],
            ['gifsicle', { optimizationLevel: 2, interlaced: true }],
        ]);
    });
});
