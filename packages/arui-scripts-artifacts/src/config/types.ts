export type YarnVersion = '1' | '2+' | 'unavailable';

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

/* -------------------------------------------------------------------------------------------------
 * Секции конфига
 * ---------------------------------------------------------------------------------------------- */

/** Настройки docker-образа. Не используются при `artifact: 'archive'`. */
export type DockerOptions = {
    /**
     * Вариант сборки. `runtime` (по умолчанию) — приложение собирается на хосте и результат кладется
     * в образ; `compiled` — зависимости и сборка выполняются внутри образа. От варианта зависят
     * дефолты хост-пайплайна (см. {@link BuildOptions}).
     */
    variant?: DockerfileVariant;
    /** Docker registry, к которому будет добавлен образ (`registry/name:version`). */
    registry?: string;
    /** Базовый docker-образ (`FROM`). */
    baseImage?: string;
    /** Запускать ли процессы в образе от пользователя nginx (не root). */
    runFromNonRootUser?: boolean;
    /** Контекст сборки docker (последний аргумент `docker build`). */
    context?: string;
    /** Имя временной директории для сгенерированных файлов. */
    tempDirName?: string;
    /** Выполнять ли `docker push` после сборки. По умолчанию — да, кроме `debug`. */
    push?: boolean;
    /** Управление флагом `--platform`. */
    platform?: DockerPlatform;
    /** Дополнительные `--build-arg` для `docker build`. */
    buildArgs?: Record<string, string>;
    /** Добавлять ли `node_modules` в `.dockerignore` (нужно для compiled-образа). */
    addNodeModulesToDockerIgnore?: boolean;
};

/** Настройки базового nginx-конфига (http-блок, `/etc/nginx/nginx.conf`). */
export type NginxBaseConfOptions = {
    workerProcesses?: number;
    workerRlimitNoFile?: number;
    workerConnections?: number;
    eventsUse?: string;
    daemon?: string;
};

/** Настройки nginx: и server-блока, который генерируется всегда, и базового http-блока. */
export type NginxOptions = {
    /** Порт, который слушает nginx внутри контейнера. */
    port?: number;
    /** Корень, из которого nginx раздает статику. */
    rootPath?: string;
    /** Добавлять ли заголовки для предыдущей версии словаря brotli. */
    enablePreviousVersionHeaders?: boolean;
    /**
     * Базовый конфиг (http-блок). `null`/`false` (по умолчанию) — не генерировать и не класть в
     * образ: используется тот, что лежит в базовом образе.
     */
    baseConf?: NginxBaseConfOptions | null | false;
};

/** Настройки tar-архива. Не используются при `artifact: 'docker'`. */
export type ArchiveOptions = {
    /** Имя итогового tar-архива. */
    name?: string;
    /** Имя временной директории, в которой собирается содержимое архива. */
    tempDirName?: string;
    /** Дополнительные директории проекта, которые кладутся в архив рядом со сборкой. */
    additionalPaths?: string[];
};

/** Хост-пайплайн: что выполняется на машине сборки перед упаковкой артефакта. */
export type BuildOptions = {
    /**
     * Удалять ли `buildPath` перед сборкой приложения.
     * По умолчанию — `true` для `runtime` и `false` для `compiled`.
     */
    cleanBuildPath?: boolean;
    /**
     * Команда сборки приложения на хосте. `null`/`false` — не собирать.
     * По умолчанию — `'npm run build'` для `runtime` и `null` для `compiled` (там сборка идет в образе).
     */
    command?: string | null | false;
    /**
     * Удалять ли dev-зависимости ({@link PackageManagerOptions.pruneCommand}) перед упаковкой.
     * По умолчанию — `true` для `runtime` и `false` для `compiled`.
     */
    removeDevDependencies?: boolean;
};

/** Менеджер зависимостей: как ставить production-зависимости и как выкидывать dev-зависимости. */
export type PackageManagerOptions = {
    /** Использовать ли yarn (если доступен). По умолчанию — по наличию `yarn.lock`. */
    useYarn?: boolean;
    /** Явно заданная версия yarn. По умолчанию определяется автоматически. */
    yarnVersion?: YarnVersion;
    /** Команда установки production-зависимостей внутри образа (для `compiled`). */
    installProductionCommand?: string;
    /** Команда очистки dev-зависимостей на хосте перед упаковкой артефакта. */
    pruneCommand?: string;
};

/**
 * Локальные файлы проекта, которые (если существуют и разрешены) используются вместо сгенерированных
 * шаблонов.
 */
export type LocalFilesOptions = {
    dockerfile?: string | null;
    startScript?: string | null;
    nginxConf?: string | null;
    nginxBaseConf?: string | null;
    /** Разрешить подмену Dockerfile локальным файлом. */
    allowDockerfile?: boolean;
    /** Разрешить подмену start.sh локальным файлом. */
    allowStartScript?: boolean;
};

/* -------------------------------------------------------------------------------------------------
 * Шаблоны
 * ---------------------------------------------------------------------------------------------- */

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

export type TemplateKey =
    | 'dockerfile'
    | 'dockerfileCompiled'
    | 'nginxConf'
    | 'baseNginxConf'
    | 'startScript';

/**
 * Кастомные рендереры шаблонов. Любой из них можно переопределить целиком.
 */
export type ArtifactTemplates = Partial<Record<TemplateKey, TemplateRenderer>>;

/**
 * Точечные оверрайды поверх сгенерированных по умолчанию шаблонов.
 */
export type ArtifactTemplateOverrides = Partial<Record<TemplateKey, TemplateOverride>>;

/**
 * Готовые (отрендеренные) содержимые файлов, которые кладутся в артефакт.
 */
export type RenderedTemplates = {
    dockerfile: string;
    nginxConf: string;
    nginxBaseConf: string;
    startScript: string;
};

/* -------------------------------------------------------------------------------------------------
 * Конфиг целиком
 * ---------------------------------------------------------------------------------------------- */

/**
 * Полный набор опций сборки артефакта. Все поля опциональны — недостающие донасыщаются дефолтами
 * в {@link resolveArtifactsConfig}. Это единственная точка входа для кастомизации: любой потребитель
 * (arui-scripts, сторонние сборки, собственные скрипты) может собрать артефакт, передав сюда свои
 * значения.
 *
 * Настройки сгруппированы по тому, к чему относятся: `docker`, `nginx`, `archive`, `build`,
 * `packageManager`, `localFiles`. На верхнем уровне остается только то, что общее для всех
 * артефактов, — идентификация и форма самого приложения.
 */
export type ArtifactsOptions = {
    /**
     * Что собирать: docker-образ (по умолчанию) или tar-архив с production-сборкой.
     * Секция `docker` при `artifact: 'archive'` не используется, и наоборот.
     */
    artifact?: ArtifactKind;

    /* --- Идентификация --- */
    /** Имя артефакта (образа). По умолчанию берется из `package.json` в `cwd`. */
    name?: string;
    /** Версия/тег. По умолчанию берется из `package.json` в `cwd`. */
    version?: string;
    /** Рабочая директория проекта. */
    cwd?: string;
    /** Режим отладки: не пушить образ, печатать стек ошибок. */
    debug?: boolean;

    /* --- Форма приложения --- */
    /** Собирается ли только клиентская часть (nginx без nodejs-сервера). */
    clientOnly?: boolean;
    /** Путь к директории со сборкой приложения относительно корня проекта. */
    buildPath?: string;
    /** Путь к серверному бандлу относительно `buildPath`. */
    serverOutput?: string;
    /** Порт, на котором поднимается nodejs-сервер приложения. */
    serverPort?: number;
    /** Директория со статикой внутри `buildPath`. Из нее выводится дефолт `publicPath`. */
    assetsPath?: string;
    /**
     * Публичный префикс путей до статики — используется в `location` блоках nginx-конфига.
     * По умолчанию `` `${assetsPath}/` ``, как это считает arui-scripts. Пустая строка приведет к
     * дублирующемуся `location /` в nginx-конфиге, поэтому переопределять стоит осознанно.
     */
    publicPath?: string;

    /* --- Секции --- */
    docker?: DockerOptions;
    nginx?: NginxOptions;
    archive?: ArchiveOptions;
    build?: BuildOptions;
    packageManager?: PackageManagerOptions;
    localFiles?: LocalFilesOptions;

    /* --- Шаблоны --- */
    /** Полная замена рендереров шаблонов. */
    templates?: ArtifactTemplates;
    /** Точечные оверрайды поверх сгенерированных шаблонов. */
    overrides?: ArtifactTemplateOverrides;
};

export type ResolvedDockerConfig = Required<DockerOptions>;
export type ResolvedNginxBaseConf = Required<NginxBaseConfOptions>;
export type ResolvedNginxConfig = Required<Omit<NginxOptions, 'baseConf'>> & {
    /** `null` — базовый конфиг не генерируется и не кладется в артефакт. */
    baseConf: ResolvedNginxBaseConf | null;
};
export type ResolvedArchiveConfig = Required<ArchiveOptions>;
export type ResolvedBuildConfig = Required<Omit<BuildOptions, 'command'>> & {
    command: string | null;
};
export type ResolvedPackageManagerConfig = Required<PackageManagerOptions>;
export type ResolvedLocalFilesConfig = Required<LocalFilesOptions>;

/**
 * Полностью донасыщенный конфиг сборки. С ним работают все шаблоны и утилиты — они не знают ничего
 * о том, откуда пришли значения, что делает их независимыми и легко тестируемыми.
 */
export type ResolvedArtifactsConfig = {
    artifact: ArtifactKind;

    name: string;
    version: string;
    cwd: string;
    debug: boolean;

    clientOnly: boolean;
    buildPath: string;
    serverOutput: string;
    serverPort: number;
    assetsPath: string;
    publicPath: string;

    docker: ResolvedDockerConfig;
    nginx: ResolvedNginxConfig;
    archive: ResolvedArchiveConfig;
    build: ResolvedBuildConfig;
    packageManager: ResolvedPackageManagerConfig;
    localFiles: ResolvedLocalFilesConfig;
};
