export const insertPlugin = (plugins: string[] | unknown[], beforePluginName: string, plugin: string | unknown): string[] | unknown[] => {
    let beforePluginIndex = -1;

    plugins.forEach((pluginName, index) =>  {
        if(Array.isArray(pluginName) && pluginName[0] === beforePluginName){
            beforePluginIndex = index;
        }

        if(!Array.isArray(pluginName) && pluginName === beforePluginName){
            beforePluginIndex = index;
        }
    });

    if(beforePluginIndex === -1) {
        return plugins;
    }

    return [...plugins.slice(0, beforePluginIndex), plugin, ...plugins.slice(beforePluginIndex)]
}