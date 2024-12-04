import applyOverrides from './util/apply-overrides';
import { createPostcssConfig, postcssPlugins, postcssPluginsOptions } from './postcss.config';

const postcssConfig = applyOverrides(
    'postcss',
    createPostcssConfig(postcssPlugins, postcssPluginsOptions),
    // тк дается возможность переопределять options для плагинов импортируемых напрямую
    // инициализировать их нужно после оверайдов
).map((plugin) => typeof plugin === 'string' || Array.isArray(plugin)
    ? plugin
    : plugin.plugin(plugin.options));

export default postcssConfig;
