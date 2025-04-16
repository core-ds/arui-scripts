const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert').strict;

const DICTIONARY_SIGNATURE_V0 = 'd197f84ac33afc8abf5b24786159c2c8be17b1ab27c2c7e5857a22acb70dfbd5';
const DICTIONARY_SIGNATURE_V1 = '4dd61fd783a68349dd536a465221f7da71a4798f68bbac0c4afede3755b762a9';
const TEST_TARGET = 'http://brotli-test:8080';

test('should return not encoded response when no accept-encoding is set', async () => {
    const response = await fetchRawData(`${TEST_TARGET}/assets/alice.v1.txt`, {
        headers: {
            'accept-encoding': '',
        },
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers['content-encoding'], undefined);
});

test('should return brotli content when `br` accept encoding is available', async () => {
    const response = await fetchRawData(`${TEST_TARGET}/assets/alice.v1.txt`, {
        headers: {
            'accept-encoding': 'br',
        },
    });
    const expectedData = await fs.promises.readFile(
        path.join(__dirname, './assets/alice.v1.txt.br'),
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers['content-encoding'], 'br');
    assert.equal(response.headers['use-as-dictionary'], 'match="/assets/alice.*.txt",id="alice.v1"');

    assert.equal(expectedData.compare(response.body), 0);
});

test('should return response compressed with dictionary when dcb is accepted and dictionary id and available-dictionary is correct', async () => {
    const response = await fetchRawData(`${TEST_TARGET}/assets/alice.v2.txt`, {
        headers: {
            'accept-encoding': 'br,dcb',
            'dictionary-id': 'alice.v1',
            'available-dictionary': `:${Buffer.from(DICTIONARY_SIGNATURE_V1, 'hex').toString('base64')}:`,
        },
    });
    const expectedData = await fs.promises.readFile(
        path.join(__dirname, './assets/alice.v2.txt.v1.dcb'),
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers['content-encoding'], 'dcb');
    assert.equal(response.headers['use-as-dictionary'], 'match="/assets/alice.*.txt",id="alice.v2"');
    assert.equal(response.headers['vary'], 'accept-encoding, available-dictionary');

    assert.equal(expectedData.compare(response.body), 0);
});

test('should select correct dictionary compressed content', async () => {
    const response = await fetchRawData(`${TEST_TARGET}/assets/alice.v2.txt`, {
        headers: {
            'accept-encoding': 'br,dcb',
            'dictionary-id': 'alice.v0',
            'available-dictionary': `:${Buffer.from(DICTIONARY_SIGNATURE_V0, 'hex').toString('base64')}:`,
        },
    });
    const expectedData = await fs.promises.readFile(
        path.join(__dirname, './assets/alice.v2.txt.v0.dcb'),
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers['content-encoding'], 'dcb');
    assert.equal(response.headers['use-as-dictionary'], 'match="/assets/alice.*.txt",id="alice.v2"');
    assert.equal(response.headers['vary'], 'accept-encoding, available-dictionary');

    assert.equal(expectedData.compare(response.body), 0);
});

test('should return brotli content when dcb is accepted, but available dictionary is incorrect', async () => {
    const response = await fetchRawData(`${TEST_TARGET}/assets/alice.v2.txt`, {
        headers: {
            'accept-encoding': 'br,dcb',
            'dictionary-id': 'alice.v1',
            'available-dictionary': `:incorrect:`,
        },
    });
    const expectedData = await fs.promises.readFile(
        path.join(__dirname, './assets/alice.v2.txt.br'),
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers['content-encoding'], 'br');
    assert.equal(response.headers['use-as-dictionary'], 'match="/assets/alice.*.txt",id="alice.v2"');

    assert.equal(expectedData.compare(response.body), 0);
});

test('should return brotli content when dcb is accepted, but dictionary-id is incorrect', async () => {
    const response = await fetchRawData(`${TEST_TARGET}/assets/alice.v2.txt`, {
        headers: {
            'accept-encoding': 'br,dcb',
            'dictionary-id': 'alice.v3',
            'available-dictionary': `:${Buffer.from(DICTIONARY_SIGNATURE_V1, 'hex').toString('base64')}:`,
        },
    });
    const expectedData = await fs.promises.readFile(
        path.join(__dirname, './assets/alice.v2.txt.br'),
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers['content-encoding'], 'br');
    assert.equal(response.headers['use-as-dictionary'], 'match="/assets/alice.*.txt",id="alice.v2"');

    assert.equal(expectedData.compare(response.body), 0);
});



// реализуем сами, потому что fetch всегда будет пытаться разархивировать ответ, а нам надо проверять ответ как есть
function fetchRawData(url, options) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                const buffer = Buffer.concat(chunks);

                resolve({
                    headers: res.headers,
                    status: res.statusCode,
                    body: buffer,
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}
