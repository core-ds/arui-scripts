export const LOCAL_OVERRIDE_STORAGE_KEY = 'arui-scripts-module-overrides';

/**
 * Возвращает переопределённый базовый адрес приложения-источника для модуля
 * или undefined, если оверрайда нет или он некорректен.
 * Любая ошибка доступа к localStorage не должна ломать загрузку модуля.
 */
export function getLocalModuleOverride(moduleId: string): string | undefined {
    try {
        const raw = window.localStorage.getItem(LOCAL_OVERRIDE_STORAGE_KEY);

        if (!raw) {
            return undefined;
        }

        const parsed: unknown = JSON.parse(raw);

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return undefined;
        }

        const value = (parsed as Record<string, unknown>)[moduleId];

        return typeof value === 'string' && value.trim() ? value.trim() : undefined;
    } catch {
        return undefined;
    }
}
