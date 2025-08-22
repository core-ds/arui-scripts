import { configs } from '../../configs/app-configs';
import { runCompilers } from '../util/run-compilers';
import { getTscWatchCommand } from '../util/tsc';

const compilersCommands: Array<string | string[]> = [require.resolve('./client')];

if (!configs.clientOnly) {
    compilersCommands.push(require.resolve('./server'));
}

if (configs.tsconfig && configs.disableDevWebpackTypecheck) {
    compilersCommands.push(getTscWatchCommand(configs.tsconfig));
}

runCompilers(compilersCommands);
