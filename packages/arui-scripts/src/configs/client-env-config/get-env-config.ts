import fs from 'fs';
import path from 'path';

import { configs } from '../app-configs';

import { ENV_CONFIG_FILENAME } from './constants';

export function replaceTemplateVariables(template: string, variables: Record<string, string | undefined>) {
    return template.replace(/\$\{(\w+)}/g, (match, varName) => variables[varName] || '');
}

let cachedEnvConfig: string | null = null;

export function getEnvConfigContent() {
    if (cachedEnvConfig) {
        return cachedEnvConfig;
    }

    const configTemplate = path.join(configs.cwd, ENV_CONFIG_FILENAME);

    if (!fs.existsSync(configTemplate)) {
        cachedEnvConfig = '{}';

        return cachedEnvConfig
    }

    const templateContent = fs.readFileSync(configTemplate, 'utf8');

    cachedEnvConfig = replaceTemplateVariables(templateContent, process.env);

    return cachedEnvConfig
}
