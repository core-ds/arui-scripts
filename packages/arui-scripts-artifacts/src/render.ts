import {
    renderBaseNginxConf,
    renderDockerfile,
    renderDockerfileCompiled,
    renderNginxConf,
    renderStartScript,
} from './templates';
import {
    type DockerfileVariant,
    type DockerTemplateKey,
    type DockerTemplateOverrides,
    type DockerTemplates,
    type RenderedTemplates,
    type ResolvedArtifactsConfig,
    type TemplateRenderer,
} from './types';

export { type DockerfileVariant };

export type RenderTemplatesParams = {
    config: ResolvedArtifactsConfig;
    /** Какой Dockerfile генерировать. По умолчанию — `config.variant`. */
    variant?: DockerfileVariant;
    /** Полная замена рендереров отдельных шаблонов. */
    templates?: DockerTemplates;
    /** Точечные оверрайды поверх сгенерированных шаблонов. */
    overrides?: DockerTemplateOverrides;
};

function renderTemplate(
    key: DockerTemplateKey,
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
 * Рендерит все файлы, которые кладутся в образ, применяя (в порядке приоритета) кастомные рендереры
 * из `templates` и точечные оверрайды из `overrides`. Результат готов к передаче в
 * `prepareFilesForDocker`.
 */
export function renderTemplates(params: RenderTemplatesParams): RenderedTemplates {
    const { config, variant = config.variant } = params;

    const dockerfileKey: DockerTemplateKey =
        variant === 'compiled' ? 'dockerfileCompiled' : 'dockerfile';
    const dockerfileRenderer = variant === 'compiled' ? renderDockerfileCompiled : renderDockerfile;

    return {
        dockerfile: renderTemplate(dockerfileKey, dockerfileRenderer, params),
        nginxConf: renderTemplate('nginxConf', renderNginxConf, params),
        // при выключенном nginx базовый конфиг не попадает в образ, поэтому и рендерить (и звать
        // оверрайд, результат которого все равно будет отброшен) нечего
        nginxBaseConf: config.nginx
            ? renderTemplate('baseNginxConf', renderBaseNginxConf, params)
            : '',
        startScript: renderTemplate('startScript', renderStartScript, params),
    };
}
