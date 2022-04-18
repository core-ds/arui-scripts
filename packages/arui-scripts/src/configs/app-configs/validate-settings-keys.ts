/**
 * Функция проверяет что все ключи объекта settingsObject есть в массиве availableKeys
 * @param {string[]} availableKeys Массив допустимых настроек
 * @param settingsObject Объект с настройками
 */
function validateSettingsKeys(availableKeys: ReadonlyArray<string>, settingsObject: Record<string, unknown>) {
    Object.keys(settingsObject).forEach((setting) => {
        if (!availableKeys.includes(setting)) {
            console.warn(
                '\x1b[33m', `Setting`,
                '\x1b[31m', setting,
                '\x1b[33m', 'is not supported!'
            );
        }
    });
}

export default validateSettingsKeys;
