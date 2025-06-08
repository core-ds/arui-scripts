# Compression dictionary transport

## Общее описание механизма

Механизм [compression dictionary transport](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression_dictionary_transport)
позволяет использовать загружаемые пользователем ресурсы как словари для сжатия последующих версий этих ресурсов.

Например, первая версия приложения после сборки имеет следующие файлы в `/assets`:

```
main.6137cb87.js
main.6137cb87.js.br
vendor.0be1767f.js
vendor.0be1767f.js.br
webpack-assets.json
```

При загрузке пользователем этих ресурсов браузер отправляет серверу запрос вида:
```http
GET /assets/main.6137cb87.js
Accept-Encoding: gzip, deflate, br, zstd
```

Если заголовок `Accept-Encoding` содержит `br`, то вместо оригинальной версии файла nginx отдаст его `.br` версию:

```http
200 OK
Content-Encoding: br
Use-As-Dictionary: match="/assets/main.*.js", dictionary-id="main.6137cb87"
Vary: accept-encoding, available-dictionary
<content of main.6137cb87.js.br file>
```

Заголовок `Use-As-Dictionary` автоматически формируется nginx и говорит браузеру о том, что полученный контент следует
использовать как словарь для последующих запросов к ресурсам, попадающим под маску `/assets/main.*.js`.

Этот заголовок будет проставляться всем файлам, попадающим под маску `{stable name}.{hash}.{ext}`. Если файл не попадает под эту маску, заголовок добавляться не будет.
Так, для `vendor.0be1767f.js` заголовок будет `match="/assets/vendor.*.js", dictionary-id="vendor.0be1767f"`, а для `webpack-assets.json` заголовка не будет.

На данный момент этот заголовок поддерживается в браузерах на основе Chromium (список совместимых версий см. на [mdn](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression_dictionary_transport#http.headers.use-as-dictionary)).

При сборке следующей версии приложения сборка ведется, используя предыдущую версию ассетов приложения как словари. Вы можете указать, где искать предыдущую версию приложения, используя настройку `previousVersionPath`:

```ts
// arui-scripts.config.ts
import { PackageSettings } from 'arui-scripts';

const settings: PackageSettings = {
    previousVersionPath: './previous-version', // так же может быть массивом путей
};

export default settings;
```

В папке `./previous-version` должны оказаться ассеты предыдущей версии приложения. То, как они туда попадут, остается на ваше усмотрение.

Файлы новой и старой версии сопоставляются по маске `{stable name}.{hash}.{ext}`. Если у файлов совпадают `{stable name}` и `{ext}`, то из них будет создан архив со словарем.
```sh
previous-version
  main.6137cb87.js
  vendor.0be1767f.js
.build
  assets
    main.3bf18d7e.js
    vendor.79fe043d.js
    main.3bf18d7e.js.6137cb87.dcb   # файл main из этой сборки, сжатый словарем предыдущей версии
    vendor.79fe043d.js.0be1767f.dcb # файл vendor из этой сборки, сжатый словарем предыдущей версии
```

Браузер, поддерживающий compression dictionary transport, будет запрашивать ресурсы новой версии, если они попадают под маску из заголовка `Use-As-Dictionary`:

```http
GET /assets/main.3bf18d7e.js
Accept-Encoding: gzip, deflate, br, zstd, dcb, dcz
Available-Dictionary: :pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4=:
Dictionary-Id: "main.6137cb87"
```

Сервер проверит заголовок `dictionary-id`, найдет по нему версию файла, сжатую словарем, проверит подпись файла (содержится в заголовке `Available-Dictionary`), и ответит контентом, сжатым с кастомным словарем.

```http
200 OK
Content-Encoding: dcb
Use-As-Dictionary: match="/assets/main.*.js", dictionary-id="main.3bf18d7e"
Vary: accept-encoding, available-dictionary
<content of main.3bf18d7e.js.6137cb87.dcb file>
```

## Использование в приложениях с префиксом в URL

Маска для заголовка `Use-As-Dictionary` должна полностью совпадать с реальным адресом, по которому браузер выполняет запрос.
Поэтому, если ваше приложение находится за прокси, меняющим реальный адрес, необходимо убедиться, что прокси добавляет заголовок `x-forwarded-prefix`.
Этот префикс будет добавлен в заголовок `Use-As-Dictionary`. Если `x-forwarded-prefix` будет содержать несколько значений, разделенных запятыми, то использоваться будет последнее значение.

```http
GET /assets/main.6137cb87.js
Accept-Encoding: gzip, deflate, br, zstd
x-forwarded-prefix: /infra-proxy,/dashboard

200 OK
Content-Encoding: br
Use-As-Dictionary: match="/dashboard/assets/main.*.js",dictionary-id="main.6137cb87"
Vary: accept-encoding, available-dictionary
<content of main.6137cb87.js.br file>
```
