export { createReactModule } from './create-react-module';
export { useModuleReady } from './module-runtime';
export { type ReactModuleProps, type CreateReactModuleOptions } from './types';
// типы из сигнатуры createReactModule: без них TypeScript не может назвать выведенный тип
// модуля через публичный подпуть, и генерация контрактов падает с TS2883
export { type MountableModule } from '../module-loader/module-types';
export { type BaseModuleState } from '../module-loader/types';
