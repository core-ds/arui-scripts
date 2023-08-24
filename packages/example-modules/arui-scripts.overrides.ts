import { OverrideFile } from "arui-scripts";

const overrides: OverrideFile = {
    webpackClientProd: (config) => {
        const allConfigs = Array.isArray(config) ? config : [config];

        return allConfigs.map((config) => {
            config.optimization.minimize = false;

            return config;
        });
    }
};

export default overrides;
