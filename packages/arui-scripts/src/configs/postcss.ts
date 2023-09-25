import applyOverrides from './util/apply-overrides';
import { createPostcssConfig, postcssPlugins, postcssPluginsOptions } from './postcss.config';

const postcssConfig = applyOverrides(
    'postcss',
    createPostcssConfig(postcssPlugins, postcssPluginsOptions),
);

export default postcssConfig;
