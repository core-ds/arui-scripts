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
        type: 'assets',
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
                                svg?.enabled && ['svgo'],
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
