import path from 'path';

import { getProjectTscPath } from '../../configs/util/typescript';

export function getTscWatchCommand(tsconfig: string, cwd = path.dirname(tsconfig)) {
    return [getProjectTscPath(cwd), '--watch', '--noEmit', '--project', tsconfig, '--skipLibCheck'];
}
