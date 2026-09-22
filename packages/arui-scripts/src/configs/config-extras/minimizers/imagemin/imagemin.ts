import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

import { configs } from '../../../app-configs';

export function getImageMinLoader() {
    const { svg, gif, jpg, png } = configs.imageMinimizer ?? {};
    const doesAnyMinificationEnabled = svg?.enabled || gif?.enabled || jpg?.enabled || png?.enabled;

    if (!doesAnyMinificationEnabled) {
        return false;
    }

    const loaderExtensions = [
        svg?.enabled && 'svg',
        gif?.enabled && 'gif',
        jpg?.enabled && 'jpe?g',
        png?.enabled && 'png',
    ].filter(Boolean);

    return {
        test: new RegExp(`\\.(${loaderExtensions.join('|')})$`),
        type: 'asset',
        // правило стоит раньше общих asset правил, поэтому порог инлайна должен быть тем же
        parser: {
            dataUrlCondition: {
                maxSize: configs.dataUrlMaxSize,
            },
        },
        use: [
            {
                loader: ImageMinimizerPlugin.loader,
                options: {
                    minimizer: {
                        implementation: ImageMinimizerPlugin.imageminMinify,
                        options: {
                            plugins: [
                                jpg?.enabled && [
                                    'mozjpeg',
                                    {
                                        quality: jpg?.quality,
                                        progressive: true,
                                    },
                                ],
                                png?.enabled && [
                                    'optipng',
                                    {
                                        optimizationLevel: png?.optimizationLevel,
                                        bitDepthReduction: png?.bitDepthReduction,
                                        colorTypeReduction: png?.colorTypeReduction,
                                        paletteReduction: png?.paletteReduction,
                                        interlaced: png?.interlaced,
                                    },
                                ],
                                svg?.enabled && [
                                    'svgo',
                                    {
                                        plugins: [
                                            {
                                                name: 'preset-default',
                                                params: {
                                                    // preset-default в svgo вырезает viewBox, без него svg перестают масштабироваться
                                                    overrides: { removeViewBox: false },
                                                },
                                            },
                                        ],
                                    },
                                ],
                                gif?.enabled && [
                                    'gifsicle',
                                    {
                                        optimizationLevel: gif?.optimizationLevel,
                                        interlaced: true,
                                    },
                                ],
                            ].filter(Boolean),
                        },
                    },
                },
            },
        ],
    };
}
