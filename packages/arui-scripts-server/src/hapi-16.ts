import { createGetWidgetsMethod, WidgetsConfig } from './widgets';
import type { HTTP_METHODS_PARTIAL, PluginFunction } from 'hapi16';

export function createGetWidgetsHapi16Plugin(widgets: WidgetsConfig, routeParams?: Record<string, unknown>) {
    const widgetMethodSettings = createGetWidgetsMethod(widgets);
    const register: PluginFunction<{}> = (server, options, next) => {


        server.route({
            method: widgetMethodSettings.method as HTTP_METHODS_PARTIAL,
            path: widgetMethodSettings.path,
            config: routeParams,
            handler: async (request, reply) => {
                try {
                    const response = await widgetMethodSettings.handler(request.payload, request);
                    reply(response);
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
        name: `@arui-scripts/server${widgetMethodSettings.path}`,
    };

    return register;
}
