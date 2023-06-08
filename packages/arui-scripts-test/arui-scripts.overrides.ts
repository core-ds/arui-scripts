import type { OverrideFile } from "arui-scripts";

const overrides: OverrideFile = {
    webpackServer: (config) => ({
        ...config,
        externals: [
            ...(Array.isArray(config.externals) ? config.externals : []),
            { express: "commonjs express" },
        ],
    }),
    postcss(config) {
        return [
            ...config,
            [
                "postcss-preset-env",
                {
                    debug: true,
                    stage: 0,

                    features: {
                        "nesting-rules": true,
                        "cascade-layers": true,
                        "oklab-function": true,
                    },
                },
            ],
        ];
    },
};

export default overrides;