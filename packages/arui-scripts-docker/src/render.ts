import {
    renderBaseNginxConf,
    renderDockerfile,
    renderDockerfileCompiled,
    renderNginxConf,
    renderStartScript,
} from './templates';
import {
    type DockerTemplateKey,
    type DockerTemplateOverrides,
    type DockerTemplates,
    type RenderedDockerTemplates,
    type ResolvedDockerConfig,
    type TemplateRenderer,
} from './types';

/** Вариант Dockerfile: «сырой» (сборка на хосте) или compiled (сборка внутри образа). */
export type DockerfileVariant = 'runtime' | 'compiled';

export type RenderDockerTemplatesParams = {
    config: ResolvedDockerConfig;
    /** Какой Dockerfile генерировать. По умолчанию — `runtime`. */
    variant?: DockerfileVariant;
    /** Полная замена рендереров отдельных шаблонов. */
    templates?: DockerTemplates;
    /** Точечные оверрайды поверх сгенерированных шаблонов. */
    overrides?: DockerTemplateOverrides;
};

const emptyRenderer: TemplateRenderer = () => '';

function renderTemplate(
    key: DockerTemplateKey,
    defaultRenderer: TemplateRenderer,
    params: RenderDockerTemplatesParams,
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
export function renderDockerTemplates(
    params: RenderDockerTemplatesParams,
): RenderedDockerTemplates {
    const { config, variant = 'runtime' } = params;

    const dockerfileKey: DockerTemplateKey =
        variant === 'compiled' ? 'dockerfileCompiled' : 'dockerfile';
    const dockerfileRenderer = variant === 'compiled' ? renderDockerfileCompiled : renderDockerfile;

    return {
        dockerfile: renderTemplate(dockerfileKey, dockerfileRenderer, params),
        nginxConf: renderTemplate('nginxConf', renderNginxConf, params),
        nginxBaseConf: config.nginx
            ? renderTemplate('baseNginxConf', renderBaseNginxConf, params)
            : renderTemplate('baseNginxConf', emptyRenderer, params),
        startScript: renderTemplate('startScript', renderStartScript, params),
    };
}
