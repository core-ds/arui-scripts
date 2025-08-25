import { runCompilers } from '../util/run-compilers';
import { configs } from '../../configs/app-configs';

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const compilersCommands: Array<string | string[]> = [require.resolve('./client')];

if (!configs.clientOnly) {
    compilersCommands.push(require.resolve('./server'));
}

runCompilers(compilersCommands);
