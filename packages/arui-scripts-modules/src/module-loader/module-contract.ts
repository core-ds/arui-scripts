/** Модуль может быть экспортирован напрямую или через `default`. */
export type ModuleExports<Module> =
    | (Module & { default?: Module | null | undefined })
    | { default: Module };

type DefaultOrModule<Module, Default> = Default extends null | undefined ? Module : Default;

/** Берем `default`, а при `null` или `undefined` используем сам модуль. */
type UnwrapModule<Module> = Module extends { default?: unknown }
    ? 'default' extends keyof Module
        ? DefaultOrModule<Module, Module['default']>
        : Module
    : Module;

/** Распознает функцию без ограничений на типы ее аргументов. */
type Callable = (...args: never[]) => unknown;

/** Фабрика может быть самой функцией, полем `factory` или старым полем `mount`. */
type FactoryFunction<Module> = Module extends Callable
    ? Module
    : Module extends { factory: infer Factory extends Callable }
    ? Factory
    : Module extends { mount: infer Factory extends Callable }
    ? Factory
    : never;

/** У `mount` пропускаем первый аргумент (DOM-элемент). У фабрики берем аргументы как есть. */
type ModuleArguments<Module> = Module extends {
    mount: infer Mount extends Callable;
    unmount: Callable;
}
    ? [Parameters<Mount>[1], Parameters<Mount>[2]]
    : Parameters<FactoryFunction<Module>>;

/** Тип параметров запуска модуля или фабрики. */
export type ModuleRunParams<Module> = ModuleArguments<UnwrapModule<Module>>[0];

/** Тип серверного состояния, которое ожидает модуль или фабрика. */
export type ModuleServerState<Module> = ModuleArguments<UnwrapModule<Module>>[1];
