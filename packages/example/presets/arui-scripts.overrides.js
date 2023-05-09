module.exports = {
    webpackServer: (config) => {
        config.externals.push({ express: 'commonjs express' });
        return config;
    }
};
