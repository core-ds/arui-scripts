import applyOverrides from './util/apply-overrides';
import { postcssPlugins, postcssPluginsOptions, createPostcssConfig } from './postcss.config';

const postcssConfig = applyOverrides(
  'postcss',
  createPostcssConfig(postcssPlugins, postcssPluginsOptions)
);

console.log(postcssConfig)

export default postcssConfig;
