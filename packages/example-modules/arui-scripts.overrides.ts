import type { OverrideFile } from 'arui-scripts';

const overrides: OverrideFile = {
    devServer: (config) => {
        return {
            ...config,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': '*',
            },
        }
    }
};

export default overrides;
