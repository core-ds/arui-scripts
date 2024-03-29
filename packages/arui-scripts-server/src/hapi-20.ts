// TODO: remove eslint-disable-next-line
import type { Plugin, Request } from 'hapi20';

import { createGetModulesMethod, ModulesConfig } from './modules';

export function createGetModulesHapi20Plugin(
    modules: ModulesConfig<[Request]>,
    routeParams?: Record<string, unknown>,
) {
    const modulesMethodSettings = createGetModulesMethod(modules);

    const plugin: Plugin<Record<string, never>> = {
        name: `@alfalab/scripts-server${modulesMethodSettings.path}`,
        version: '1.0.0',
        register: (server) => {
            server.route({
                method: modulesMethodSettings.method,
                path: modulesMethodSettings.path,
                options: {
                    ...routeParams,
                },
                // eslint-disable-next-line consistent-return
                handler: async (request, h) => {
                    try {
                        return await modulesMethodSettings.handler(request.payload as any, request);
                    } catch (e: any) {
                        h.response({
                            error: e.message,
                            status: 500,
                        }).code(500);
                    }
                },
            });
        },
    };

    return plugin;
}
