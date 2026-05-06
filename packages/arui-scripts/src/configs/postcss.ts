import { applyOverrides } from './util/apply-overrides';
import {
    createPostcssConfig,
    type PostcssPlugin,
    postcssPlugins,
    postcssPluginsOptions,
} from './postcss.config';

const postcssConfigWithOverrides = applyOverrides(
    'postcss',
    createPostcssConfig(postcssPlugins, postcssPluginsOptions),
    // тк дается возможность переопределять options для плагинов импортируемых напрямую
    // инициализировать их нужно после оверайдов
);

const isResolvedPostcssPlugin = (plugin: PostcssPlugin): plugin is { postcssPlugin: string } =>
    typeof plugin === 'object' && !Array.isArray(plugin) && 'postcssPlugin' in plugin;

const resolvePostcssConfig = (plugins: PostcssPlugin[]) =>
    plugins.map((plugin) =>
        typeof plugin === 'string' || Array.isArray(plugin) || isResolvedPostcssPlugin(plugin)
            ? plugin
            : plugin.plugin(plugin.options),
    );

const isAutoprefixerPlugin = (plugin: PostcssPlugin) => {
    if (plugin === 'autoprefixer') {
        return true;
    }

    if (Array.isArray(plugin)) {
        return plugin[0] === 'autoprefixer';
    }

    return isResolvedPostcssPlugin(plugin) && plugin.postcssPlugin === 'autoprefixer';
};

export const postcssConfig = resolvePostcssConfig(postcssConfigWithOverrides);

export const serverPostcssConfig = resolvePostcssConfig(
    postcssConfigWithOverrides.filter((plugin) => !isAutoprefixerPlugin(plugin)),
);
