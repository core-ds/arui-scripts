import { runCompilers } from '../util/run-compilers';
import { getTscWatchCommand } from '../util/tsc';
import { configs } from '../../configs/app-configs';

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.BROWSERSLIST_CONFIG =
    process.env.BROWSERSLIST_CONFIG || require.resolve('../../../.browserslistrc');

const compilersCommands: Array<string | string[]> = [require.resolve('./client')];

if (!configs.clientOnly) {
    compilersCommands.push(require.resolve('./server'));
}

runCompilers(compilersCommands);
