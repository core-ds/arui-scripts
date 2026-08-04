import validateNpmPackageName from 'validate-npm-package-name';

export function validateProjectName(name: string): true | string {
    const trimmed = name.trim();

    if (!trimmed) {
        return 'Имя проекта не может быть пустым';
    }

    const result = validateNpmPackageName(trimmed);

    if (result.validForNewPackages) {
        return true;
    }

    const messages = [...(result.errors ?? []), ...(result.warnings ?? [])];

    return messages.join('; ') || 'Некорректное имя пакета';
}
