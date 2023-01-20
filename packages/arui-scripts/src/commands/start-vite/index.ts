import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import checkRequiredFiles from '../util/check-required-files';

process.env.BROWSERSLIST_CONFIG = process.env.BROWSERSLIST_CONFIG || require.resolve('../../../.browserslistrc');
if (!checkRequiredFiles()) {
    process.exit(1);
}


const compileServer = spawn('node', [path.join(__dirname, '../start/server')], { stdio: 'inherit' });
const compileClient = spawn('node', [path.join(__dirname, './client')], { stdio: 'inherit' });

const onProcessExit = (code: number) => {
    if (code !== 0) {
        compileServer.kill();
        compileClient.kill();
        process.exit(code);
    }
};

compileClient.on('error', onProcessExit);
compileServer.on('error', onProcessExit);
compileServer.on('close', onProcessExit);
compileClient.on('close', onProcessExit);
