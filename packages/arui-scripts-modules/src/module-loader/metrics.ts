const EVENT_CATEGORY = {
    module: 'Module',
};

export const MODULE_METRICS = {
    startFetch: {
        category: EVENT_CATEGORY.module,
        action: 'fetch module',
        label: 'Модуль начал загружаться',
        dimensionsMapping: {
            moduleId: '2',
            hostAppId: '3',
            fromCache: '4',
        },
    },
    fetchSuccess: {
        category: EVENT_CATEGORY.module,
        action: 'fetch module > success',
        label: 'Модуль успешно загрузился',
        dimensionsMapping: {
            moduleId: '2',
            hostAppId: '3',
        },
    },
};
