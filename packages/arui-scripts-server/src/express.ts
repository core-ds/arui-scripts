import { Router } from 'express';
import { createGetWidgetsMethod, WidgetsConfig } from './widgets';

export function createGetWidgetsExpress(widgets: WidgetsConfig) {
    const router = Router();

    const widgetMethodSettings = createGetWidgetsMethod(widgets);

    (router as unknown as Record<string, typeof router.post>)[widgetMethodSettings.method.toLowerCase()](widgetMethodSettings.path, async (req, res) => {
        try {
            const response = await widgetMethodSettings.handler(req.body, req);
            res.send(response);
        } catch (e: any) {
            res.status(500).send({
                error: e.message,
                status: 500,
            });
        }
    });

    return router;
}
