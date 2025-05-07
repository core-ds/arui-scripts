import fs from 'fs';
import path from 'path';

// Этот файл по сути заведен для того, чтобы просто в более понятном виде описать тот алгоритм, который описан
// в коде самого расширения. Просто C довольно многословен и написать на нем так же понятно у меня не получается


// этот "объект" символизирует встроенные методы nginx
const nginx = {
    // конфигурация модуля
    config: {
        brotli_static: 'on',
    },
    // функция, которая преобразует uri запроса в путь до файла в файловой системе
    filenameForRequest: (req) => '',
};


export function handle(req, reply) {
    if (req.method !== 'GET' || req.method !== 'HEAD') {
        return false;
    }

    if (req.url.endsWith('/')) {
        return false;
    }

    if (nginx.config.brotli_static === 'off') {
        return false;
    }

    if (!req.headers['accept-encoding'].includes('br')) {
        return false;
    }

    setUseAsDictionaryHeader(req, reply);

    const dcbServed = tryToServeDcb(req, reply);

    if (dcbServed !== false) {
        return dcbServed;
    }

    const brFilename = `${filename}.br`;

    if (fs.existsSync(brFilename)) {
        reply.setHeader('Content-Encoding', 'br');
        return reply(fs.readFileSync(brFilename));
    }

    return false;
}

const SIGNATURE_OFFSET = 4;
const SIGNATURE_LENGTH = 32;
function tryToServeDcb(req, reply) {
    if (!req.headers['accept-encoding'].includes('dcb')
        || !req.headers['dictionary-id']
        || !req.headers['available-dictionary']) {
        return false;
    }

    const [stableName, hash] = req.headers['dictionary-id'].split('.');
    const availableDictionary = req.headers['available-dictionary'];

    if (!stableName || !hash) {
        return false;
    }

    const filename = nginx.filenameForRequest(req);

    if (!filename.startsWith(stableName)) {
        return false;
    }

    const dcbFilename = `${filename}.${hash}.dcb`;

    if (!fs.fileExistSync(dcbFilename)) {
        return false;
    }

    const dcbFileContent = fs.readFileSync(dcbFilename);
    const dictionarySignature = Buffer.from(availableDictionary, 'base64');
    const fileSignature = dcbFileContent.subarray(
        SIGNATURE_OFFSET,
        SIGNATURE_OFFSET + SIGNATURE_LENGTH,
    );

    if (dictionarySignature.compare(fileSignature) !== 0) {
        return false;
    }

    reply.setHeader('Vary', 'accept-encoding, available-dictionary');

    return reply(dcbFileContent);
}

function setUseAsDictionaryHeader(req, reply) {
    const filename = nginx.filenameForRequest(req);
    const [stableName, hash] = filename.split('.');
    const pathname = req.path;
    const ext = path.extname(filename);

    if (stableName && hash) {
        let prefix = '';

        if (req.headers['x-forwarded-prefix']) {
            prefix = req.headers['x-forwarded-prefix'].split(',').pop();
        }

        reply.setHeader('Use-As-Dictionary', `match="${prefix}/${pathname}/${stableName}.*.${ext}",id="${stableName}.${hash}"`);
    }
}
