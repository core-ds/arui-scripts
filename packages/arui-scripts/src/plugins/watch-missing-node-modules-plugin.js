class WatchMissingNodeModulesPlugin {
    constructor(nodeModulesPath) {
        this.nodeModulesPath = nodeModulesPath;
    }

    apply(compiler) {
        compiler.hooks.emit.tap('WatchMissingNodeModulesPlugin', (compilation) => {
            const missingDeps = Array.from(compilation.missingDependencies);
            const { nodeModulesPath } = this;

            // If any missing files are expected to appear in node_modules...
            if (missingDeps.some((file) => file.includes(nodeModulesPath))) {
                // ...tell webpack to watch node_modules recursively until they appear.
                compilation.contextDependencies.add(nodeModulesPath);
            }
        });
    }
}

module.exports = WatchMissingNodeModulesPlugin;
