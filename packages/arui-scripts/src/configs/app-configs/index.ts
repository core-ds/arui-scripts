import { calculateDependentConfig, calculateDependentContext } from './calculate-dependent-config';
import { getDefaultAppConfig, getDefaultAppContext } from './get-defaults';
import { AppConfigs, AppContext, AppContextWithConfigs } from './types';
import { updateWithConfigFile } from './update-with-config-file';
import { updateWithEnv } from './update-with-env';
import { updateWithPackage } from './update-with-package';
import { updateWithPresets } from './update-with-presets';

import '../util/register-ts-node';

let tmpConfig: AppConfigs = getDefaultAppConfig();
let tmpContext: AppContext = getDefaultAppContext();

tmpConfig = updateWithPresets(tmpConfig, tmpContext);
tmpConfig = updateWithPackage(tmpConfig, tmpContext);
tmpConfig = updateWithConfigFile(tmpConfig, tmpContext);
tmpConfig = updateWithEnv(tmpConfig);
tmpConfig = calculateDependentConfig(tmpConfig);
tmpContext = calculateDependentContext(tmpConfig, tmpContext);

export const appContext = tmpContext;
export const appConfigs = tmpConfig;

export const configs: AppContextWithConfigs = {
    ...appConfigs,
    ...appContext,
};

export default configs;
