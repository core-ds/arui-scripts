import { type HTTP_METHODS_PARTIAL, type PluginFunction, type Request } from 'hapi16';

import { createGetModulesMethod, type ModulesConfig } from './modules';

export function createGetModulesHapi16Plugin(
    modules: ModulesConfig<[Request]>,
    routeParams?: Record<string, unknown>,
) {
    const modulesMethodSettings = createGetModulesMethod(modules);
    const register: PluginFunction<Record<string, never>> = (server, options, next) => {
        server.route({
            method: modulesMethodSettings.method as HTTP_METHODS_PARTIAL,
            path: modulesMethodSettings.path,
            config: routeParams,
            handler: async (request, reply) => {
                try {
                    const response = await modulesMethodSettings.handler(request.payload, request);

                    reply(response);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e: any) {
                    reply({
                        error: e.message,
                        status: 500,
                    }).code(500);
                }
            },
        });

        next();
    };

    register.attributes = {
        name: `@alfalab/scripts-server${modulesMethodSettings.path}`,
    };

    return register;
}
