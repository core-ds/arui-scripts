# Nginx-brotli module

Это модуль для nginx, который добавляет поддержку brotli сжатия.

Основан на [оригинальной реализации от google](https://github.com/google/ngx_brotli/tree/master).

Filter модуль скопирован без изменений.

Static модуль модифицирован для поддержки работы с [shared-dictionary](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression_dictionary_transport).

Алгоритм работы браузеров с shared-dictionary:

- Пользователь загружает ресурс. В заголовке `Use-As-Dictionary` ресурс помечается как "словарь" для будущих версий этого ресурса.
В заголовке содержится маска ресурсов, для которых его надо использовать как словарь. Так же есть возможность указать id для этого словаря.
- При последующих запросах за ресурсами, попадающими под маску, браузер будет отправлять заголовок `Available-Dictionary`, `Dictionary-Id` если для словаря был задан id, а так же в `Accept-Encoding` будет добавляться `dcb`
- Сервер может на таки запросы ответить архивом, сжатым с использованием первой версии ресурса.

Модуль предполагает что кроме статических версий br контента, будут так же предоставляться версии, сжатые словарем.
Для того чтобы это "просто работало" предполагается что все имена статичных фалов имеют структуру типа `{стабильное имя}.{хэш}.{расширение}`.

`{стабильное имя}` используется как главный идентификатор словаря, с помощью заголовков мы определяем что запросы за другими такими ресурсами должны идти со словарем.
`{хэш}` используется как уникальный идентификатор именно этой версии словаря.

Фактически, алгоритм работы можно выразить таким псевдокодом на js:

```js
function handle(req, reply) {
    if (req.method !== 'GET' || req.method !== 'HEAD') {
        return false;
    }

    if (req.url.endsWith('/')) {
        return false;
    }

    if (settings.brotli_static === 'off') {
        return false;
    }

    if (settings.brotli_static === 'on' && !req.headers['accept-encoding'].includes('br')) {
        return false;
    }

    if (req.headers['accept-encoding'].includes('dcb') && req.headers['dictionary-id']) {
        const [stableName, hash] = req.headers['dictionary-id'].split('.');

        if (stableName && hash) {
            const filename = nginx.filenameForRequest(req);

            if (filename.startsWith(stableName)) {
                const dcbFilename = `${filename}.${hash}.dcb`;

                if (fs.existsSync(dcbFilename)) {
                    reply.setHeader('Content-Encoding', 'dcb');
                    return reply(fs.readFileSync(dcbFilename));
                }
            }
        }
    }

    const filename = nginx.filenameForRequest(req);
    const [stableName, hash] = filename.split('.');
    const path = req.path;
    const ext = path.extname(filename);

    if (stableName && hash) {
        reply.setHeader('Use-As-Dictionary', `match="${path}/${stableName}.*.${ext}",id="${stableName}.${hash}"`);
    }

    const brFilename = `${filename}.br`;

    if (fs.existsSync(brFilename)) {
        reply.setHeader('Content-Encoding', 'br');
        return reply(fs.readFileSync(brFilename));
    }

    return false;
}
```
