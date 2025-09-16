import { type AbstractAppEventBus, type AbstractKnownEventTypes } from './abstract-types';

declare global {
    /* eslint-disable no-var,@typescript-eslint/naming-convention,no-underscore-dangle,vars-on-top */
    var __alfa_event_buses: Record<string, AbstractAppEventBus<AbstractKnownEventTypes>>;
    /* eslint-enable no-var,@typescript-eslint/naming-convention,no-underscore-dangle,vars-on-top */

    type EventBusParams = {
        targetNode?: Node;
        debugMode?: boolean;
    };
}
