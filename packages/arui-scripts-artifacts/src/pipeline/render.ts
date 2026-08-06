import {
    type ArtifactTemplateOverrides,
    type ArtifactTemplates,
    type DockerfileVariant,
    type RenderedTemplates,
    type ResolvedArtifactsConfig,
    type TemplateKey,
    type TemplateRenderer,
} from '../config/types';
import { renderDockerfile } from '../docker/templates/dockerfile.template';
import { renderDockerfileCompiled } from '../docker/templates/dockerfile-compiled.template';
import { renderBaseNginxConf } from '../nginx/templates/base-nginx.conf.template';
import { renderNginxConf } from '../nginx/templates/nginx.conf.template';
import { renderStartScript } from '../start-script/start.template';

export type RenderTemplatesParams = {
    config: ResolvedArtifactsConfig;
    /** Какой Dockerfile генерировать. По умолчанию — `config.docker.variant`. */
    variant?: DockerfileVariant;
    /** Полная замена рендереров отдельных шаблонов. */
    templates?: ArtifactTemplates;
    /** Точечные оверрайды поверх сгенерированных шаблонов. */
    overrides?: ArtifactTemplateOverrides;
};

function renderTemplate(
    key: TemplateKey,
    defaultRenderer: TemplateRenderer,
    params: RenderTemplatesParams,
): string {
    const { config, templates, overrides } = params;
    const renderer = templates?.[key] ?? defaultRenderer;

    let content = renderer(config);

    const override = overrides?.[key];

    if (override) {
        content = override(content, config);
    }

    return content;
}

/**
 * Рендерит все файлы, которые кладутся в артефакт, применяя (в порядке приоритета) кастомные
 * рендереры из `templates` и точечные оверрайды из `overrides`. Результат готов к передаче в
 * `prepareFilesForDocker`.
 */
export function renderTemplates(params: RenderTemplatesParams): RenderedTemplates {
    const { config, variant = config.docker.variant } = params;

    const dockerfileKey: TemplateKey = variant === 'compiled' ? 'dockerfileCompiled' : 'dockerfile';
    const dockerfileRenderer = variant === 'compiled' ? renderDockerfileCompiled : renderDockerfile;

    return {
        dockerfile: renderTemplate(dockerfileKey, dockerfileRenderer, params),
        nginxConf: renderTemplate('nginxConf', renderNginxConf, params),
        // при выключенном базовом конфиге он не попадает в артефакт, поэтому и рендерить (и звать
        // оверрайд, результат которого все равно будет отброшен) нечего
        nginxBaseConf: config.nginx.baseConf
            ? renderTemplate('baseNginxConf', renderBaseNginxConf, params)
            : '',
        startScript: renderTemplate('startScript', renderStartScript, params),
    };
}
