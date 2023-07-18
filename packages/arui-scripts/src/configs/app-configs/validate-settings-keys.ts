/**
 * Функция проверяет что все ключи объекта settingsObject есть в уже существующей конфигурации
 */
export function validateSettingsKeys(
    existingConfig: Record<string, unknown>,
    settingsObject: Record<string, unknown>,
    source?: string
) {
    Object.keys(settingsObject).forEach((setting) => {
        if (typeof existingConfig[setting] === 'undefined') {
            console.warn(`Неизвестная настройка "${setting}" в ${source || 'конфигурации'}`);
        }
    });
}
