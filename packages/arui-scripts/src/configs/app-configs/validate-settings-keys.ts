/**
 * Функция проверяет что все ключи объекта settingsObject есть в уже существующей конфигурации.
 *
 * Проверяется именно наличие ключа, а не значения: у части настроек (например, docker-специфичных)
 * дефолт живет в @alfalab/arui-scripts-artifacts, поэтому в конфиге они лежат со значением `undefined`.
 */
export function validateSettingsKeys(
    existingConfig: Record<string, unknown>,
    settingsObject: Record<string, unknown>,
    source?: string,
) {
    Object.keys(settingsObject).forEach((setting) => {
        if (!Object.prototype.hasOwnProperty.call(existingConfig, setting)) {
            console.warn(`Неизвестная настройка "${setting}" в ${source || 'конфигурации'}`);
        }
    });
}
