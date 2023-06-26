import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import configs from "../../../app-configs";

export const getImageMin = () => {
    const { svg } = configs.imageMinimizer ?? {};
    const doesAnyMinificationEnabled = svg?.enabled;

    return [
        doesAnyMinificationEnabled &&
        new ImageMinimizerPlugin({
            minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                    plugins: [svg?.enabled && ["svgo"]].filter(Boolean)
                }
            }
        }),
    ]
}
