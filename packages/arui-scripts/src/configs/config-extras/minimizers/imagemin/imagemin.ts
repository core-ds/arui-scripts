import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import configs from "../../../app-configs";

export const getImageMin = () => {
    const { svg, gif } = configs.imageMinimizer ?? {};
    const doesAnyMinificationEnabled = svg?.enabled || gif?.enabled;

    return [
        doesAnyMinificationEnabled &&
        new ImageMinimizerPlugin({
            minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                    plugins: [
                        svg?.enabled && ["svgo"],
                        gif?.enabled && ["gifsicle", {
                            optimizationLevel: gif?.optimizationLevel,
                            interlaced: true
                        }],
                    ].filter(Boolean)
                }
            }
        })
    ]
}
