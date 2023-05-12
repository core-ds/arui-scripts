import { createGetWidgetsMethod, WidgetsConfig } from './widgets';
import type { Plugin } from 'hapi20';

export function createGetWidgetsHapi20Plugin(widgets: WidgetsConfig, routeParams?: Record<string, unknown>) {
    const widgetMethodSettings = createGetWidgetsMethod(widgets);

    const plugin: Plugin<{}> = {
        name: `@arui-scripts/server${widgetMethodSettings.path}`,
        version: '1.0.0',
        register: (server, options) => {
            server.route({
                method: widgetMethodSettings.method,
                path: widgetMethodSettings.path,
                options: {
                    ...routeParams,
                },
                handler: async (request, h) => {
                    try {
                        return await widgetMethodSettings.handler(request.payload as any, request);
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
