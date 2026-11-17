import { createReactModule } from '@alfalab/scripts-modules/react';

import { ServerStateModule } from './server-state-module';

// Нужно для демонстрации работы с дефолтными экспортами.

export default createReactModule({ Component: ServerStateModule });
