export type YarnVersion = '1' | '2+' | 'unavailable';

/**
 * Настройки, которые прокидываются в базовый nginx-конфиг (http-блок).
 */
export type NginxConfig = {
    workerProcesses?: number;
    workerRlimitNoFile?: number;
    workerConnections?: number;
    eventsUse?: string;
    daemon?: string;
};

/**
 * Управление флагом `--platform` в команде `docker build`:
 * - `'auto'` — историческое поведение: флаг подставляется только если версия docker его поддерживает;
 * - `false` — никогда не добавлять флаг;
 * - строка (например `'linux/amd64'`) — всегда использовать указанную платформу.
 */
export type DockerPlatform = 'auto' | false | string;

/** Вариант Dockerfile: «сырой» (сборка на хосте) или compiled (сборка внутри образа). */
export type DockerfileVariant = 'runtime' | 'compiled';

/** Тип собираемого артефакта поставки. */
export type ArtifactKind = 'docker' | 'archive';

/**
 * Функция-оверрайд шаблона. Получает сгенерированную по умолчанию строку и итоговый конфиг,
 * возвращает новую строку. Позволяет точечно донасыщать/подменять любой из шаблонов.
 */
export type TemplateOverride = (
    generatedContent: string,
    config: ResolvedArtifactsConfig,
) => string;

/**
 * Функция-рендерер шаблона. Полностью заменяет генерацию шаблона по умолчанию.
 */
export type TemplateRenderer = (config: ResolvedArtifactsConfig) => string;

export type DockerTemplateKey =
    | 'dockerfile'
    | 'dockerfileCompiled'
    | 'nginxConf'
    | 'baseNginxConf'
    | 'startScript';

/**
 * Кастомные рендереры шаблонов. Любой из них можно переопределить целиком.
 */
export type DockerTemplates = Partial<Record<DockerTemplateKey, TemplateRenderer>>;

/**
 * Точечные оверрайды поверх сгенерированных по умолчанию шаблонов.
 */
export type DockerTemplateOverrides = Partial<Record<DockerTemplateKey, TemplateOverride>>;

/**
 * Пути к локальным файлам, которые (если существуют) будут использованы вместо сгенерированных шаблонов.
 */
export type LocalFiles = {
    dockerfile?: string | null;
    startScript?: string | null;
    nginxConf?: string | null;
    nginxBaseConf?: string | null;
};

/**
 * Полный набор опций сборки docker-образа. Все поля опциональны — недостающие донасыщаются дефолтами
 * в {@link resolveArtifactsConfig}. Это единственная точка входа для кастомизации: любой потребитель
 * (arui-scripts, newclick-builder, собственные скрипты) может собрать образ, передав сюда свои значения.
 */
export type ArtifactsOptions = {
    /**
     * Что собирать: docker-образ (по умолчанию) или tar-архив с production-сборкой.
     * Docker-специфичные опции (`baseDockerImage`, `platform`, `extraBuildArgs`, …) при
     * `artifact: 'archive'` не используются.
     */
    artifact?: ArtifactKind;
    /**
     * Вариант сборки. `runtime` (по умолчанию) — приложение собирается на хосте и результат кладется
     * в образ; `compiled` — зависимости и сборка выполняются внутри образа. От варианта зависят
     * дефолты хост-пайплайна ({@link ArtifactsOptions.buildCommand} и соседние).
     */
    variant?: DockerfileVariant;

    /* --- Идентификация образа --- */
    /** Имя образа. По умолчанию берется из `package.json` в `cwd`. */
    name?: string;
    /** Версия/тег образа. По умолчанию берется из `package.json` в `cwd`. */
    version?: string;
    /** Docker registry, к которому будет добавлен образ (`registry/name:version`). */
    dockerRegistry?: string;

    /* --- Базовый образ и форма приложения --- */
    /** Базовый docker-образ (`FROM`). */
    baseDockerImage?: string;
    /** Собирается ли только клиентская часть (nginx без nodejs-сервера). */
    clientOnly?: boolean;
    /** Путь к директории со сборкой приложения относительно корня проекта. */
    buildPath?: string;
    /** Путь к серверному бандлу относительно `buildPath`. */
    serverOutput?: string;
    /** Корень, из которого nginx раздает статику. */
    nginxRootPath?: string;
    /** Директория со статикой внутри `buildPath`. Из нее выводится дефолт `publicPath`. */
    assetsPath?: string;
    /**
     * Публичный префикс путей до статики — используется в `location` блоках nginx-конфига.
     * По умолчанию `` `${assetsPath}/` ``, как это считает arui-scripts. Пустая строка приведет к
     * дублирующемуся `location /` в nginx-конфиге, поэтому переопределять стоит осознанно.
     */
    publicPath?: string;

    /* --- Порты --- */
    clientServerPort?: number;
    serverPort?: number;

    /* --- Nginx --- */
    /** Настройки базового nginx-конфига. `null`/`false` — не генерировать базовый конфиг. */
    nginx?: NginxConfig | null | false;
    /** Добавлять ли заголовки для предыдущей версии словаря brotli. */
    enablePreviousVersionHeaders?: boolean;

    /* --- Поведение сборки --- */
    /** Запускать ли процессы в образе от пользователя nginx (не root). */
    runFromNonRootUser?: boolean;
    /** Рабочая директория проекта. */
    cwd?: string;
    /** Контекст сборки docker (последний аргумент `docker build`). */
    context?: string;
    /** Имя временной директории для сгенерированных файлов. */
    tempDirName?: string;
    /** Режим отладки: не пушить образ, печатать стек ошибок. */
    debug?: boolean;
    /** Выполнять ли `docker push` после сборки. По умолчанию — да, кроме `debug`. */
    push?: boolean;
    /** Управление флагом `--platform`. */
    platform?: DockerPlatform;
    /** Дополнительные `--build-arg` для `docker build`. */
    extraBuildArgs?: Record<string, string>;

    /* --- Хост-пайплайн (выполняется перед `docker build`) --- */
    /**
     * Удалять ли `buildPath` перед сборкой приложения.
     * По умолчанию — `true` для `runtime` и `false` для `compiled`.
     */
    cleanBuildPath?: boolean;
    /**
     * Команда сборки приложения на хосте. `null`/`false` — не собирать.
     * По умолчанию — `'npm run build'` для `runtime` и `null` для `compiled` (там сборка идет в образе).
     */
    buildCommand?: string | null | false;
    /**
     * Удалять ли dev-зависимости ({@link ArtifactsOptions.pruneCommand}) перед `docker build`.
     * Аналог `removeDevDependenciesDuringDockerBuild` в arui-scripts.
     * По умолчанию — `true` для `runtime` и `false` для `compiled`.
     */
    removeDevDependencies?: boolean;

    /* --- tar-архив (`artifact: 'archive'`) --- */
    /** Имя итогового tar-архива. */
    archiveName?: string;
    /** Дополнительные директории проекта, которые кладутся в архив рядом со сборкой. */
    additionalBuildPath?: string[];

    /* --- Менеджер зависимостей --- */
    /** Использовать ли yarn (если доступен). */
    useYarn?: boolean;
    /** Явно заданная версия yarn. По умолчанию определяется автоматически. */
    yarnVersion?: YarnVersion;
    /** Команда установки production-зависимостей внутри образа (для `compiled`). */
    installProductionCommand?: string;
    /** Команда очистки dev-зависимостей на хосте перед сборкой образа. */
    pruneCommand?: string;

    /* --- Кастомизация файлов --- */
    /** Добавлять ли `node_modules` в `.dockerignore` (нужно для compiled-образа). */
    addNodeModulesToDockerIgnore?: boolean;
    /** Разрешить подмену Dockerfile локальным файлом. */
    allowLocalDockerfile?: boolean;
    /** Разрешить подмену start.sh локальным файлом. */
    allowLocalStartScript?: boolean;
    /** Пути к локальным файлам, замещающим сгенерированные шаблоны. */
    localFiles?: LocalFiles;

    /* --- Шаблоны --- */
    /** Полная замена рендереров шаблонов. */
    templates?: DockerTemplates;
    /** Точечные оверрайды поверх сгенерированных шаблонов. */
    overrides?: DockerTemplateOverrides;
};

/**
 * Полностью донасыщенный конфиг сборки. С ним работают все шаблоны и утилиты — они не знают ничего
 * о том, откуда пришли значения, что делает их независимыми и легко тестируемыми.
 */
export type ResolvedArtifactsConfig = {
    artifact: ArtifactKind;
    variant: DockerfileVariant;

    name: string;
    version: string;
    dockerRegistry: string;

    baseDockerImage: string;
    clientOnly: boolean;
    buildPath: string;
    serverOutput: string;
    nginxRootPath: string;
    assetsPath: string;
    publicPath: string;

    clientServerPort: number;
    serverPort: number;

    nginx: NginxConfig | null;
    enablePreviousVersionHeaders: boolean;

    runFromNonRootUser: boolean;
    cwd: string;
    context: string;
    tempDirName: string;
    debug: boolean;
    push: boolean;
    platform: DockerPlatform;
    extraBuildArgs: Record<string, string>;

    cleanBuildPath: boolean;
    buildCommand: string | null;
    removeDevDependencies: boolean;

    archiveName: string;
    additionalBuildPath: string[];

    useYarn: boolean;
    yarnVersion: YarnVersion;
    installProductionCommand: string;
    pruneCommand: string;

    addNodeModulesToDockerIgnore: boolean;
    allowLocalDockerfile: boolean;
    allowLocalStartScript: boolean;
    localFiles: Required<LocalFiles>;
};

/**
 * Готовые (отрендеренные) содержимого файлов, которые будут положены в образ.
 */
export type RenderedTemplates = {
    dockerfile: string;
    nginxConf: string;
    nginxBaseConf: string;
    startScript: string;
};
