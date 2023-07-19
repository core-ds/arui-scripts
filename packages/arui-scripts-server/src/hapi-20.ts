import { createGetModulesMethod, ModulesConfig } from './modules';
import type { Plugin, Request } from 'hapi20';

export function createGetModulesHapi20Plugin(modules: ModulesConfig<[Request]>, routeParams?: Record<string, unknown>) {
    const modulesMethodSettings = createGetModulesMethod(modules);

    const plugin: Plugin<{}> = {
        name: `@alfalab/scripts-server${modulesMethodSettings.path}`,
        version: '1.0.0',
        register: (server, options) => {
            server.route({
                method: modulesMethodSettings.method,
                path: modulesMethodSettings.path,
                options: {
                    ...routeParams,
                },
                handler: async (request, h) => {
                    try {
                        return await modulesMethodSettings.handler(request.payload as any, request);
                    } catch (e: any) {
                        h
                            .response({
                                error: e.message,
                                status: 500,
                            })
                            .code(500);
                    }
                },
            });
        }
    };

    return plugin;
}
