import applyOverrides from './util/apply-overrides';
import { postcssPlugins, postcssPluginsOptions, createPostcssConfig } from './postcss.config';

const postcssConfig = applyOverrides(
  'postcss',
  createPostcssConfig(postcssPlugins, postcssPluginsOptions)
);

export default postcssConfig;
