import { getEnvConfigContent } from './get-env-config';

export function addEnvToHtmlTemplate(html: string) {
    return html.replace('<%= envConfig %>', getEnvConfigContent());
}
