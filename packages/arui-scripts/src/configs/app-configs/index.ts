import '../util/register-ts-node';

import { AppConfigs } from './types';
import { getDefaults } from './get-defaults';
import { updateWithEnv } from './update-with-env';
import { updateWithPackage } from './update-with-package';
import { updateWithPresets } from './update-with-presets';
import { calculateDependentConfig } from './calculate-dependent-config';

let config: AppConfigs = getDefaults();

config = updateWithPresets(config);
config = updateWithPackage(config);
config = updateWithEnv(config);
config = calculateDependentConfig(config);

export default config;
