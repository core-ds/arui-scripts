"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ignore attempts to require any types of assets
(() => {
    // simply ignore css files, it wont cause any damage
    const ignoreExtensions = ['.css'];
    // warn about other requires, because it may lead to unexpected behaviour in production
    const warnExtensions = [
        '.gif',
        '.jpeg',
        '.jpg',
        '.ico',
        '.png',
        '.xml',
        '.svg',
        '.mp4',
        '.webm',
        '.ogv',
        '.aac',
        '.mp3',
        '.wav',
        '.ogg',
    ];
    const noop = () => { };
    const warn = (_, path) => console.warn(`\u001B[0;31mWARNING!
    Trying to require ${path} in node.js.
    Non-js files is ignored when required in node_modules\u001B[0m`);
    ignoreExtensions.forEach((e) => {
        require.extensions[e] = noop;
    });
    warnExtensions.forEach((e) => {
        require.extensions[e] = warn;
    });
})();

(() => {
var __webpack_modules__ = ({
4121
/*!***************************************************!*\
  !*** ../arui-scripts-server/build/rsc/express.js ***!
  \***************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({
    value: true
});
exports.R = createRscExpress;
// Express-адаптер RSC-обработчика. Обычный node-граф (вне RSC-слоя):
// импортируется из серверного entry приложения, а handler приходит
// из модуля-границы RSC-графа.
var express_1 = __webpack_require__(/*! express */ 7252);
/**
 * Возвращает Router, отдающий страницы/flight/actions через RSC-обработчик.
 * Мидлвара обрабатывает все GET/POST запросы, которые до неё дошли, —
 * монтируйте её после статики и API-роутов.
 */ function createRscExpress(handler) {
    var router = (0, express_1.Router)();
    router.use(function(req, res, next) {
        if (req.method !== 'GET' && req.method !== 'POST') {
            next();
            return;
        }
        handler.handleNodeRequest(req, res).catch(next);
    });
    return router;
}


},
7252
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
(module) {
"use strict";
module.exports = require("express");

},
290
/*!******************************!*\
  !*** external "async_hooks" ***!
  \******************************/
(module) {
"use strict";
module.exports = require("async_hooks");

},
6982
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
(module) {
"use strict";
module.exports = require("crypto");

},
2203
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
(module) {
"use strict";
module.exports = require("stream");

},
9023
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
(module) {
"use strict";
module.exports = require("util");

},
230
/*!**********************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-button/desktop/default.desktop.css ***!
  \**********************************************************************************/
() {
// empty (null-loader)

},
8847
/*!*********************************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-button/esm/components/base-button/default.css ***!
  \*********************************************************************************************/
() {
// empty (null-loader)

},
8444
/*!*******************************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-button/esm/components/base-button/index.css ***!
  \*******************************************************************************************/
() {
// empty (null-loader)

},
8657
/*!**********************************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-button/esm/components/base-button/inverted.css ***!
  \**********************************************************************************************/
() {
// empty (null-loader)

},
4338
/*!**************************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-button/esm/desktop/default.desktop.css ***!
  \**************************************************************************************/
() {
// empty (null-loader)

},
9687
/*!******************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-button/esm/desktop/desktop.css ***!
  \******************************************************************************/
() {
// empty (null-loader)

},
362
/*!***************************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-button/esm/desktop/inverted.desktop.css ***!
  \***************************************************************************************/
() {
// empty (null-loader)

},
8562
/*!************************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-button/esm/mobile/default.mobile.css ***!
  \************************************************************************************/
() {
// empty (null-loader)

},
7138
/*!*************************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-button/esm/mobile/inverted.mobile.css ***!
  \*************************************************************************************/
() {
// empty (null-loader)

},
4225
/*!****************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-button/esm/mobile/mobile.css ***!
  \****************************************************************************/
() {
// empty (null-loader)

},
5014
/*!***********************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-spinner/esm/default.css ***!
  \***********************************************************************/
() {
// empty (null-loader)

},
5053
/*!*********************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-spinner/esm/index.css ***!
  \*********************************************************************/
() {
// empty (null-loader)

},
4746
/*!************************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-spinner/esm/inverted.css ***!
  \************************************************************************/
() {
// empty (null-loader)

},
8940
/*!**********************************************************************!*\
  !*** ./node_modules/@alfalab/core-components-spinner/esm/preset.css ***!
  \**********************************************************************/
() {
// empty (null-loader)

},
1406
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** builtin:rsc-action-entry-loader?actions=%7B%22%2FUsers%2Fdmitrbrvsk%2Falfabank%2Farui-scripts%2Fpackages%2Fexample-rsc%2Fsrc%2Frsc%2Factions.ts%22%3A%5B%5B%224021670c6f9f964c40370841a697fb94447dd4f23f0abaf40c74c2958cd632e2d6%22%2C%22echoOnServer%22%5D%5D%7D&from-client=true! + 1 modules ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************/
(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "4021670c6f9f964c40370841a697fb94447dd4f23f0abaf40c74c2958cd632e2d6": () => (/* reexport */ echoOnServer)
});

// EXTERNAL MODULE: ./node_modules/react-server-dom-rspack/server.node.js
var server_node = __webpack_require__(9261);
;// CONCATENATED MODULE: ./src/rsc/actions.ts

async function echoOnServer(value) {
    return `сервер получил ${value} в ${new Date().toISOString()} (pid ${process.pid})`;
}

(0,server_node.ensureServerActions)([
    echoOnServer
]);
(0,server_node.registerServerReference)(echoOnServer, "4021670c6f9f964c40370841a697fb94447dd4f23f0abaf40c74c2958cd632e2d6", null);

;// CONCATENATED MODULE: builtin:rsc-action-entry-loader?actions=%7B%22%2FUsers%2Fdmitrbrvsk%2Falfabank%2Farui-scripts%2Fpackages%2Fexample-rsc%2Fsrc%2Frsc%2Factions.ts%22%3A%5B%5B%224021670c6f9f964c40370841a697fb94447dd4f23f0abaf40c74c2958cd632e2d6%22%2C%22echoOnServer%22%5D%5D%7D&from-client=true!


},
5410
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** builtin:rsc-action-entry-loader?actions=%7B%22%2FUsers%2Fdmitrbrvsk%2Falfabank%2Farui-scripts%2Fpackages%2Fexample-rsc%2Fsrc%2Frsc%2Fpages%2Fhome.tsx%22%3A%5B%5D%2C%22%2FUsers%2Fdmitrbrvsk%2Falfabank%2Farui-scripts%2Fpackages%2Fexample-rsc%2Fsrc%2Frsc%2Fcomponents%2Fcounter.tsx%22%3A%5B%5D%7D&from-client=false! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************/
() {


},
354
/*!*************************************************!*\
  !*** ../arui-scripts-server/build/rsc/index.js ***!
  \*************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";

function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype), d = Object.defineProperty;
    return d(g, "next", {
        value: verb(0)
    }), d(g, "throw", {
        value: verb(1)
    }), d(g, "return", {
        value: verb(2)
    }), typeof Symbol === "function" && d(g, Symbol.iterator, {
        value: function() {
            return this;
        }
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return _instanceof(value, P) ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.RSC_CONTENT_TYPE = exports.RSC_ACTION_HEADER = void 0;
exports.createRscAppHandler = createRscAppHandler;
var server_node_1 = __webpack_require__(/*! react-server-dom-rspack/server.node */ 9261);
var node_web_1 = __webpack_require__(/*! ./node-web */ 4775);
var parse_render_request_1 = __webpack_require__(/*! ./parse-render-request */ 6270);
var ssr_1 = __webpack_require__(/*! ./ssr */ 782);
var types_1 = __webpack_require__(/*! ./types */ 563);
var types_2 = __webpack_require__(/*! ./types */ 563);
Object.defineProperty(exports, "RSC_ACTION_HEADER", ({
    enumerable: true,
    get: function get() {
        return types_2.RSC_ACTION_HEADER;
    }
}));
Object.defineProperty(exports, "RSC_CONTENT_TYPE", ({
    enumerable: true,
    get: function get() {
        return types_2.RSC_CONTENT_TYPE;
    }
}));
/**
 * CSRF-классификация запроса к server action: Origin (fallback — Referer) против Host.
 * Обе штатные топологии сохраняют исходный Host (nginx: `proxy_set_header Host $host`;
 * dev-прокси без changeOrigin), поэтому сравнение корректно и в dev, и в prod.
 * `Origin: null` (sandbox-iframe и т.п.) и невалидные значения считаем cross-origin.
 */ function getRequestOrigin(request) {
    var _a;
    var source = (_a = request.headers.get('origin')) !== null && _a !== void 0 ? _a : request.headers.get('referer');
    if (!source) {
        return 'unknown';
    }
    var host = request.headers.get('host');
    try {
        return host && new URL(source).host === host ? 'same-origin' : 'cross-origin';
    } catch (e) {
        return 'cross-origin';
    }
}
/**
 * Cross-origin запросы к server actions отклоняются всегда. Запрос без Origin и Referer:
 * для form-action тоже отклоняется — обычный `<form method="post">` не требует CORS
 * preflight, и это единственная защита пути (OWASP: отсутствию обоих заголовков не
 * доверяем); для header-пути ('action') допускается — кастомный заголовок x-rsc-action
 * вынуждает preflight у браузеров (CSRF невозможен), а без Origin ходят только
 * не-браузерные клиенты (server-to-server, тесты), не несущие чужих кук.
 * Эта проверка — обязанность именно framework-обёртки (как в Next.js), а не
 * react-server-dom-rspack: у библиотеки нет доступа к заголовкам запроса вовсе.
 */ function isForbiddenCrossOrigin(request, kind) {
    var origin = getRequestOrigin(request);
    return origin === 'cross-origin' || origin === 'unknown' && kind === 'form-action';
}
/**
 * Приводит перехваченное значение к Error: react-server-dom-rspack редактирует
 * (обрезает message/stack) в prod-сборке только значения instanceof Error — plain
 * object/строка/число, брошенные из action, ушли бы клиенту дословно, в любом режиме.
 */ function toActionError(error) {
    if (_instanceof(error, Error)) {
        return error;
    }
    if (typeof error === 'string') {
        return new Error(error);
    }
    try {
        return new Error(JSON.stringify(error));
    } catch (e) {
        return new Error(String(error));
    }
}
function createRscAppHandler(options) {
    function handleRequest(req) {
        return __awaiter(this, void 0, void 0, function() {
            var _a, request, parsed, returnValue, formState, temporaryReferences, actionStatus, contentType, body, _tmp, args, action, data, error, formData, decodedAction, result, error1, context, renderResult, payload, flightStream, ssrResult;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        request = (0, node_web_1.toWebRequest)(req);
                        parsed = (0, parse_render_request_1.parseRenderRequest)(request.method, request.headers);
                        if ((parsed.kind === 'action' || parsed.kind === 'form-action') && isForbiddenCrossOrigin(request, parsed.kind)) {
                            return [
                                2,
                                new Response('Forbidden: cross-origin server action request rejected', {
                                    status: 403
                                })
                            ];
                        }
                        if (!(parsed.kind === 'action')) return [
                            3,
                            9
                        ];
                        // вызов server action через setServerCallback клиентского runtime
                        contentType = request.headers.get('content-type');
                        if (!(contentType === null || contentType === void 0 ? void 0 : contentType.startsWith('multipart/form-data'))) return [
                            3,
                            2
                        ];
                        return [
                            4,
                            request.formData()
                        ];
                    case 1:
                        _tmp = _state.sent();
                        return [
                            3,
                            4
                        ];
                    case 2:
                        return [
                            4,
                            request.text()
                        ];
                    case 3:
                        _tmp = _state.sent();
                        _state.label = 4;
                    case 4:
                        body = _tmp;
                        temporaryReferences = (0, server_node_1.createTemporaryReferenceSet)();
                        return [
                            4,
                            (0, server_node_1.decodeReply)(body, {
                                temporaryReferences: temporaryReferences
                            })
                        ];
                    case 5:
                        args = _state.sent();
                        action = (0, server_node_1.loadServerAction)(parsed.actionId);
                        _state.label = 6;
                    case 6:
                        _state.trys.push([
                            6,
                            8,
                            ,
                            9
                        ]);
                        return [
                            4,
                            action.apply(void 0, _to_consumable_array(args))
                        ];
                    case 7:
                        data = _state.sent();
                        returnValue = {
                            ok: true,
                            data: data
                        };
                        return [
                            3,
                            9
                        ];
                    case 8:
                        error = _state.sent();
                        returnValue = {
                            ok: false,
                            data: toActionError(error)
                        };
                        actionStatus = 500;
                        return [
                            3,
                            9
                        ];
                    case 9:
                        if (!(parsed.kind === 'form-action')) return [
                            3,
                            16
                        ];
                        return [
                            4,
                            request.formData()
                        ];
                    case 10:
                        formData = _state.sent();
                        return [
                            4,
                            (0, server_node_1.decodeAction)(formData)
                        ];
                    case 11:
                        decodedAction = _state.sent();
                        _state.label = 12;
                    case 12:
                        _state.trys.push([
                            12,
                            15,
                            ,
                            16
                        ]);
                        return [
                            4,
                            decodedAction === null || decodedAction === void 0 ? void 0 : decodedAction()
                        ];
                    case 13:
                        result = _state.sent();
                        return [
                            4,
                            (0, server_node_1.decodeFormState)(result, formData)
                        ];
                    case 14:
                        formState = (_a = _state.sent()) !== null && _a !== void 0 ? _a : undefined;
                        return [
                            3,
                            16
                        ];
                    case 15:
                        error1 = _state.sent();
                        return [
                            2,
                            new Response('Internal Server Error: server action failed', {
                                status: 500
                            })
                        ];
                    case 16:
                        context = {
                            url: new URL(request.url),
                            method: request.method,
                            headers: req.headers,
                            req: req
                        };
                        return [
                            4,
                            options.render(context)
                        ];
                    case 17:
                        renderResult = _state.sent();
                        payload = {
                            root: renderResult.root,
                            formState: formState,
                            returnValue: returnValue
                        };
                        flightStream = (0, server_node_1.renderToReadableStream)(payload, {
                            temporaryReferences: temporaryReferences
                        });
                        if (parsed.kind === 'flight' || parsed.kind === 'action') {
                            return [
                                2,
                                new Response(flightStream, {
                                    status: actionStatus,
                                    headers: {
                                        'content-type': "".concat(types_1.RSC_CONTENT_TYPE, ";charset=utf-8")
                                    }
                                })
                            ];
                        }
                        return [
                            4,
                            (0, ssr_1.renderHtmlFromFlight)(flightStream, {
                                bootstrapScripts: renderResult.bootstrapScripts,
                                formState: formState
                            })
                        ];
                    case 18:
                        ssrResult = _state.sent();
                        return [
                            2,
                            new Response(ssrResult.stream, {
                                status: ssrResult.status,
                                headers: {
                                    'content-type': 'text/html;charset=utf-8'
                                }
                            })
                        ];
                }
            });
        });
    }
    return {
        handleNodeRequest: function handleNodeRequest(req, res) {
            return __awaiter(this, void 0, void 0, function() {
                var response, error;
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            _state.trys.push([
                                0,
                                2,
                                ,
                                3
                            ]);
                            return [
                                4,
                                handleRequest(req)
                            ];
                        case 1:
                            response = _state.sent();
                            return [
                                3,
                                3
                            ];
                        case 2:
                            error = _state.sent();
                            // декодирование запроса (payload actions, form actions) или рендер
                            // могут упасть на невалидном/протухшем вводе (например, неизвестный
                            // action id после деплоя) — не отдаём наружу стек и пути ФС
                            response = new Response('Internal Server Error', {
                                status: 500
                            });
                            return [
                                3,
                                3
                            ];
                        case 3:
                            return [
                                4,
                                (0, node_web_1.sendWebResponse)(res, response)
                            ];
                        case 4:
                            _state.sent();
                            return [
                                2
                            ];
                    }
                });
            });
        }
    };
}


},
4775
/*!****************************************************!*\
  !*** ../arui-scripts-server/build/rsc/node-web.js ***!
  \****************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";

function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype), d = Object.defineProperty;
    return d(g, "next", {
        value: verb(0)
    }), d(g, "throw", {
        value: verb(1)
    }), d(g, "return", {
        value: verb(2)
    }), typeof Symbol === "function" && d(g, Symbol.iterator, {
        value: function() {
            return this;
        }
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return _instanceof(value, P) ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.toWebRequest = toWebRequest;
exports.sendWebResponse = sendWebResponse;
var stream_1 = __webpack_require__(/*! stream */ 2203);
/** Конвертация node-запроса в web Request (для formData/text и единообразного API) */ function toWebRequest(req) {
    var url = new URL(req.url || '/', "http://".concat(req.headers.host || 'localhost'));
    var method = req.method || 'GET';
    var headers = new Headers();
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        var _loop = function() {
            var _step_value = _sliced_to_array(_step.value, 2), key = _step_value[0], value = _step_value[1];
            if (Array.isArray(value)) {
                value.forEach(function(item) {
                    return headers.append(key, item);
                });
            } else if (value != null) {
                headers.set(key, value);
            }
        };
        for(var _iterator = Object.entries(req.headers)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    var body = method === 'GET' || method === 'HEAD' ? undefined : stream_1.Readable.toWeb(req);
    return new Request(url, Object.assign({
        method: method,
        headers: headers,
        body: body
    }, body ? {
        duplex: 'half'
    } : {}));
}
/** Стриминг web Response в node-ответ */ function sendWebResponse(res, response) {
    return __awaiter(this, void 0, void 0, function() {
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    res.statusCode = response.status;
                    response.headers.forEach(function(value, key) {
                        return res.setHeader(key, value);
                    });
                    // отключает буферизацию ответа в nginx (прод-шаблон arui-scripts) —
                    // стриминг (flight/HTML) доходит до браузера сразу
                    res.setHeader('x-accel-buffering', 'no');
                    if (!response.body) {
                        res.end();
                        return [
                            2
                        ];
                    }
                    return [
                        4,
                        new Promise(function(resolve, reject) {
                            var nodeStream = stream_1.Readable.fromWeb(response.body);
                            nodeStream.on('error', reject);
                            res.on('close', resolve);
                            res.on('error', reject);
                            nodeStream.pipe(res);
                        })
                    ];
                case 1:
                    _state.sent();
                    return [
                        2
                    ];
            }
        });
    });
}


},
6270
/*!****************************************************************!*\
  !*** ../arui-scripts-server/build/rsc/parse-render-request.js ***!
  \****************************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.parseRenderRequest = parseRenderRequest;
var types_1 = __webpack_require__(/*! ./types */ 563);
/**
 * Дискриминация входящего запроса (конвенция arui-scripts, совместима
 * с клиентским runtime `@alfalab/scripts-server/rsc/client`):
 * - POST с заголовком `x-rsc-action` — вызов server action после гидратации;
 * - POST без заголовка — form action до гидратации (progressive enhancement);
 * - GET с `Accept: text/html` — HTML-рендер (обычная навигация браузера);
 * - остальные GET (клиент шлёт `Accept: text/x-component`) — Flight-payload.
 */ function parseRenderRequest(method, headers) {
    var _a;
    if (method === 'POST') {
        var actionId = headers.get(types_1.RSC_ACTION_HEADER);
        return actionId ? {
            kind: 'action',
            actionId: actionId
        } : {
            kind: 'form-action'
        };
    }
    var accept = (_a = headers.get('accept')) !== null && _a !== void 0 ? _a : '';
    if (accept.includes(types_1.RSC_CONTENT_TYPE)) {
        return {
            kind: 'flight'
        };
    }
    if (accept.includes('text/html')) {
        return {
            kind: 'html'
        };
    }
    return {
        kind: 'flight'
    };
}


},
782
/*!***********************************************!*\
  !*** ../arui-scripts-server/build/rsc/ssr.js ***!
  \***********************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";

function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype), d = Object.defineProperty;
    return d(g, "next", {
        value: verb(0)
    }), d(g, "throw", {
        value: verb(1)
    }), d(g, "return", {
        value: verb(2)
    }), typeof Symbol === "function" && d(g, Symbol.iterator, {
        value: function() {
            return this;
        }
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function get() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = this && this.__importStar || function() {
    var ownKeys = function ownKeys1(o) {
        ownKeys = Object.getOwnPropertyNames || function(o) {
            var ar = [];
            for(var k in o)if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
            for(var k = ownKeys(mod), i = 0; i < k.length; i++)if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
    };
}();
var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return _instanceof(value, P) ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.renderHtmlFromFlight = renderHtmlFromFlight;
// SSR-мост: arui-scripts компилирует ЭТОТ модуль в слое 'server-side-rendering'
// (обычные условия резолва, без 'react-server') — правило вешается на путь
// '@alfalab/scripts-server/rsc/ssr'. Десериализует RSC-стрим обратно
// в React-дерево и стримит HTML.
// Без JSX: пакет собирается обычным tsc без jsx-трансформации.
var React = __importStar(__webpack_require__(/*! react */ 3380));
// именно server.edge: CJS-require 'react-dom/server' резолвится в server.node,
// в котором нет renderToReadableStream; edge-сборка работает и в node (web streams)
var server_edge_1 = __webpack_require__(/*! react-dom/server.edge */ 1515);
var client_1 = __webpack_require__(/*! react-server-dom-rspack/client */ 3693);
var server_1 = __webpack_require__(/*! rsc-html-stream/server */ 6738);
function renderHtmlFromFlight(flightStream_1) {
    return __awaiter(this, arguments, void 0, function(flightStream) {
        var options, _flightStream_tee, ssrStream, inlineStream, payload, htmlStream, status, error, responseStream;
        var _arguments = arguments;
        function SsrRoot() {
            // десериализация запускается внутри контекста ReactDOMServer,
            // чтобы работали preinit/preload ресурсов клиентских компонентов
            payload !== null && payload !== void 0 ? payload : payload = (0, client_1.createFromReadableStream)(ssrStream);
            return React.use(payload).root;
        }
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    options = _arguments.length > 1 && _arguments[1] !== void 0 ? _arguments[1] : {};
                    // один поток — на SSR-десериализацию, второй инлайнится в HTML для гидратации
                    _flightStream_tee = _sliced_to_array(flightStream.tee(), 2), ssrStream = _flightStream_tee[0], inlineStream = _flightStream_tee[1];
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        3,
                        ,
                        5
                    ]);
                    return [
                        4,
                        (0, server_edge_1.renderToReadableStream)(React.createElement(SsrRoot), {
                            bootstrapScripts: options.bootstrapScripts,
                            nonce: options.nonce,
                            formState: options.formState
                        })
                    ];
                case 2:
                    htmlStream = _state.sent();
                    return [
                        3,
                        5
                    ];
                case 3:
                    error = _state.sent();
                    // фолбэк: пустой shell + чистый CSR на клиенте (ошибка серверного компонента
                    // воспроизведётся на клиенте и попадёт в error boundary)
                    status = 500;
                    return [
                        4,
                        (0, server_edge_1.renderToReadableStream)(React.createElement('html', null, React.createElement('body', null, React.createElement('noscript', null, 'Internal Server Error: SSR failed'))), {
                            nonce: options.nonce
                        })
                    ];
                case 4:
                    htmlStream = _state.sent();
                    return [
                        3,
                        5
                    ];
                case 5:
                    // начальный RSC-стрим инлайнится в HTML как <script>...FLIGHT_DATA...</script> —
                    // клиент гидратируется без повторного запроса
                    responseStream = htmlStream.pipeThrough((0, server_1.injectRSCPayload)(inlineStream, {
                        nonce: options.nonce
                    }));
                    return [
                        2,
                        {
                            stream: responseStream,
                            status: status
                        }
                    ];
            }
        });
    });
}


},
563
/*!*************************************************!*\
  !*** ../arui-scripts-server/build/rsc/types.js ***!
  \*************************************************/
(__unused_rspack_module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.RSC_CONTENT_TYPE = exports.RSC_ACTION_HEADER = void 0;
/** Заголовок с id server action (конвенция клиента и сервера arui-scripts) */ exports.RSC_ACTION_HEADER = 'x-rsc-action';
/** Content-type RSC-стрима */ exports.RSC_CONTENT_TYPE = 'text/x-component';


},
987
/*!**********************************************************************************!*\
  !*** ./node_modules/react-dom/cjs/react-dom-server-legacy.browser.production.js ***!
  \**********************************************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";
/**
 * @license React
 * react-dom-server-legacy.browser.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /*


 JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)

 Copyright (c) 2011 Gary Court
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/ 
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var React = __webpack_require__(/*! react */ 3380), ReactDOM = __webpack_require__(/*! react-dom */ 9253);
function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
        url += "?args[]=" + encodeURIComponent(arguments[1]);
        for(var i = 2; i < arguments.length; i++)url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_SCOPE_TYPE = Symbol.for("react.scope"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden"), REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== (typeof maybeIterable === "undefined" ? "undefined" : _type_of(maybeIterable))) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
}
var isArrayImpl = Array.isArray;
function murmurhash3_32_gc(key, seed) {
    var remainder = key.length & 3;
    var bytes = key.length - remainder;
    var h1 = seed;
    for(seed = 0; seed < bytes;){
        var k1 = key.charCodeAt(seed) & 255 | (key.charCodeAt(++seed) & 255) << 8 | (key.charCodeAt(++seed) & 255) << 16 | (key.charCodeAt(++seed) & 255) << 24;
        ++seed;
        k1 = 3432918353 * (k1 & 65535) + ((3432918353 * (k1 >>> 16) & 65535) << 16) & 4294967295;
        k1 = k1 << 15 | k1 >>> 17;
        k1 = 461845907 * (k1 & 65535) + ((461845907 * (k1 >>> 16) & 65535) << 16) & 4294967295;
        h1 ^= k1;
        h1 = h1 << 13 | h1 >>> 19;
        h1 = 5 * (h1 & 65535) + ((5 * (h1 >>> 16) & 65535) << 16) & 4294967295;
        h1 = (h1 & 65535) + 27492 + (((h1 >>> 16) + 58964 & 65535) << 16);
    }
    k1 = 0;
    switch(remainder){
        case 3:
            k1 ^= (key.charCodeAt(seed + 2) & 255) << 16;
        case 2:
            k1 ^= (key.charCodeAt(seed + 1) & 255) << 8;
        case 1:
            k1 ^= key.charCodeAt(seed) & 255, k1 = 3432918353 * (k1 & 65535) + ((3432918353 * (k1 >>> 16) & 65535) << 16) & 4294967295, k1 = k1 << 15 | k1 >>> 17, h1 ^= 461845907 * (k1 & 65535) + ((461845907 * (k1 >>> 16) & 65535) << 16) & 4294967295;
    }
    h1 ^= key.length;
    h1 ^= h1 >>> 16;
    h1 = 2246822507 * (h1 & 65535) + ((2246822507 * (h1 >>> 16) & 65535) << 16) & 4294967295;
    h1 ^= h1 >>> 13;
    h1 = 3266489909 * (h1 & 65535) + ((3266489909 * (h1 >>> 16) & 65535) << 16) & 4294967295;
    return (h1 ^ h1 >>> 16) >>> 0;
}
var assign = Object.assign, hasOwnProperty = Object.prototype.hasOwnProperty, VALID_ATTRIBUTE_NAME_REGEX = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), illegalAttributeNameCache = {}, validatedAttributeNameCache = {};
function isAttributeNameSafe(attributeName) {
    if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) return !0;
    if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
    if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) return validatedAttributeNameCache[attributeName] = !0;
    illegalAttributeNameCache[attributeName] = !0;
    return !1;
}
var unitlessNumbers = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" ")), aliases = new Map([
    [
        "acceptCharset",
        "accept-charset"
    ],
    [
        "htmlFor",
        "for"
    ],
    [
        "httpEquiv",
        "http-equiv"
    ],
    [
        "crossOrigin",
        "crossorigin"
    ],
    [
        "accentHeight",
        "accent-height"
    ],
    [
        "alignmentBaseline",
        "alignment-baseline"
    ],
    [
        "arabicForm",
        "arabic-form"
    ],
    [
        "baselineShift",
        "baseline-shift"
    ],
    [
        "capHeight",
        "cap-height"
    ],
    [
        "clipPath",
        "clip-path"
    ],
    [
        "clipRule",
        "clip-rule"
    ],
    [
        "colorInterpolation",
        "color-interpolation"
    ],
    [
        "colorInterpolationFilters",
        "color-interpolation-filters"
    ],
    [
        "colorProfile",
        "color-profile"
    ],
    [
        "colorRendering",
        "color-rendering"
    ],
    [
        "dominantBaseline",
        "dominant-baseline"
    ],
    [
        "enableBackground",
        "enable-background"
    ],
    [
        "fillOpacity",
        "fill-opacity"
    ],
    [
        "fillRule",
        "fill-rule"
    ],
    [
        "floodColor",
        "flood-color"
    ],
    [
        "floodOpacity",
        "flood-opacity"
    ],
    [
        "fontFamily",
        "font-family"
    ],
    [
        "fontSize",
        "font-size"
    ],
    [
        "fontSizeAdjust",
        "font-size-adjust"
    ],
    [
        "fontStretch",
        "font-stretch"
    ],
    [
        "fontStyle",
        "font-style"
    ],
    [
        "fontVariant",
        "font-variant"
    ],
    [
        "fontWeight",
        "font-weight"
    ],
    [
        "glyphName",
        "glyph-name"
    ],
    [
        "glyphOrientationHorizontal",
        "glyph-orientation-horizontal"
    ],
    [
        "glyphOrientationVertical",
        "glyph-orientation-vertical"
    ],
    [
        "horizAdvX",
        "horiz-adv-x"
    ],
    [
        "horizOriginX",
        "horiz-origin-x"
    ],
    [
        "imageRendering",
        "image-rendering"
    ],
    [
        "letterSpacing",
        "letter-spacing"
    ],
    [
        "lightingColor",
        "lighting-color"
    ],
    [
        "markerEnd",
        "marker-end"
    ],
    [
        "markerMid",
        "marker-mid"
    ],
    [
        "markerStart",
        "marker-start"
    ],
    [
        "overlinePosition",
        "overline-position"
    ],
    [
        "overlineThickness",
        "overline-thickness"
    ],
    [
        "paintOrder",
        "paint-order"
    ],
    [
        "panose-1",
        "panose-1"
    ],
    [
        "pointerEvents",
        "pointer-events"
    ],
    [
        "renderingIntent",
        "rendering-intent"
    ],
    [
        "shapeRendering",
        "shape-rendering"
    ],
    [
        "stopColor",
        "stop-color"
    ],
    [
        "stopOpacity",
        "stop-opacity"
    ],
    [
        "strikethroughPosition",
        "strikethrough-position"
    ],
    [
        "strikethroughThickness",
        "strikethrough-thickness"
    ],
    [
        "strokeDasharray",
        "stroke-dasharray"
    ],
    [
        "strokeDashoffset",
        "stroke-dashoffset"
    ],
    [
        "strokeLinecap",
        "stroke-linecap"
    ],
    [
        "strokeLinejoin",
        "stroke-linejoin"
    ],
    [
        "strokeMiterlimit",
        "stroke-miterlimit"
    ],
    [
        "strokeOpacity",
        "stroke-opacity"
    ],
    [
        "strokeWidth",
        "stroke-width"
    ],
    [
        "textAnchor",
        "text-anchor"
    ],
    [
        "textDecoration",
        "text-decoration"
    ],
    [
        "textRendering",
        "text-rendering"
    ],
    [
        "transformOrigin",
        "transform-origin"
    ],
    [
        "underlinePosition",
        "underline-position"
    ],
    [
        "underlineThickness",
        "underline-thickness"
    ],
    [
        "unicodeBidi",
        "unicode-bidi"
    ],
    [
        "unicodeRange",
        "unicode-range"
    ],
    [
        "unitsPerEm",
        "units-per-em"
    ],
    [
        "vAlphabetic",
        "v-alphabetic"
    ],
    [
        "vHanging",
        "v-hanging"
    ],
    [
        "vIdeographic",
        "v-ideographic"
    ],
    [
        "vMathematical",
        "v-mathematical"
    ],
    [
        "vectorEffect",
        "vector-effect"
    ],
    [
        "vertAdvY",
        "vert-adv-y"
    ],
    [
        "vertOriginX",
        "vert-origin-x"
    ],
    [
        "vertOriginY",
        "vert-origin-y"
    ],
    [
        "wordSpacing",
        "word-spacing"
    ],
    [
        "writingMode",
        "writing-mode"
    ],
    [
        "xmlnsXlink",
        "xmlns:xlink"
    ],
    [
        "xHeight",
        "x-height"
    ]
]), matchHtmlRegExp = /["'&<>]/;
function escapeTextForBrowser(text) {
    if ("boolean" === typeof text || "number" === typeof text || "bigint" === (typeof text === "undefined" ? "undefined" : _type_of(text))) return "" + text;
    text = "" + text;
    var match = matchHtmlRegExp.exec(text);
    if (match) {
        var html = "", index, lastIndex = 0;
        for(index = match.index; index < text.length; index++){
            switch(text.charCodeAt(index)){
                case 34:
                    match = "&quot;";
                    break;
                case 38:
                    match = "&amp;";
                    break;
                case 39:
                    match = "&#x27;";
                    break;
                case 60:
                    match = "&lt;";
                    break;
                case 62:
                    match = "&gt;";
                    break;
                default:
                    continue;
            }
            lastIndex !== index && (html += text.slice(lastIndex, index));
            lastIndex = index + 1;
            html += match;
        }
        text = lastIndex !== index ? html + text.slice(lastIndex, index) : html;
    }
    return text;
}
var uppercasePattern = /([A-Z])/g, msPattern = /^ms-/, isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
function sanitizeURL(url) {
    return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
}
var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, sharedNotPendingObject = {
    pending: !1,
    data: null,
    method: null,
    action: null
}, previousDispatcher = ReactDOMSharedInternals.d;
ReactDOMSharedInternals.d = {
    f: previousDispatcher.f,
    r: previousDispatcher.r,
    D: prefetchDNS,
    C: preconnect,
    L: preload,
    m: preloadModule,
    X: preinitScript,
    S: preinitStyle,
    M: preinitModuleScript
};
var PRELOAD_NO_CREDS = [], currentlyFlushingRenderState = null, scriptRegex = /(<\/|<)(s)(cript)/gi;
function scriptReplacer(match, prefix, s, suffix) {
    return "" + prefix + ("s" === s ? "\\u0073" : "\\u0053") + suffix;
}
function createResumableState(identifierPrefix, externalRuntimeConfig, bootstrapScriptContent, bootstrapScripts, bootstrapModules) {
    return {
        idPrefix: void 0 === identifierPrefix ? "" : identifierPrefix,
        nextFormID: 0,
        streamingFormat: 0,
        bootstrapScriptContent: bootstrapScriptContent,
        bootstrapScripts: bootstrapScripts,
        bootstrapModules: bootstrapModules,
        instructions: 0,
        hasBody: !1,
        hasHtml: !1,
        unknownResources: {},
        dnsResources: {},
        connectResources: {
            default: {},
            anonymous: {},
            credentials: {}
        },
        imageResources: {},
        styleResources: {},
        scriptResources: {},
        moduleUnknownResources: {},
        moduleScriptResources: {}
    };
}
function createFormatContext(insertionMode, selectedValue, tagScope, viewTransition) {
    return {
        insertionMode: insertionMode,
        selectedValue: selectedValue,
        tagScope: tagScope,
        viewTransition: viewTransition
    };
}
function getChildFormatContext(parentContext, type, props) {
    var subtreeScope = parentContext.tagScope & -25;
    switch(type){
        case "noscript":
            return createFormatContext(2, null, subtreeScope | 1, null);
        case "select":
            return createFormatContext(2, null != props.value ? props.value : props.defaultValue, subtreeScope, null);
        case "svg":
            return createFormatContext(4, null, subtreeScope, null);
        case "picture":
            return createFormatContext(2, null, subtreeScope | 2, null);
        case "math":
            return createFormatContext(5, null, subtreeScope, null);
        case "foreignObject":
            return createFormatContext(2, null, subtreeScope, null);
        case "table":
            return createFormatContext(6, null, subtreeScope, null);
        case "thead":
        case "tbody":
        case "tfoot":
            return createFormatContext(7, null, subtreeScope, null);
        case "colgroup":
            return createFormatContext(9, null, subtreeScope, null);
        case "tr":
            return createFormatContext(8, null, subtreeScope, null);
        case "head":
            if (2 > parentContext.insertionMode) return createFormatContext(3, null, subtreeScope, null);
            break;
        case "html":
            if (0 === parentContext.insertionMode) return createFormatContext(1, null, subtreeScope, null);
    }
    return 6 <= parentContext.insertionMode || 2 > parentContext.insertionMode ? createFormatContext(2, null, subtreeScope, null) : parentContext.tagScope !== subtreeScope ? createFormatContext(parentContext.insertionMode, parentContext.selectedValue, subtreeScope, null) : parentContext;
}
function getSuspenseViewTransition(parentViewTransition) {
    return null === parentViewTransition ? null : {
        update: parentViewTransition.update,
        enter: "none",
        exit: "none",
        share: parentViewTransition.update,
        name: parentViewTransition.autoName,
        autoName: parentViewTransition.autoName,
        nameIdx: 0
    };
}
function getSuspenseFallbackFormatContext(resumableState, parentContext) {
    parentContext.tagScope & 32 && (resumableState.instructions |= 128);
    return createFormatContext(parentContext.insertionMode, parentContext.selectedValue, parentContext.tagScope | 12, getSuspenseViewTransition(parentContext.viewTransition));
}
function getSuspenseContentFormatContext(resumableState, parentContext) {
    resumableState = getSuspenseViewTransition(parentContext.viewTransition);
    var subtreeScope = parentContext.tagScope | 16;
    null !== resumableState && "none" !== resumableState.share && (subtreeScope |= 64);
    return createFormatContext(parentContext.insertionMode, parentContext.selectedValue, subtreeScope, resumableState);
}
var styleNameCache = new Map();
function pushStyleAttribute(target, style) {
    if ("object" !== (typeof style === "undefined" ? "undefined" : _type_of(style))) throw Error(formatProdErrorMessage(62));
    var isFirst = !0, styleName;
    for(styleName in style)if (hasOwnProperty.call(style, styleName)) {
        var styleValue = style[styleName];
        if (null != styleValue && "boolean" !== typeof styleValue && "" !== styleValue) {
            if (0 === styleName.indexOf("--")) {
                var nameChunk = escapeTextForBrowser(styleName);
                styleValue = escapeTextForBrowser(("" + styleValue).trim());
            } else nameChunk = styleNameCache.get(styleName), void 0 === nameChunk && (nameChunk = escapeTextForBrowser(styleName.replace(uppercasePattern, "-$1").toLowerCase().replace(msPattern, "-ms-")), styleNameCache.set(styleName, nameChunk)), styleValue = "number" === typeof styleValue ? 0 === styleValue || unitlessNumbers.has(styleName) ? "" + styleValue : styleValue + "px" : escapeTextForBrowser(("" + styleValue).trim());
            isFirst ? (isFirst = !1, target.push(' style="', nameChunk, ":", styleValue)) : target.push(";", nameChunk, ":", styleValue);
        }
    }
    isFirst || target.push('"');
}
function pushBooleanAttribute(target, name, value) {
    value && "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && target.push(" ", name, '=""');
}
function pushStringAttribute(target, name, value) {
    "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && "boolean" !== typeof value && target.push(" ", name, '="', escapeTextForBrowser(value), '"');
}
var actionJavaScriptURL = escapeTextForBrowser("javascript:throw new Error('React form unexpectedly submitted.')");
function pushAdditionalFormField(value, key) {
    this.push('<input type="hidden"');
    validateAdditionalFormField(value);
    pushStringAttribute(this, "name", key);
    pushStringAttribute(this, "value", value);
    this.push("/>");
}
function validateAdditionalFormField(value) {
    if ("string" !== typeof value) throw Error(formatProdErrorMessage(480));
}
function getCustomFormFields(resumableState, formAction) {
    if ("function" === typeof formAction.$$FORM_ACTION) {
        var id = resumableState.nextFormID++;
        resumableState = resumableState.idPrefix + id;
        try {
            var customFields = formAction.$$FORM_ACTION(resumableState);
            if (customFields) {
                var formData = customFields.data;
                null != formData && formData.forEach(validateAdditionalFormField);
            }
            return customFields;
        } catch (x) {
            if ("object" === (typeof x === "undefined" ? "undefined" : _type_of(x)) && null !== x && "function" === typeof x.then) throw x;
        }
    }
    return null;
}
function pushFormActionAttribute(target, resumableState, renderState, formAction, formEncType, formMethod, formTarget, name) {
    var formData = null;
    if ("function" === typeof formAction) {
        var customFields = getCustomFormFields(resumableState, formAction);
        null !== customFields ? (name = customFields.name, formAction = customFields.action || "", formEncType = customFields.encType, formMethod = customFields.method, formTarget = customFields.target, formData = customFields.data) : (target.push(" ", "formAction", '="', actionJavaScriptURL, '"'), formTarget = formMethod = formEncType = formAction = name = null, injectFormReplayingRuntime(resumableState, renderState));
    }
    null != name && pushAttribute(target, "name", name);
    null != formAction && pushAttribute(target, "formAction", formAction);
    null != formEncType && pushAttribute(target, "formEncType", formEncType);
    null != formMethod && pushAttribute(target, "formMethod", formMethod);
    null != formTarget && pushAttribute(target, "formTarget", formTarget);
    return formData;
}
function pushAttribute(target, name, value) {
    switch(name){
        case "className":
            pushStringAttribute(target, "class", value);
            break;
        case "tabIndex":
            pushStringAttribute(target, "tabindex", value);
            break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
            pushStringAttribute(target, name, value);
            break;
        case "style":
            pushStyleAttribute(target, value);
            break;
        case "src":
        case "href":
            if ("" === value) break;
        case "action":
        case "formAction":
            if (null == value || "function" === typeof value || "symbol" === (typeof value === "undefined" ? "undefined" : _type_of(value)) || "boolean" === typeof value) break;
            value = sanitizeURL("" + value);
            target.push(" ", name, '="', escapeTextForBrowser(value), '"');
            break;
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "ref":
            break;
        case "autoFocus":
        case "multiple":
        case "muted":
            pushBooleanAttribute(target, name.toLowerCase(), value);
            break;
        case "xlinkHref":
            if ("function" === typeof value || "symbol" === (typeof value === "undefined" ? "undefined" : _type_of(value)) || "boolean" === typeof value) break;
            value = sanitizeURL("" + value);
            target.push(" ", "xlink:href", '="', escapeTextForBrowser(value), '"');
            break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
            "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && target.push(" ", name, '="', escapeTextForBrowser(value), '"');
            break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
            value && "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && target.push(" ", name, '=""');
            break;
        case "capture":
        case "download":
            !0 === value ? target.push(" ", name, '=""') : !1 !== value && "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && target.push(" ", name, '="', escapeTextForBrowser(value), '"');
            break;
        case "cols":
        case "rows":
        case "size":
        case "span":
            "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && !isNaN(value) && 1 <= value && target.push(" ", name, '="', escapeTextForBrowser(value), '"');
            break;
        case "rowSpan":
        case "start":
            "function" === typeof value || "symbol" === (typeof value === "undefined" ? "undefined" : _type_of(value)) || isNaN(value) || target.push(" ", name, '="', escapeTextForBrowser(value), '"');
            break;
        case "xlinkActuate":
            pushStringAttribute(target, "xlink:actuate", value);
            break;
        case "xlinkArcrole":
            pushStringAttribute(target, "xlink:arcrole", value);
            break;
        case "xlinkRole":
            pushStringAttribute(target, "xlink:role", value);
            break;
        case "xlinkShow":
            pushStringAttribute(target, "xlink:show", value);
            break;
        case "xlinkTitle":
            pushStringAttribute(target, "xlink:title", value);
            break;
        case "xlinkType":
            pushStringAttribute(target, "xlink:type", value);
            break;
        case "xmlBase":
            pushStringAttribute(target, "xml:base", value);
            break;
        case "xmlLang":
            pushStringAttribute(target, "xml:lang", value);
            break;
        case "xmlSpace":
            pushStringAttribute(target, "xml:space", value);
            break;
        default:
            if (!(2 < name.length) || "o" !== name[0] && "O" !== name[0] || "n" !== name[1] && "N" !== name[1]) {
                if (name = aliases.get(name) || name, isAttributeNameSafe(name)) {
                    switch(typeof value === "undefined" ? "undefined" : _type_of(value)){
                        case "function":
                        case "symbol":
                            return;
                        case "boolean":
                            var prefix$8 = name.toLowerCase().slice(0, 5);
                            if ("data-" !== prefix$8 && "aria-" !== prefix$8) return;
                    }
                    target.push(" ", name, '="', escapeTextForBrowser(value), '"');
                }
            }
    }
}
function pushInnerHTML(target, innerHTML, children) {
    if (null != innerHTML) {
        if (null != children) throw Error(formatProdErrorMessage(60));
        if ("object" !== (typeof innerHTML === "undefined" ? "undefined" : _type_of(innerHTML)) || !("__html" in innerHTML)) throw Error(formatProdErrorMessage(61));
        innerHTML = innerHTML.__html;
        null !== innerHTML && void 0 !== innerHTML && target.push("" + innerHTML);
    }
}
function flattenOptionChildren(children) {
    var content = "";
    React.Children.forEach(children, function(child) {
        null != child && (content += child);
    });
    return content;
}
function injectFormReplayingRuntime(resumableState, renderState) {
    if (0 === (resumableState.instructions & 16)) {
        resumableState.instructions |= 16;
        var preamble = renderState.preamble, bootstrapChunks = renderState.bootstrapChunks;
        (preamble.htmlChunks || preamble.headChunks) && 0 === bootstrapChunks.length ? (bootstrapChunks.push(renderState.startInlineScript), pushCompletedShellIdAttribute(bootstrapChunks, resumableState), bootstrapChunks.push(">", 'addEventListener("submit",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute("formAction");null!=f&&(e=f,b=null)}"javascript:throw new Error(\'React form unexpectedly submitted.\')"===e&&(a.preventDefault(),b?(a=document.createElement("input"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});', "\x3c/script>")) : bootstrapChunks.unshift(renderState.startInlineScript, ">", 'addEventListener("submit",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute("formAction");null!=f&&(e=f,b=null)}"javascript:throw new Error(\'React form unexpectedly submitted.\')"===e&&(a.preventDefault(),b?(a=document.createElement("input"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});', "\x3c/script>");
    }
}
function pushLinkImpl(target, props) {
    target.push(startChunkForTag("link"));
    for(var propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
            case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(399, "link"));
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push("/>");
    return null;
}
var styleRegex = /(<\/|<)(s)(tyle)/gi;
function styleReplacer(match, prefix, s, suffix) {
    return "" + prefix + ("s" === s ? "\\73 " : "\\53 ") + suffix;
}
function pushSelfClosing(target, props, tag) {
    target.push(startChunkForTag(tag));
    for(var propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
            case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(399, tag));
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push("/>");
    return null;
}
function pushTitleImpl(target, props) {
    target.push(startChunkForTag("title"));
    var children = null, innerHTML = null, propKey;
    for(propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
                children = propValue;
                break;
            case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push(">");
    props = Array.isArray(children) ? 2 > children.length ? children[0] : null : children;
    "function" !== typeof props && "symbol" !== (typeof props === "undefined" ? "undefined" : _type_of(props)) && null !== props && void 0 !== props && target.push(escapeTextForBrowser("" + props));
    pushInnerHTML(target, innerHTML, children);
    target.push(endChunkForTag("title"));
    return null;
}
function pushScriptImpl(target, props) {
    target.push(startChunkForTag("script"));
    var children = null, innerHTML = null, propKey;
    for(propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
                children = propValue;
                break;
            case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push(">");
    pushInnerHTML(target, innerHTML, children);
    "string" === typeof children && target.push(("" + children).replace(scriptRegex, scriptReplacer));
    target.push(endChunkForTag("script"));
    return null;
}
function pushStartSingletonElement(target, props, tag) {
    target.push(startChunkForTag(tag));
    var innerHTML = tag = null, propKey;
    for(propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
                tag = propValue;
                break;
            case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push(">");
    pushInnerHTML(target, innerHTML, tag);
    return tag;
}
function pushStartGenericElement(target, props, tag) {
    target.push(startChunkForTag(tag));
    var innerHTML = tag = null, propKey;
    for(propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
                tag = propValue;
                break;
            case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push(">");
    pushInnerHTML(target, innerHTML, tag);
    return "string" === typeof tag ? (target.push(escapeTextForBrowser(tag)), null) : tag;
}
var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/, validatedTagCache = new Map();
function startChunkForTag(tag) {
    var tagStartChunk = validatedTagCache.get(tag);
    if (void 0 === tagStartChunk) {
        if (!VALID_TAG_REGEX.test(tag)) throw Error(formatProdErrorMessage(65, tag));
        tagStartChunk = "<" + tag;
        validatedTagCache.set(tag, tagStartChunk);
    }
    return tagStartChunk;
}
function pushStartInstance(target$jscomp$0, type, props, resumableState, renderState, preambleState, hoistableState, formatContext, textEmbedded) {
    switch(type){
        case "div":
        case "span":
        case "svg":
        case "path":
            break;
        case "a":
            target$jscomp$0.push(startChunkForTag("a"));
            var children = null, innerHTML = null, propKey;
            for(propKey in props)if (hasOwnProperty.call(props, propKey)) {
                var propValue = props[propKey];
                if (null != propValue) switch(propKey){
                    case "children":
                        children = propValue;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML = propValue;
                        break;
                    case "href":
                        "" === propValue ? pushStringAttribute(target$jscomp$0, "href", "") : pushAttribute(target$jscomp$0, propKey, propValue);
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey, propValue);
                }
            }
            target$jscomp$0.push(">");
            pushInnerHTML(target$jscomp$0, innerHTML, children);
            if ("string" === typeof children) {
                target$jscomp$0.push(escapeTextForBrowser(children));
                var JSCompiler_inline_result = null;
            } else JSCompiler_inline_result = children;
            return JSCompiler_inline_result;
        case "g":
        case "p":
        case "li":
            break;
        case "select":
            target$jscomp$0.push(startChunkForTag("select"));
            var children$jscomp$0 = null, innerHTML$jscomp$0 = null, propKey$jscomp$0;
            for(propKey$jscomp$0 in props)if (hasOwnProperty.call(props, propKey$jscomp$0)) {
                var propValue$jscomp$0 = props[propKey$jscomp$0];
                if (null != propValue$jscomp$0) switch(propKey$jscomp$0){
                    case "children":
                        children$jscomp$0 = propValue$jscomp$0;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$0 = propValue$jscomp$0;
                        break;
                    case "defaultValue":
                    case "value":
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$0, propValue$jscomp$0);
                }
            }
            target$jscomp$0.push(">");
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$0, children$jscomp$0);
            return children$jscomp$0;
        case "option":
            var selectedValue = formatContext.selectedValue;
            target$jscomp$0.push(startChunkForTag("option"));
            var children$jscomp$1 = null, value = null, selected = null, innerHTML$jscomp$1 = null, propKey$jscomp$1;
            for(propKey$jscomp$1 in props)if (hasOwnProperty.call(props, propKey$jscomp$1)) {
                var propValue$jscomp$1 = props[propKey$jscomp$1];
                if (null != propValue$jscomp$1) switch(propKey$jscomp$1){
                    case "children":
                        children$jscomp$1 = propValue$jscomp$1;
                        break;
                    case "selected":
                        selected = propValue$jscomp$1;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$1 = propValue$jscomp$1;
                        break;
                    case "value":
                        value = propValue$jscomp$1;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$1, propValue$jscomp$1);
                }
            }
            if (null != selectedValue) {
                var stringValue = null !== value ? "" + value : flattenOptionChildren(children$jscomp$1);
                if (isArrayImpl(selectedValue)) for(var i = 0; i < selectedValue.length; i++){
                    if ("" + selectedValue[i] === stringValue) {
                        target$jscomp$0.push(' selected=""');
                        break;
                    }
                }
                else "" + selectedValue === stringValue && target$jscomp$0.push(' selected=""');
            } else selected && target$jscomp$0.push(' selected=""');
            target$jscomp$0.push(">");
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$1, children$jscomp$1);
            return children$jscomp$1;
        case "textarea":
            target$jscomp$0.push(startChunkForTag("textarea"));
            var value$jscomp$0 = null, defaultValue = null, children$jscomp$2 = null, propKey$jscomp$2;
            for(propKey$jscomp$2 in props)if (hasOwnProperty.call(props, propKey$jscomp$2)) {
                var propValue$jscomp$2 = props[propKey$jscomp$2];
                if (null != propValue$jscomp$2) switch(propKey$jscomp$2){
                    case "children":
                        children$jscomp$2 = propValue$jscomp$2;
                        break;
                    case "value":
                        value$jscomp$0 = propValue$jscomp$2;
                        break;
                    case "defaultValue":
                        defaultValue = propValue$jscomp$2;
                        break;
                    case "dangerouslySetInnerHTML":
                        throw Error(formatProdErrorMessage(91));
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$2, propValue$jscomp$2);
                }
            }
            null === value$jscomp$0 && null !== defaultValue && (value$jscomp$0 = defaultValue);
            target$jscomp$0.push(">");
            if (null != children$jscomp$2) {
                if (null != value$jscomp$0) throw Error(formatProdErrorMessage(92));
                if (isArrayImpl(children$jscomp$2)) {
                    if (1 < children$jscomp$2.length) throw Error(formatProdErrorMessage(93));
                    value$jscomp$0 = "" + children$jscomp$2[0];
                }
                value$jscomp$0 = "" + children$jscomp$2;
            }
            "string" === typeof value$jscomp$0 && "\n" === value$jscomp$0[0] && target$jscomp$0.push("\n");
            null !== value$jscomp$0 && target$jscomp$0.push(escapeTextForBrowser("" + value$jscomp$0));
            return null;
        case "input":
            target$jscomp$0.push(startChunkForTag("input"));
            var name = null, formAction = null, formEncType = null, formMethod = null, formTarget = null, value$jscomp$1 = null, defaultValue$jscomp$0 = null, checked = null, defaultChecked = null, propKey$jscomp$3;
            for(propKey$jscomp$3 in props)if (hasOwnProperty.call(props, propKey$jscomp$3)) {
                var propValue$jscomp$3 = props[propKey$jscomp$3];
                if (null != propValue$jscomp$3) switch(propKey$jscomp$3){
                    case "children":
                    case "dangerouslySetInnerHTML":
                        throw Error(formatProdErrorMessage(399, "input"));
                    case "name":
                        name = propValue$jscomp$3;
                        break;
                    case "formAction":
                        formAction = propValue$jscomp$3;
                        break;
                    case "formEncType":
                        formEncType = propValue$jscomp$3;
                        break;
                    case "formMethod":
                        formMethod = propValue$jscomp$3;
                        break;
                    case "formTarget":
                        formTarget = propValue$jscomp$3;
                        break;
                    case "defaultChecked":
                        defaultChecked = propValue$jscomp$3;
                        break;
                    case "defaultValue":
                        defaultValue$jscomp$0 = propValue$jscomp$3;
                        break;
                    case "checked":
                        checked = propValue$jscomp$3;
                        break;
                    case "value":
                        value$jscomp$1 = propValue$jscomp$3;
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$3, propValue$jscomp$3);
                }
            }
            var formData = pushFormActionAttribute(target$jscomp$0, resumableState, renderState, formAction, formEncType, formMethod, formTarget, name);
            null !== checked ? pushBooleanAttribute(target$jscomp$0, "checked", checked) : null !== defaultChecked && pushBooleanAttribute(target$jscomp$0, "checked", defaultChecked);
            null !== value$jscomp$1 ? pushAttribute(target$jscomp$0, "value", value$jscomp$1) : null !== defaultValue$jscomp$0 && pushAttribute(target$jscomp$0, "value", defaultValue$jscomp$0);
            target$jscomp$0.push("/>");
            null != formData && formData.forEach(pushAdditionalFormField, target$jscomp$0);
            return null;
        case "button":
            target$jscomp$0.push(startChunkForTag("button"));
            var children$jscomp$3 = null, innerHTML$jscomp$2 = null, name$jscomp$0 = null, formAction$jscomp$0 = null, formEncType$jscomp$0 = null, formMethod$jscomp$0 = null, formTarget$jscomp$0 = null, propKey$jscomp$4;
            for(propKey$jscomp$4 in props)if (hasOwnProperty.call(props, propKey$jscomp$4)) {
                var propValue$jscomp$4 = props[propKey$jscomp$4];
                if (null != propValue$jscomp$4) switch(propKey$jscomp$4){
                    case "children":
                        children$jscomp$3 = propValue$jscomp$4;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$2 = propValue$jscomp$4;
                        break;
                    case "name":
                        name$jscomp$0 = propValue$jscomp$4;
                        break;
                    case "formAction":
                        formAction$jscomp$0 = propValue$jscomp$4;
                        break;
                    case "formEncType":
                        formEncType$jscomp$0 = propValue$jscomp$4;
                        break;
                    case "formMethod":
                        formMethod$jscomp$0 = propValue$jscomp$4;
                        break;
                    case "formTarget":
                        formTarget$jscomp$0 = propValue$jscomp$4;
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$4, propValue$jscomp$4);
                }
            }
            var formData$jscomp$0 = pushFormActionAttribute(target$jscomp$0, resumableState, renderState, formAction$jscomp$0, formEncType$jscomp$0, formMethod$jscomp$0, formTarget$jscomp$0, name$jscomp$0);
            target$jscomp$0.push(">");
            null != formData$jscomp$0 && formData$jscomp$0.forEach(pushAdditionalFormField, target$jscomp$0);
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$2, children$jscomp$3);
            if ("string" === typeof children$jscomp$3) {
                target$jscomp$0.push(escapeTextForBrowser(children$jscomp$3));
                var JSCompiler_inline_result$jscomp$0 = null;
            } else JSCompiler_inline_result$jscomp$0 = children$jscomp$3;
            return JSCompiler_inline_result$jscomp$0;
        case "form":
            target$jscomp$0.push(startChunkForTag("form"));
            var children$jscomp$4 = null, innerHTML$jscomp$3 = null, formAction$jscomp$1 = null, formEncType$jscomp$1 = null, formMethod$jscomp$1 = null, formTarget$jscomp$1 = null, propKey$jscomp$5;
            for(propKey$jscomp$5 in props)if (hasOwnProperty.call(props, propKey$jscomp$5)) {
                var propValue$jscomp$5 = props[propKey$jscomp$5];
                if (null != propValue$jscomp$5) switch(propKey$jscomp$5){
                    case "children":
                        children$jscomp$4 = propValue$jscomp$5;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$3 = propValue$jscomp$5;
                        break;
                    case "action":
                        formAction$jscomp$1 = propValue$jscomp$5;
                        break;
                    case "encType":
                        formEncType$jscomp$1 = propValue$jscomp$5;
                        break;
                    case "method":
                        formMethod$jscomp$1 = propValue$jscomp$5;
                        break;
                    case "target":
                        formTarget$jscomp$1 = propValue$jscomp$5;
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$5, propValue$jscomp$5);
                }
            }
            var formData$jscomp$1 = null, formActionName = null;
            if ("function" === typeof formAction$jscomp$1) {
                var customFields = getCustomFormFields(resumableState, formAction$jscomp$1);
                null !== customFields ? (formAction$jscomp$1 = customFields.action || "", formEncType$jscomp$1 = customFields.encType, formMethod$jscomp$1 = customFields.method, formTarget$jscomp$1 = customFields.target, formData$jscomp$1 = customFields.data, formActionName = customFields.name) : (target$jscomp$0.push(" ", "action", '="', actionJavaScriptURL, '"'), formTarget$jscomp$1 = formMethod$jscomp$1 = formEncType$jscomp$1 = formAction$jscomp$1 = null, injectFormReplayingRuntime(resumableState, renderState));
            }
            null != formAction$jscomp$1 && pushAttribute(target$jscomp$0, "action", formAction$jscomp$1);
            null != formEncType$jscomp$1 && pushAttribute(target$jscomp$0, "encType", formEncType$jscomp$1);
            null != formMethod$jscomp$1 && pushAttribute(target$jscomp$0, "method", formMethod$jscomp$1);
            null != formTarget$jscomp$1 && pushAttribute(target$jscomp$0, "target", formTarget$jscomp$1);
            target$jscomp$0.push(">");
            null !== formActionName && (target$jscomp$0.push('<input type="hidden"'), pushStringAttribute(target$jscomp$0, "name", formActionName), target$jscomp$0.push("/>"), null != formData$jscomp$1 && formData$jscomp$1.forEach(pushAdditionalFormField, target$jscomp$0));
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$3, children$jscomp$4);
            if ("string" === typeof children$jscomp$4) {
                target$jscomp$0.push(escapeTextForBrowser(children$jscomp$4));
                var JSCompiler_inline_result$jscomp$1 = null;
            } else JSCompiler_inline_result$jscomp$1 = children$jscomp$4;
            return JSCompiler_inline_result$jscomp$1;
        case "menuitem":
            target$jscomp$0.push(startChunkForTag("menuitem"));
            for(var propKey$jscomp$6 in props)if (hasOwnProperty.call(props, propKey$jscomp$6)) {
                var propValue$jscomp$6 = props[propKey$jscomp$6];
                if (null != propValue$jscomp$6) switch(propKey$jscomp$6){
                    case "children":
                    case "dangerouslySetInnerHTML":
                        throw Error(formatProdErrorMessage(400));
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$6, propValue$jscomp$6);
                }
            }
            target$jscomp$0.push(">");
            return null;
        case "object":
            target$jscomp$0.push(startChunkForTag("object"));
            var children$jscomp$5 = null, innerHTML$jscomp$4 = null, propKey$jscomp$7;
            for(propKey$jscomp$7 in props)if (hasOwnProperty.call(props, propKey$jscomp$7)) {
                var propValue$jscomp$7 = props[propKey$jscomp$7];
                if (null != propValue$jscomp$7) switch(propKey$jscomp$7){
                    case "children":
                        children$jscomp$5 = propValue$jscomp$7;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$4 = propValue$jscomp$7;
                        break;
                    case "data":
                        var sanitizedValue = sanitizeURL("" + propValue$jscomp$7);
                        if ("" === sanitizedValue) break;
                        target$jscomp$0.push(" ", "data", '="', escapeTextForBrowser(sanitizedValue), '"');
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$7, propValue$jscomp$7);
                }
            }
            target$jscomp$0.push(">");
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$4, children$jscomp$5);
            if ("string" === typeof children$jscomp$5) {
                target$jscomp$0.push(escapeTextForBrowser(children$jscomp$5));
                var JSCompiler_inline_result$jscomp$2 = null;
            } else JSCompiler_inline_result$jscomp$2 = children$jscomp$5;
            return JSCompiler_inline_result$jscomp$2;
        case "title":
            var noscriptTagInScope = formatContext.tagScope & 1, isFallback = formatContext.tagScope & 4;
            if (4 === formatContext.insertionMode || noscriptTagInScope || null != props.itemProp) var JSCompiler_inline_result$jscomp$3 = pushTitleImpl(target$jscomp$0, props);
            else isFallback ? JSCompiler_inline_result$jscomp$3 = null : (pushTitleImpl(renderState.hoistableChunks, props), JSCompiler_inline_result$jscomp$3 = void 0);
            return JSCompiler_inline_result$jscomp$3;
        case "link":
            var noscriptTagInScope$jscomp$0 = formatContext.tagScope & 1, isFallback$jscomp$0 = formatContext.tagScope & 4, rel = props.rel, href = props.href, precedence = props.precedence;
            if (4 === formatContext.insertionMode || noscriptTagInScope$jscomp$0 || null != props.itemProp || "string" !== typeof rel || "string" !== typeof href || "" === href) {
                pushLinkImpl(target$jscomp$0, props);
                var JSCompiler_inline_result$jscomp$4 = null;
            } else if ("stylesheet" === props.rel) if ("string" !== typeof precedence || null != props.disabled || props.onLoad || props.onError) JSCompiler_inline_result$jscomp$4 = pushLinkImpl(target$jscomp$0, props);
            else {
                var styleQueue = renderState.styles.get(precedence), resourceState = resumableState.styleResources.hasOwnProperty(href) ? resumableState.styleResources[href] : void 0;
                if (null !== resourceState) {
                    resumableState.styleResources[href] = null;
                    styleQueue || (styleQueue = {
                        precedence: escapeTextForBrowser(precedence),
                        rules: [],
                        hrefs: [],
                        sheets: new Map()
                    }, renderState.styles.set(precedence, styleQueue));
                    var resource = {
                        state: 0,
                        props: assign({}, props, {
                            "data-precedence": props.precedence,
                            precedence: null
                        })
                    };
                    if (resourceState) {
                        2 === resourceState.length && adoptPreloadCredentials(resource.props, resourceState);
                        var preloadResource = renderState.preloads.stylesheets.get(href);
                        preloadResource && 0 < preloadResource.length ? preloadResource.length = 0 : resource.state = 1;
                    }
                    styleQueue.sheets.set(href, resource);
                    hoistableState && hoistableState.stylesheets.add(resource);
                } else if (styleQueue) {
                    var resource$9 = styleQueue.sheets.get(href);
                    resource$9 && hoistableState && hoistableState.stylesheets.add(resource$9);
                }
                textEmbedded && target$jscomp$0.push("\x3c!-- --\x3e");
                JSCompiler_inline_result$jscomp$4 = null;
            }
            else props.onLoad || props.onError ? JSCompiler_inline_result$jscomp$4 = pushLinkImpl(target$jscomp$0, props) : (textEmbedded && target$jscomp$0.push("\x3c!-- --\x3e"), JSCompiler_inline_result$jscomp$4 = isFallback$jscomp$0 ? null : pushLinkImpl(renderState.hoistableChunks, props));
            return JSCompiler_inline_result$jscomp$4;
        case "script":
            var noscriptTagInScope$jscomp$1 = formatContext.tagScope & 1, asyncProp = props.async;
            if ("string" !== typeof props.src || !props.src || !asyncProp || "function" === typeof asyncProp || "symbol" === (typeof asyncProp === "undefined" ? "undefined" : _type_of(asyncProp)) || props.onLoad || props.onError || 4 === formatContext.insertionMode || noscriptTagInScope$jscomp$1 || null != props.itemProp) var JSCompiler_inline_result$jscomp$5 = pushScriptImpl(target$jscomp$0, props);
            else {
                var key = props.src;
                if ("module" === props.type) {
                    var resources = resumableState.moduleScriptResources;
                    var preloads = renderState.preloads.moduleScripts;
                } else resources = resumableState.scriptResources, preloads = renderState.preloads.scripts;
                var resourceState$jscomp$0 = resources.hasOwnProperty(key) ? resources[key] : void 0;
                if (null !== resourceState$jscomp$0) {
                    resources[key] = null;
                    var scriptProps = props;
                    if (resourceState$jscomp$0) {
                        2 === resourceState$jscomp$0.length && (scriptProps = assign({}, props), adoptPreloadCredentials(scriptProps, resourceState$jscomp$0));
                        var preloadResource$jscomp$0 = preloads.get(key);
                        preloadResource$jscomp$0 && (preloadResource$jscomp$0.length = 0);
                    }
                    var resource$jscomp$0 = [];
                    renderState.scripts.add(resource$jscomp$0);
                    pushScriptImpl(resource$jscomp$0, scriptProps);
                }
                textEmbedded && target$jscomp$0.push("\x3c!-- --\x3e");
                JSCompiler_inline_result$jscomp$5 = null;
            }
            return JSCompiler_inline_result$jscomp$5;
        case "style":
            var noscriptTagInScope$jscomp$2 = formatContext.tagScope & 1, precedence$jscomp$0 = props.precedence, href$jscomp$0 = props.href, nonce = props.nonce;
            if (4 === formatContext.insertionMode || noscriptTagInScope$jscomp$2 || null != props.itemProp || "string" !== typeof precedence$jscomp$0 || "string" !== typeof href$jscomp$0 || "" === href$jscomp$0) {
                target$jscomp$0.push(startChunkForTag("style"));
                var children$jscomp$6 = null, innerHTML$jscomp$5 = null, propKey$jscomp$8;
                for(propKey$jscomp$8 in props)if (hasOwnProperty.call(props, propKey$jscomp$8)) {
                    var propValue$jscomp$8 = props[propKey$jscomp$8];
                    if (null != propValue$jscomp$8) switch(propKey$jscomp$8){
                        case "children":
                            children$jscomp$6 = propValue$jscomp$8;
                            break;
                        case "dangerouslySetInnerHTML":
                            innerHTML$jscomp$5 = propValue$jscomp$8;
                            break;
                        default:
                            pushAttribute(target$jscomp$0, propKey$jscomp$8, propValue$jscomp$8);
                    }
                }
                target$jscomp$0.push(">");
                var child = Array.isArray(children$jscomp$6) ? 2 > children$jscomp$6.length ? children$jscomp$6[0] : null : children$jscomp$6;
                "function" !== typeof child && "symbol" !== (typeof child === "undefined" ? "undefined" : _type_of(child)) && null !== child && void 0 !== child && target$jscomp$0.push(("" + child).replace(styleRegex, styleReplacer));
                pushInnerHTML(target$jscomp$0, innerHTML$jscomp$5, children$jscomp$6);
                target$jscomp$0.push(endChunkForTag("style"));
                var JSCompiler_inline_result$jscomp$6 = null;
            } else {
                var styleQueue$jscomp$0 = renderState.styles.get(precedence$jscomp$0);
                if (null !== (resumableState.styleResources.hasOwnProperty(href$jscomp$0) ? resumableState.styleResources[href$jscomp$0] : void 0)) {
                    resumableState.styleResources[href$jscomp$0] = null;
                    styleQueue$jscomp$0 || (styleQueue$jscomp$0 = {
                        precedence: escapeTextForBrowser(precedence$jscomp$0),
                        rules: [],
                        hrefs: [],
                        sheets: new Map()
                    }, renderState.styles.set(precedence$jscomp$0, styleQueue$jscomp$0));
                    var nonceStyle = renderState.nonce.style;
                    if (!nonceStyle || nonceStyle === nonce) {
                        styleQueue$jscomp$0.hrefs.push(escapeTextForBrowser(href$jscomp$0));
                        var target = styleQueue$jscomp$0.rules, children$jscomp$7 = null, innerHTML$jscomp$6 = null, propKey$jscomp$9;
                        for(propKey$jscomp$9 in props)if (hasOwnProperty.call(props, propKey$jscomp$9)) {
                            var propValue$jscomp$9 = props[propKey$jscomp$9];
                            if (null != propValue$jscomp$9) switch(propKey$jscomp$9){
                                case "children":
                                    children$jscomp$7 = propValue$jscomp$9;
                                    break;
                                case "dangerouslySetInnerHTML":
                                    innerHTML$jscomp$6 = propValue$jscomp$9;
                            }
                        }
                        var child$jscomp$0 = Array.isArray(children$jscomp$7) ? 2 > children$jscomp$7.length ? children$jscomp$7[0] : null : children$jscomp$7;
                        "function" !== typeof child$jscomp$0 && "symbol" !== (typeof child$jscomp$0 === "undefined" ? "undefined" : _type_of(child$jscomp$0)) && null !== child$jscomp$0 && void 0 !== child$jscomp$0 && target.push(("" + child$jscomp$0).replace(styleRegex, styleReplacer));
                        pushInnerHTML(target, innerHTML$jscomp$6, children$jscomp$7);
                    }
                }
                styleQueue$jscomp$0 && hoistableState && hoistableState.styles.add(styleQueue$jscomp$0);
                textEmbedded && target$jscomp$0.push("\x3c!-- --\x3e");
                JSCompiler_inline_result$jscomp$6 = void 0;
            }
            return JSCompiler_inline_result$jscomp$6;
        case "meta":
            var noscriptTagInScope$jscomp$3 = formatContext.tagScope & 1, isFallback$jscomp$1 = formatContext.tagScope & 4;
            if (4 === formatContext.insertionMode || noscriptTagInScope$jscomp$3 || null != props.itemProp) var JSCompiler_inline_result$jscomp$7 = pushSelfClosing(target$jscomp$0, props, "meta");
            else textEmbedded && target$jscomp$0.push("\x3c!-- --\x3e"), JSCompiler_inline_result$jscomp$7 = isFallback$jscomp$1 ? null : "string" === typeof props.charSet ? pushSelfClosing(renderState.charsetChunks, props, "meta") : "viewport" === props.name ? pushSelfClosing(renderState.viewportChunks, props, "meta") : pushSelfClosing(renderState.hoistableChunks, props, "meta");
            return JSCompiler_inline_result$jscomp$7;
        case "listing":
        case "pre":
            target$jscomp$0.push(startChunkForTag(type));
            var children$jscomp$8 = null, innerHTML$jscomp$7 = null, propKey$jscomp$10;
            for(propKey$jscomp$10 in props)if (hasOwnProperty.call(props, propKey$jscomp$10)) {
                var propValue$jscomp$10 = props[propKey$jscomp$10];
                if (null != propValue$jscomp$10) switch(propKey$jscomp$10){
                    case "children":
                        children$jscomp$8 = propValue$jscomp$10;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$7 = propValue$jscomp$10;
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$10, propValue$jscomp$10);
                }
            }
            target$jscomp$0.push(">");
            if (null != innerHTML$jscomp$7) {
                if (null != children$jscomp$8) throw Error(formatProdErrorMessage(60));
                if ("object" !== (typeof innerHTML$jscomp$7 === "undefined" ? "undefined" : _type_of(innerHTML$jscomp$7)) || !("__html" in innerHTML$jscomp$7)) throw Error(formatProdErrorMessage(61));
                var html = innerHTML$jscomp$7.__html;
                null !== html && void 0 !== html && ("string" === typeof html && 0 < html.length && "\n" === html[0] ? target$jscomp$0.push("\n", html) : target$jscomp$0.push("" + html));
            }
            "string" === typeof children$jscomp$8 && "\n" === children$jscomp$8[0] && target$jscomp$0.push("\n");
            return children$jscomp$8;
        case "img":
            var pictureOrNoScriptTagInScope = formatContext.tagScope & 3, src = props.src, srcSet = props.srcSet;
            if (!("lazy" === props.loading || !src && !srcSet || "string" !== typeof src && null != src || "string" !== typeof srcSet && null != srcSet || "low" === props.fetchPriority || pictureOrNoScriptTagInScope) && ("string" !== typeof src || ":" !== src[4] || "d" !== src[0] && "D" !== src[0] || "a" !== src[1] && "A" !== src[1] || "t" !== src[2] && "T" !== src[2] || "a" !== src[3] && "A" !== src[3]) && ("string" !== typeof srcSet || ":" !== srcSet[4] || "d" !== srcSet[0] && "D" !== srcSet[0] || "a" !== srcSet[1] && "A" !== srcSet[1] || "t" !== srcSet[2] && "T" !== srcSet[2] || "a" !== srcSet[3] && "A" !== srcSet[3])) {
                null !== hoistableState && formatContext.tagScope & 64 && (hoistableState.suspenseyImages = !0);
                var sizes = "string" === typeof props.sizes ? props.sizes : void 0, key$jscomp$0 = srcSet ? srcSet + "\n" + (sizes || "") : src, promotablePreloads = renderState.preloads.images, resource$jscomp$1 = promotablePreloads.get(key$jscomp$0);
                if (resource$jscomp$1) {
                    if ("high" === props.fetchPriority || 10 > renderState.highImagePreloads.size) promotablePreloads.delete(key$jscomp$0), renderState.highImagePreloads.add(resource$jscomp$1);
                } else if (!resumableState.imageResources.hasOwnProperty(key$jscomp$0)) {
                    resumableState.imageResources[key$jscomp$0] = PRELOAD_NO_CREDS;
                    var input = props.crossOrigin;
                    var JSCompiler_inline_result$jscomp$8 = "string" === typeof input ? "use-credentials" === input ? input : "" : void 0;
                    var headers = renderState.headers, header;
                    headers && 0 < headers.remainingCapacity && "string" !== typeof props.srcSet && ("high" === props.fetchPriority || 500 > headers.highImagePreloads.length) && (header = getPreloadAsHeader(src, "image", {
                        imageSrcSet: props.srcSet,
                        imageSizes: props.sizes,
                        crossOrigin: JSCompiler_inline_result$jscomp$8,
                        integrity: props.integrity,
                        nonce: props.nonce,
                        type: props.type,
                        fetchPriority: props.fetchPriority,
                        referrerPolicy: props.refererPolicy
                    }), 0 <= (headers.remainingCapacity -= header.length + 2)) ? (renderState.resets.image[key$jscomp$0] = PRELOAD_NO_CREDS, headers.highImagePreloads && (headers.highImagePreloads += ", "), headers.highImagePreloads += header) : (resource$jscomp$1 = [], pushLinkImpl(resource$jscomp$1, {
                        rel: "preload",
                        as: "image",
                        href: srcSet ? void 0 : src,
                        imageSrcSet: srcSet,
                        imageSizes: sizes,
                        crossOrigin: JSCompiler_inline_result$jscomp$8,
                        integrity: props.integrity,
                        type: props.type,
                        fetchPriority: props.fetchPriority,
                        referrerPolicy: props.referrerPolicy
                    }), "high" === props.fetchPriority || 10 > renderState.highImagePreloads.size ? renderState.highImagePreloads.add(resource$jscomp$1) : (renderState.bulkPreloads.add(resource$jscomp$1), promotablePreloads.set(key$jscomp$0, resource$jscomp$1)));
                }
            }
            return pushSelfClosing(target$jscomp$0, props, "img");
        case "base":
        case "area":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "param":
        case "source":
        case "track":
        case "wbr":
            return pushSelfClosing(target$jscomp$0, props, type);
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
            break;
        case "head":
            if (2 > formatContext.insertionMode) {
                var preamble = preambleState || renderState.preamble;
                if (preamble.headChunks) throw Error(formatProdErrorMessage(545, "`<head>`"));
                null !== preambleState && target$jscomp$0.push("\x3c!--head--\x3e");
                preamble.headChunks = [];
                var JSCompiler_inline_result$jscomp$9 = pushStartSingletonElement(preamble.headChunks, props, "head");
            } else JSCompiler_inline_result$jscomp$9 = pushStartGenericElement(target$jscomp$0, props, "head");
            return JSCompiler_inline_result$jscomp$9;
        case "body":
            if (2 > formatContext.insertionMode) {
                var preamble$jscomp$0 = preambleState || renderState.preamble;
                if (preamble$jscomp$0.bodyChunks) throw Error(formatProdErrorMessage(545, "`<body>`"));
                null !== preambleState && target$jscomp$0.push("\x3c!--body--\x3e");
                preamble$jscomp$0.bodyChunks = [];
                var JSCompiler_inline_result$jscomp$10 = pushStartSingletonElement(preamble$jscomp$0.bodyChunks, props, "body");
            } else JSCompiler_inline_result$jscomp$10 = pushStartGenericElement(target$jscomp$0, props, "body");
            return JSCompiler_inline_result$jscomp$10;
        case "html":
            if (0 === formatContext.insertionMode) {
                var preamble$jscomp$1 = preambleState || renderState.preamble;
                if (preamble$jscomp$1.htmlChunks) throw Error(formatProdErrorMessage(545, "`<html>`"));
                null !== preambleState && target$jscomp$0.push("\x3c!--html--\x3e");
                preamble$jscomp$1.htmlChunks = [
                    ""
                ];
                var JSCompiler_inline_result$jscomp$11 = pushStartSingletonElement(preamble$jscomp$1.htmlChunks, props, "html");
            } else JSCompiler_inline_result$jscomp$11 = pushStartGenericElement(target$jscomp$0, props, "html");
            return JSCompiler_inline_result$jscomp$11;
        default:
            if (-1 !== type.indexOf("-")) {
                target$jscomp$0.push(startChunkForTag(type));
                var children$jscomp$9 = null, innerHTML$jscomp$8 = null, propKey$jscomp$11;
                for(propKey$jscomp$11 in props)if (hasOwnProperty.call(props, propKey$jscomp$11)) {
                    var propValue$jscomp$11 = props[propKey$jscomp$11];
                    if (null != propValue$jscomp$11) {
                        var attributeName = propKey$jscomp$11;
                        switch(propKey$jscomp$11){
                            case "children":
                                children$jscomp$9 = propValue$jscomp$11;
                                break;
                            case "dangerouslySetInnerHTML":
                                innerHTML$jscomp$8 = propValue$jscomp$11;
                                break;
                            case "style":
                                pushStyleAttribute(target$jscomp$0, propValue$jscomp$11);
                                break;
                            case "suppressContentEditableWarning":
                            case "suppressHydrationWarning":
                            case "ref":
                                break;
                            case "className":
                                attributeName = "class";
                            default:
                                if (isAttributeNameSafe(propKey$jscomp$11) && "function" !== typeof propValue$jscomp$11 && "symbol" !== (typeof propValue$jscomp$11 === "undefined" ? "undefined" : _type_of(propValue$jscomp$11)) && !1 !== propValue$jscomp$11) {
                                    if (!0 === propValue$jscomp$11) propValue$jscomp$11 = "";
                                    else if ("object" === (typeof propValue$jscomp$11 === "undefined" ? "undefined" : _type_of(propValue$jscomp$11))) continue;
                                    target$jscomp$0.push(" ", attributeName, '="', escapeTextForBrowser(propValue$jscomp$11), '"');
                                }
                        }
                    }
                }
                target$jscomp$0.push(">");
                pushInnerHTML(target$jscomp$0, innerHTML$jscomp$8, children$jscomp$9);
                return children$jscomp$9;
            }
    }
    return pushStartGenericElement(target$jscomp$0, props, type);
}
var endTagCache = new Map();
function endChunkForTag(tag) {
    var chunk = endTagCache.get(tag);
    void 0 === chunk && (chunk = "</" + tag + ">", endTagCache.set(tag, chunk));
    return chunk;
}
function hoistPreambleState(renderState, preambleState) {
    renderState = renderState.preamble;
    null === renderState.htmlChunks && preambleState.htmlChunks && (renderState.htmlChunks = preambleState.htmlChunks);
    null === renderState.headChunks && preambleState.headChunks && (renderState.headChunks = preambleState.headChunks);
    null === renderState.bodyChunks && preambleState.bodyChunks && (renderState.bodyChunks = preambleState.bodyChunks);
}
function writeBootstrap(destination, renderState) {
    renderState = renderState.bootstrapChunks;
    for(var i = 0; i < renderState.length - 1; i++)destination.push(renderState[i]);
    return i < renderState.length ? (i = renderState[i], renderState.length = 0, destination.push(i)) : !0;
}
function writeStartPendingSuspenseBoundary(destination, renderState, id) {
    destination.push('\x3c!--$?--\x3e<template id="');
    if (null === id) throw Error(formatProdErrorMessage(395));
    destination.push(renderState.boundaryPrefix);
    renderState = id.toString(16);
    destination.push(renderState);
    return destination.push('"></template>');
}
function writeStartSegment(destination, renderState, formatContext, id) {
    switch(formatContext.insertionMode){
        case 0:
        case 1:
        case 3:
        case 2:
            return destination.push('<div hidden id="'), destination.push(renderState.segmentPrefix), renderState = id.toString(16), destination.push(renderState), destination.push('">');
        case 4:
            return destination.push('<svg aria-hidden="true" style="display:none" id="'), destination.push(renderState.segmentPrefix), renderState = id.toString(16), destination.push(renderState), destination.push('">');
        case 5:
            return destination.push('<math aria-hidden="true" style="display:none" id="'), destination.push(renderState.segmentPrefix), renderState = id.toString(16), destination.push(renderState), destination.push('">');
        case 6:
            return destination.push('<table hidden id="'), destination.push(renderState.segmentPrefix), renderState = id.toString(16), destination.push(renderState), destination.push('">');
        case 7:
            return destination.push('<table hidden><tbody id="'), destination.push(renderState.segmentPrefix), renderState = id.toString(16), destination.push(renderState), destination.push('">');
        case 8:
            return destination.push('<table hidden><tr id="'), destination.push(renderState.segmentPrefix), renderState = id.toString(16), destination.push(renderState), destination.push('">');
        case 9:
            return destination.push('<table hidden><colgroup id="'), destination.push(renderState.segmentPrefix), renderState = id.toString(16), destination.push(renderState), destination.push('">');
        default:
            throw Error(formatProdErrorMessage(397));
    }
}
function writeEndSegment(destination, formatContext) {
    switch(formatContext.insertionMode){
        case 0:
        case 1:
        case 3:
        case 2:
            return destination.push("</div>");
        case 4:
            return destination.push("</svg>");
        case 5:
            return destination.push("</math>");
        case 6:
            return destination.push("</table>");
        case 7:
            return destination.push("</tbody></table>");
        case 8:
            return destination.push("</tr></table>");
        case 9:
            return destination.push("</colgroup></table>");
        default:
            throw Error(formatProdErrorMessage(397));
    }
}
var regexForJSStringsInInstructionScripts = /[<\u2028\u2029]/g;
function escapeJSStringsForInstructionScripts(input) {
    return JSON.stringify(input).replace(regexForJSStringsInInstructionScripts, function(match) {
        switch(match){
            case "<":
                return "\\u003c";
            case "\u2028":
                return "\\u2028";
            case "\u2029":
                return "\\u2029";
            default:
                throw Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
        }
    });
}
var regexForJSStringsInScripts = /[&><\u2028\u2029]/g;
function escapeJSObjectForInstructionScripts(input) {
    return JSON.stringify(input).replace(regexForJSStringsInScripts, function(match) {
        switch(match){
            case "&":
                return "\\u0026";
            case ">":
                return "\\u003e";
            case "<":
                return "\\u003c";
            case "\u2028":
                return "\\u2028";
            case "\u2029":
                return "\\u2029";
            default:
                throw Error("escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
        }
    });
}
var currentlyRenderingBoundaryHasStylesToHoist = !1, destinationHasCapacity = !0;
function flushStyleTagsLateForBoundary(styleQueue) {
    var rules = styleQueue.rules, hrefs = styleQueue.hrefs, i = 0;
    if (hrefs.length) {
        this.push(currentlyFlushingRenderState.startInlineStyle);
        this.push(' media="not all" data-precedence="');
        this.push(styleQueue.precedence);
        for(this.push('" data-href="'); i < hrefs.length - 1; i++)this.push(hrefs[i]), this.push(" ");
        this.push(hrefs[i]);
        this.push('">');
        for(i = 0; i < rules.length; i++)this.push(rules[i]);
        destinationHasCapacity = this.push("</style>");
        currentlyRenderingBoundaryHasStylesToHoist = !0;
        rules.length = 0;
        hrefs.length = 0;
    }
}
function hasStylesToHoist(stylesheet) {
    return 2 !== stylesheet.state ? currentlyRenderingBoundaryHasStylesToHoist = !0 : !1;
}
function writeHoistablesForBoundary(destination, hoistableState, renderState) {
    currentlyRenderingBoundaryHasStylesToHoist = !1;
    destinationHasCapacity = !0;
    currentlyFlushingRenderState = renderState;
    hoistableState.styles.forEach(flushStyleTagsLateForBoundary, destination);
    currentlyFlushingRenderState = null;
    hoistableState.stylesheets.forEach(hasStylesToHoist);
    currentlyRenderingBoundaryHasStylesToHoist && (renderState.stylesToHoist = !0);
    return destinationHasCapacity;
}
function flushResource(resource) {
    for(var i = 0; i < resource.length; i++)this.push(resource[i]);
    resource.length = 0;
}
var stylesheetFlushingQueue = [];
function flushStyleInPreamble(stylesheet) {
    pushLinkImpl(stylesheetFlushingQueue, stylesheet.props);
    for(var i = 0; i < stylesheetFlushingQueue.length; i++)this.push(stylesheetFlushingQueue[i]);
    stylesheetFlushingQueue.length = 0;
    stylesheet.state = 2;
}
function flushStylesInPreamble(styleQueue) {
    var hasStylesheets = 0 < styleQueue.sheets.size;
    styleQueue.sheets.forEach(flushStyleInPreamble, this);
    styleQueue.sheets.clear();
    var rules = styleQueue.rules, hrefs = styleQueue.hrefs;
    if (!hasStylesheets || hrefs.length) {
        this.push(currentlyFlushingRenderState.startInlineStyle);
        this.push(' data-precedence="');
        this.push(styleQueue.precedence);
        styleQueue = 0;
        if (hrefs.length) {
            for(this.push('" data-href="'); styleQueue < hrefs.length - 1; styleQueue++)this.push(hrefs[styleQueue]), this.push(" ");
            this.push(hrefs[styleQueue]);
        }
        this.push('">');
        for(styleQueue = 0; styleQueue < rules.length; styleQueue++)this.push(rules[styleQueue]);
        this.push("</style>");
        rules.length = 0;
        hrefs.length = 0;
    }
}
function preloadLateStyle(stylesheet) {
    if (0 === stylesheet.state) {
        stylesheet.state = 1;
        var props = stylesheet.props;
        pushLinkImpl(stylesheetFlushingQueue, {
            rel: "preload",
            as: "style",
            href: stylesheet.props.href,
            crossOrigin: props.crossOrigin,
            fetchPriority: props.fetchPriority,
            integrity: props.integrity,
            media: props.media,
            hrefLang: props.hrefLang,
            referrerPolicy: props.referrerPolicy
        });
        for(stylesheet = 0; stylesheet < stylesheetFlushingQueue.length; stylesheet++)this.push(stylesheetFlushingQueue[stylesheet]);
        stylesheetFlushingQueue.length = 0;
    }
}
function preloadLateStyles(styleQueue) {
    styleQueue.sheets.forEach(preloadLateStyle, this);
    styleQueue.sheets.clear();
}
function pushCompletedShellIdAttribute(target, resumableState) {
    0 === (resumableState.instructions & 32) && (resumableState.instructions |= 32, target.push(' id="', escapeTextForBrowser("_" + resumableState.idPrefix + "R_"), '"'));
}
function writeStyleResourceDependenciesInJS(destination, hoistableState) {
    destination.push("[");
    var nextArrayOpenBrackChunk = "[";
    hoistableState.stylesheets.forEach(function(resource) {
        if (2 !== resource.state) if (3 === resource.state) destination.push(nextArrayOpenBrackChunk), resource = escapeJSObjectForInstructionScripts("" + resource.props.href), destination.push(resource), destination.push("]"), nextArrayOpenBrackChunk = ",[";
        else {
            destination.push(nextArrayOpenBrackChunk);
            var precedence = resource.props["data-precedence"], props = resource.props, coercedHref = sanitizeURL("" + resource.props.href);
            coercedHref = escapeJSObjectForInstructionScripts(coercedHref);
            destination.push(coercedHref);
            precedence = "" + precedence;
            destination.push(",");
            precedence = escapeJSObjectForInstructionScripts(precedence);
            destination.push(precedence);
            for(var propKey in props)if (hasOwnProperty.call(props, propKey) && (precedence = props[propKey], null != precedence)) switch(propKey){
                case "href":
                case "rel":
                case "precedence":
                case "data-precedence":
                    break;
                case "children":
                case "dangerouslySetInnerHTML":
                    throw Error(formatProdErrorMessage(399, "link"));
                default:
                    writeStyleResourceAttributeInJS(destination, propKey, precedence);
            }
            destination.push("]");
            nextArrayOpenBrackChunk = ",[";
            resource.state = 3;
        }
    });
    destination.push("]");
}
function writeStyleResourceAttributeInJS(destination, name, value) {
    var attributeName = name.toLowerCase();
    switch(typeof value === "undefined" ? "undefined" : _type_of(value)){
        case "function":
        case "symbol":
            return;
    }
    switch(name){
        case "innerHTML":
        case "dangerouslySetInnerHTML":
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "style":
        case "ref":
            return;
        case "className":
            attributeName = "class";
            name = "" + value;
            break;
        case "hidden":
            if (!1 === value) return;
            name = "";
            break;
        case "src":
        case "href":
            value = sanitizeURL(value);
            name = "" + value;
            break;
        default:
            if (2 < name.length && ("o" === name[0] || "O" === name[0]) && ("n" === name[1] || "N" === name[1]) || !isAttributeNameSafe(name)) return;
            name = "" + value;
    }
    destination.push(",");
    attributeName = escapeJSObjectForInstructionScripts(attributeName);
    destination.push(attributeName);
    destination.push(",");
    attributeName = escapeJSObjectForInstructionScripts(name);
    destination.push(attributeName);
}
function createHoistableState() {
    return {
        styles: new Set(),
        stylesheets: new Set(),
        suspenseyImages: !1
    };
}
function prefetchDNS(href) {
    var request = currentRequest ? currentRequest : null;
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if ("string" === typeof href && href) {
            if (!resumableState.dnsResources.hasOwnProperty(href)) {
                resumableState.dnsResources[href] = null;
                resumableState = renderState.headers;
                var header, JSCompiler_temp;
                if (JSCompiler_temp = resumableState && 0 < resumableState.remainingCapacity) JSCompiler_temp = (header = "<" + ("" + href).replace(regexForHrefInLinkHeaderURLContext, escapeHrefForLinkHeaderURLContextReplacer) + ">; rel=dns-prefetch", 0 <= (resumableState.remainingCapacity -= header.length + 2));
                JSCompiler_temp ? (renderState.resets.dns[href] = null, resumableState.preconnects && (resumableState.preconnects += ", "), resumableState.preconnects += header) : (header = [], pushLinkImpl(header, {
                    href: href,
                    rel: "dns-prefetch"
                }), renderState.preconnects.add(header));
            }
            enqueueFlush(request);
        }
    } else previousDispatcher.D(href);
}
function preconnect(href, crossOrigin) {
    var request = currentRequest ? currentRequest : null;
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if ("string" === typeof href && href) {
            var bucket = "use-credentials" === crossOrigin ? "credentials" : "string" === typeof crossOrigin ? "anonymous" : "default";
            if (!resumableState.connectResources[bucket].hasOwnProperty(href)) {
                resumableState.connectResources[bucket][href] = null;
                resumableState = renderState.headers;
                var header, JSCompiler_temp;
                if (JSCompiler_temp = resumableState && 0 < resumableState.remainingCapacity) {
                    JSCompiler_temp = "<" + ("" + href).replace(regexForHrefInLinkHeaderURLContext, escapeHrefForLinkHeaderURLContextReplacer) + ">; rel=preconnect";
                    if ("string" === typeof crossOrigin) {
                        var escapedCrossOrigin = ("" + crossOrigin).replace(regexForLinkHeaderQuotedParamValueContext, escapeStringForLinkHeaderQuotedParamValueContextReplacer);
                        JSCompiler_temp += '; crossorigin="' + escapedCrossOrigin + '"';
                    }
                    JSCompiler_temp = (header = JSCompiler_temp, 0 <= (resumableState.remainingCapacity -= header.length + 2));
                }
                JSCompiler_temp ? (renderState.resets.connect[bucket][href] = null, resumableState.preconnects && (resumableState.preconnects += ", "), resumableState.preconnects += header) : (bucket = [], pushLinkImpl(bucket, {
                    rel: "preconnect",
                    href: href,
                    crossOrigin: crossOrigin
                }), renderState.preconnects.add(bucket));
            }
            enqueueFlush(request);
        }
    } else previousDispatcher.C(href, crossOrigin);
}
function preload(href, as, options) {
    var request = currentRequest ? currentRequest : null;
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if (as && href) {
            switch(as){
                case "image":
                    if (options) {
                        var imageSrcSet = options.imageSrcSet;
                        var imageSizes = options.imageSizes;
                        var fetchPriority = options.fetchPriority;
                    }
                    var key = imageSrcSet ? imageSrcSet + "\n" + (imageSizes || "") : href;
                    if (resumableState.imageResources.hasOwnProperty(key)) return;
                    resumableState.imageResources[key] = PRELOAD_NO_CREDS;
                    resumableState = renderState.headers;
                    var header;
                    resumableState && 0 < resumableState.remainingCapacity && "string" !== typeof imageSrcSet && "high" === fetchPriority && (header = getPreloadAsHeader(href, as, options), 0 <= (resumableState.remainingCapacity -= header.length + 2)) ? (renderState.resets.image[key] = PRELOAD_NO_CREDS, resumableState.highImagePreloads && (resumableState.highImagePreloads += ", "), resumableState.highImagePreloads += header) : (resumableState = [], pushLinkImpl(resumableState, assign({
                        rel: "preload",
                        href: imageSrcSet ? void 0 : href,
                        as: as
                    }, options)), "high" === fetchPriority ? renderState.highImagePreloads.add(resumableState) : (renderState.bulkPreloads.add(resumableState), renderState.preloads.images.set(key, resumableState)));
                    break;
                case "style":
                    if (resumableState.styleResources.hasOwnProperty(href)) return;
                    imageSrcSet = [];
                    pushLinkImpl(imageSrcSet, assign({
                        rel: "preload",
                        href: href,
                        as: as
                    }, options));
                    resumableState.styleResources[href] = !options || "string" !== typeof options.crossOrigin && "string" !== typeof options.integrity ? PRELOAD_NO_CREDS : [
                        options.crossOrigin,
                        options.integrity
                    ];
                    renderState.preloads.stylesheets.set(href, imageSrcSet);
                    renderState.bulkPreloads.add(imageSrcSet);
                    break;
                case "script":
                    if (resumableState.scriptResources.hasOwnProperty(href)) return;
                    imageSrcSet = [];
                    renderState.preloads.scripts.set(href, imageSrcSet);
                    renderState.bulkPreloads.add(imageSrcSet);
                    pushLinkImpl(imageSrcSet, assign({
                        rel: "preload",
                        href: href,
                        as: as
                    }, options));
                    resumableState.scriptResources[href] = !options || "string" !== typeof options.crossOrigin && "string" !== typeof options.integrity ? PRELOAD_NO_CREDS : [
                        options.crossOrigin,
                        options.integrity
                    ];
                    break;
                default:
                    if (resumableState.unknownResources.hasOwnProperty(as)) {
                        if (imageSrcSet = resumableState.unknownResources[as], imageSrcSet.hasOwnProperty(href)) return;
                    } else imageSrcSet = {}, resumableState.unknownResources[as] = imageSrcSet;
                    imageSrcSet[href] = PRELOAD_NO_CREDS;
                    if ((resumableState = renderState.headers) && 0 < resumableState.remainingCapacity && "font" === as && (key = getPreloadAsHeader(href, as, options), 0 <= (resumableState.remainingCapacity -= key.length + 2))) renderState.resets.font[href] = PRELOAD_NO_CREDS, resumableState.fontPreloads && (resumableState.fontPreloads += ", "), resumableState.fontPreloads += key;
                    else switch(resumableState = [], href = assign({
                        rel: "preload",
                        href: href,
                        as: as
                    }, options), pushLinkImpl(resumableState, href), as){
                        case "font":
                            renderState.fontPreloads.add(resumableState);
                            break;
                        default:
                            renderState.bulkPreloads.add(resumableState);
                    }
            }
            enqueueFlush(request);
        }
    } else previousDispatcher.L(href, as, options);
}
function preloadModule(href, options) {
    var request = currentRequest ? currentRequest : null;
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if (href) {
            var as = options && "string" === typeof options.as ? options.as : "script";
            switch(as){
                case "script":
                    if (resumableState.moduleScriptResources.hasOwnProperty(href)) return;
                    as = [];
                    resumableState.moduleScriptResources[href] = !options || "string" !== typeof options.crossOrigin && "string" !== typeof options.integrity ? PRELOAD_NO_CREDS : [
                        options.crossOrigin,
                        options.integrity
                    ];
                    renderState.preloads.moduleScripts.set(href, as);
                    break;
                default:
                    if (resumableState.moduleUnknownResources.hasOwnProperty(as)) {
                        var resources = resumableState.unknownResources[as];
                        if (resources.hasOwnProperty(href)) return;
                    } else resources = {}, resumableState.moduleUnknownResources[as] = resources;
                    as = [];
                    resources[href] = PRELOAD_NO_CREDS;
            }
            pushLinkImpl(as, assign({
                rel: "modulepreload",
                href: href
            }, options));
            renderState.bulkPreloads.add(as);
            enqueueFlush(request);
        }
    } else previousDispatcher.m(href, options);
}
function preinitStyle(href, precedence, options) {
    var request = currentRequest ? currentRequest : null;
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if (href) {
            precedence = precedence || "default";
            var styleQueue = renderState.styles.get(precedence), resourceState = resumableState.styleResources.hasOwnProperty(href) ? resumableState.styleResources[href] : void 0;
            null !== resourceState && (resumableState.styleResources[href] = null, styleQueue || (styleQueue = {
                precedence: escapeTextForBrowser(precedence),
                rules: [],
                hrefs: [],
                sheets: new Map()
            }, renderState.styles.set(precedence, styleQueue)), precedence = {
                state: 0,
                props: assign({
                    rel: "stylesheet",
                    href: href,
                    "data-precedence": precedence
                }, options)
            }, resourceState && (2 === resourceState.length && adoptPreloadCredentials(precedence.props, resourceState), (renderState = renderState.preloads.stylesheets.get(href)) && 0 < renderState.length ? renderState.length = 0 : precedence.state = 1), styleQueue.sheets.set(href, precedence), enqueueFlush(request));
        }
    } else previousDispatcher.S(href, precedence, options);
}
function preinitScript(src, options) {
    var request = currentRequest ? currentRequest : null;
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if (src) {
            var resourceState = resumableState.scriptResources.hasOwnProperty(src) ? resumableState.scriptResources[src] : void 0;
            null !== resourceState && (resumableState.scriptResources[src] = null, options = assign({
                src: src,
                async: !0
            }, options), resourceState && (2 === resourceState.length && adoptPreloadCredentials(options, resourceState), src = renderState.preloads.scripts.get(src)) && (src.length = 0), src = [], renderState.scripts.add(src), pushScriptImpl(src, options), enqueueFlush(request));
        }
    } else previousDispatcher.X(src, options);
}
function preinitModuleScript(src, options) {
    var request = currentRequest ? currentRequest : null;
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if (src) {
            var resourceState = resumableState.moduleScriptResources.hasOwnProperty(src) ? resumableState.moduleScriptResources[src] : void 0;
            null !== resourceState && (resumableState.moduleScriptResources[src] = null, options = assign({
                src: src,
                type: "module",
                async: !0
            }, options), resourceState && (2 === resourceState.length && adoptPreloadCredentials(options, resourceState), src = renderState.preloads.moduleScripts.get(src)) && (src.length = 0), src = [], renderState.scripts.add(src), pushScriptImpl(src, options), enqueueFlush(request));
        }
    } else previousDispatcher.M(src, options);
}
function adoptPreloadCredentials(target, preloadState) {
    null == target.crossOrigin && (target.crossOrigin = preloadState[0]);
    null == target.integrity && (target.integrity = preloadState[1]);
}
function getPreloadAsHeader(href, as, params) {
    href = ("" + href).replace(regexForHrefInLinkHeaderURLContext, escapeHrefForLinkHeaderURLContextReplacer);
    as = ("" + as).replace(regexForLinkHeaderQuotedParamValueContext, escapeStringForLinkHeaderQuotedParamValueContextReplacer);
    as = "<" + href + '>; rel=preload; as="' + as + '"';
    for(var paramName in params)hasOwnProperty.call(params, paramName) && (href = params[paramName], "string" === typeof href && (as += "; " + paramName.toLowerCase() + '="' + ("" + href).replace(regexForLinkHeaderQuotedParamValueContext, escapeStringForLinkHeaderQuotedParamValueContextReplacer) + '"'));
    return as;
}
var regexForHrefInLinkHeaderURLContext = /[<>\r\n]/g;
function escapeHrefForLinkHeaderURLContextReplacer(match) {
    switch(match){
        case "<":
            return "%3C";
        case ">":
            return "%3E";
        case "\n":
            return "%0A";
        case "\r":
            return "%0D";
        default:
            throw Error("escapeLinkHrefForHeaderContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
    }
}
var regexForLinkHeaderQuotedParamValueContext = /["';,\r\n]/g;
function escapeStringForLinkHeaderQuotedParamValueContextReplacer(match) {
    switch(match){
        case '"':
            return "%22";
        case "'":
            return "%27";
        case ";":
            return "%3B";
        case ",":
            return "%2C";
        case "\n":
            return "%0A";
        case "\r":
            return "%0D";
        default:
            throw Error("escapeStringForLinkHeaderQuotedParamValueContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
    }
}
function hoistStyleQueueDependency(styleQueue) {
    this.styles.add(styleQueue);
}
function hoistStylesheetDependency(stylesheet) {
    this.stylesheets.add(stylesheet);
}
function hoistHoistables(parentState, childState) {
    childState.styles.forEach(hoistStyleQueueDependency, parentState);
    childState.stylesheets.forEach(hoistStylesheetDependency, parentState);
    childState.suspenseyImages && (parentState.suspenseyImages = !0);
}
function createRenderState(resumableState, generateStaticMarkup) {
    var idPrefix = resumableState.idPrefix, bootstrapChunks = [], bootstrapScriptContent = resumableState.bootstrapScriptContent, bootstrapScripts = resumableState.bootstrapScripts, bootstrapModules = resumableState.bootstrapModules;
    void 0 !== bootstrapScriptContent && (bootstrapChunks.push("<script"), pushCompletedShellIdAttribute(bootstrapChunks, resumableState), bootstrapChunks.push(">", ("" + bootstrapScriptContent).replace(scriptRegex, scriptReplacer), "\x3c/script>"));
    bootstrapScriptContent = idPrefix + "P:";
    var JSCompiler_object_inline_segmentPrefix_1673 = idPrefix + "S:";
    idPrefix += "B:";
    var JSCompiler_object_inline_preconnects_1687 = new Set(), JSCompiler_object_inline_fontPreloads_1688 = new Set(), JSCompiler_object_inline_highImagePreloads_1689 = new Set(), JSCompiler_object_inline_styles_1690 = new Map(), JSCompiler_object_inline_bootstrapScripts_1691 = new Set(), JSCompiler_object_inline_scripts_1692 = new Set(), JSCompiler_object_inline_bulkPreloads_1693 = new Set(), JSCompiler_object_inline_preloads_1694 = {
        images: new Map(),
        stylesheets: new Map(),
        scripts: new Map(),
        moduleScripts: new Map()
    };
    if (void 0 !== bootstrapScripts) for(var i = 0; i < bootstrapScripts.length; i++){
        var scriptConfig = bootstrapScripts[i], src, crossOrigin = void 0, integrity = void 0, props = {
            rel: "preload",
            as: "script",
            fetchPriority: "low",
            nonce: void 0
        };
        "string" === typeof scriptConfig ? props.href = src = scriptConfig : (props.href = src = scriptConfig.src, props.integrity = integrity = "string" === typeof scriptConfig.integrity ? scriptConfig.integrity : void 0, props.crossOrigin = crossOrigin = "string" === typeof scriptConfig || null == scriptConfig.crossOrigin ? void 0 : "use-credentials" === scriptConfig.crossOrigin ? "use-credentials" : "");
        scriptConfig = resumableState;
        var href = src;
        scriptConfig.scriptResources[href] = null;
        scriptConfig.moduleScriptResources[href] = null;
        scriptConfig = [];
        pushLinkImpl(scriptConfig, props);
        JSCompiler_object_inline_bootstrapScripts_1691.add(scriptConfig);
        bootstrapChunks.push('<script src="', escapeTextForBrowser(src), '"');
        "string" === typeof integrity && bootstrapChunks.push(' integrity="', escapeTextForBrowser(integrity), '"');
        "string" === typeof crossOrigin && bootstrapChunks.push(' crossorigin="', escapeTextForBrowser(crossOrigin), '"');
        pushCompletedShellIdAttribute(bootstrapChunks, resumableState);
        bootstrapChunks.push(' async="">\x3c/script>');
    }
    if (void 0 !== bootstrapModules) for(bootstrapScripts = 0; bootstrapScripts < bootstrapModules.length; bootstrapScripts++)props = bootstrapModules[bootstrapScripts], crossOrigin = src = void 0, integrity = {
        rel: "modulepreload",
        fetchPriority: "low",
        nonce: void 0
    }, "string" === typeof props ? integrity.href = i = props : (integrity.href = i = props.src, integrity.integrity = crossOrigin = "string" === typeof props.integrity ? props.integrity : void 0, integrity.crossOrigin = src = "string" === typeof props || null == props.crossOrigin ? void 0 : "use-credentials" === props.crossOrigin ? "use-credentials" : ""), props = resumableState, scriptConfig = i, props.scriptResources[scriptConfig] = null, props.moduleScriptResources[scriptConfig] = null, props = [], pushLinkImpl(props, integrity), JSCompiler_object_inline_bootstrapScripts_1691.add(props), bootstrapChunks.push('<script type="module" src="', escapeTextForBrowser(i), '"'), "string" === typeof crossOrigin && bootstrapChunks.push(' integrity="', escapeTextForBrowser(crossOrigin), '"'), "string" === typeof src && bootstrapChunks.push(' crossorigin="', escapeTextForBrowser(src), '"'), pushCompletedShellIdAttribute(bootstrapChunks, resumableState), bootstrapChunks.push(' async="">\x3c/script>');
    return {
        placeholderPrefix: bootstrapScriptContent,
        segmentPrefix: JSCompiler_object_inline_segmentPrefix_1673,
        boundaryPrefix: idPrefix,
        startInlineScript: "<script",
        startInlineStyle: "<style",
        preamble: {
            htmlChunks: null,
            headChunks: null,
            bodyChunks: null
        },
        externalRuntimeScript: null,
        bootstrapChunks: bootstrapChunks,
        importMapChunks: [],
        onHeaders: void 0,
        headers: null,
        resets: {
            font: {},
            dns: {},
            connect: {
                default: {},
                anonymous: {},
                credentials: {}
            },
            image: {},
            style: {}
        },
        charsetChunks: [],
        viewportChunks: [],
        hoistableChunks: [],
        preconnects: JSCompiler_object_inline_preconnects_1687,
        fontPreloads: JSCompiler_object_inline_fontPreloads_1688,
        highImagePreloads: JSCompiler_object_inline_highImagePreloads_1689,
        styles: JSCompiler_object_inline_styles_1690,
        bootstrapScripts: JSCompiler_object_inline_bootstrapScripts_1691,
        scripts: JSCompiler_object_inline_scripts_1692,
        bulkPreloads: JSCompiler_object_inline_bulkPreloads_1693,
        preloads: JSCompiler_object_inline_preloads_1694,
        nonce: {
            script: void 0,
            style: void 0
        },
        stylesToHoist: !1,
        generateStaticMarkup: generateStaticMarkup
    };
}
function pushTextInstance(target, text, renderState, textEmbedded) {
    if (renderState.generateStaticMarkup) return target.push(escapeTextForBrowser(text)), !1;
    "" === text ? target = textEmbedded : (textEmbedded && target.push("\x3c!-- --\x3e"), target.push(escapeTextForBrowser(text)), target = !0);
    return target;
}
function pushSegmentFinale(target, renderState, lastPushedText, textEmbedded) {
    renderState.generateStaticMarkup || lastPushedText && textEmbedded && target.push("\x3c!-- --\x3e");
}
var bind = Function.prototype.bind, REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
function getComponentNameFromType(type) {
    if (null == type) return null;
    if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
    if ("string" === typeof type) return type;
    switch(type){
        case REACT_FRAGMENT_TYPE:
            return "Fragment";
        case REACT_PROFILER_TYPE:
            return "Profiler";
        case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
        case REACT_SUSPENSE_TYPE:
            return "Suspense";
        case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
        case REACT_ACTIVITY_TYPE:
            return "Activity";
    }
    if ("object" === (typeof type === "undefined" ? "undefined" : _type_of(type))) switch(type.$$typeof){
        case REACT_PORTAL_TYPE:
            return "Portal";
        case REACT_CONTEXT_TYPE:
            return type.displayName || "Context";
        case REACT_CONSUMER_TYPE:
            return (type._context.displayName || "Context") + ".Consumer";
        case REACT_FORWARD_REF_TYPE:
            var innerType = type.render;
            type = type.displayName;
            type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
            return type;
        case REACT_MEMO_TYPE:
            return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
        case REACT_LAZY_TYPE:
            innerType = type._payload;
            type = type._init;
            try {
                return getComponentNameFromType(type(innerType));
            } catch (x) {}
    }
    return null;
}
var emptyContextObject = {}, currentActiveSnapshot = null;
function popToNearestCommonAncestor(prev, next) {
    if (prev !== next) {
        prev.context._currentValue2 = prev.parentValue;
        prev = prev.parent;
        var parentNext = next.parent;
        if (null === prev) {
            if (null !== parentNext) throw Error(formatProdErrorMessage(401));
        } else {
            if (null === parentNext) throw Error(formatProdErrorMessage(401));
            popToNearestCommonAncestor(prev, parentNext);
        }
        next.context._currentValue2 = next.value;
    }
}
function popAllPrevious(prev) {
    prev.context._currentValue2 = prev.parentValue;
    prev = prev.parent;
    null !== prev && popAllPrevious(prev);
}
function pushAllNext(next) {
    var parentNext = next.parent;
    null !== parentNext && pushAllNext(parentNext);
    next.context._currentValue2 = next.value;
}
function popPreviousToCommonLevel(prev, next) {
    prev.context._currentValue2 = prev.parentValue;
    prev = prev.parent;
    if (null === prev) throw Error(formatProdErrorMessage(402));
    prev.depth === next.depth ? popToNearestCommonAncestor(prev, next) : popPreviousToCommonLevel(prev, next);
}
function popNextToCommonLevel(prev, next) {
    var parentNext = next.parent;
    if (null === parentNext) throw Error(formatProdErrorMessage(402));
    prev.depth === parentNext.depth ? popToNearestCommonAncestor(prev, parentNext) : popNextToCommonLevel(prev, parentNext);
    next.context._currentValue2 = next.value;
}
function switchContext(newSnapshot) {
    var prev = currentActiveSnapshot;
    prev !== newSnapshot && (null === prev ? pushAllNext(newSnapshot) : null === newSnapshot ? popAllPrevious(prev) : prev.depth === newSnapshot.depth ? popToNearestCommonAncestor(prev, newSnapshot) : prev.depth > newSnapshot.depth ? popPreviousToCommonLevel(prev, newSnapshot) : popNextToCommonLevel(prev, newSnapshot), currentActiveSnapshot = newSnapshot);
}
var classComponentUpdater = {
    enqueueSetState: function enqueueSetState(inst, payload) {
        inst = inst._reactInternals;
        null !== inst.queue && inst.queue.push(payload);
    },
    enqueueReplaceState: function enqueueReplaceState(inst, payload) {
        inst = inst._reactInternals;
        inst.replace = !0;
        inst.queue = [
            payload
        ];
    },
    enqueueForceUpdate: function enqueueForceUpdate() {}
}, emptyTreeContext = {
    id: 1,
    overflow: ""
};
function pushTreeContext(baseContext, totalChildren, index) {
    var baseIdWithLeadingBit = baseContext.id;
    baseContext = baseContext.overflow;
    var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
    baseIdWithLeadingBit &= ~(1 << baseLength);
    index += 1;
    var length = 32 - clz32(totalChildren) + baseLength;
    if (30 < length) {
        var numberOfOverflowBits = baseLength - baseLength % 5;
        length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
        baseIdWithLeadingBit >>= numberOfOverflowBits;
        baseLength -= numberOfOverflowBits;
        return {
            id: 1 << 32 - clz32(totalChildren) + baseLength | index << baseLength | baseIdWithLeadingBit,
            overflow: length + baseContext
        };
    }
    return {
        id: 1 << length | index << baseLength | baseIdWithLeadingBit,
        overflow: baseContext
    };
}
var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback, log = Math.log, LN2 = Math.LN2;
function clz32Fallback(x) {
    x >>>= 0;
    return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
}
function noop() {}
var SuspenseException = Error(formatProdErrorMessage(460));
function trackUsedThenable(thenableState, thenable, index) {
    index = thenableState[index];
    void 0 === index ? thenableState.push(thenable) : index !== thenable && (thenable.then(noop, noop), thenable = index);
    switch(thenable.status){
        case "fulfilled":
            return thenable.value;
        case "rejected":
            throw thenable.reason;
        default:
            "string" === typeof thenable.status ? thenable.then(noop, noop) : (thenableState = thenable, thenableState.status = "pending", thenableState.then(function(fulfilledValue) {
                if ("pending" === thenable.status) {
                    var fulfilledThenable = thenable;
                    fulfilledThenable.status = "fulfilled";
                    fulfilledThenable.value = fulfilledValue;
                }
            }, function(error) {
                if ("pending" === thenable.status) {
                    var rejectedThenable = thenable;
                    rejectedThenable.status = "rejected";
                    rejectedThenable.reason = error;
                }
            }));
            switch(thenable.status){
                case "fulfilled":
                    return thenable.value;
                case "rejected":
                    throw thenable.reason;
            }
            suspendedThenable = thenable;
            throw SuspenseException;
    }
}
var suspendedThenable = null;
function getSuspendedThenable() {
    if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
    var thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
}
function is(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
}
var objectIs = "function" === typeof Object.is ? Object.is : is, currentlyRenderingComponent = null, currentlyRenderingTask = null, currentlyRenderingRequest = null, currentlyRenderingKeyPath = null, firstWorkInProgressHook = null, workInProgressHook = null, isReRender = !1, didScheduleRenderPhaseUpdate = !1, localIdCounter = 0, actionStateCounter = 0, actionStateMatchingIndex = -1, thenableIndexCounter = 0, thenableState = null, renderPhaseUpdates = null, numberOfReRenders = 0;
function resolveCurrentlyRenderingComponent() {
    if (null === currentlyRenderingComponent) throw Error(formatProdErrorMessage(321));
    return currentlyRenderingComponent;
}
function createHook() {
    if (0 < numberOfReRenders) throw Error(formatProdErrorMessage(312));
    return {
        memoizedState: null,
        queue: null,
        next: null
    };
}
function createWorkInProgressHook() {
    null === workInProgressHook ? null === firstWorkInProgressHook ? (isReRender = !1, firstWorkInProgressHook = workInProgressHook = createHook()) : (isReRender = !0, workInProgressHook = firstWorkInProgressHook) : null === workInProgressHook.next ? (isReRender = !1, workInProgressHook = workInProgressHook.next = createHook()) : (isReRender = !0, workInProgressHook = workInProgressHook.next);
    return workInProgressHook;
}
function getThenableStateAfterSuspending() {
    var state = thenableState;
    thenableState = null;
    return state;
}
function resetHooksState() {
    currentlyRenderingKeyPath = currentlyRenderingRequest = currentlyRenderingTask = currentlyRenderingComponent = null;
    didScheduleRenderPhaseUpdate = !1;
    firstWorkInProgressHook = null;
    numberOfReRenders = 0;
    workInProgressHook = renderPhaseUpdates = null;
}
function basicStateReducer(state, action) {
    return "function" === typeof action ? action(state) : action;
}
function useReducer(reducer, initialArg, init) {
    currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
    workInProgressHook = createWorkInProgressHook();
    if (isReRender) {
        var queue = workInProgressHook.queue;
        initialArg = queue.dispatch;
        if (null !== renderPhaseUpdates && (init = renderPhaseUpdates.get(queue), void 0 !== init)) {
            renderPhaseUpdates.delete(queue);
            queue = workInProgressHook.memoizedState;
            do queue = reducer(queue, init.action), init = init.next;
            while (null !== init);
            workInProgressHook.memoizedState = queue;
            return [
                queue,
                initialArg
            ];
        }
        return [
            workInProgressHook.memoizedState,
            initialArg
        ];
    }
    reducer = reducer === basicStateReducer ? "function" === typeof initialArg ? initialArg() : initialArg : void 0 !== init ? init(initialArg) : initialArg;
    workInProgressHook.memoizedState = reducer;
    reducer = workInProgressHook.queue = {
        last: null,
        dispatch: null
    };
    reducer = reducer.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, reducer);
    return [
        workInProgressHook.memoizedState,
        reducer
    ];
}
function useMemo(nextCreate, deps) {
    currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
    workInProgressHook = createWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    if (null !== workInProgressHook) {
        var prevState = workInProgressHook.memoizedState;
        if (null !== prevState && null !== deps) {
            var prevDeps = prevState[1];
            a: if (null === prevDeps) prevDeps = !1;
            else {
                for(var i = 0; i < prevDeps.length && i < deps.length; i++)if (!objectIs(deps[i], prevDeps[i])) {
                    prevDeps = !1;
                    break a;
                }
                prevDeps = !0;
            }
            if (prevDeps) return prevState[0];
        }
    }
    nextCreate = nextCreate();
    workInProgressHook.memoizedState = [
        nextCreate,
        deps
    ];
    return nextCreate;
}
function dispatchAction(componentIdentity, queue, action) {
    if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
    if (componentIdentity === currentlyRenderingComponent) if (didScheduleRenderPhaseUpdate = !0, componentIdentity = {
        action: action,
        next: null
    }, null === renderPhaseUpdates && (renderPhaseUpdates = new Map()), action = renderPhaseUpdates.get(queue), void 0 === action) renderPhaseUpdates.set(queue, componentIdentity);
    else {
        for(queue = action; null !== queue.next;)queue = queue.next;
        queue.next = componentIdentity;
    }
}
function throwOnUseEffectEventCall() {
    throw Error(formatProdErrorMessage(440));
}
function unsupportedStartTransition() {
    throw Error(formatProdErrorMessage(394));
}
function unsupportedSetOptimisticState() {
    throw Error(formatProdErrorMessage(479));
}
function useActionState(action, initialState, permalink) {
    resolveCurrentlyRenderingComponent();
    var actionStateHookIndex = actionStateCounter++, request = currentlyRenderingRequest;
    if ("function" === typeof action.$$FORM_ACTION) {
        var nextPostbackStateKey = null, componentKeyPath = currentlyRenderingKeyPath;
        request = request.formState;
        var isSignatureEqual = action.$$IS_SIGNATURE_EQUAL;
        if (null !== request && "function" === typeof isSignatureEqual) {
            var postbackKey = request[1];
            isSignatureEqual.call(action, request[2], request[3]) && (nextPostbackStateKey = void 0 !== permalink ? "p" + permalink : "k" + murmurhash3_32_gc(JSON.stringify([
                componentKeyPath,
                null,
                actionStateHookIndex
            ]), 0), postbackKey === nextPostbackStateKey && (actionStateMatchingIndex = actionStateHookIndex, initialState = request[0]));
        }
        var boundAction = action.bind(null, initialState);
        action = function action(payload) {
            boundAction(payload);
        };
        "function" === typeof boundAction.$$FORM_ACTION && (action.$$FORM_ACTION = function(prefix) {
            prefix = boundAction.$$FORM_ACTION(prefix);
            void 0 !== permalink && (permalink += "", prefix.action = permalink);
            var formData = prefix.data;
            formData && (null === nextPostbackStateKey && (nextPostbackStateKey = void 0 !== permalink ? "p" + permalink : "k" + murmurhash3_32_gc(JSON.stringify([
                componentKeyPath,
                null,
                actionStateHookIndex
            ]), 0)), formData.append("$ACTION_KEY", nextPostbackStateKey));
            return prefix;
        });
        return [
            initialState,
            action,
            !1
        ];
    }
    var boundAction$22 = action.bind(null, initialState);
    return [
        initialState,
        function(payload) {
            boundAction$22(payload);
        },
        !1
    ];
}
function unwrapThenable(thenable) {
    var index = thenableIndexCounter;
    thenableIndexCounter += 1;
    null === thenableState && (thenableState = []);
    return trackUsedThenable(thenableState, thenable, index);
}
function unsupportedRefresh() {
    throw Error(formatProdErrorMessage(393));
}
var HooksDispatcher = {
    readContext: function readContext(context) {
        return context._currentValue2;
    },
    use: function use(usable) {
        if (null !== usable && "object" === (typeof usable === "undefined" ? "undefined" : _type_of(usable))) {
            if ("function" === typeof usable.then) return unwrapThenable(usable);
            if (usable.$$typeof === REACT_CONTEXT_TYPE) return usable._currentValue2;
        }
        throw Error(formatProdErrorMessage(438, String(usable)));
    },
    useContext: function useContext(context) {
        resolveCurrentlyRenderingComponent();
        return context._currentValue2;
    },
    useMemo: useMemo,
    useReducer: useReducer,
    useRef: function useRef(initialValue) {
        currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
        workInProgressHook = createWorkInProgressHook();
        var previousRef = workInProgressHook.memoizedState;
        return null === previousRef ? (initialValue = {
            current: initialValue
        }, workInProgressHook.memoizedState = initialValue) : previousRef;
    },
    useState: function useState(initialState) {
        return useReducer(basicStateReducer, initialState);
    },
    useInsertionEffect: noop,
    useLayoutEffect: noop,
    useCallback: function useCallback(callback, deps) {
        return useMemo(function() {
            return callback;
        }, deps);
    },
    useImperativeHandle: noop,
    useEffect: noop,
    useDebugValue: noop,
    useDeferredValue: function useDeferredValue(value, initialValue) {
        resolveCurrentlyRenderingComponent();
        return void 0 !== initialValue ? initialValue : value;
    },
    useTransition: function useTransition() {
        resolveCurrentlyRenderingComponent();
        return [
            !1,
            unsupportedStartTransition
        ];
    },
    useId: function useId() {
        var JSCompiler_inline_result = currentlyRenderingTask.treeContext;
        var overflow = JSCompiler_inline_result.overflow;
        JSCompiler_inline_result = JSCompiler_inline_result.id;
        JSCompiler_inline_result = (JSCompiler_inline_result & ~(1 << 32 - clz32(JSCompiler_inline_result) - 1)).toString(32) + overflow;
        var resumableState = currentResumableState;
        if (null === resumableState) throw Error(formatProdErrorMessage(404));
        overflow = localIdCounter++;
        JSCompiler_inline_result = "_" + resumableState.idPrefix + "R_" + JSCompiler_inline_result;
        0 < overflow && (JSCompiler_inline_result += "H" + overflow.toString(32));
        return JSCompiler_inline_result + "_";
    },
    useSyncExternalStore: function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
        if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
        return getServerSnapshot();
    },
    useOptimistic: function useOptimistic(passthrough) {
        resolveCurrentlyRenderingComponent();
        return [
            passthrough,
            unsupportedSetOptimisticState
        ];
    },
    useActionState: useActionState,
    useFormState: useActionState,
    useHostTransitionStatus: function useHostTransitionStatus() {
        resolveCurrentlyRenderingComponent();
        return sharedNotPendingObject;
    },
    useMemoCache: function useMemoCache(size) {
        for(var data = Array(size), i = 0; i < size; i++)data[i] = REACT_MEMO_CACHE_SENTINEL;
        return data;
    },
    useCacheRefresh: function useCacheRefresh() {
        return unsupportedRefresh;
    },
    useEffectEvent: function useEffectEvent() {
        return throwOnUseEffectEventCall;
    }
}, currentResumableState = null, DefaultAsyncDispatcher = {
    getCacheForType: function getCacheForType() {
        throw Error(formatProdErrorMessage(248));
    },
    cacheSignal: function cacheSignal() {
        throw Error(formatProdErrorMessage(248));
    }
}, prefix, suffix;
function describeBuiltInComponentFrame(name) {
    if (void 0 === prefix) try {
        throw Error();
    } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || "";
        suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
    }
    return "\n" + prefix + name + suffix;
}
var reentry = !1;
function describeNativeComponentFrame(fn, construct) {
    if (!fn || reentry) return "";
    reentry = !0;
    var previousPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
        var RunInRootFrame = {
            DetermineComponentFrameRoot: function DetermineComponentFrameRoot() {
                try {
                    if (construct) {
                        var Fake = function Fake() {
                            throw Error();
                        };
                        Object.defineProperty(Fake.prototype, "props", {
                            set: function set() {
                                throw Error();
                            }
                        });
                        if ("object" === (typeof Reflect === "undefined" ? "undefined" : _type_of(Reflect)) && Reflect.construct) {
                            try {
                                Reflect.construct(Fake, []);
                            } catch (x) {
                                var control = x;
                            }
                            Reflect.construct(fn, [], Fake);
                        } else {
                            try {
                                Fake.call();
                            } catch (x$24) {
                                control = x$24;
                            }
                            fn.call(Fake.prototype);
                        }
                    } else {
                        try {
                            throw Error();
                        } catch (x$25) {
                            control = x$25;
                        }
                        (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {});
                    }
                } catch (sample) {
                    if (sample && control && "string" === typeof sample.stack) return [
                        sample.stack,
                        control.stack
                    ];
                }
                return [
                    null,
                    null
                ];
            }
        };
        RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
        var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, "name");
        namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", {
            value: "DetermineComponentFrameRoot"
        });
        var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
        if (sampleStack && controlStack) {
            var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
            for(namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");)RunInRootFrame++;
            for(; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot");)namePropDescriptor++;
            if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length) for(RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];)namePropDescriptor--;
            for(; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
                    do if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                        var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                        fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                        return frame;
                    }
                    while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
                }
                break;
            }
        }
    } finally{
        reentry = !1, Error.prepareStackTrace = previousPrepareStackTrace;
    }
    return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
}
function describeComponentStackByType(type) {
    if ("string" === typeof type) return describeBuiltInComponentFrame(type);
    if ("function" === typeof type) return type.prototype && type.prototype.isReactComponent ? describeNativeComponentFrame(type, !0) : describeNativeComponentFrame(type, !1);
    if ("object" === (typeof type === "undefined" ? "undefined" : _type_of(type)) && null !== type) {
        switch(type.$$typeof){
            case REACT_FORWARD_REF_TYPE:
                return describeNativeComponentFrame(type.render, !1);
            case REACT_MEMO_TYPE:
                return describeNativeComponentFrame(type.type, !1);
            case REACT_LAZY_TYPE:
                var lazyComponent = type, payload = lazyComponent._payload;
                lazyComponent = lazyComponent._init;
                try {
                    type = lazyComponent(payload);
                } catch (x) {
                    return describeBuiltInComponentFrame("Lazy");
                }
                return describeComponentStackByType(type);
        }
        if ("string" === typeof type.name) {
            a: {
                payload = type.name;
                lazyComponent = type.env;
                var location = type.debugLocation;
                if (null != location && (type = Error.prepareStackTrace, Error.prepareStackTrace = void 0, location = location.stack, Error.prepareStackTrace = type, location.startsWith("Error: react-stack-top-frame\n") && (location = location.slice(29)), type = location.indexOf("\n"), -1 !== type && (location = location.slice(type + 1)), type = location.indexOf("react_stack_bottom_frame"), -1 !== type && (type = location.lastIndexOf("\n", type)), type = -1 !== type ? location = location.slice(0, type) : "", location = type.lastIndexOf("\n"), type = -1 === location ? type : type.slice(location + 1), -1 !== type.indexOf(payload))) {
                    payload = "\n" + type;
                    break a;
                }
                payload = describeBuiltInComponentFrame(payload + (lazyComponent ? " [" + lazyComponent + "]" : ""));
            }
            return payload;
        }
    }
    switch(type){
        case REACT_SUSPENSE_LIST_TYPE:
            return describeBuiltInComponentFrame("SuspenseList");
        case REACT_SUSPENSE_TYPE:
            return describeBuiltInComponentFrame("Suspense");
    }
    return "";
}
function isEligibleForOutlining(request, boundary) {
    return (500 < boundary.byteSize || !1) && null === boundary.contentPreamble;
}
function defaultErrorHandler(error) {
    if ("object" === (typeof error === "undefined" ? "undefined" : _type_of(error)) && null !== error && "string" === typeof error.environmentName) {
        var JSCompiler_inline_result = error.environmentName;
        error = [
            error
        ].slice(0);
        "string" === typeof error[0] ? error.splice(0, 1, "[%s] " + error[0], " " + JSCompiler_inline_result + " ") : error.splice(0, 0, "[%s]", " " + JSCompiler_inline_result + " ");
        error.unshift(console);
        JSCompiler_inline_result = bind.apply(console.error, error);
        JSCompiler_inline_result();
    } else console.error(error);
    return null;
}
function RequestInstance(resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, formState) {
    var abortSet = new Set();
    this.destination = null;
    this.flushScheduled = !1;
    this.resumableState = resumableState;
    this.renderState = renderState;
    this.rootFormatContext = rootFormatContext;
    this.progressiveChunkSize = void 0 === progressiveChunkSize ? 12800 : progressiveChunkSize;
    this.status = 10;
    this.fatalError = null;
    this.pendingRootTasks = this.allPendingTasks = this.nextSegmentId = 0;
    this.completedPreambleSegments = this.completedRootSegment = null;
    this.byteSize = 0;
    this.abortableTasks = abortSet;
    this.pingedTasks = [];
    this.clientRenderedBoundaries = [];
    this.completedBoundaries = [];
    this.partialBoundaries = [];
    this.trackedPostpones = null;
    this.onError = void 0 === onError ? defaultErrorHandler : onError;
    this.onPostpone = void 0 === onPostpone ? noop : onPostpone;
    this.onAllReady = void 0 === onAllReady ? noop : onAllReady;
    this.onShellReady = void 0 === onShellReady ? noop : onShellReady;
    this.onShellError = void 0 === onShellError ? noop : onShellError;
    this.onFatalError = void 0 === onFatalError ? noop : onFatalError;
    this.formState = void 0 === formState ? null : formState;
}
function createRequest(children, resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, formState) {
    resumableState = new RequestInstance(resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, formState);
    renderState = createPendingSegment(resumableState, 0, null, rootFormatContext, !1, !1);
    renderState.parentFlushed = !0;
    children = createRenderTask(resumableState, null, children, -1, null, renderState, null, null, resumableState.abortableTasks, null, rootFormatContext, null, emptyTreeContext, null, null);
    pushComponentStack(children);
    resumableState.pingedTasks.push(children);
    return resumableState;
}
var currentRequest = null;
function pingTask(request, task) {
    request.pingedTasks.push(task);
    1 === request.pingedTasks.length && (request.flushScheduled = null !== request.destination, performWork(request));
}
function createSuspenseBoundary(request, row, fallbackAbortableTasks, contentPreamble, fallbackPreamble) {
    fallbackAbortableTasks = {
        status: 0,
        rootSegmentID: -1,
        parentFlushed: !1,
        pendingTasks: 0,
        row: row,
        completedSegments: [],
        byteSize: 0,
        fallbackAbortableTasks: fallbackAbortableTasks,
        errorDigest: null,
        contentState: createHoistableState(),
        fallbackState: createHoistableState(),
        contentPreamble: contentPreamble,
        fallbackPreamble: fallbackPreamble,
        trackedContentKeyPath: null,
        trackedFallbackNode: null
    };
    null !== row && (row.pendingTasks++, contentPreamble = row.boundaries, null !== contentPreamble && (request.allPendingTasks++, fallbackAbortableTasks.pendingTasks++, contentPreamble.push(fallbackAbortableTasks)), request = row.inheritedHoistables, null !== request && hoistHoistables(fallbackAbortableTasks.contentState, request));
    return fallbackAbortableTasks;
}
function createRenderTask(request, thenableState, node, childIndex, blockedBoundary, blockedSegment, blockedPreamble, hoistableState, abortSet, keyPath, formatContext, context, treeContext, row, componentStack) {
    request.allPendingTasks++;
    null === blockedBoundary ? request.pendingRootTasks++ : blockedBoundary.pendingTasks++;
    null !== row && row.pendingTasks++;
    var task = {
        replay: null,
        node: node,
        childIndex: childIndex,
        ping: function ping() {
            return pingTask(request, task);
        },
        blockedBoundary: blockedBoundary,
        blockedSegment: blockedSegment,
        blockedPreamble: blockedPreamble,
        hoistableState: hoistableState,
        abortSet: abortSet,
        keyPath: keyPath,
        formatContext: formatContext,
        context: context,
        treeContext: treeContext,
        row: row,
        componentStack: componentStack,
        thenableState: thenableState
    };
    abortSet.add(task);
    return task;
}
function createReplayTask(request, thenableState, replay, node, childIndex, blockedBoundary, hoistableState, abortSet, keyPath, formatContext, context, treeContext, row, componentStack) {
    request.allPendingTasks++;
    null === blockedBoundary ? request.pendingRootTasks++ : blockedBoundary.pendingTasks++;
    null !== row && row.pendingTasks++;
    replay.pendingTasks++;
    var task = {
        replay: replay,
        node: node,
        childIndex: childIndex,
        ping: function ping() {
            return pingTask(request, task);
        },
        blockedBoundary: blockedBoundary,
        blockedSegment: null,
        blockedPreamble: null,
        hoistableState: hoistableState,
        abortSet: abortSet,
        keyPath: keyPath,
        formatContext: formatContext,
        context: context,
        treeContext: treeContext,
        row: row,
        componentStack: componentStack,
        thenableState: thenableState
    };
    abortSet.add(task);
    return task;
}
function createPendingSegment(request, index, boundary, parentFormatContext, lastPushedText, textEmbedded) {
    return {
        status: 0,
        parentFlushed: !1,
        id: -1,
        index: index,
        chunks: [],
        children: [],
        preambleChildren: [],
        parentFormatContext: parentFormatContext,
        boundary: boundary,
        lastPushedText: lastPushedText,
        textEmbedded: textEmbedded
    };
}
function pushComponentStack(task) {
    var node = task.node;
    if ("object" === (typeof node === "undefined" ? "undefined" : _type_of(node)) && null !== node) switch(node.$$typeof){
        case REACT_ELEMENT_TYPE:
            task.componentStack = {
                parent: task.componentStack,
                type: node.type
            };
    }
}
function replaceSuspenseComponentStackWithSuspenseFallbackStack(componentStack) {
    return null === componentStack ? null : {
        parent: componentStack.parent,
        type: "Suspense Fallback"
    };
}
function getThrownInfo(node$jscomp$0) {
    var errorInfo = {};
    node$jscomp$0 && Object.defineProperty(errorInfo, "componentStack", {
        configurable: !0,
        enumerable: !0,
        get: function get() {
            try {
                var info = "", node = node$jscomp$0;
                do info += describeComponentStackByType(node.type), node = node.parent;
                while (node);
                var JSCompiler_inline_result = info;
            } catch (x) {
                JSCompiler_inline_result = "\nError generating stack: " + x.message + "\n" + x.stack;
            }
            Object.defineProperty(errorInfo, "componentStack", {
                value: JSCompiler_inline_result
            });
            return JSCompiler_inline_result;
        }
    });
    return errorInfo;
}
function logRecoverableError(request, error, errorInfo) {
    request = request.onError;
    error = request(error, errorInfo);
    if (null == error || "string" === typeof error) return error;
}
function fatalError(request, error) {
    var onShellError = request.onShellError, onFatalError = request.onFatalError;
    onShellError(error);
    onFatalError(error);
    null !== request.destination ? (request.status = 14, request.destination.destroy(error)) : (request.status = 13, request.fatalError = error);
}
function finishSuspenseListRow(request, row) {
    unblockSuspenseListRow(request, row.next, row.hoistables);
}
function unblockSuspenseListRow(request, unblockedRow, inheritedHoistables) {
    for(; null !== unblockedRow;){
        null !== inheritedHoistables && (hoistHoistables(unblockedRow.hoistables, inheritedHoistables), unblockedRow.inheritedHoistables = inheritedHoistables);
        var unblockedBoundaries = unblockedRow.boundaries;
        if (null !== unblockedBoundaries) {
            unblockedRow.boundaries = null;
            for(var i = 0; i < unblockedBoundaries.length; i++){
                var unblockedBoundary = unblockedBoundaries[i];
                null !== inheritedHoistables && hoistHoistables(unblockedBoundary.contentState, inheritedHoistables);
                finishedTask(request, unblockedBoundary, null, null);
            }
        }
        unblockedRow.pendingTasks--;
        if (0 < unblockedRow.pendingTasks) break;
        inheritedHoistables = unblockedRow.hoistables;
        unblockedRow = unblockedRow.next;
    }
}
function tryToResolveTogetherRow(request, togetherRow) {
    var boundaries = togetherRow.boundaries;
    if (null !== boundaries && togetherRow.pendingTasks === boundaries.length) {
        for(var allCompleteAndInlinable = !0, i = 0; i < boundaries.length; i++){
            var rowBoundary = boundaries[i];
            if (1 !== rowBoundary.pendingTasks || rowBoundary.parentFlushed || isEligibleForOutlining(request, rowBoundary)) {
                allCompleteAndInlinable = !1;
                break;
            }
        }
        allCompleteAndInlinable && unblockSuspenseListRow(request, togetherRow, togetherRow.hoistables);
    }
}
function createSuspenseListRow(previousRow) {
    var newRow = {
        pendingTasks: 1,
        boundaries: null,
        hoistables: createHoistableState(),
        inheritedHoistables: null,
        together: !1,
        next: null
    };
    null !== previousRow && 0 < previousRow.pendingTasks && (newRow.pendingTasks++, newRow.boundaries = [], previousRow.next = newRow);
    return newRow;
}
function renderSuspenseListRows(request, task, keyPath, rows, revealOrder) {
    var prevKeyPath = task.keyPath, prevTreeContext = task.treeContext, prevRow = task.row;
    task.keyPath = keyPath;
    keyPath = rows.length;
    var previousSuspenseListRow = null;
    if (null !== task.replay) {
        var resumeSlots = task.replay.slots;
        if (null !== resumeSlots && "object" === (typeof resumeSlots === "undefined" ? "undefined" : _type_of(resumeSlots))) for(var n = 0; n < keyPath; n++){
            var i = "backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder ? n : keyPath - 1 - n, node = rows[i];
            task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
            task.treeContext = pushTreeContext(prevTreeContext, keyPath, i);
            var resumeSegmentID = resumeSlots[i];
            "number" === typeof resumeSegmentID ? (resumeNode(request, task, resumeSegmentID, node, i), delete resumeSlots[i]) : renderNode(request, task, node, i);
            0 === --previousSuspenseListRow.pendingTasks && finishSuspenseListRow(request, previousSuspenseListRow);
        }
        else for(resumeSlots = 0; resumeSlots < keyPath; resumeSlots++)n = "backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder ? resumeSlots : keyPath - 1 - resumeSlots, i = rows[n], task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow), task.treeContext = pushTreeContext(prevTreeContext, keyPath, n), renderNode(request, task, i, n), 0 === --previousSuspenseListRow.pendingTasks && finishSuspenseListRow(request, previousSuspenseListRow);
    } else if ("backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder) for(revealOrder = 0; revealOrder < keyPath; revealOrder++)resumeSlots = rows[revealOrder], task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow), task.treeContext = pushTreeContext(prevTreeContext, keyPath, revealOrder), renderNode(request, task, resumeSlots, revealOrder), 0 === --previousSuspenseListRow.pendingTasks && finishSuspenseListRow(request, previousSuspenseListRow);
    else {
        revealOrder = task.blockedSegment;
        resumeSlots = revealOrder.children.length;
        n = revealOrder.chunks.length;
        for(i = keyPath - 1; 0 <= i; i--){
            node = rows[i];
            task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
            task.treeContext = pushTreeContext(prevTreeContext, keyPath, i);
            resumeSegmentID = createPendingSegment(request, n, null, task.formatContext, 0 === i ? revealOrder.lastPushedText : !0, !0);
            revealOrder.children.splice(resumeSlots, 0, resumeSegmentID);
            task.blockedSegment = resumeSegmentID;
            try {
                renderNode(request, task, node, i), pushSegmentFinale(resumeSegmentID.chunks, request.renderState, resumeSegmentID.lastPushedText, resumeSegmentID.textEmbedded), resumeSegmentID.status = 1, 0 === --previousSuspenseListRow.pendingTasks && finishSuspenseListRow(request, previousSuspenseListRow);
            } catch (thrownValue) {
                throw resumeSegmentID.status = 12 === request.status ? 3 : 4, thrownValue;
            }
        }
        task.blockedSegment = revealOrder;
        revealOrder.lastPushedText = !1;
    }
    null !== prevRow && null !== previousSuspenseListRow && 0 < previousSuspenseListRow.pendingTasks && (prevRow.pendingTasks++, previousSuspenseListRow.next = prevRow);
    task.treeContext = prevTreeContext;
    task.row = prevRow;
    task.keyPath = prevKeyPath;
}
function renderWithHooks(request, task, keyPath, Component, props, secondArg) {
    var prevThenableState = task.thenableState;
    task.thenableState = null;
    currentlyRenderingComponent = {};
    currentlyRenderingTask = task;
    currentlyRenderingRequest = request;
    currentlyRenderingKeyPath = keyPath;
    actionStateCounter = localIdCounter = 0;
    actionStateMatchingIndex = -1;
    thenableIndexCounter = 0;
    thenableState = prevThenableState;
    for(request = Component(props, secondArg); didScheduleRenderPhaseUpdate;)didScheduleRenderPhaseUpdate = !1, actionStateCounter = localIdCounter = 0, actionStateMatchingIndex = -1, thenableIndexCounter = 0, numberOfReRenders += 1, workInProgressHook = null, request = Component(props, secondArg);
    resetHooksState();
    return request;
}
function finishFunctionComponent(request, task, keyPath, children, hasId, actionStateCount, actionStateMatchingIndex) {
    var didEmitActionStateMarkers = !1;
    if (0 !== actionStateCount && null !== request.formState) {
        var segment = task.blockedSegment;
        if (null !== segment) {
            didEmitActionStateMarkers = !0;
            segment = segment.chunks;
            for(var i = 0; i < actionStateCount; i++)i === actionStateMatchingIndex ? segment.push("\x3c!--F!--\x3e") : segment.push("\x3c!--F--\x3e");
        }
    }
    actionStateCount = task.keyPath;
    task.keyPath = keyPath;
    hasId ? (keyPath = task.treeContext, task.treeContext = pushTreeContext(keyPath, 1, 0), renderNode(request, task, children, -1), task.treeContext = keyPath) : didEmitActionStateMarkers ? renderNode(request, task, children, -1) : renderNodeDestructive(request, task, children, -1);
    task.keyPath = actionStateCount;
}
function renderElement(request, task, keyPath, type, props, ref) {
    if ("function" === typeof type) if (type.prototype && type.prototype.isReactComponent) {
        var newProps = props;
        if ("ref" in props) {
            newProps = {};
            for(var propName in props)"ref" !== propName && (newProps[propName] = props[propName]);
        }
        var defaultProps = type.defaultProps;
        if (defaultProps) {
            newProps === props && (newProps = assign({}, newProps, props));
            for(var propName$43 in defaultProps)void 0 === newProps[propName$43] && (newProps[propName$43] = defaultProps[propName$43]);
        }
        props = newProps;
        newProps = emptyContextObject;
        defaultProps = type.contextType;
        "object" === (typeof defaultProps === "undefined" ? "undefined" : _type_of(defaultProps)) && null !== defaultProps && (newProps = defaultProps._currentValue2);
        newProps = new type(props, newProps);
        var initialState = void 0 !== newProps.state ? newProps.state : null;
        newProps.updater = classComponentUpdater;
        newProps.props = props;
        newProps.state = initialState;
        defaultProps = {
            queue: [],
            replace: !1
        };
        newProps._reactInternals = defaultProps;
        ref = type.contextType;
        newProps.context = "object" === (typeof ref === "undefined" ? "undefined" : _type_of(ref)) && null !== ref ? ref._currentValue2 : emptyContextObject;
        ref = type.getDerivedStateFromProps;
        "function" === typeof ref && (ref = ref(props, initialState), initialState = null === ref || void 0 === ref ? initialState : assign({}, initialState, ref), newProps.state = initialState);
        if ("function" !== typeof type.getDerivedStateFromProps && "function" !== typeof newProps.getSnapshotBeforeUpdate && ("function" === typeof newProps.UNSAFE_componentWillMount || "function" === typeof newProps.componentWillMount)) if (type = newProps.state, "function" === typeof newProps.componentWillMount && newProps.componentWillMount(), "function" === typeof newProps.UNSAFE_componentWillMount && newProps.UNSAFE_componentWillMount(), type !== newProps.state && classComponentUpdater.enqueueReplaceState(newProps, newProps.state, null), null !== defaultProps.queue && 0 < defaultProps.queue.length) if (type = defaultProps.queue, ref = defaultProps.replace, defaultProps.queue = null, defaultProps.replace = !1, ref && 1 === type.length) newProps.state = type[0];
        else {
            defaultProps = ref ? type[0] : newProps.state;
            initialState = !0;
            for(ref = ref ? 1 : 0; ref < type.length; ref++)propName$43 = type[ref], propName$43 = "function" === typeof propName$43 ? propName$43.call(newProps, defaultProps, props, void 0) : propName$43, null != propName$43 && (initialState ? (initialState = !1, defaultProps = assign({}, defaultProps, propName$43)) : assign(defaultProps, propName$43));
            newProps.state = defaultProps;
        }
        else defaultProps.queue = null;
        type = newProps.render();
        if (12 === request.status) throw null;
        props = task.keyPath;
        task.keyPath = keyPath;
        renderNodeDestructive(request, task, type, -1);
        task.keyPath = props;
    } else {
        type = renderWithHooks(request, task, keyPath, type, props, void 0);
        if (12 === request.status) throw null;
        finishFunctionComponent(request, task, keyPath, type, 0 !== localIdCounter, actionStateCounter, actionStateMatchingIndex);
    }
    else if ("string" === typeof type) if (newProps = task.blockedSegment, null === newProps) newProps = props.children, defaultProps = task.formatContext, initialState = task.keyPath, task.formatContext = getChildFormatContext(defaultProps, type, props), task.keyPath = keyPath, renderNode(request, task, newProps, -1), task.formatContext = defaultProps, task.keyPath = initialState;
    else {
        initialState = pushStartInstance(newProps.chunks, type, props, request.resumableState, request.renderState, task.blockedPreamble, task.hoistableState, task.formatContext, newProps.lastPushedText);
        newProps.lastPushedText = !1;
        defaultProps = task.formatContext;
        ref = task.keyPath;
        task.keyPath = keyPath;
        if (3 === (task.formatContext = getChildFormatContext(defaultProps, type, props)).insertionMode) {
            keyPath = createPendingSegment(request, 0, null, task.formatContext, !1, !1);
            newProps.preambleChildren.push(keyPath);
            task.blockedSegment = keyPath;
            try {
                keyPath.status = 6, renderNode(request, task, initialState, -1), pushSegmentFinale(keyPath.chunks, request.renderState, keyPath.lastPushedText, keyPath.textEmbedded), keyPath.status = 1;
            } finally{
                task.blockedSegment = newProps;
            }
        } else renderNode(request, task, initialState, -1);
        task.formatContext = defaultProps;
        task.keyPath = ref;
        a: {
            task = newProps.chunks;
            request = request.resumableState;
            switch(type){
                case "title":
                case "style":
                case "script":
                case "area":
                case "base":
                case "br":
                case "col":
                case "embed":
                case "hr":
                case "img":
                case "input":
                case "keygen":
                case "link":
                case "meta":
                case "param":
                case "source":
                case "track":
                case "wbr":
                    break a;
                case "body":
                    if (1 >= defaultProps.insertionMode) {
                        request.hasBody = !0;
                        break a;
                    }
                    break;
                case "html":
                    if (0 === defaultProps.insertionMode) {
                        request.hasHtml = !0;
                        break a;
                    }
                    break;
                case "head":
                    if (1 >= defaultProps.insertionMode) break a;
            }
            task.push(endChunkForTag(type));
        }
        newProps.lastPushedText = !1;
    }
    else {
        switch(type){
            case REACT_LEGACY_HIDDEN_TYPE:
            case REACT_STRICT_MODE_TYPE:
            case REACT_PROFILER_TYPE:
            case REACT_FRAGMENT_TYPE:
                type = task.keyPath;
                task.keyPath = keyPath;
                renderNodeDestructive(request, task, props.children, -1);
                task.keyPath = type;
                return;
            case REACT_ACTIVITY_TYPE:
                type = task.blockedSegment;
                null === type ? "hidden" !== props.mode && (type = task.keyPath, task.keyPath = keyPath, renderNode(request, task, props.children, -1), task.keyPath = type) : "hidden" !== props.mode && (request.renderState.generateStaticMarkup || type.chunks.push("\x3c!--&--\x3e"), type.lastPushedText = !1, newProps = task.keyPath, task.keyPath = keyPath, renderNode(request, task, props.children, -1), task.keyPath = newProps, request.renderState.generateStaticMarkup || type.chunks.push("\x3c!--/&--\x3e"), type.lastPushedText = !1);
                return;
            case REACT_SUSPENSE_LIST_TYPE:
                a: {
                    type = props.children;
                    props = props.revealOrder;
                    if ("forwards" === props || "backwards" === props || "unstable_legacy-backwards" === props) {
                        if (isArrayImpl(type)) {
                            renderSuspenseListRows(request, task, keyPath, type, props);
                            break a;
                        }
                        if (newProps = getIteratorFn(type)) {
                            if (newProps = newProps.call(type)) {
                                defaultProps = newProps.next();
                                if (!defaultProps.done) {
                                    do defaultProps = newProps.next();
                                    while (!defaultProps.done);
                                    renderSuspenseListRows(request, task, keyPath, type, props);
                                }
                                break a;
                            }
                        }
                    }
                    "together" === props ? (props = task.keyPath, newProps = task.row, defaultProps = task.row = createSuspenseListRow(null), defaultProps.boundaries = [], defaultProps.together = !0, task.keyPath = keyPath, renderNodeDestructive(request, task, type, -1), 0 === --defaultProps.pendingTasks && finishSuspenseListRow(request, defaultProps), task.keyPath = props, task.row = newProps, null !== newProps && 0 < defaultProps.pendingTasks && (newProps.pendingTasks++, defaultProps.next = newProps)) : (props = task.keyPath, task.keyPath = keyPath, renderNodeDestructive(request, task, type, -1), task.keyPath = props);
                }
                return;
            case REACT_VIEW_TRANSITION_TYPE:
            case REACT_SCOPE_TYPE:
                throw Error(formatProdErrorMessage(343));
            case REACT_SUSPENSE_TYPE:
                a: if (null !== task.replay) {
                    type = task.keyPath;
                    newProps = task.formatContext;
                    defaultProps = task.row;
                    task.keyPath = keyPath;
                    task.formatContext = getSuspenseContentFormatContext(request.resumableState, newProps);
                    task.row = null;
                    keyPath = props.children;
                    try {
                        renderNode(request, task, keyPath, -1);
                    } finally{
                        task.keyPath = type, task.formatContext = newProps, task.row = defaultProps;
                    }
                } else {
                    type = task.keyPath;
                    ref = task.formatContext;
                    var prevRow = task.row, parentBoundary = task.blockedBoundary;
                    propName$43 = task.blockedPreamble;
                    var parentHoistableState = task.hoistableState;
                    propName = task.blockedSegment;
                    var fallback = props.fallback;
                    props = props.children;
                    var fallbackAbortSet = new Set();
                    var newBoundary = createSuspenseBoundary(request, task.row, fallbackAbortSet, null, null);
                    null !== request.trackedPostpones && (newBoundary.trackedContentKeyPath = keyPath);
                    var boundarySegment = createPendingSegment(request, propName.chunks.length, newBoundary, task.formatContext, !1, !1);
                    propName.children.push(boundarySegment);
                    propName.lastPushedText = !1;
                    var contentRootSegment = createPendingSegment(request, 0, null, task.formatContext, !1, !1);
                    contentRootSegment.parentFlushed = !0;
                    if (null !== request.trackedPostpones) {
                        newProps = task.componentStack;
                        defaultProps = [
                            keyPath[0],
                            "Suspense Fallback",
                            keyPath[2]
                        ];
                        initialState = [
                            defaultProps[1],
                            defaultProps[2],
                            [],
                            null
                        ];
                        request.trackedPostpones.workingMap.set(defaultProps, initialState);
                        newBoundary.trackedFallbackNode = initialState;
                        task.blockedSegment = boundarySegment;
                        task.blockedPreamble = newBoundary.fallbackPreamble;
                        task.keyPath = defaultProps;
                        task.formatContext = getSuspenseFallbackFormatContext(request.resumableState, ref);
                        task.componentStack = replaceSuspenseComponentStackWithSuspenseFallbackStack(newProps);
                        boundarySegment.status = 6;
                        try {
                            renderNode(request, task, fallback, -1), pushSegmentFinale(boundarySegment.chunks, request.renderState, boundarySegment.lastPushedText, boundarySegment.textEmbedded), boundarySegment.status = 1;
                        } catch (thrownValue) {
                            throw boundarySegment.status = 12 === request.status ? 3 : 4, thrownValue;
                        } finally{
                            task.blockedSegment = propName, task.blockedPreamble = propName$43, task.keyPath = type, task.formatContext = ref;
                        }
                        task = createRenderTask(request, null, props, -1, newBoundary, contentRootSegment, newBoundary.contentPreamble, newBoundary.contentState, task.abortSet, keyPath, getSuspenseContentFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, null, newProps);
                        pushComponentStack(task);
                        request.pingedTasks.push(task);
                    } else {
                        task.blockedBoundary = newBoundary;
                        task.blockedPreamble = newBoundary.contentPreamble;
                        task.hoistableState = newBoundary.contentState;
                        task.blockedSegment = contentRootSegment;
                        task.keyPath = keyPath;
                        task.formatContext = getSuspenseContentFormatContext(request.resumableState, ref);
                        task.row = null;
                        contentRootSegment.status = 6;
                        try {
                            if (renderNode(request, task, props, -1), pushSegmentFinale(contentRootSegment.chunks, request.renderState, contentRootSegment.lastPushedText, contentRootSegment.textEmbedded), contentRootSegment.status = 1, queueCompletedSegment(newBoundary, contentRootSegment), 0 === newBoundary.pendingTasks && 0 === newBoundary.status) {
                                if (newBoundary.status = 1, !isEligibleForOutlining(request, newBoundary)) {
                                    null !== prevRow && 0 === --prevRow.pendingTasks && finishSuspenseListRow(request, prevRow);
                                    0 === request.pendingRootTasks && task.blockedPreamble && preparePreamble(request);
                                    break a;
                                }
                            } else null !== prevRow && prevRow.together && tryToResolveTogetherRow(request, prevRow);
                        } catch (thrownValue$30) {
                            newBoundary.status = 4, 12 === request.status ? (contentRootSegment.status = 3, newProps = request.fatalError) : (contentRootSegment.status = 4, newProps = thrownValue$30), defaultProps = getThrownInfo(task.componentStack), initialState = logRecoverableError(request, newProps, defaultProps), newBoundary.errorDigest = initialState, untrackBoundary(request, newBoundary);
                        } finally{
                            task.blockedBoundary = parentBoundary, task.blockedPreamble = propName$43, task.hoistableState = parentHoistableState, task.blockedSegment = propName, task.keyPath = type, task.formatContext = ref, task.row = prevRow;
                        }
                        task = createRenderTask(request, null, fallback, -1, parentBoundary, boundarySegment, newBoundary.fallbackPreamble, newBoundary.fallbackState, fallbackAbortSet, [
                            keyPath[0],
                            "Suspense Fallback",
                            keyPath[2]
                        ], getSuspenseFallbackFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, task.row, replaceSuspenseComponentStackWithSuspenseFallbackStack(task.componentStack));
                        pushComponentStack(task);
                        request.pingedTasks.push(task);
                    }
                }
                return;
        }
        if ("object" === (typeof type === "undefined" ? "undefined" : _type_of(type)) && null !== type) switch(type.$$typeof){
            case REACT_FORWARD_REF_TYPE:
                if ("ref" in props) for(fallback in newProps = {}, props)"ref" !== fallback && (newProps[fallback] = props[fallback]);
                else newProps = props;
                type = renderWithHooks(request, task, keyPath, type.render, newProps, ref);
                finishFunctionComponent(request, task, keyPath, type, 0 !== localIdCounter, actionStateCounter, actionStateMatchingIndex);
                return;
            case REACT_MEMO_TYPE:
                renderElement(request, task, keyPath, type.type, props, ref);
                return;
            case REACT_CONTEXT_TYPE:
                defaultProps = props.children;
                newProps = task.keyPath;
                props = props.value;
                initialState = type._currentValue2;
                type._currentValue2 = props;
                ref = currentActiveSnapshot;
                currentActiveSnapshot = type = {
                    parent: ref,
                    depth: null === ref ? 0 : ref.depth + 1,
                    context: type,
                    parentValue: initialState,
                    value: props
                };
                task.context = type;
                task.keyPath = keyPath;
                renderNodeDestructive(request, task, defaultProps, -1);
                request = currentActiveSnapshot;
                if (null === request) throw Error(formatProdErrorMessage(403));
                request.context._currentValue2 = request.parentValue;
                request = currentActiveSnapshot = request.parent;
                task.context = request;
                task.keyPath = newProps;
                return;
            case REACT_CONSUMER_TYPE:
                props = props.children;
                type = props(type._context._currentValue2);
                props = task.keyPath;
                task.keyPath = keyPath;
                renderNodeDestructive(request, task, type, -1);
                task.keyPath = props;
                return;
            case REACT_LAZY_TYPE:
                newProps = type._init;
                type = newProps(type._payload);
                if (12 === request.status) throw null;
                renderElement(request, task, keyPath, type, props, ref);
                return;
        }
        throw Error(formatProdErrorMessage(130, null == type ? type : typeof type === "undefined" ? "undefined" : _type_of(type), ""));
    }
}
function resumeNode(request, task, segmentId, node, childIndex) {
    var prevReplay = task.replay, blockedBoundary = task.blockedBoundary, resumedSegment = createPendingSegment(request, 0, null, task.formatContext, !1, !1);
    resumedSegment.id = segmentId;
    resumedSegment.parentFlushed = !0;
    try {
        task.replay = null, task.blockedSegment = resumedSegment, renderNode(request, task, node, childIndex), resumedSegment.status = 1, null === blockedBoundary ? request.completedRootSegment = resumedSegment : (queueCompletedSegment(blockedBoundary, resumedSegment), blockedBoundary.parentFlushed && request.partialBoundaries.push(blockedBoundary));
    } finally{
        task.replay = prevReplay, task.blockedSegment = null;
    }
}
function renderNodeDestructive(request, task, node, childIndex) {
    null !== task.replay && "number" === typeof task.replay.slots ? resumeNode(request, task, task.replay.slots, node, childIndex) : (task.node = node, task.childIndex = childIndex, node = task.componentStack, pushComponentStack(task), retryNode(request, task), task.componentStack = node);
}
function retryNode(request, task) {
    var node = task.node, childIndex = task.childIndex;
    if (null !== node) {
        if ("object" === (typeof node === "undefined" ? "undefined" : _type_of(node))) {
            switch(node.$$typeof){
                case REACT_ELEMENT_TYPE:
                    var type = node.type, key = node.key, props = node.props;
                    node = props.ref;
                    var ref = void 0 !== node ? node : null, name = getComponentNameFromType(type), keyOrIndex = null == key ? -1 === childIndex ? 0 : childIndex : key;
                    key = [
                        task.keyPath,
                        name,
                        keyOrIndex
                    ];
                    if (null !== task.replay) a: {
                        var replay = task.replay;
                        childIndex = replay.nodes;
                        for(node = 0; node < childIndex.length; node++){
                            var node$jscomp$0 = childIndex[node];
                            if (keyOrIndex === node$jscomp$0[1]) {
                                if (4 === node$jscomp$0.length) {
                                    if (null !== name && name !== node$jscomp$0[0]) throw Error(formatProdErrorMessage(490, node$jscomp$0[0], name));
                                    var childNodes = node$jscomp$0[2];
                                    name = node$jscomp$0[3];
                                    keyOrIndex = task.node;
                                    task.replay = {
                                        nodes: childNodes,
                                        slots: name,
                                        pendingTasks: 1
                                    };
                                    try {
                                        renderElement(request, task, key, type, props, ref);
                                        if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length) throw Error(formatProdErrorMessage(488));
                                        task.replay.pendingTasks--;
                                    } catch (x) {
                                        if ("object" === (typeof x === "undefined" ? "undefined" : _type_of(x)) && null !== x && (x === SuspenseException || "function" === typeof x.then)) throw task.node === keyOrIndex ? task.replay = replay : childIndex.splice(node, 1), x;
                                        task.replay.pendingTasks--;
                                        props = getThrownInfo(task.componentStack);
                                        key = request;
                                        request = task.blockedBoundary;
                                        type = x;
                                        props = logRecoverableError(key, type, props);
                                        abortRemainingReplayNodes(key, request, childNodes, name, type, props);
                                    }
                                    task.replay = replay;
                                } else {
                                    if (type !== REACT_SUSPENSE_TYPE) throw Error(formatProdErrorMessage(490, "Suspense", getComponentNameFromType(type) || "Unknown"));
                                    b: {
                                        replay = void 0;
                                        type = node$jscomp$0[5];
                                        ref = node$jscomp$0[2];
                                        name = node$jscomp$0[3];
                                        keyOrIndex = null === node$jscomp$0[4] ? [] : node$jscomp$0[4][2];
                                        node$jscomp$0 = null === node$jscomp$0[4] ? null : node$jscomp$0[4][3];
                                        var prevKeyPath = task.keyPath, prevContext = task.formatContext, prevRow = task.row, previousReplaySet = task.replay, parentBoundary = task.blockedBoundary, parentHoistableState = task.hoistableState, content = props.children, fallback = props.fallback, fallbackAbortSet = new Set();
                                        props = createSuspenseBoundary(request, task.row, fallbackAbortSet, null, null);
                                        props.parentFlushed = !0;
                                        props.rootSegmentID = type;
                                        task.blockedBoundary = props;
                                        task.hoistableState = props.contentState;
                                        task.keyPath = key;
                                        task.formatContext = getSuspenseContentFormatContext(request.resumableState, prevContext);
                                        task.row = null;
                                        task.replay = {
                                            nodes: ref,
                                            slots: name,
                                            pendingTasks: 1
                                        };
                                        try {
                                            renderNode(request, task, content, -1);
                                            if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length) throw Error(formatProdErrorMessage(488));
                                            task.replay.pendingTasks--;
                                            if (0 === props.pendingTasks && 0 === props.status) {
                                                props.status = 1;
                                                request.completedBoundaries.push(props);
                                                break b;
                                            }
                                        } catch (error) {
                                            props.status = 4, childNodes = getThrownInfo(task.componentStack), replay = logRecoverableError(request, error, childNodes), props.errorDigest = replay, task.replay.pendingTasks--, request.clientRenderedBoundaries.push(props);
                                        } finally{
                                            task.blockedBoundary = parentBoundary, task.hoistableState = parentHoistableState, task.replay = previousReplaySet, task.keyPath = prevKeyPath, task.formatContext = prevContext, task.row = prevRow;
                                        }
                                        childNodes = createReplayTask(request, null, {
                                            nodes: keyOrIndex,
                                            slots: node$jscomp$0,
                                            pendingTasks: 0
                                        }, fallback, -1, parentBoundary, props.fallbackState, fallbackAbortSet, [
                                            key[0],
                                            "Suspense Fallback",
                                            key[2]
                                        ], getSuspenseFallbackFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, task.row, replaceSuspenseComponentStackWithSuspenseFallbackStack(task.componentStack));
                                        pushComponentStack(childNodes);
                                        request.pingedTasks.push(childNodes);
                                    }
                                }
                                childIndex.splice(node, 1);
                                break a;
                            }
                        }
                    }
                    else renderElement(request, task, key, type, props, ref);
                    return;
                case REACT_PORTAL_TYPE:
                    throw Error(formatProdErrorMessage(257));
                case REACT_LAZY_TYPE:
                    childNodes = node._init;
                    node = childNodes(node._payload);
                    if (12 === request.status) throw null;
                    renderNodeDestructive(request, task, node, childIndex);
                    return;
            }
            if (isArrayImpl(node)) {
                renderChildrenArray(request, task, node, childIndex);
                return;
            }
            if (childNodes = getIteratorFn(node)) {
                if (childNodes = childNodes.call(node)) {
                    node = childNodes.next();
                    if (!node.done) {
                        props = [];
                        do props.push(node.value), node = childNodes.next();
                        while (!node.done);
                        renderChildrenArray(request, task, props, childIndex);
                    }
                    return;
                }
            }
            if ("function" === typeof node.then) return task.thenableState = null, renderNodeDestructive(request, task, unwrapThenable(node), childIndex);
            if (node.$$typeof === REACT_CONTEXT_TYPE) return renderNodeDestructive(request, task, node._currentValue2, childIndex);
            childIndex = Object.prototype.toString.call(node);
            throw Error(formatProdErrorMessage(31, "[object Object]" === childIndex ? "object with keys {" + Object.keys(node).join(", ") + "}" : childIndex));
        }
        if ("string" === typeof node) childIndex = task.blockedSegment, null !== childIndex && (childIndex.lastPushedText = pushTextInstance(childIndex.chunks, node, request.renderState, childIndex.lastPushedText));
        else if ("number" === typeof node || "bigint" === (typeof node === "undefined" ? "undefined" : _type_of(node))) childIndex = task.blockedSegment, null !== childIndex && (childIndex.lastPushedText = pushTextInstance(childIndex.chunks, "" + node, request.renderState, childIndex.lastPushedText));
    }
}
function renderChildrenArray(request, task, children, childIndex) {
    var prevKeyPath = task.keyPath;
    if (-1 !== childIndex && (task.keyPath = [
        task.keyPath,
        "Fragment",
        childIndex
    ], null !== task.replay)) {
        for(var replay = task.replay, replayNodes = replay.nodes, j = 0; j < replayNodes.length; j++){
            var node = replayNodes[j];
            if (node[1] === childIndex) {
                childIndex = node[2];
                node = node[3];
                task.replay = {
                    nodes: childIndex,
                    slots: node,
                    pendingTasks: 1
                };
                try {
                    renderChildrenArray(request, task, children, -1);
                    if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length) throw Error(formatProdErrorMessage(488));
                    task.replay.pendingTasks--;
                } catch (x) {
                    if ("object" === (typeof x === "undefined" ? "undefined" : _type_of(x)) && null !== x && (x === SuspenseException || "function" === typeof x.then)) throw x;
                    task.replay.pendingTasks--;
                    children = getThrownInfo(task.componentStack);
                    var boundary = task.blockedBoundary, error = x;
                    children = logRecoverableError(request, error, children);
                    abortRemainingReplayNodes(request, boundary, childIndex, node, error, children);
                }
                task.replay = replay;
                replayNodes.splice(j, 1);
                break;
            }
        }
        task.keyPath = prevKeyPath;
        return;
    }
    replay = task.treeContext;
    replayNodes = children.length;
    if (null !== task.replay && (j = task.replay.slots, null !== j && "object" === (typeof j === "undefined" ? "undefined" : _type_of(j)))) {
        for(childIndex = 0; childIndex < replayNodes; childIndex++)node = children[childIndex], task.treeContext = pushTreeContext(replay, replayNodes, childIndex), boundary = j[childIndex], "number" === typeof boundary ? (resumeNode(request, task, boundary, node, childIndex), delete j[childIndex]) : renderNode(request, task, node, childIndex);
        task.treeContext = replay;
        task.keyPath = prevKeyPath;
        return;
    }
    for(j = 0; j < replayNodes; j++)childIndex = children[j], task.treeContext = pushTreeContext(replay, replayNodes, j), renderNode(request, task, childIndex, j);
    task.treeContext = replay;
    task.keyPath = prevKeyPath;
}
function trackPostponedBoundary(request, trackedPostpones, boundary) {
    boundary.status = 5;
    boundary.rootSegmentID = request.nextSegmentId++;
    request = boundary.trackedContentKeyPath;
    if (null === request) throw Error(formatProdErrorMessage(486));
    var fallbackReplayNode = boundary.trackedFallbackNode, children = [], boundaryNode = trackedPostpones.workingMap.get(request);
    if (void 0 === boundaryNode) return boundary = [
        request[1],
        request[2],
        children,
        null,
        fallbackReplayNode,
        boundary.rootSegmentID
    ], trackedPostpones.workingMap.set(request, boundary), addToReplayParent(boundary, request[0], trackedPostpones), boundary;
    boundaryNode[4] = fallbackReplayNode;
    boundaryNode[5] = boundary.rootSegmentID;
    return boundaryNode;
}
function trackPostpone(request, trackedPostpones, task, segment) {
    segment.status = 5;
    var keyPath = task.keyPath, boundary = task.blockedBoundary;
    if (null === boundary) segment.id = request.nextSegmentId++, trackedPostpones.rootSlots = segment.id, null !== request.completedRootSegment && (request.completedRootSegment.status = 5);
    else {
        if (null !== boundary && 0 === boundary.status) {
            var boundaryNode = trackPostponedBoundary(request, trackedPostpones, boundary);
            if (boundary.trackedContentKeyPath === keyPath && -1 === task.childIndex) {
                -1 === segment.id && (segment.id = segment.parentFlushed ? boundary.rootSegmentID : request.nextSegmentId++);
                boundaryNode[3] = segment.id;
                return;
            }
        }
        -1 === segment.id && (segment.id = segment.parentFlushed && null !== boundary ? boundary.rootSegmentID : request.nextSegmentId++);
        if (-1 === task.childIndex) null === keyPath ? trackedPostpones.rootSlots = segment.id : (task = trackedPostpones.workingMap.get(keyPath), void 0 === task ? (task = [
            keyPath[1],
            keyPath[2],
            [],
            segment.id
        ], addToReplayParent(task, keyPath[0], trackedPostpones)) : task[3] = segment.id);
        else {
            if (null === keyPath) if (request = trackedPostpones.rootSlots, null === request) request = trackedPostpones.rootSlots = {};
            else {
                if ("number" === typeof request) throw Error(formatProdErrorMessage(491));
            }
            else if (boundary = trackedPostpones.workingMap, boundaryNode = boundary.get(keyPath), void 0 === boundaryNode) request = {}, boundaryNode = [
                keyPath[1],
                keyPath[2],
                [],
                request
            ], boundary.set(keyPath, boundaryNode), addToReplayParent(boundaryNode, keyPath[0], trackedPostpones);
            else if (request = boundaryNode[3], null === request) request = boundaryNode[3] = {};
            else if ("number" === typeof request) throw Error(formatProdErrorMessage(491));
            request[task.childIndex] = segment.id;
        }
    }
}
function untrackBoundary(request, boundary) {
    request = request.trackedPostpones;
    null !== request && (boundary = boundary.trackedContentKeyPath, null !== boundary && (boundary = request.workingMap.get(boundary), void 0 !== boundary && (boundary.length = 4, boundary[2] = [], boundary[3] = null)));
}
function spawnNewSuspendedReplayTask(request, task, thenableState) {
    return createReplayTask(request, thenableState, task.replay, task.node, task.childIndex, task.blockedBoundary, task.hoistableState, task.abortSet, task.keyPath, task.formatContext, task.context, task.treeContext, task.row, task.componentStack);
}
function spawnNewSuspendedRenderTask(request, task, thenableState) {
    var segment = task.blockedSegment, newSegment = createPendingSegment(request, segment.chunks.length, null, task.formatContext, segment.lastPushedText, !0);
    segment.children.push(newSegment);
    segment.lastPushedText = !1;
    return createRenderTask(request, thenableState, task.node, task.childIndex, task.blockedBoundary, newSegment, task.blockedPreamble, task.hoistableState, task.abortSet, task.keyPath, task.formatContext, task.context, task.treeContext, task.row, task.componentStack);
}
function renderNode(request, task, node, childIndex) {
    var previousFormatContext = task.formatContext, previousContext = task.context, previousKeyPath = task.keyPath, previousTreeContext = task.treeContext, previousComponentStack = task.componentStack, segment = task.blockedSegment;
    if (null === segment) {
        segment = task.replay;
        try {
            return renderNodeDestructive(request, task, node, childIndex);
        } catch (thrownValue) {
            if (resetHooksState(), node = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue, 12 !== request.status && "object" === (typeof node === "undefined" ? "undefined" : _type_of(node)) && null !== node) {
                if ("function" === typeof node.then) {
                    childIndex = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                    request = spawnNewSuspendedReplayTask(request, task, childIndex).ping;
                    node.then(request, request);
                    task.formatContext = previousFormatContext;
                    task.context = previousContext;
                    task.keyPath = previousKeyPath;
                    task.treeContext = previousTreeContext;
                    task.componentStack = previousComponentStack;
                    task.replay = segment;
                    switchContext(previousContext);
                    return;
                }
                if ("Maximum call stack size exceeded" === node.message) {
                    node = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                    node = spawnNewSuspendedReplayTask(request, task, node);
                    request.pingedTasks.push(node);
                    task.formatContext = previousFormatContext;
                    task.context = previousContext;
                    task.keyPath = previousKeyPath;
                    task.treeContext = previousTreeContext;
                    task.componentStack = previousComponentStack;
                    task.replay = segment;
                    switchContext(previousContext);
                    return;
                }
            }
        }
    } else {
        var childrenLength = segment.children.length, chunkLength = segment.chunks.length;
        try {
            return renderNodeDestructive(request, task, node, childIndex);
        } catch (thrownValue$62) {
            if (resetHooksState(), segment.children.length = childrenLength, segment.chunks.length = chunkLength, node = thrownValue$62 === SuspenseException ? getSuspendedThenable() : thrownValue$62, 12 !== request.status && "object" === (typeof node === "undefined" ? "undefined" : _type_of(node)) && null !== node) {
                if ("function" === typeof node.then) {
                    segment = node;
                    node = thrownValue$62 === SuspenseException ? getThenableStateAfterSuspending() : null;
                    request = spawnNewSuspendedRenderTask(request, task, node).ping;
                    segment.then(request, request);
                    task.formatContext = previousFormatContext;
                    task.context = previousContext;
                    task.keyPath = previousKeyPath;
                    task.treeContext = previousTreeContext;
                    task.componentStack = previousComponentStack;
                    switchContext(previousContext);
                    return;
                }
                if ("Maximum call stack size exceeded" === node.message) {
                    segment = thrownValue$62 === SuspenseException ? getThenableStateAfterSuspending() : null;
                    segment = spawnNewSuspendedRenderTask(request, task, segment);
                    request.pingedTasks.push(segment);
                    task.formatContext = previousFormatContext;
                    task.context = previousContext;
                    task.keyPath = previousKeyPath;
                    task.treeContext = previousTreeContext;
                    task.componentStack = previousComponentStack;
                    switchContext(previousContext);
                    return;
                }
            }
        }
    }
    task.formatContext = previousFormatContext;
    task.context = previousContext;
    task.keyPath = previousKeyPath;
    task.treeContext = previousTreeContext;
    switchContext(previousContext);
    throw node;
}
function abortTaskSoft(task) {
    var boundary = task.blockedBoundary, segment = task.blockedSegment;
    null !== segment && (segment.status = 3, finishedTask(this, boundary, task.row, segment));
}
function abortRemainingReplayNodes(request$jscomp$0, boundary, nodes, slots, error, errorDigest$jscomp$0) {
    for(var i = 0; i < nodes.length; i++){
        var node = nodes[i];
        if (4 === node.length) abortRemainingReplayNodes(request$jscomp$0, boundary, node[2], node[3], error, errorDigest$jscomp$0);
        else {
            node = node[5];
            var request = request$jscomp$0, errorDigest = errorDigest$jscomp$0, resumedBoundary = createSuspenseBoundary(request, null, new Set(), null, null);
            resumedBoundary.parentFlushed = !0;
            resumedBoundary.rootSegmentID = node;
            resumedBoundary.status = 4;
            resumedBoundary.errorDigest = errorDigest;
            resumedBoundary.parentFlushed && request.clientRenderedBoundaries.push(resumedBoundary);
        }
    }
    nodes.length = 0;
    if (null !== slots) {
        if (null === boundary) throw Error(formatProdErrorMessage(487));
        4 !== boundary.status && (boundary.status = 4, boundary.errorDigest = errorDigest$jscomp$0, boundary.parentFlushed && request$jscomp$0.clientRenderedBoundaries.push(boundary));
        if ("object" === (typeof slots === "undefined" ? "undefined" : _type_of(slots))) for(var index in slots)delete slots[index];
    }
}
function abortTask(task, request, error) {
    var boundary = task.blockedBoundary, segment = task.blockedSegment;
    if (null !== segment) {
        if (6 === segment.status) return;
        segment.status = 3;
    }
    var errorInfo = getThrownInfo(task.componentStack);
    if (null === boundary) {
        if (13 !== request.status && 14 !== request.status) {
            boundary = task.replay;
            if (null === boundary) {
                null !== request.trackedPostpones && null !== segment ? (boundary = request.trackedPostpones, logRecoverableError(request, error, errorInfo), trackPostpone(request, boundary, task, segment), finishedTask(request, null, task.row, segment)) : (logRecoverableError(request, error, errorInfo), fatalError(request, error));
                return;
            }
            boundary.pendingTasks--;
            0 === boundary.pendingTasks && 0 < boundary.nodes.length && (segment = logRecoverableError(request, error, errorInfo), abortRemainingReplayNodes(request, null, boundary.nodes, boundary.slots, error, segment));
            request.pendingRootTasks--;
            0 === request.pendingRootTasks && completeShell(request);
        }
    } else {
        var trackedPostpones$63 = request.trackedPostpones;
        if (4 !== boundary.status) {
            if (null !== trackedPostpones$63 && null !== segment) return logRecoverableError(request, error, errorInfo), trackPostpone(request, trackedPostpones$63, task, segment), boundary.fallbackAbortableTasks.forEach(function(fallbackTask) {
                return abortTask(fallbackTask, request, error);
            }), boundary.fallbackAbortableTasks.clear(), finishedTask(request, boundary, task.row, segment);
            boundary.status = 4;
            segment = logRecoverableError(request, error, errorInfo);
            boundary.status = 4;
            boundary.errorDigest = segment;
            untrackBoundary(request, boundary);
            boundary.parentFlushed && request.clientRenderedBoundaries.push(boundary);
        }
        boundary.pendingTasks--;
        segment = boundary.row;
        null !== segment && 0 === --segment.pendingTasks && finishSuspenseListRow(request, segment);
        boundary.fallbackAbortableTasks.forEach(function(fallbackTask) {
            return abortTask(fallbackTask, request, error);
        });
        boundary.fallbackAbortableTasks.clear();
    }
    task = task.row;
    null !== task && 0 === --task.pendingTasks && finishSuspenseListRow(request, task);
    request.allPendingTasks--;
    0 === request.allPendingTasks && completeAll(request);
}
function safelyEmitEarlyPreloads(request, shellComplete) {
    try {
        var renderState = request.renderState, onHeaders = renderState.onHeaders;
        if (onHeaders) {
            var headers = renderState.headers;
            if (headers) {
                renderState.headers = null;
                var linkHeader = headers.preconnects;
                headers.fontPreloads && (linkHeader && (linkHeader += ", "), linkHeader += headers.fontPreloads);
                headers.highImagePreloads && (linkHeader && (linkHeader += ", "), linkHeader += headers.highImagePreloads);
                if (!shellComplete) {
                    var queueIter = renderState.styles.values(), queueStep = queueIter.next();
                    b: for(; 0 < headers.remainingCapacity && !queueStep.done; queueStep = queueIter.next())for(var sheetIter = queueStep.value.sheets.values(), sheetStep = sheetIter.next(); 0 < headers.remainingCapacity && !sheetStep.done; sheetStep = sheetIter.next()){
                        var sheet = sheetStep.value, props = sheet.props, key = props.href, props$jscomp$0 = sheet.props, header = getPreloadAsHeader(props$jscomp$0.href, "style", {
                            crossOrigin: props$jscomp$0.crossOrigin,
                            integrity: props$jscomp$0.integrity,
                            nonce: props$jscomp$0.nonce,
                            type: props$jscomp$0.type,
                            fetchPriority: props$jscomp$0.fetchPriority,
                            referrerPolicy: props$jscomp$0.referrerPolicy,
                            media: props$jscomp$0.media
                        });
                        if (0 <= (headers.remainingCapacity -= header.length + 2)) renderState.resets.style[key] = PRELOAD_NO_CREDS, linkHeader && (linkHeader += ", "), linkHeader += header, renderState.resets.style[key] = "string" === typeof props.crossOrigin || "string" === typeof props.integrity ? [
                            props.crossOrigin,
                            props.integrity
                        ] : PRELOAD_NO_CREDS;
                        else break b;
                    }
                }
                linkHeader ? onHeaders({
                    Link: linkHeader
                }) : onHeaders({});
            }
        }
    } catch (error) {
        logRecoverableError(request, error, {});
    }
}
function completeShell(request) {
    null === request.trackedPostpones && safelyEmitEarlyPreloads(request, !0);
    null === request.trackedPostpones && preparePreamble(request);
    request.onShellError = noop;
    request = request.onShellReady;
    request();
}
function completeAll(request) {
    safelyEmitEarlyPreloads(request, null === request.trackedPostpones ? !0 : null === request.completedRootSegment || 5 !== request.completedRootSegment.status);
    preparePreamble(request);
    request = request.onAllReady;
    request();
}
function queueCompletedSegment(boundary, segment) {
    if (0 === segment.chunks.length && 1 === segment.children.length && null === segment.children[0].boundary && -1 === segment.children[0].id) {
        var childSegment = segment.children[0];
        childSegment.id = segment.id;
        childSegment.parentFlushed = !0;
        1 !== childSegment.status && 3 !== childSegment.status && 4 !== childSegment.status || queueCompletedSegment(boundary, childSegment);
    } else boundary.completedSegments.push(segment);
}
function finishedTask(request, boundary, row, segment) {
    null !== row && (0 === --row.pendingTasks ? finishSuspenseListRow(request, row) : row.together && tryToResolveTogetherRow(request, row));
    request.allPendingTasks--;
    if (null === boundary) {
        if (null !== segment && segment.parentFlushed) {
            if (null !== request.completedRootSegment) throw Error(formatProdErrorMessage(389));
            request.completedRootSegment = segment;
        }
        request.pendingRootTasks--;
        0 === request.pendingRootTasks && completeShell(request);
    } else if (boundary.pendingTasks--, 4 !== boundary.status) if (0 === boundary.pendingTasks) if (0 === boundary.status && (boundary.status = 1), null !== segment && segment.parentFlushed && (1 === segment.status || 3 === segment.status) && queueCompletedSegment(boundary, segment), boundary.parentFlushed && request.completedBoundaries.push(boundary), 1 === boundary.status) row = boundary.row, null !== row && hoistHoistables(row.hoistables, boundary.contentState), isEligibleForOutlining(request, boundary) || (boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request), boundary.fallbackAbortableTasks.clear(), null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row)), 0 === request.pendingRootTasks && null === request.trackedPostpones && null !== boundary.contentPreamble && preparePreamble(request);
    else {
        if (5 === boundary.status && (boundary = boundary.row, null !== boundary)) {
            if (null !== request.trackedPostpones) {
                row = request.trackedPostpones;
                var postponedRow = boundary.next;
                if (null !== postponedRow && (segment = postponedRow.boundaries, null !== segment)) for(postponedRow.boundaries = null, postponedRow = 0; postponedRow < segment.length; postponedRow++){
                    var postponedBoundary = segment[postponedRow];
                    trackPostponedBoundary(request, row, postponedBoundary);
                    finishedTask(request, postponedBoundary, null, null);
                }
            }
            0 === --boundary.pendingTasks && finishSuspenseListRow(request, boundary);
        }
    }
    else null === segment || !segment.parentFlushed || 1 !== segment.status && 3 !== segment.status || (queueCompletedSegment(boundary, segment), 1 === boundary.completedSegments.length && boundary.parentFlushed && request.partialBoundaries.push(boundary)), boundary = boundary.row, null !== boundary && boundary.together && tryToResolveTogetherRow(request, boundary);
    0 === request.allPendingTasks && completeAll(request);
}
function performWork(request$jscomp$2) {
    if (14 !== request$jscomp$2.status && 13 !== request$jscomp$2.status) {
        var prevContext = currentActiveSnapshot, prevDispatcher = ReactSharedInternals.H;
        ReactSharedInternals.H = HooksDispatcher;
        var prevAsyncDispatcher = ReactSharedInternals.A;
        ReactSharedInternals.A = DefaultAsyncDispatcher;
        var prevRequest = currentRequest;
        currentRequest = request$jscomp$2;
        var prevResumableState = currentResumableState;
        currentResumableState = request$jscomp$2.resumableState;
        try {
            var pingedTasks = request$jscomp$2.pingedTasks, i;
            for(i = 0; i < pingedTasks.length; i++){
                var task = pingedTasks[i], request = request$jscomp$2, segment = task.blockedSegment;
                if (null === segment) {
                    var request$jscomp$0 = request;
                    if (0 !== task.replay.pendingTasks) {
                        switchContext(task.context);
                        try {
                            "number" === typeof task.replay.slots ? resumeNode(request$jscomp$0, task, task.replay.slots, task.node, task.childIndex) : retryNode(request$jscomp$0, task);
                            if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length) throw Error(formatProdErrorMessage(488));
                            task.replay.pendingTasks--;
                            task.abortSet.delete(task);
                            finishedTask(request$jscomp$0, task.blockedBoundary, task.row, null);
                        } catch (thrownValue) {
                            resetHooksState();
                            var x = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue;
                            if ("object" === (typeof x === "undefined" ? "undefined" : _type_of(x)) && null !== x && "function" === typeof x.then) {
                                var ping = task.ping;
                                x.then(ping, ping);
                                task.thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                            } else {
                                task.replay.pendingTasks--;
                                task.abortSet.delete(task);
                                var errorInfo = getThrownInfo(task.componentStack);
                                request = void 0;
                                var request$jscomp$1 = request$jscomp$0, boundary = task.blockedBoundary, error$jscomp$0 = 12 === request$jscomp$0.status ? request$jscomp$0.fatalError : x, replayNodes = task.replay.nodes, resumeSlots = task.replay.slots;
                                request = logRecoverableError(request$jscomp$1, error$jscomp$0, errorInfo);
                                abortRemainingReplayNodes(request$jscomp$1, boundary, replayNodes, resumeSlots, error$jscomp$0, request);
                                request$jscomp$0.pendingRootTasks--;
                                0 === request$jscomp$0.pendingRootTasks && completeShell(request$jscomp$0);
                                request$jscomp$0.allPendingTasks--;
                                0 === request$jscomp$0.allPendingTasks && completeAll(request$jscomp$0);
                            }
                        } finally{}
                    }
                } else if (request$jscomp$0 = void 0, request$jscomp$1 = segment, 0 === request$jscomp$1.status) {
                    request$jscomp$1.status = 6;
                    switchContext(task.context);
                    var childrenLength = request$jscomp$1.children.length, chunkLength = request$jscomp$1.chunks.length;
                    try {
                        retryNode(request, task), pushSegmentFinale(request$jscomp$1.chunks, request.renderState, request$jscomp$1.lastPushedText, request$jscomp$1.textEmbedded), task.abortSet.delete(task), request$jscomp$1.status = 1, finishedTask(request, task.blockedBoundary, task.row, request$jscomp$1);
                    } catch (thrownValue) {
                        resetHooksState();
                        request$jscomp$1.children.length = childrenLength;
                        request$jscomp$1.chunks.length = chunkLength;
                        var x$jscomp$0 = thrownValue === SuspenseException ? getSuspendedThenable() : 12 === request.status ? request.fatalError : thrownValue;
                        if (12 === request.status && null !== request.trackedPostpones) {
                            var trackedPostpones = request.trackedPostpones, thrownInfo = getThrownInfo(task.componentStack);
                            task.abortSet.delete(task);
                            logRecoverableError(request, x$jscomp$0, thrownInfo);
                            trackPostpone(request, trackedPostpones, task, request$jscomp$1);
                            finishedTask(request, task.blockedBoundary, task.row, request$jscomp$1);
                        } else if ("object" === (typeof x$jscomp$0 === "undefined" ? "undefined" : _type_of(x$jscomp$0)) && null !== x$jscomp$0 && "function" === typeof x$jscomp$0.then) {
                            request$jscomp$1.status = 0;
                            task.thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                            var ping$jscomp$0 = task.ping;
                            x$jscomp$0.then(ping$jscomp$0, ping$jscomp$0);
                        } else {
                            var errorInfo$jscomp$0 = getThrownInfo(task.componentStack);
                            task.abortSet.delete(task);
                            request$jscomp$1.status = 4;
                            var boundary$jscomp$0 = task.blockedBoundary, row = task.row;
                            null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row);
                            request.allPendingTasks--;
                            request$jscomp$0 = logRecoverableError(request, x$jscomp$0, errorInfo$jscomp$0);
                            if (null === boundary$jscomp$0) fatalError(request, x$jscomp$0);
                            else if (boundary$jscomp$0.pendingTasks--, 4 !== boundary$jscomp$0.status) {
                                boundary$jscomp$0.status = 4;
                                boundary$jscomp$0.errorDigest = request$jscomp$0;
                                untrackBoundary(request, boundary$jscomp$0);
                                var boundaryRow = boundary$jscomp$0.row;
                                null !== boundaryRow && 0 === --boundaryRow.pendingTasks && finishSuspenseListRow(request, boundaryRow);
                                boundary$jscomp$0.parentFlushed && request.clientRenderedBoundaries.push(boundary$jscomp$0);
                                0 === request.pendingRootTasks && null === request.trackedPostpones && null !== boundary$jscomp$0.contentPreamble && preparePreamble(request);
                            }
                            0 === request.allPendingTasks && completeAll(request);
                        }
                    } finally{}
                }
            }
            pingedTasks.splice(0, i);
            null !== request$jscomp$2.destination && flushCompletedQueues(request$jscomp$2, request$jscomp$2.destination);
        } catch (error) {
            logRecoverableError(request$jscomp$2, error, {}), fatalError(request$jscomp$2, error);
        } finally{
            currentResumableState = prevResumableState, ReactSharedInternals.H = prevDispatcher, ReactSharedInternals.A = prevAsyncDispatcher, prevDispatcher === HooksDispatcher && switchContext(prevContext), currentRequest = prevRequest;
        }
    }
}
function preparePreambleFromSubtree(request, segment, collectedPreambleSegments) {
    segment.preambleChildren.length && collectedPreambleSegments.push(segment.preambleChildren);
    for(var pendingPreambles = !1, i = 0; i < segment.children.length; i++)pendingPreambles = preparePreambleFromSegment(request, segment.children[i], collectedPreambleSegments) || pendingPreambles;
    return pendingPreambles;
}
function preparePreambleFromSegment(request, segment, collectedPreambleSegments) {
    var boundary = segment.boundary;
    if (null === boundary) return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
    var preamble = boundary.contentPreamble, fallbackPreamble = boundary.fallbackPreamble;
    if (null === preamble || null === fallbackPreamble) return !1;
    switch(boundary.status){
        case 1:
            hoistPreambleState(request.renderState, preamble);
            request.byteSize += boundary.byteSize;
            segment = boundary.completedSegments[0];
            if (!segment) throw Error(formatProdErrorMessage(391));
            return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
        case 5:
            if (null !== request.trackedPostpones) return !0;
        case 4:
            if (1 === segment.status) return hoistPreambleState(request.renderState, fallbackPreamble), preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
        default:
            return !0;
    }
}
function preparePreamble(request) {
    if (request.completedRootSegment && null === request.completedPreambleSegments) {
        var collectedPreambleSegments = [], originalRequestByteSize = request.byteSize, hasPendingPreambles = preparePreambleFromSegment(request, request.completedRootSegment, collectedPreambleSegments), preamble = request.renderState.preamble;
        !1 === hasPendingPreambles || preamble.headChunks && preamble.bodyChunks ? request.completedPreambleSegments = collectedPreambleSegments : request.byteSize = originalRequestByteSize;
    }
}
function flushSubtree(request, destination, segment, hoistableState) {
    segment.parentFlushed = !0;
    switch(segment.status){
        case 0:
            segment.id = request.nextSegmentId++;
        case 5:
            return hoistableState = segment.id, segment.lastPushedText = !1, segment.textEmbedded = !1, request = request.renderState, destination.push('<template id="'), destination.push(request.placeholderPrefix), request = hoistableState.toString(16), destination.push(request), destination.push('"></template>');
        case 1:
            segment.status = 2;
            var r = !0, chunks = segment.chunks, chunkIdx = 0;
            segment = segment.children;
            for(var childIdx = 0; childIdx < segment.length; childIdx++){
                for(r = segment[childIdx]; chunkIdx < r.index; chunkIdx++)destination.push(chunks[chunkIdx]);
                r = flushSegment(request, destination, r, hoistableState);
            }
            for(; chunkIdx < chunks.length - 1; chunkIdx++)destination.push(chunks[chunkIdx]);
            chunkIdx < chunks.length && (r = destination.push(chunks[chunkIdx]));
            return r;
        case 3:
            return !0;
        default:
            throw Error(formatProdErrorMessage(390));
    }
}
var flushedByteSize = 0;
function flushSegment(request, destination, segment, hoistableState) {
    var boundary = segment.boundary;
    if (null === boundary) return flushSubtree(request, destination, segment, hoistableState);
    boundary.parentFlushed = !0;
    if (4 === boundary.status) {
        var row = boundary.row;
        null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row);
        request.renderState.generateStaticMarkup || (boundary = boundary.errorDigest, destination.push("\x3c!--$!--\x3e"), destination.push("<template"), boundary && (destination.push(' data-dgst="'), boundary = escapeTextForBrowser(boundary), destination.push(boundary), destination.push('"')), destination.push("></template>"));
        flushSubtree(request, destination, segment, hoistableState);
        request = request.renderState.generateStaticMarkup ? !0 : destination.push("\x3c!--/$--\x3e");
        return request;
    }
    if (1 !== boundary.status) return 0 === boundary.status && (boundary.rootSegmentID = request.nextSegmentId++), 0 < boundary.completedSegments.length && request.partialBoundaries.push(boundary), writeStartPendingSuspenseBoundary(destination, request.renderState, boundary.rootSegmentID), hoistableState && hoistHoistables(hoistableState, boundary.fallbackState), flushSubtree(request, destination, segment, hoistableState), destination.push("\x3c!--/$--\x3e");
    if (!flushingPartialBoundaries && isEligibleForOutlining(request, boundary) && flushedByteSize + boundary.byteSize > request.progressiveChunkSize) return boundary.rootSegmentID = request.nextSegmentId++, request.completedBoundaries.push(boundary), writeStartPendingSuspenseBoundary(destination, request.renderState, boundary.rootSegmentID), flushSubtree(request, destination, segment, hoistableState), destination.push("\x3c!--/$--\x3e");
    flushedByteSize += boundary.byteSize;
    hoistableState && hoistHoistables(hoistableState, boundary.contentState);
    segment = boundary.row;
    null !== segment && isEligibleForOutlining(request, boundary) && 0 === --segment.pendingTasks && finishSuspenseListRow(request, segment);
    request.renderState.generateStaticMarkup || destination.push("\x3c!--$--\x3e");
    segment = boundary.completedSegments;
    if (1 !== segment.length) throw Error(formatProdErrorMessage(391));
    flushSegment(request, destination, segment[0], hoistableState);
    request = request.renderState.generateStaticMarkup ? !0 : destination.push("\x3c!--/$--\x3e");
    return request;
}
function flushSegmentContainer(request, destination, segment, hoistableState) {
    writeStartSegment(destination, request.renderState, segment.parentFormatContext, segment.id);
    flushSegment(request, destination, segment, hoistableState);
    return writeEndSegment(destination, segment.parentFormatContext);
}
function flushCompletedBoundary(request, destination, boundary) {
    flushedByteSize = boundary.byteSize;
    for(var completedSegments = boundary.completedSegments, i = 0; i < completedSegments.length; i++)flushPartiallyCompletedSegment(request, destination, boundary, completedSegments[i]);
    completedSegments.length = 0;
    completedSegments = boundary.row;
    null !== completedSegments && isEligibleForOutlining(request, boundary) && 0 === --completedSegments.pendingTasks && finishSuspenseListRow(request, completedSegments);
    writeHoistablesForBoundary(destination, boundary.contentState, request.renderState);
    completedSegments = request.resumableState;
    request = request.renderState;
    i = boundary.rootSegmentID;
    boundary = boundary.contentState;
    var requiresStyleInsertion = request.stylesToHoist;
    request.stylesToHoist = !1;
    destination.push(request.startInlineScript);
    destination.push(">");
    requiresStyleInsertion ? (0 === (completedSegments.instructions & 4) && (completedSegments.instructions |= 4, destination.push('$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};')), 0 === (completedSegments.instructions & 2) && (completedSegments.instructions |= 2, destination.push('$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d||"/&"===d)if(0===h)break;else h--;else"$"!==d&&"$?"!==d&&"$~"!==d&&"$!"!==d&&"&"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data="$";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};\n$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data="$~",$RB.push(a,b),2===$RB.length&&("number"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};')), 0 === (completedSegments.instructions & 8) ? (completedSegments.instructions |= 8, destination.push('$RM=new Map;$RR=function(n,w,p){function u(q){this._p=null;q()}for(var r=new Map,t=document,h,b,e=t.querySelectorAll("link[data-precedence],style[data-precedence]"),v=[],k=0;b=e[k++];)"not all"===b.getAttribute("media")?v.push(b):("LINK"===b.tagName&&$RM.set(b.getAttribute("href"),b),r.set(b.dataset.precedence,h=b));e=0;b=[];var l,a;for(k=!0;;){if(k){var f=p[e++];if(!f){k=!1;e=0;continue}var c=!1,m=0;var d=f[m++];if(a=$RM.get(d)){var g=a._p;c=!0}else{a=t.createElement("link");a.href=d;a.rel=\n"stylesheet";for(a.dataset.precedence=l=f[m++];g=f[m++];)a.setAttribute(g,f[m++]);g=a._p=new Promise(function(q,x){a.onload=u.bind(a,q);a.onerror=u.bind(a,x)});$RM.set(d,a)}d=a.getAttribute("media");!g||d&&!matchMedia(d).matches||b.push(g);if(c)continue}else{a=v[e++];if(!a)break;l=a.getAttribute("data-precedence");a.removeAttribute("media")}c=r.get(l)||h;c===h&&(h=a);r.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=t.head,c.insertBefore(a,c.firstChild))}if(p=document.getElementById(n))p.previousSibling.data=\n"$~";Promise.all(b).then($RC.bind(null,n,w),$RX.bind(null,n,"CSS failed to load"))};$RR("')) : destination.push('$RR("')) : (0 === (completedSegments.instructions & 2) && (completedSegments.instructions |= 2, destination.push('$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d||"/&"===d)if(0===h)break;else h--;else"$"!==d&&"$?"!==d&&"$~"!==d&&"$!"!==d&&"&"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data="$";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};\n$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data="$~",$RB.push(a,b),2===$RB.length&&("number"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};')), destination.push('$RC("'));
    completedSegments = i.toString(16);
    destination.push(request.boundaryPrefix);
    destination.push(completedSegments);
    destination.push('","');
    destination.push(request.segmentPrefix);
    destination.push(completedSegments);
    requiresStyleInsertion ? (destination.push('",'), writeStyleResourceDependenciesInJS(destination, boundary)) : destination.push('"');
    boundary = destination.push(")\x3c/script>");
    return writeBootstrap(destination, request) && boundary;
}
function flushPartiallyCompletedSegment(request, destination, boundary, segment) {
    if (2 === segment.status) return !0;
    var hoistableState = boundary.contentState, segmentID = segment.id;
    if (-1 === segmentID) {
        if (-1 === (segment.id = boundary.rootSegmentID)) throw Error(formatProdErrorMessage(392));
        return flushSegmentContainer(request, destination, segment, hoistableState);
    }
    if (segmentID === boundary.rootSegmentID) return flushSegmentContainer(request, destination, segment, hoistableState);
    flushSegmentContainer(request, destination, segment, hoistableState);
    boundary = request.resumableState;
    request = request.renderState;
    destination.push(request.startInlineScript);
    destination.push(">");
    0 === (boundary.instructions & 1) ? (boundary.instructions |= 1, destination.push('$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("')) : destination.push('$RS("');
    destination.push(request.segmentPrefix);
    segmentID = segmentID.toString(16);
    destination.push(segmentID);
    destination.push('","');
    destination.push(request.placeholderPrefix);
    destination.push(segmentID);
    destination = destination.push('")\x3c/script>');
    return destination;
}
var flushingPartialBoundaries = !1;
function flushCompletedQueues(request, destination) {
    try {
        if (!(0 < request.pendingRootTasks)) {
            var i, completedRootSegment = request.completedRootSegment;
            if (null !== completedRootSegment) {
                if (5 === completedRootSegment.status) return;
                var completedPreambleSegments = request.completedPreambleSegments;
                if (null === completedPreambleSegments) return;
                flushedByteSize = request.byteSize;
                var resumableState = request.resumableState, renderState = request.renderState, preamble = renderState.preamble, htmlChunks = preamble.htmlChunks, headChunks = preamble.headChunks, i$jscomp$0;
                if (htmlChunks) {
                    for(i$jscomp$0 = 0; i$jscomp$0 < htmlChunks.length; i$jscomp$0++)destination.push(htmlChunks[i$jscomp$0]);
                    if (headChunks) for(i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)destination.push(headChunks[i$jscomp$0]);
                    else {
                        var chunk = startChunkForTag("head");
                        destination.push(chunk);
                        destination.push(">");
                    }
                } else if (headChunks) for(i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)destination.push(headChunks[i$jscomp$0]);
                var charsetChunks = renderState.charsetChunks;
                for(i$jscomp$0 = 0; i$jscomp$0 < charsetChunks.length; i$jscomp$0++)destination.push(charsetChunks[i$jscomp$0]);
                charsetChunks.length = 0;
                renderState.preconnects.forEach(flushResource, destination);
                renderState.preconnects.clear();
                var viewportChunks = renderState.viewportChunks;
                for(i$jscomp$0 = 0; i$jscomp$0 < viewportChunks.length; i$jscomp$0++)destination.push(viewportChunks[i$jscomp$0]);
                viewportChunks.length = 0;
                renderState.fontPreloads.forEach(flushResource, destination);
                renderState.fontPreloads.clear();
                renderState.highImagePreloads.forEach(flushResource, destination);
                renderState.highImagePreloads.clear();
                currentlyFlushingRenderState = renderState;
                renderState.styles.forEach(flushStylesInPreamble, destination);
                currentlyFlushingRenderState = null;
                var importMapChunks = renderState.importMapChunks;
                for(i$jscomp$0 = 0; i$jscomp$0 < importMapChunks.length; i$jscomp$0++)destination.push(importMapChunks[i$jscomp$0]);
                importMapChunks.length = 0;
                renderState.bootstrapScripts.forEach(flushResource, destination);
                renderState.scripts.forEach(flushResource, destination);
                renderState.scripts.clear();
                renderState.bulkPreloads.forEach(flushResource, destination);
                renderState.bulkPreloads.clear();
                resumableState.instructions |= 32;
                var hoistableChunks = renderState.hoistableChunks;
                for(i$jscomp$0 = 0; i$jscomp$0 < hoistableChunks.length; i$jscomp$0++)destination.push(hoistableChunks[i$jscomp$0]);
                for(resumableState = hoistableChunks.length = 0; resumableState < completedPreambleSegments.length; resumableState++){
                    var segments = completedPreambleSegments[resumableState];
                    for(renderState = 0; renderState < segments.length; renderState++)flushSegment(request, destination, segments[renderState], null);
                }
                var preamble$jscomp$0 = request.renderState.preamble, headChunks$jscomp$0 = preamble$jscomp$0.headChunks;
                if (preamble$jscomp$0.htmlChunks || headChunks$jscomp$0) {
                    var chunk$jscomp$0 = endChunkForTag("head");
                    destination.push(chunk$jscomp$0);
                }
                var bodyChunks = preamble$jscomp$0.bodyChunks;
                if (bodyChunks) for(completedPreambleSegments = 0; completedPreambleSegments < bodyChunks.length; completedPreambleSegments++)destination.push(bodyChunks[completedPreambleSegments]);
                flushSegment(request, destination, completedRootSegment, null);
                request.completedRootSegment = null;
                var renderState$jscomp$0 = request.renderState;
                if (0 !== request.allPendingTasks || 0 !== request.clientRenderedBoundaries.length || 0 !== request.completedBoundaries.length || null !== request.trackedPostpones && (0 !== request.trackedPostpones.rootNodes.length || null !== request.trackedPostpones.rootSlots)) {
                    var resumableState$jscomp$0 = request.resumableState;
                    if (0 === (resumableState$jscomp$0.instructions & 64)) {
                        resumableState$jscomp$0.instructions |= 64;
                        destination.push(renderState$jscomp$0.startInlineScript);
                        if (0 === (resumableState$jscomp$0.instructions & 32)) {
                            resumableState$jscomp$0.instructions |= 32;
                            var shellId = "_" + resumableState$jscomp$0.idPrefix + "R_";
                            destination.push(' id="');
                            var chunk$jscomp$1 = escapeTextForBrowser(shellId);
                            destination.push(chunk$jscomp$1);
                            destination.push('"');
                        }
                        destination.push(">");
                        destination.push("requestAnimationFrame(function(){$RT=performance.now()});");
                        destination.push("\x3c/script>");
                    }
                }
                writeBootstrap(destination, renderState$jscomp$0);
            }
            var renderState$jscomp$1 = request.renderState;
            completedRootSegment = 0;
            var viewportChunks$jscomp$0 = renderState$jscomp$1.viewportChunks;
            for(completedRootSegment = 0; completedRootSegment < viewportChunks$jscomp$0.length; completedRootSegment++)destination.push(viewportChunks$jscomp$0[completedRootSegment]);
            viewportChunks$jscomp$0.length = 0;
            renderState$jscomp$1.preconnects.forEach(flushResource, destination);
            renderState$jscomp$1.preconnects.clear();
            renderState$jscomp$1.fontPreloads.forEach(flushResource, destination);
            renderState$jscomp$1.fontPreloads.clear();
            renderState$jscomp$1.highImagePreloads.forEach(flushResource, destination);
            renderState$jscomp$1.highImagePreloads.clear();
            renderState$jscomp$1.styles.forEach(preloadLateStyles, destination);
            renderState$jscomp$1.scripts.forEach(flushResource, destination);
            renderState$jscomp$1.scripts.clear();
            renderState$jscomp$1.bulkPreloads.forEach(flushResource, destination);
            renderState$jscomp$1.bulkPreloads.clear();
            var hoistableChunks$jscomp$0 = renderState$jscomp$1.hoistableChunks;
            for(completedRootSegment = 0; completedRootSegment < hoistableChunks$jscomp$0.length; completedRootSegment++)destination.push(hoistableChunks$jscomp$0[completedRootSegment]);
            hoistableChunks$jscomp$0.length = 0;
            var clientRenderedBoundaries = request.clientRenderedBoundaries;
            for(i = 0; i < clientRenderedBoundaries.length; i++){
                var boundary = clientRenderedBoundaries[i];
                renderState$jscomp$1 = destination;
                var resumableState$jscomp$1 = request.resumableState, renderState$jscomp$2 = request.renderState, id = boundary.rootSegmentID, errorDigest = boundary.errorDigest;
                renderState$jscomp$1.push(renderState$jscomp$2.startInlineScript);
                renderState$jscomp$1.push(">");
                0 === (resumableState$jscomp$1.instructions & 4) ? (resumableState$jscomp$1.instructions |= 4, renderState$jscomp$1.push('$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};;$RX("')) : renderState$jscomp$1.push('$RX("');
                renderState$jscomp$1.push(renderState$jscomp$2.boundaryPrefix);
                var chunk$jscomp$2 = id.toString(16);
                renderState$jscomp$1.push(chunk$jscomp$2);
                renderState$jscomp$1.push('"');
                if (errorDigest) {
                    renderState$jscomp$1.push(",");
                    var chunk$jscomp$3 = escapeJSStringsForInstructionScripts(errorDigest || "");
                    renderState$jscomp$1.push(chunk$jscomp$3);
                }
                var JSCompiler_inline_result = renderState$jscomp$1.push(")\x3c/script>");
                if (!JSCompiler_inline_result) {
                    request.destination = null;
                    i++;
                    clientRenderedBoundaries.splice(0, i);
                    return;
                }
            }
            clientRenderedBoundaries.splice(0, i);
            var completedBoundaries = request.completedBoundaries;
            for(i = 0; i < completedBoundaries.length; i++)if (!flushCompletedBoundary(request, destination, completedBoundaries[i])) {
                request.destination = null;
                i++;
                completedBoundaries.splice(0, i);
                return;
            }
            completedBoundaries.splice(0, i);
            flushingPartialBoundaries = !0;
            var partialBoundaries = request.partialBoundaries;
            for(i = 0; i < partialBoundaries.length; i++){
                var boundary$69 = partialBoundaries[i];
                a: {
                    clientRenderedBoundaries = request;
                    boundary = destination;
                    flushedByteSize = boundary$69.byteSize;
                    var completedSegments = boundary$69.completedSegments;
                    for(JSCompiler_inline_result = 0; JSCompiler_inline_result < completedSegments.length; JSCompiler_inline_result++)if (!flushPartiallyCompletedSegment(clientRenderedBoundaries, boundary, boundary$69, completedSegments[JSCompiler_inline_result])) {
                        JSCompiler_inline_result++;
                        completedSegments.splice(0, JSCompiler_inline_result);
                        var JSCompiler_inline_result$jscomp$0 = !1;
                        break a;
                    }
                    completedSegments.splice(0, JSCompiler_inline_result);
                    var row = boundary$69.row;
                    null !== row && row.together && 1 === boundary$69.pendingTasks && (1 === row.pendingTasks ? unblockSuspenseListRow(clientRenderedBoundaries, row, row.hoistables) : row.pendingTasks--);
                    JSCompiler_inline_result$jscomp$0 = writeHoistablesForBoundary(boundary, boundary$69.contentState, clientRenderedBoundaries.renderState);
                }
                if (!JSCompiler_inline_result$jscomp$0) {
                    request.destination = null;
                    i++;
                    partialBoundaries.splice(0, i);
                    return;
                }
            }
            partialBoundaries.splice(0, i);
            flushingPartialBoundaries = !1;
            var largeBoundaries = request.completedBoundaries;
            for(i = 0; i < largeBoundaries.length; i++)if (!flushCompletedBoundary(request, destination, largeBoundaries[i])) {
                request.destination = null;
                i++;
                largeBoundaries.splice(0, i);
                return;
            }
            largeBoundaries.splice(0, i);
        }
    } finally{
        flushingPartialBoundaries = !1, 0 === request.allPendingTasks && 0 === request.clientRenderedBoundaries.length && 0 === request.completedBoundaries.length && (request.flushScheduled = !1, i = request.resumableState, i.hasBody && (partialBoundaries = endChunkForTag("body"), destination.push(partialBoundaries)), i.hasHtml && (i = endChunkForTag("html"), destination.push(i)), request.status = 14, destination.push(null), request.destination = null);
    }
}
function enqueueFlush(request) {
    if (!1 === request.flushScheduled && 0 === request.pingedTasks.length && null !== request.destination) {
        request.flushScheduled = !0;
        var destination = request.destination;
        destination ? flushCompletedQueues(request, destination) : request.flushScheduled = !1;
    }
}
function startFlowing(request, destination) {
    if (13 === request.status) request.status = 14, destination.destroy(request.fatalError);
    else if (14 !== request.status && null === request.destination) {
        request.destination = destination;
        try {
            flushCompletedQueues(request, destination);
        } catch (error) {
            logRecoverableError(request, error, {}), fatalError(request, error);
        }
    }
}
function abort(request, reason) {
    if (11 === request.status || 10 === request.status) request.status = 12;
    try {
        var abortableTasks = request.abortableTasks;
        if (0 < abortableTasks.size) {
            var error = void 0 === reason ? Error(formatProdErrorMessage(432)) : "object" === (typeof reason === "undefined" ? "undefined" : _type_of(reason)) && null !== reason && "function" === typeof reason.then ? Error(formatProdErrorMessage(530)) : reason;
            request.fatalError = error;
            abortableTasks.forEach(function(task) {
                return abortTask(task, request, error);
            });
            abortableTasks.clear();
        }
        null !== request.destination && flushCompletedQueues(request, request.destination);
    } catch (error$71) {
        logRecoverableError(request, error$71, {}), fatalError(request, error$71);
    }
}
function addToReplayParent(node, parentKeyPath, trackedPostpones) {
    if (null === parentKeyPath) trackedPostpones.rootNodes.push(node);
    else {
        var workingMap = trackedPostpones.workingMap, parentNode = workingMap.get(parentKeyPath);
        void 0 === parentNode && (parentNode = [
            parentKeyPath[1],
            parentKeyPath[2],
            [],
            null
        ], workingMap.set(parentKeyPath, parentNode), addToReplayParent(parentNode, parentKeyPath[0], trackedPostpones));
        parentNode[2].push(node);
    }
}
function onError() {}
function renderToStringImpl(children, options, generateStaticMarkup, abortReason) {
    var didFatal = !1, fatalError = null, result = "", readyToStream = !1;
    options = createResumableState(options ? options.identifierPrefix : void 0);
    children = createRequest(children, options, createRenderState(options, generateStaticMarkup), createFormatContext(0, null, 0, null), Infinity, onError, void 0, function() {
        readyToStream = !0;
    }, void 0, void 0, void 0);
    children.flushScheduled = null !== children.destination;
    performWork(children);
    10 === children.status && (children.status = 11);
    null === children.trackedPostpones && safelyEmitEarlyPreloads(children, 0 === children.pendingRootTasks);
    abort(children, abortReason);
    startFlowing(children, {
        push: function push(chunk) {
            null !== chunk && (result += chunk);
            return !0;
        },
        destroy: function destroy(error) {
            didFatal = !0;
            fatalError = error;
        }
    });
    if (didFatal && fatalError !== abortReason) throw fatalError;
    if (!readyToStream) throw Error(formatProdErrorMessage(426));
    return result;
}
exports.renderToStaticMarkup = function(children, options) {
    return renderToStringImpl(children, options, !0, 'The server used "renderToStaticMarkup" which does not support Suspense. If you intended to have the server wait for the suspended component please switch to "renderToReadableStream" which supports Suspense on the server');
};
exports.renderToString = function(children, options) {
    return renderToStringImpl(children, options, !1, 'The server used "renderToString" which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to "renderToReadableStream" which supports Suspense on the server');
};
exports.version = "19.2.7";


},
3024
/*!************************************************************************!*\
  !*** ./node_modules/react-dom/cjs/react-dom-server.edge.production.js ***!
  \************************************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";
/**
 * @license React
 * react-dom-server.edge.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ /*


 JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)

 Copyright (c) 2011 Gary Court
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/ 
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var React = __webpack_require__(/*! react */ 3380), ReactDOM = __webpack_require__(/*! react-dom */ 9253), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_SCOPE_TYPE = Symbol.for("react.scope"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden"), REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== (typeof maybeIterable === "undefined" ? "undefined" : _type_of(maybeIterable))) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
}
var isArrayImpl = Array.isArray;
function murmurhash3_32_gc(key, seed) {
    var remainder = key.length & 3;
    var bytes = key.length - remainder;
    var h1 = seed;
    for(seed = 0; seed < bytes;){
        var k1 = key.charCodeAt(seed) & 255 | (key.charCodeAt(++seed) & 255) << 8 | (key.charCodeAt(++seed) & 255) << 16 | (key.charCodeAt(++seed) & 255) << 24;
        ++seed;
        k1 = 3432918353 * (k1 & 65535) + ((3432918353 * (k1 >>> 16) & 65535) << 16) & 4294967295;
        k1 = k1 << 15 | k1 >>> 17;
        k1 = 461845907 * (k1 & 65535) + ((461845907 * (k1 >>> 16) & 65535) << 16) & 4294967295;
        h1 ^= k1;
        h1 = h1 << 13 | h1 >>> 19;
        h1 = 5 * (h1 & 65535) + ((5 * (h1 >>> 16) & 65535) << 16) & 4294967295;
        h1 = (h1 & 65535) + 27492 + (((h1 >>> 16) + 58964 & 65535) << 16);
    }
    k1 = 0;
    switch(remainder){
        case 3:
            k1 ^= (key.charCodeAt(seed + 2) & 255) << 16;
        case 2:
            k1 ^= (key.charCodeAt(seed + 1) & 255) << 8;
        case 1:
            k1 ^= key.charCodeAt(seed) & 255, k1 = 3432918353 * (k1 & 65535) + ((3432918353 * (k1 >>> 16) & 65535) << 16) & 4294967295, k1 = k1 << 15 | k1 >>> 17, h1 ^= 461845907 * (k1 & 65535) + ((461845907 * (k1 >>> 16) & 65535) << 16) & 4294967295;
    }
    h1 ^= key.length;
    h1 ^= h1 >>> 16;
    h1 = 2246822507 * (h1 & 65535) + ((2246822507 * (h1 >>> 16) & 65535) << 16) & 4294967295;
    h1 ^= h1 >>> 13;
    h1 = 3266489909 * (h1 & 65535) + ((3266489909 * (h1 >>> 16) & 65535) << 16) & 4294967295;
    return (h1 ^ h1 >>> 16) >>> 0;
}
function handleErrorInNextTick(error) {
    setTimeout(function() {
        throw error;
    });
}
var LocalPromise = Promise, scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : function(callback) {
    LocalPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
}, currentView = null, writtenBytes = 0;
function writeChunk(destination, chunk) {
    if (0 !== chunk.byteLength) if (2048 < chunk.byteLength) 0 < writtenBytes && (destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes)), currentView = new Uint8Array(2048), writtenBytes = 0), destination.enqueue(chunk);
    else {
        var allowableBytes = currentView.length - writtenBytes;
        allowableBytes < chunk.byteLength && (0 === allowableBytes ? destination.enqueue(currentView) : (currentView.set(chunk.subarray(0, allowableBytes), writtenBytes), destination.enqueue(currentView), chunk = chunk.subarray(allowableBytes)), currentView = new Uint8Array(2048), writtenBytes = 0);
        currentView.set(chunk, writtenBytes);
        writtenBytes += chunk.byteLength;
    }
}
function writeChunkAndReturn(destination, chunk) {
    writeChunk(destination, chunk);
    return !0;
}
function completeWriting(destination) {
    currentView && 0 < writtenBytes && (destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes)), currentView = null, writtenBytes = 0);
}
var textEncoder = new TextEncoder();
function stringToChunk(content) {
    return textEncoder.encode(content);
}
function stringToPrecomputedChunk(content) {
    return textEncoder.encode(content);
}
function byteLengthOfChunk(chunk) {
    return chunk.byteLength;
}
function closeWithError(destination, error) {
    "function" === typeof destination.error ? destination.error(error) : destination.close();
}
var assign = Object.assign, hasOwnProperty = Object.prototype.hasOwnProperty, VALID_ATTRIBUTE_NAME_REGEX = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), illegalAttributeNameCache = {}, validatedAttributeNameCache = {};
function isAttributeNameSafe(attributeName) {
    if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) return !0;
    if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
    if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) return validatedAttributeNameCache[attributeName] = !0;
    illegalAttributeNameCache[attributeName] = !0;
    return !1;
}
var unitlessNumbers = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" ")), aliases = new Map([
    [
        "acceptCharset",
        "accept-charset"
    ],
    [
        "htmlFor",
        "for"
    ],
    [
        "httpEquiv",
        "http-equiv"
    ],
    [
        "crossOrigin",
        "crossorigin"
    ],
    [
        "accentHeight",
        "accent-height"
    ],
    [
        "alignmentBaseline",
        "alignment-baseline"
    ],
    [
        "arabicForm",
        "arabic-form"
    ],
    [
        "baselineShift",
        "baseline-shift"
    ],
    [
        "capHeight",
        "cap-height"
    ],
    [
        "clipPath",
        "clip-path"
    ],
    [
        "clipRule",
        "clip-rule"
    ],
    [
        "colorInterpolation",
        "color-interpolation"
    ],
    [
        "colorInterpolationFilters",
        "color-interpolation-filters"
    ],
    [
        "colorProfile",
        "color-profile"
    ],
    [
        "colorRendering",
        "color-rendering"
    ],
    [
        "dominantBaseline",
        "dominant-baseline"
    ],
    [
        "enableBackground",
        "enable-background"
    ],
    [
        "fillOpacity",
        "fill-opacity"
    ],
    [
        "fillRule",
        "fill-rule"
    ],
    [
        "floodColor",
        "flood-color"
    ],
    [
        "floodOpacity",
        "flood-opacity"
    ],
    [
        "fontFamily",
        "font-family"
    ],
    [
        "fontSize",
        "font-size"
    ],
    [
        "fontSizeAdjust",
        "font-size-adjust"
    ],
    [
        "fontStretch",
        "font-stretch"
    ],
    [
        "fontStyle",
        "font-style"
    ],
    [
        "fontVariant",
        "font-variant"
    ],
    [
        "fontWeight",
        "font-weight"
    ],
    [
        "glyphName",
        "glyph-name"
    ],
    [
        "glyphOrientationHorizontal",
        "glyph-orientation-horizontal"
    ],
    [
        "glyphOrientationVertical",
        "glyph-orientation-vertical"
    ],
    [
        "horizAdvX",
        "horiz-adv-x"
    ],
    [
        "horizOriginX",
        "horiz-origin-x"
    ],
    [
        "imageRendering",
        "image-rendering"
    ],
    [
        "letterSpacing",
        "letter-spacing"
    ],
    [
        "lightingColor",
        "lighting-color"
    ],
    [
        "markerEnd",
        "marker-end"
    ],
    [
        "markerMid",
        "marker-mid"
    ],
    [
        "markerStart",
        "marker-start"
    ],
    [
        "overlinePosition",
        "overline-position"
    ],
    [
        "overlineThickness",
        "overline-thickness"
    ],
    [
        "paintOrder",
        "paint-order"
    ],
    [
        "panose-1",
        "panose-1"
    ],
    [
        "pointerEvents",
        "pointer-events"
    ],
    [
        "renderingIntent",
        "rendering-intent"
    ],
    [
        "shapeRendering",
        "shape-rendering"
    ],
    [
        "stopColor",
        "stop-color"
    ],
    [
        "stopOpacity",
        "stop-opacity"
    ],
    [
        "strikethroughPosition",
        "strikethrough-position"
    ],
    [
        "strikethroughThickness",
        "strikethrough-thickness"
    ],
    [
        "strokeDasharray",
        "stroke-dasharray"
    ],
    [
        "strokeDashoffset",
        "stroke-dashoffset"
    ],
    [
        "strokeLinecap",
        "stroke-linecap"
    ],
    [
        "strokeLinejoin",
        "stroke-linejoin"
    ],
    [
        "strokeMiterlimit",
        "stroke-miterlimit"
    ],
    [
        "strokeOpacity",
        "stroke-opacity"
    ],
    [
        "strokeWidth",
        "stroke-width"
    ],
    [
        "textAnchor",
        "text-anchor"
    ],
    [
        "textDecoration",
        "text-decoration"
    ],
    [
        "textRendering",
        "text-rendering"
    ],
    [
        "transformOrigin",
        "transform-origin"
    ],
    [
        "underlinePosition",
        "underline-position"
    ],
    [
        "underlineThickness",
        "underline-thickness"
    ],
    [
        "unicodeBidi",
        "unicode-bidi"
    ],
    [
        "unicodeRange",
        "unicode-range"
    ],
    [
        "unitsPerEm",
        "units-per-em"
    ],
    [
        "vAlphabetic",
        "v-alphabetic"
    ],
    [
        "vHanging",
        "v-hanging"
    ],
    [
        "vIdeographic",
        "v-ideographic"
    ],
    [
        "vMathematical",
        "v-mathematical"
    ],
    [
        "vectorEffect",
        "vector-effect"
    ],
    [
        "vertAdvY",
        "vert-adv-y"
    ],
    [
        "vertOriginX",
        "vert-origin-x"
    ],
    [
        "vertOriginY",
        "vert-origin-y"
    ],
    [
        "wordSpacing",
        "word-spacing"
    ],
    [
        "writingMode",
        "writing-mode"
    ],
    [
        "xmlnsXlink",
        "xmlns:xlink"
    ],
    [
        "xHeight",
        "x-height"
    ]
]), matchHtmlRegExp = /["'&<>]/;
function escapeTextForBrowser(text) {
    if ("boolean" === typeof text || "number" === typeof text || "bigint" === (typeof text === "undefined" ? "undefined" : _type_of(text))) return "" + text;
    text = "" + text;
    var match = matchHtmlRegExp.exec(text);
    if (match) {
        var html = "", index, lastIndex = 0;
        for(index = match.index; index < text.length; index++){
            switch(text.charCodeAt(index)){
                case 34:
                    match = "&quot;";
                    break;
                case 38:
                    match = "&amp;";
                    break;
                case 39:
                    match = "&#x27;";
                    break;
                case 60:
                    match = "&lt;";
                    break;
                case 62:
                    match = "&gt;";
                    break;
                default:
                    continue;
            }
            lastIndex !== index && (html += text.slice(lastIndex, index));
            lastIndex = index + 1;
            html += match;
        }
        text = lastIndex !== index ? html + text.slice(lastIndex, index) : html;
    }
    return text;
}
var uppercasePattern = /([A-Z])/g, msPattern = /^ms-/, isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
function sanitizeURL(url) {
    return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
}
var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, sharedNotPendingObject = {
    pending: !1,
    data: null,
    method: null,
    action: null
}, previousDispatcher = ReactDOMSharedInternals.d;
ReactDOMSharedInternals.d = {
    f: previousDispatcher.f,
    r: previousDispatcher.r,
    D: prefetchDNS,
    C: preconnect,
    L: preload,
    m: preloadModule,
    X: preinitScript,
    S: preinitStyle,
    M: preinitModuleScript
};
var PRELOAD_NO_CREDS = [], currentlyFlushingRenderState = null;
stringToPrecomputedChunk('"></template>');
var startInlineScript = stringToPrecomputedChunk("<script"), endInlineScript = stringToPrecomputedChunk("\x3c/script>"), startScriptSrc = stringToPrecomputedChunk('<script src="'), startModuleSrc = stringToPrecomputedChunk('<script type="module" src="'), scriptNonce = stringToPrecomputedChunk(' nonce="'), scriptIntegirty = stringToPrecomputedChunk(' integrity="'), scriptCrossOrigin = stringToPrecomputedChunk(' crossorigin="'), endAsyncScript = stringToPrecomputedChunk(' async="">\x3c/script>'), startInlineStyle = stringToPrecomputedChunk("<style"), scriptRegex = /(<\/|<)(s)(cript)/gi;
function scriptReplacer(match, prefix, s, suffix) {
    return "" + prefix + ("s" === s ? "\\u0073" : "\\u0053") + suffix;
}
var importMapScriptStart = stringToPrecomputedChunk('<script type="importmap">'), importMapScriptEnd = stringToPrecomputedChunk("\x3c/script>");
function createRenderState(resumableState, nonce, externalRuntimeConfig, importMap, onHeaders, maxHeadersLength) {
    externalRuntimeConfig = "string" === typeof nonce ? nonce : nonce && nonce.script;
    var inlineScriptWithNonce = void 0 === externalRuntimeConfig ? startInlineScript : stringToPrecomputedChunk('<script nonce="' + escapeTextForBrowser(externalRuntimeConfig) + '"'), nonceStyle = "string" === typeof nonce ? void 0 : nonce && nonce.style, inlineStyleWithNonce = void 0 === nonceStyle ? startInlineStyle : stringToPrecomputedChunk('<style nonce="' + escapeTextForBrowser(nonceStyle) + '"'), idPrefix = resumableState.idPrefix, bootstrapChunks = [], bootstrapScriptContent = resumableState.bootstrapScriptContent, bootstrapScripts = resumableState.bootstrapScripts, bootstrapModules = resumableState.bootstrapModules;
    void 0 !== bootstrapScriptContent && (bootstrapChunks.push(inlineScriptWithNonce), pushCompletedShellIdAttribute(bootstrapChunks, resumableState), bootstrapChunks.push(endOfStartTag, stringToChunk(("" + bootstrapScriptContent).replace(scriptRegex, scriptReplacer)), endInlineScript));
    bootstrapScriptContent = [];
    void 0 !== importMap && (bootstrapScriptContent.push(importMapScriptStart), bootstrapScriptContent.push(stringToChunk(("" + JSON.stringify(importMap)).replace(scriptRegex, scriptReplacer))), bootstrapScriptContent.push(importMapScriptEnd));
    importMap = onHeaders ? {
        preconnects: "",
        fontPreloads: "",
        highImagePreloads: "",
        remainingCapacity: 2 + ("number" === typeof maxHeadersLength ? maxHeadersLength : 2e3)
    } : null;
    onHeaders = {
        placeholderPrefix: stringToPrecomputedChunk(idPrefix + "P:"),
        segmentPrefix: stringToPrecomputedChunk(idPrefix + "S:"),
        boundaryPrefix: stringToPrecomputedChunk(idPrefix + "B:"),
        startInlineScript: inlineScriptWithNonce,
        startInlineStyle: inlineStyleWithNonce,
        preamble: createPreambleState(),
        externalRuntimeScript: null,
        bootstrapChunks: bootstrapChunks,
        importMapChunks: bootstrapScriptContent,
        onHeaders: onHeaders,
        headers: importMap,
        resets: {
            font: {},
            dns: {},
            connect: {
                default: {},
                anonymous: {},
                credentials: {}
            },
            image: {},
            style: {}
        },
        charsetChunks: [],
        viewportChunks: [],
        hoistableChunks: [],
        preconnects: new Set(),
        fontPreloads: new Set(),
        highImagePreloads: new Set(),
        styles: new Map(),
        bootstrapScripts: new Set(),
        scripts: new Set(),
        bulkPreloads: new Set(),
        preloads: {
            images: new Map(),
            stylesheets: new Map(),
            scripts: new Map(),
            moduleScripts: new Map()
        },
        nonce: {
            script: externalRuntimeConfig,
            style: nonceStyle
        },
        hoistableState: null,
        stylesToHoist: !1
    };
    if (void 0 !== bootstrapScripts) for(importMap = 0; importMap < bootstrapScripts.length; importMap++)idPrefix = bootstrapScripts[importMap], nonceStyle = inlineScriptWithNonce = void 0, inlineStyleWithNonce = {
        rel: "preload",
        as: "script",
        fetchPriority: "low",
        nonce: nonce
    }, "string" === typeof idPrefix ? inlineStyleWithNonce.href = maxHeadersLength = idPrefix : (inlineStyleWithNonce.href = maxHeadersLength = idPrefix.src, inlineStyleWithNonce.integrity = nonceStyle = "string" === typeof idPrefix.integrity ? idPrefix.integrity : void 0, inlineStyleWithNonce.crossOrigin = inlineScriptWithNonce = "string" === typeof idPrefix || null == idPrefix.crossOrigin ? void 0 : "use-credentials" === idPrefix.crossOrigin ? "use-credentials" : ""), idPrefix = resumableState, bootstrapScriptContent = maxHeadersLength, idPrefix.scriptResources[bootstrapScriptContent] = null, idPrefix.moduleScriptResources[bootstrapScriptContent] = null, idPrefix = [], pushLinkImpl(idPrefix, inlineStyleWithNonce), onHeaders.bootstrapScripts.add(idPrefix), bootstrapChunks.push(startScriptSrc, stringToChunk(escapeTextForBrowser(maxHeadersLength)), attributeEnd), externalRuntimeConfig && bootstrapChunks.push(scriptNonce, stringToChunk(escapeTextForBrowser(externalRuntimeConfig)), attributeEnd), "string" === typeof nonceStyle && bootstrapChunks.push(scriptIntegirty, stringToChunk(escapeTextForBrowser(nonceStyle)), attributeEnd), "string" === typeof inlineScriptWithNonce && bootstrapChunks.push(scriptCrossOrigin, stringToChunk(escapeTextForBrowser(inlineScriptWithNonce)), attributeEnd), pushCompletedShellIdAttribute(bootstrapChunks, resumableState), bootstrapChunks.push(endAsyncScript);
    if (void 0 !== bootstrapModules) for(nonce = 0; nonce < bootstrapModules.length; nonce++)nonceStyle = bootstrapModules[nonce], maxHeadersLength = importMap = void 0, inlineScriptWithNonce = {
        rel: "modulepreload",
        fetchPriority: "low",
        nonce: externalRuntimeConfig
    }, "string" === typeof nonceStyle ? inlineScriptWithNonce.href = bootstrapScripts = nonceStyle : (inlineScriptWithNonce.href = bootstrapScripts = nonceStyle.src, inlineScriptWithNonce.integrity = maxHeadersLength = "string" === typeof nonceStyle.integrity ? nonceStyle.integrity : void 0, inlineScriptWithNonce.crossOrigin = importMap = "string" === typeof nonceStyle || null == nonceStyle.crossOrigin ? void 0 : "use-credentials" === nonceStyle.crossOrigin ? "use-credentials" : ""), nonceStyle = resumableState, inlineStyleWithNonce = bootstrapScripts, nonceStyle.scriptResources[inlineStyleWithNonce] = null, nonceStyle.moduleScriptResources[inlineStyleWithNonce] = null, nonceStyle = [], pushLinkImpl(nonceStyle, inlineScriptWithNonce), onHeaders.bootstrapScripts.add(nonceStyle), bootstrapChunks.push(startModuleSrc, stringToChunk(escapeTextForBrowser(bootstrapScripts)), attributeEnd), externalRuntimeConfig && bootstrapChunks.push(scriptNonce, stringToChunk(escapeTextForBrowser(externalRuntimeConfig)), attributeEnd), "string" === typeof maxHeadersLength && bootstrapChunks.push(scriptIntegirty, stringToChunk(escapeTextForBrowser(maxHeadersLength)), attributeEnd), "string" === typeof importMap && bootstrapChunks.push(scriptCrossOrigin, stringToChunk(escapeTextForBrowser(importMap)), attributeEnd), pushCompletedShellIdAttribute(bootstrapChunks, resumableState), bootstrapChunks.push(endAsyncScript);
    return onHeaders;
}
function createResumableState(identifierPrefix, externalRuntimeConfig, bootstrapScriptContent, bootstrapScripts, bootstrapModules) {
    return {
        idPrefix: void 0 === identifierPrefix ? "" : identifierPrefix,
        nextFormID: 0,
        streamingFormat: 0,
        bootstrapScriptContent: bootstrapScriptContent,
        bootstrapScripts: bootstrapScripts,
        bootstrapModules: bootstrapModules,
        instructions: 0,
        hasBody: !1,
        hasHtml: !1,
        unknownResources: {},
        dnsResources: {},
        connectResources: {
            default: {},
            anonymous: {},
            credentials: {}
        },
        imageResources: {},
        styleResources: {},
        scriptResources: {},
        moduleUnknownResources: {},
        moduleScriptResources: {}
    };
}
function createPreambleState() {
    return {
        htmlChunks: null,
        headChunks: null,
        bodyChunks: null
    };
}
function createFormatContext(insertionMode, selectedValue, tagScope, viewTransition) {
    return {
        insertionMode: insertionMode,
        selectedValue: selectedValue,
        tagScope: tagScope,
        viewTransition: viewTransition
    };
}
function createRootFormatContext(namespaceURI) {
    return createFormatContext("http://www.w3.org/2000/svg" === namespaceURI ? 4 : "http://www.w3.org/1998/Math/MathML" === namespaceURI ? 5 : 0, null, 0, null);
}
function getChildFormatContext(parentContext, type, props) {
    var subtreeScope = parentContext.tagScope & -25;
    switch(type){
        case "noscript":
            return createFormatContext(2, null, subtreeScope | 1, null);
        case "select":
            return createFormatContext(2, null != props.value ? props.value : props.defaultValue, subtreeScope, null);
        case "svg":
            return createFormatContext(4, null, subtreeScope, null);
        case "picture":
            return createFormatContext(2, null, subtreeScope | 2, null);
        case "math":
            return createFormatContext(5, null, subtreeScope, null);
        case "foreignObject":
            return createFormatContext(2, null, subtreeScope, null);
        case "table":
            return createFormatContext(6, null, subtreeScope, null);
        case "thead":
        case "tbody":
        case "tfoot":
            return createFormatContext(7, null, subtreeScope, null);
        case "colgroup":
            return createFormatContext(9, null, subtreeScope, null);
        case "tr":
            return createFormatContext(8, null, subtreeScope, null);
        case "head":
            if (2 > parentContext.insertionMode) return createFormatContext(3, null, subtreeScope, null);
            break;
        case "html":
            if (0 === parentContext.insertionMode) return createFormatContext(1, null, subtreeScope, null);
    }
    return 6 <= parentContext.insertionMode || 2 > parentContext.insertionMode ? createFormatContext(2, null, subtreeScope, null) : parentContext.tagScope !== subtreeScope ? createFormatContext(parentContext.insertionMode, parentContext.selectedValue, subtreeScope, null) : parentContext;
}
function getSuspenseViewTransition(parentViewTransition) {
    return null === parentViewTransition ? null : {
        update: parentViewTransition.update,
        enter: "none",
        exit: "none",
        share: parentViewTransition.update,
        name: parentViewTransition.autoName,
        autoName: parentViewTransition.autoName,
        nameIdx: 0
    };
}
function getSuspenseFallbackFormatContext(resumableState, parentContext) {
    parentContext.tagScope & 32 && (resumableState.instructions |= 128);
    return createFormatContext(parentContext.insertionMode, parentContext.selectedValue, parentContext.tagScope | 12, getSuspenseViewTransition(parentContext.viewTransition));
}
function getSuspenseContentFormatContext(resumableState, parentContext) {
    resumableState = getSuspenseViewTransition(parentContext.viewTransition);
    var subtreeScope = parentContext.tagScope | 16;
    null !== resumableState && "none" !== resumableState.share && (subtreeScope |= 64);
    return createFormatContext(parentContext.insertionMode, parentContext.selectedValue, subtreeScope, resumableState);
}
var textSeparator = stringToPrecomputedChunk("\x3c!-- --\x3e");
function pushTextInstance(target, text, renderState, textEmbedded) {
    if ("" === text) return textEmbedded;
    textEmbedded && target.push(textSeparator);
    target.push(stringToChunk(escapeTextForBrowser(text)));
    return !0;
}
var styleNameCache = new Map(), styleAttributeStart = stringToPrecomputedChunk(' style="'), styleAssign = stringToPrecomputedChunk(":"), styleSeparator = stringToPrecomputedChunk(";");
function pushStyleAttribute(target, style) {
    if ("object" !== (typeof style === "undefined" ? "undefined" : _type_of(style))) throw Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
    var isFirst = !0, styleName;
    for(styleName in style)if (hasOwnProperty.call(style, styleName)) {
        var styleValue = style[styleName];
        if (null != styleValue && "boolean" !== typeof styleValue && "" !== styleValue) {
            if (0 === styleName.indexOf("--")) {
                var nameChunk = stringToChunk(escapeTextForBrowser(styleName));
                styleValue = stringToChunk(escapeTextForBrowser(("" + styleValue).trim()));
            } else nameChunk = styleNameCache.get(styleName), void 0 === nameChunk && (nameChunk = stringToPrecomputedChunk(escapeTextForBrowser(styleName.replace(uppercasePattern, "-$1").toLowerCase().replace(msPattern, "-ms-"))), styleNameCache.set(styleName, nameChunk)), styleValue = "number" === typeof styleValue ? 0 === styleValue || unitlessNumbers.has(styleName) ? stringToChunk("" + styleValue) : stringToChunk(styleValue + "px") : stringToChunk(escapeTextForBrowser(("" + styleValue).trim()));
            isFirst ? (isFirst = !1, target.push(styleAttributeStart, nameChunk, styleAssign, styleValue)) : target.push(styleSeparator, nameChunk, styleAssign, styleValue);
        }
    }
    isFirst || target.push(attributeEnd);
}
var attributeSeparator = stringToPrecomputedChunk(" "), attributeAssign = stringToPrecomputedChunk('="'), attributeEnd = stringToPrecomputedChunk('"'), attributeEmptyString = stringToPrecomputedChunk('=""');
function pushBooleanAttribute(target, name, value) {
    value && "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && target.push(attributeSeparator, stringToChunk(name), attributeEmptyString);
}
function pushStringAttribute(target, name, value) {
    "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && "boolean" !== typeof value && target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
}
var actionJavaScriptURL = stringToPrecomputedChunk(escapeTextForBrowser("javascript:throw new Error('React form unexpectedly submitted.')")), startHiddenInputChunk = stringToPrecomputedChunk('<input type="hidden"');
function pushAdditionalFormField(value, key) {
    this.push(startHiddenInputChunk);
    validateAdditionalFormField(value);
    pushStringAttribute(this, "name", key);
    pushStringAttribute(this, "value", value);
    this.push(endOfStartTagSelfClosing);
}
function validateAdditionalFormField(value) {
    if ("string" !== typeof value) throw Error("File/Blob fields are not yet supported in progressive forms. Will fallback to client hydration.");
}
function getCustomFormFields(resumableState, formAction) {
    if ("function" === typeof formAction.$$FORM_ACTION) {
        var id = resumableState.nextFormID++;
        resumableState = resumableState.idPrefix + id;
        try {
            var customFields = formAction.$$FORM_ACTION(resumableState);
            if (customFields) {
                var formData = customFields.data;
                null != formData && formData.forEach(validateAdditionalFormField);
            }
            return customFields;
        } catch (x) {
            if ("object" === (typeof x === "undefined" ? "undefined" : _type_of(x)) && null !== x && "function" === typeof x.then) throw x;
        }
    }
    return null;
}
function pushFormActionAttribute(target, resumableState, renderState, formAction, formEncType, formMethod, formTarget, name) {
    var formData = null;
    if ("function" === typeof formAction) {
        var customFields = getCustomFormFields(resumableState, formAction);
        null !== customFields ? (name = customFields.name, formAction = customFields.action || "", formEncType = customFields.encType, formMethod = customFields.method, formTarget = customFields.target, formData = customFields.data) : (target.push(attributeSeparator, stringToChunk("formAction"), attributeAssign, actionJavaScriptURL, attributeEnd), formTarget = formMethod = formEncType = formAction = name = null, injectFormReplayingRuntime(resumableState, renderState));
    }
    null != name && pushAttribute(target, "name", name);
    null != formAction && pushAttribute(target, "formAction", formAction);
    null != formEncType && pushAttribute(target, "formEncType", formEncType);
    null != formMethod && pushAttribute(target, "formMethod", formMethod);
    null != formTarget && pushAttribute(target, "formTarget", formTarget);
    return formData;
}
function pushAttribute(target, name, value) {
    switch(name){
        case "className":
            pushStringAttribute(target, "class", value);
            break;
        case "tabIndex":
            pushStringAttribute(target, "tabindex", value);
            break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
            pushStringAttribute(target, name, value);
            break;
        case "style":
            pushStyleAttribute(target, value);
            break;
        case "src":
        case "href":
            if ("" === value) break;
        case "action":
        case "formAction":
            if (null == value || "function" === typeof value || "symbol" === (typeof value === "undefined" ? "undefined" : _type_of(value)) || "boolean" === typeof value) break;
            value = sanitizeURL("" + value);
            target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
            break;
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "ref":
            break;
        case "autoFocus":
        case "multiple":
        case "muted":
            pushBooleanAttribute(target, name.toLowerCase(), value);
            break;
        case "xlinkHref":
            if ("function" === typeof value || "symbol" === (typeof value === "undefined" ? "undefined" : _type_of(value)) || "boolean" === typeof value) break;
            value = sanitizeURL("" + value);
            target.push(attributeSeparator, stringToChunk("xlink:href"), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
            break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
            "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
            break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
            value && "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && target.push(attributeSeparator, stringToChunk(name), attributeEmptyString);
            break;
        case "capture":
        case "download":
            !0 === value ? target.push(attributeSeparator, stringToChunk(name), attributeEmptyString) : !1 !== value && "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
            break;
        case "cols":
        case "rows":
        case "size":
        case "span":
            "function" !== typeof value && "symbol" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) && !isNaN(value) && 1 <= value && target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
            break;
        case "rowSpan":
        case "start":
            "function" === typeof value || "symbol" === (typeof value === "undefined" ? "undefined" : _type_of(value)) || isNaN(value) || target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
            break;
        case "xlinkActuate":
            pushStringAttribute(target, "xlink:actuate", value);
            break;
        case "xlinkArcrole":
            pushStringAttribute(target, "xlink:arcrole", value);
            break;
        case "xlinkRole":
            pushStringAttribute(target, "xlink:role", value);
            break;
        case "xlinkShow":
            pushStringAttribute(target, "xlink:show", value);
            break;
        case "xlinkTitle":
            pushStringAttribute(target, "xlink:title", value);
            break;
        case "xlinkType":
            pushStringAttribute(target, "xlink:type", value);
            break;
        case "xmlBase":
            pushStringAttribute(target, "xml:base", value);
            break;
        case "xmlLang":
            pushStringAttribute(target, "xml:lang", value);
            break;
        case "xmlSpace":
            pushStringAttribute(target, "xml:space", value);
            break;
        default:
            if (!(2 < name.length) || "o" !== name[0] && "O" !== name[0] || "n" !== name[1] && "N" !== name[1]) {
                if (name = aliases.get(name) || name, isAttributeNameSafe(name)) {
                    switch(typeof value === "undefined" ? "undefined" : _type_of(value)){
                        case "function":
                        case "symbol":
                            return;
                        case "boolean":
                            var prefix$8 = name.toLowerCase().slice(0, 5);
                            if ("data-" !== prefix$8 && "aria-" !== prefix$8) return;
                    }
                    target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
                }
            }
    }
}
var endOfStartTag = stringToPrecomputedChunk(">"), endOfStartTagSelfClosing = stringToPrecomputedChunk("/>");
function pushInnerHTML(target, innerHTML, children) {
    if (null != innerHTML) {
        if (null != children) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        if ("object" !== (typeof innerHTML === "undefined" ? "undefined" : _type_of(innerHTML)) || !("__html" in innerHTML)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://react.dev/link/dangerously-set-inner-html for more information.");
        innerHTML = innerHTML.__html;
        null !== innerHTML && void 0 !== innerHTML && target.push(stringToChunk("" + innerHTML));
    }
}
function flattenOptionChildren(children) {
    var content = "";
    React.Children.forEach(children, function(child) {
        null != child && (content += child);
    });
    return content;
}
var selectedMarkerAttribute = stringToPrecomputedChunk(' selected=""'), formReplayingRuntimeScript = stringToPrecomputedChunk('addEventListener("submit",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute("formAction");null!=f&&(e=f,b=null)}"javascript:throw new Error(\'React form unexpectedly submitted.\')"===e&&(a.preventDefault(),b?(a=document.createElement("input"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});');
function injectFormReplayingRuntime(resumableState, renderState) {
    if (0 === (resumableState.instructions & 16)) {
        resumableState.instructions |= 16;
        var preamble = renderState.preamble, bootstrapChunks = renderState.bootstrapChunks;
        (preamble.htmlChunks || preamble.headChunks) && 0 === bootstrapChunks.length ? (bootstrapChunks.push(renderState.startInlineScript), pushCompletedShellIdAttribute(bootstrapChunks, resumableState), bootstrapChunks.push(endOfStartTag, formReplayingRuntimeScript, endInlineScript)) : bootstrapChunks.unshift(renderState.startInlineScript, endOfStartTag, formReplayingRuntimeScript, endInlineScript);
    }
}
var formStateMarkerIsMatching = stringToPrecomputedChunk("\x3c!--F!--\x3e"), formStateMarkerIsNotMatching = stringToPrecomputedChunk("\x3c!--F--\x3e");
function pushLinkImpl(target, props) {
    target.push(startChunkForTag("link"));
    for(var propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
            case "dangerouslySetInnerHTML":
                throw Error("link is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push(endOfStartTagSelfClosing);
    return null;
}
var styleRegex = /(<\/|<)(s)(tyle)/gi;
function styleReplacer(match, prefix, s, suffix) {
    return "" + prefix + ("s" === s ? "\\73 " : "\\53 ") + suffix;
}
function pushSelfClosing(target, props, tag) {
    target.push(startChunkForTag(tag));
    for(var propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
            case "dangerouslySetInnerHTML":
                throw Error(tag + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push(endOfStartTagSelfClosing);
    return null;
}
function pushTitleImpl(target, props) {
    target.push(startChunkForTag("title"));
    var children = null, innerHTML = null, propKey;
    for(propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
                children = propValue;
                break;
            case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push(endOfStartTag);
    props = Array.isArray(children) ? 2 > children.length ? children[0] : null : children;
    "function" !== typeof props && "symbol" !== (typeof props === "undefined" ? "undefined" : _type_of(props)) && null !== props && void 0 !== props && target.push(stringToChunk(escapeTextForBrowser("" + props)));
    pushInnerHTML(target, innerHTML, children);
    target.push(endChunkForTag("title"));
    return null;
}
var headPreambleContributionChunk = stringToPrecomputedChunk("\x3c!--head--\x3e"), bodyPreambleContributionChunk = stringToPrecomputedChunk("\x3c!--body--\x3e"), htmlPreambleContributionChunk = stringToPrecomputedChunk("\x3c!--html--\x3e");
function pushScriptImpl(target, props) {
    target.push(startChunkForTag("script"));
    var children = null, innerHTML = null, propKey;
    for(propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
                children = propValue;
                break;
            case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push(endOfStartTag);
    pushInnerHTML(target, innerHTML, children);
    "string" === typeof children && target.push(stringToChunk(("" + children).replace(scriptRegex, scriptReplacer)));
    target.push(endChunkForTag("script"));
    return null;
}
function pushStartSingletonElement(target, props, tag) {
    target.push(startChunkForTag(tag));
    var innerHTML = tag = null, propKey;
    for(propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
                tag = propValue;
                break;
            case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push(endOfStartTag);
    pushInnerHTML(target, innerHTML, tag);
    return tag;
}
function pushStartGenericElement(target, props, tag) {
    target.push(startChunkForTag(tag));
    var innerHTML = tag = null, propKey;
    for(propKey in props)if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue) switch(propKey){
            case "children":
                tag = propValue;
                break;
            case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
            default:
                pushAttribute(target, propKey, propValue);
        }
    }
    target.push(endOfStartTag);
    pushInnerHTML(target, innerHTML, tag);
    return "string" === typeof tag ? (target.push(stringToChunk(escapeTextForBrowser(tag))), null) : tag;
}
var leadingNewline = stringToPrecomputedChunk("\n"), VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/, validatedTagCache = new Map();
function startChunkForTag(tag) {
    var tagStartChunk = validatedTagCache.get(tag);
    if (void 0 === tagStartChunk) {
        if (!VALID_TAG_REGEX.test(tag)) throw Error("Invalid tag: " + tag);
        tagStartChunk = stringToPrecomputedChunk("<" + tag);
        validatedTagCache.set(tag, tagStartChunk);
    }
    return tagStartChunk;
}
var doctypeChunk = stringToPrecomputedChunk("<!DOCTYPE html>");
function pushStartInstance(target$jscomp$0, type, props, resumableState, renderState, preambleState, hoistableState, formatContext, textEmbedded) {
    switch(type){
        case "div":
        case "span":
        case "svg":
        case "path":
            break;
        case "a":
            target$jscomp$0.push(startChunkForTag("a"));
            var children = null, innerHTML = null, propKey;
            for(propKey in props)if (hasOwnProperty.call(props, propKey)) {
                var propValue = props[propKey];
                if (null != propValue) switch(propKey){
                    case "children":
                        children = propValue;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML = propValue;
                        break;
                    case "href":
                        "" === propValue ? pushStringAttribute(target$jscomp$0, "href", "") : pushAttribute(target$jscomp$0, propKey, propValue);
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey, propValue);
                }
            }
            target$jscomp$0.push(endOfStartTag);
            pushInnerHTML(target$jscomp$0, innerHTML, children);
            if ("string" === typeof children) {
                target$jscomp$0.push(stringToChunk(escapeTextForBrowser(children)));
                var JSCompiler_inline_result = null;
            } else JSCompiler_inline_result = children;
            return JSCompiler_inline_result;
        case "g":
        case "p":
        case "li":
            break;
        case "select":
            target$jscomp$0.push(startChunkForTag("select"));
            var children$jscomp$0 = null, innerHTML$jscomp$0 = null, propKey$jscomp$0;
            for(propKey$jscomp$0 in props)if (hasOwnProperty.call(props, propKey$jscomp$0)) {
                var propValue$jscomp$0 = props[propKey$jscomp$0];
                if (null != propValue$jscomp$0) switch(propKey$jscomp$0){
                    case "children":
                        children$jscomp$0 = propValue$jscomp$0;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$0 = propValue$jscomp$0;
                        break;
                    case "defaultValue":
                    case "value":
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$0, propValue$jscomp$0);
                }
            }
            target$jscomp$0.push(endOfStartTag);
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$0, children$jscomp$0);
            return children$jscomp$0;
        case "option":
            var selectedValue = formatContext.selectedValue;
            target$jscomp$0.push(startChunkForTag("option"));
            var children$jscomp$1 = null, value = null, selected = null, innerHTML$jscomp$1 = null, propKey$jscomp$1;
            for(propKey$jscomp$1 in props)if (hasOwnProperty.call(props, propKey$jscomp$1)) {
                var propValue$jscomp$1 = props[propKey$jscomp$1];
                if (null != propValue$jscomp$1) switch(propKey$jscomp$1){
                    case "children":
                        children$jscomp$1 = propValue$jscomp$1;
                        break;
                    case "selected":
                        selected = propValue$jscomp$1;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$1 = propValue$jscomp$1;
                        break;
                    case "value":
                        value = propValue$jscomp$1;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$1, propValue$jscomp$1);
                }
            }
            if (null != selectedValue) {
                var stringValue = null !== value ? "" + value : flattenOptionChildren(children$jscomp$1);
                if (isArrayImpl(selectedValue)) for(var i = 0; i < selectedValue.length; i++){
                    if ("" + selectedValue[i] === stringValue) {
                        target$jscomp$0.push(selectedMarkerAttribute);
                        break;
                    }
                }
                else "" + selectedValue === stringValue && target$jscomp$0.push(selectedMarkerAttribute);
            } else selected && target$jscomp$0.push(selectedMarkerAttribute);
            target$jscomp$0.push(endOfStartTag);
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$1, children$jscomp$1);
            return children$jscomp$1;
        case "textarea":
            target$jscomp$0.push(startChunkForTag("textarea"));
            var value$jscomp$0 = null, defaultValue = null, children$jscomp$2 = null, propKey$jscomp$2;
            for(propKey$jscomp$2 in props)if (hasOwnProperty.call(props, propKey$jscomp$2)) {
                var propValue$jscomp$2 = props[propKey$jscomp$2];
                if (null != propValue$jscomp$2) switch(propKey$jscomp$2){
                    case "children":
                        children$jscomp$2 = propValue$jscomp$2;
                        break;
                    case "value":
                        value$jscomp$0 = propValue$jscomp$2;
                        break;
                    case "defaultValue":
                        defaultValue = propValue$jscomp$2;
                        break;
                    case "dangerouslySetInnerHTML":
                        throw Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$2, propValue$jscomp$2);
                }
            }
            null === value$jscomp$0 && null !== defaultValue && (value$jscomp$0 = defaultValue);
            target$jscomp$0.push(endOfStartTag);
            if (null != children$jscomp$2) {
                if (null != value$jscomp$0) throw Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
                if (isArrayImpl(children$jscomp$2)) {
                    if (1 < children$jscomp$2.length) throw Error("<textarea> can only have at most one child.");
                    value$jscomp$0 = "" + children$jscomp$2[0];
                }
                value$jscomp$0 = "" + children$jscomp$2;
            }
            "string" === typeof value$jscomp$0 && "\n" === value$jscomp$0[0] && target$jscomp$0.push(leadingNewline);
            null !== value$jscomp$0 && target$jscomp$0.push(stringToChunk(escapeTextForBrowser("" + value$jscomp$0)));
            return null;
        case "input":
            target$jscomp$0.push(startChunkForTag("input"));
            var name = null, formAction = null, formEncType = null, formMethod = null, formTarget = null, value$jscomp$1 = null, defaultValue$jscomp$0 = null, checked = null, defaultChecked = null, propKey$jscomp$3;
            for(propKey$jscomp$3 in props)if (hasOwnProperty.call(props, propKey$jscomp$3)) {
                var propValue$jscomp$3 = props[propKey$jscomp$3];
                if (null != propValue$jscomp$3) switch(propKey$jscomp$3){
                    case "children":
                    case "dangerouslySetInnerHTML":
                        throw Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
                    case "name":
                        name = propValue$jscomp$3;
                        break;
                    case "formAction":
                        formAction = propValue$jscomp$3;
                        break;
                    case "formEncType":
                        formEncType = propValue$jscomp$3;
                        break;
                    case "formMethod":
                        formMethod = propValue$jscomp$3;
                        break;
                    case "formTarget":
                        formTarget = propValue$jscomp$3;
                        break;
                    case "defaultChecked":
                        defaultChecked = propValue$jscomp$3;
                        break;
                    case "defaultValue":
                        defaultValue$jscomp$0 = propValue$jscomp$3;
                        break;
                    case "checked":
                        checked = propValue$jscomp$3;
                        break;
                    case "value":
                        value$jscomp$1 = propValue$jscomp$3;
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$3, propValue$jscomp$3);
                }
            }
            var formData = pushFormActionAttribute(target$jscomp$0, resumableState, renderState, formAction, formEncType, formMethod, formTarget, name);
            null !== checked ? pushBooleanAttribute(target$jscomp$0, "checked", checked) : null !== defaultChecked && pushBooleanAttribute(target$jscomp$0, "checked", defaultChecked);
            null !== value$jscomp$1 ? pushAttribute(target$jscomp$0, "value", value$jscomp$1) : null !== defaultValue$jscomp$0 && pushAttribute(target$jscomp$0, "value", defaultValue$jscomp$0);
            target$jscomp$0.push(endOfStartTagSelfClosing);
            null != formData && formData.forEach(pushAdditionalFormField, target$jscomp$0);
            return null;
        case "button":
            target$jscomp$0.push(startChunkForTag("button"));
            var children$jscomp$3 = null, innerHTML$jscomp$2 = null, name$jscomp$0 = null, formAction$jscomp$0 = null, formEncType$jscomp$0 = null, formMethod$jscomp$0 = null, formTarget$jscomp$0 = null, propKey$jscomp$4;
            for(propKey$jscomp$4 in props)if (hasOwnProperty.call(props, propKey$jscomp$4)) {
                var propValue$jscomp$4 = props[propKey$jscomp$4];
                if (null != propValue$jscomp$4) switch(propKey$jscomp$4){
                    case "children":
                        children$jscomp$3 = propValue$jscomp$4;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$2 = propValue$jscomp$4;
                        break;
                    case "name":
                        name$jscomp$0 = propValue$jscomp$4;
                        break;
                    case "formAction":
                        formAction$jscomp$0 = propValue$jscomp$4;
                        break;
                    case "formEncType":
                        formEncType$jscomp$0 = propValue$jscomp$4;
                        break;
                    case "formMethod":
                        formMethod$jscomp$0 = propValue$jscomp$4;
                        break;
                    case "formTarget":
                        formTarget$jscomp$0 = propValue$jscomp$4;
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$4, propValue$jscomp$4);
                }
            }
            var formData$jscomp$0 = pushFormActionAttribute(target$jscomp$0, resumableState, renderState, formAction$jscomp$0, formEncType$jscomp$0, formMethod$jscomp$0, formTarget$jscomp$0, name$jscomp$0);
            target$jscomp$0.push(endOfStartTag);
            null != formData$jscomp$0 && formData$jscomp$0.forEach(pushAdditionalFormField, target$jscomp$0);
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$2, children$jscomp$3);
            if ("string" === typeof children$jscomp$3) {
                target$jscomp$0.push(stringToChunk(escapeTextForBrowser(children$jscomp$3)));
                var JSCompiler_inline_result$jscomp$0 = null;
            } else JSCompiler_inline_result$jscomp$0 = children$jscomp$3;
            return JSCompiler_inline_result$jscomp$0;
        case "form":
            target$jscomp$0.push(startChunkForTag("form"));
            var children$jscomp$4 = null, innerHTML$jscomp$3 = null, formAction$jscomp$1 = null, formEncType$jscomp$1 = null, formMethod$jscomp$1 = null, formTarget$jscomp$1 = null, propKey$jscomp$5;
            for(propKey$jscomp$5 in props)if (hasOwnProperty.call(props, propKey$jscomp$5)) {
                var propValue$jscomp$5 = props[propKey$jscomp$5];
                if (null != propValue$jscomp$5) switch(propKey$jscomp$5){
                    case "children":
                        children$jscomp$4 = propValue$jscomp$5;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$3 = propValue$jscomp$5;
                        break;
                    case "action":
                        formAction$jscomp$1 = propValue$jscomp$5;
                        break;
                    case "encType":
                        formEncType$jscomp$1 = propValue$jscomp$5;
                        break;
                    case "method":
                        formMethod$jscomp$1 = propValue$jscomp$5;
                        break;
                    case "target":
                        formTarget$jscomp$1 = propValue$jscomp$5;
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$5, propValue$jscomp$5);
                }
            }
            var formData$jscomp$1 = null, formActionName = null;
            if ("function" === typeof formAction$jscomp$1) {
                var customFields = getCustomFormFields(resumableState, formAction$jscomp$1);
                null !== customFields ? (formAction$jscomp$1 = customFields.action || "", formEncType$jscomp$1 = customFields.encType, formMethod$jscomp$1 = customFields.method, formTarget$jscomp$1 = customFields.target, formData$jscomp$1 = customFields.data, formActionName = customFields.name) : (target$jscomp$0.push(attributeSeparator, stringToChunk("action"), attributeAssign, actionJavaScriptURL, attributeEnd), formTarget$jscomp$1 = formMethod$jscomp$1 = formEncType$jscomp$1 = formAction$jscomp$1 = null, injectFormReplayingRuntime(resumableState, renderState));
            }
            null != formAction$jscomp$1 && pushAttribute(target$jscomp$0, "action", formAction$jscomp$1);
            null != formEncType$jscomp$1 && pushAttribute(target$jscomp$0, "encType", formEncType$jscomp$1);
            null != formMethod$jscomp$1 && pushAttribute(target$jscomp$0, "method", formMethod$jscomp$1);
            null != formTarget$jscomp$1 && pushAttribute(target$jscomp$0, "target", formTarget$jscomp$1);
            target$jscomp$0.push(endOfStartTag);
            null !== formActionName && (target$jscomp$0.push(startHiddenInputChunk), pushStringAttribute(target$jscomp$0, "name", formActionName), target$jscomp$0.push(endOfStartTagSelfClosing), null != formData$jscomp$1 && formData$jscomp$1.forEach(pushAdditionalFormField, target$jscomp$0));
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$3, children$jscomp$4);
            if ("string" === typeof children$jscomp$4) {
                target$jscomp$0.push(stringToChunk(escapeTextForBrowser(children$jscomp$4)));
                var JSCompiler_inline_result$jscomp$1 = null;
            } else JSCompiler_inline_result$jscomp$1 = children$jscomp$4;
            return JSCompiler_inline_result$jscomp$1;
        case "menuitem":
            target$jscomp$0.push(startChunkForTag("menuitem"));
            for(var propKey$jscomp$6 in props)if (hasOwnProperty.call(props, propKey$jscomp$6)) {
                var propValue$jscomp$6 = props[propKey$jscomp$6];
                if (null != propValue$jscomp$6) switch(propKey$jscomp$6){
                    case "children":
                    case "dangerouslySetInnerHTML":
                        throw Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$6, propValue$jscomp$6);
                }
            }
            target$jscomp$0.push(endOfStartTag);
            return null;
        case "object":
            target$jscomp$0.push(startChunkForTag("object"));
            var children$jscomp$5 = null, innerHTML$jscomp$4 = null, propKey$jscomp$7;
            for(propKey$jscomp$7 in props)if (hasOwnProperty.call(props, propKey$jscomp$7)) {
                var propValue$jscomp$7 = props[propKey$jscomp$7];
                if (null != propValue$jscomp$7) switch(propKey$jscomp$7){
                    case "children":
                        children$jscomp$5 = propValue$jscomp$7;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$4 = propValue$jscomp$7;
                        break;
                    case "data":
                        var sanitizedValue = sanitizeURL("" + propValue$jscomp$7);
                        if ("" === sanitizedValue) break;
                        target$jscomp$0.push(attributeSeparator, stringToChunk("data"), attributeAssign, stringToChunk(escapeTextForBrowser(sanitizedValue)), attributeEnd);
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$7, propValue$jscomp$7);
                }
            }
            target$jscomp$0.push(endOfStartTag);
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$4, children$jscomp$5);
            if ("string" === typeof children$jscomp$5) {
                target$jscomp$0.push(stringToChunk(escapeTextForBrowser(children$jscomp$5)));
                var JSCompiler_inline_result$jscomp$2 = null;
            } else JSCompiler_inline_result$jscomp$2 = children$jscomp$5;
            return JSCompiler_inline_result$jscomp$2;
        case "title":
            var noscriptTagInScope = formatContext.tagScope & 1, isFallback = formatContext.tagScope & 4;
            if (4 === formatContext.insertionMode || noscriptTagInScope || null != props.itemProp) var JSCompiler_inline_result$jscomp$3 = pushTitleImpl(target$jscomp$0, props);
            else isFallback ? JSCompiler_inline_result$jscomp$3 = null : (pushTitleImpl(renderState.hoistableChunks, props), JSCompiler_inline_result$jscomp$3 = void 0);
            return JSCompiler_inline_result$jscomp$3;
        case "link":
            var noscriptTagInScope$jscomp$0 = formatContext.tagScope & 1, isFallback$jscomp$0 = formatContext.tagScope & 4, rel = props.rel, href = props.href, precedence = props.precedence;
            if (4 === formatContext.insertionMode || noscriptTagInScope$jscomp$0 || null != props.itemProp || "string" !== typeof rel || "string" !== typeof href || "" === href) {
                pushLinkImpl(target$jscomp$0, props);
                var JSCompiler_inline_result$jscomp$4 = null;
            } else if ("stylesheet" === props.rel) if ("string" !== typeof precedence || null != props.disabled || props.onLoad || props.onError) JSCompiler_inline_result$jscomp$4 = pushLinkImpl(target$jscomp$0, props);
            else {
                var styleQueue = renderState.styles.get(precedence), resourceState = resumableState.styleResources.hasOwnProperty(href) ? resumableState.styleResources[href] : void 0;
                if (null !== resourceState) {
                    resumableState.styleResources[href] = null;
                    styleQueue || (styleQueue = {
                        precedence: stringToChunk(escapeTextForBrowser(precedence)),
                        rules: [],
                        hrefs: [],
                        sheets: new Map()
                    }, renderState.styles.set(precedence, styleQueue));
                    var resource = {
                        state: 0,
                        props: assign({}, props, {
                            "data-precedence": props.precedence,
                            precedence: null
                        })
                    };
                    if (resourceState) {
                        2 === resourceState.length && adoptPreloadCredentials(resource.props, resourceState);
                        var preloadResource = renderState.preloads.stylesheets.get(href);
                        preloadResource && 0 < preloadResource.length ? preloadResource.length = 0 : resource.state = 1;
                    }
                    styleQueue.sheets.set(href, resource);
                    hoistableState && hoistableState.stylesheets.add(resource);
                } else if (styleQueue) {
                    var resource$9 = styleQueue.sheets.get(href);
                    resource$9 && hoistableState && hoistableState.stylesheets.add(resource$9);
                }
                textEmbedded && target$jscomp$0.push(textSeparator);
                JSCompiler_inline_result$jscomp$4 = null;
            }
            else props.onLoad || props.onError ? JSCompiler_inline_result$jscomp$4 = pushLinkImpl(target$jscomp$0, props) : (textEmbedded && target$jscomp$0.push(textSeparator), JSCompiler_inline_result$jscomp$4 = isFallback$jscomp$0 ? null : pushLinkImpl(renderState.hoistableChunks, props));
            return JSCompiler_inline_result$jscomp$4;
        case "script":
            var noscriptTagInScope$jscomp$1 = formatContext.tagScope & 1, asyncProp = props.async;
            if ("string" !== typeof props.src || !props.src || !asyncProp || "function" === typeof asyncProp || "symbol" === (typeof asyncProp === "undefined" ? "undefined" : _type_of(asyncProp)) || props.onLoad || props.onError || 4 === formatContext.insertionMode || noscriptTagInScope$jscomp$1 || null != props.itemProp) var JSCompiler_inline_result$jscomp$5 = pushScriptImpl(target$jscomp$0, props);
            else {
                var key = props.src;
                if ("module" === props.type) {
                    var resources = resumableState.moduleScriptResources;
                    var preloads = renderState.preloads.moduleScripts;
                } else resources = resumableState.scriptResources, preloads = renderState.preloads.scripts;
                var resourceState$jscomp$0 = resources.hasOwnProperty(key) ? resources[key] : void 0;
                if (null !== resourceState$jscomp$0) {
                    resources[key] = null;
                    var scriptProps = props;
                    if (resourceState$jscomp$0) {
                        2 === resourceState$jscomp$0.length && (scriptProps = assign({}, props), adoptPreloadCredentials(scriptProps, resourceState$jscomp$0));
                        var preloadResource$jscomp$0 = preloads.get(key);
                        preloadResource$jscomp$0 && (preloadResource$jscomp$0.length = 0);
                    }
                    var resource$jscomp$0 = [];
                    renderState.scripts.add(resource$jscomp$0);
                    pushScriptImpl(resource$jscomp$0, scriptProps);
                }
                textEmbedded && target$jscomp$0.push(textSeparator);
                JSCompiler_inline_result$jscomp$5 = null;
            }
            return JSCompiler_inline_result$jscomp$5;
        case "style":
            var noscriptTagInScope$jscomp$2 = formatContext.tagScope & 1, precedence$jscomp$0 = props.precedence, href$jscomp$0 = props.href, nonce = props.nonce;
            if (4 === formatContext.insertionMode || noscriptTagInScope$jscomp$2 || null != props.itemProp || "string" !== typeof precedence$jscomp$0 || "string" !== typeof href$jscomp$0 || "" === href$jscomp$0) {
                target$jscomp$0.push(startChunkForTag("style"));
                var children$jscomp$6 = null, innerHTML$jscomp$5 = null, propKey$jscomp$8;
                for(propKey$jscomp$8 in props)if (hasOwnProperty.call(props, propKey$jscomp$8)) {
                    var propValue$jscomp$8 = props[propKey$jscomp$8];
                    if (null != propValue$jscomp$8) switch(propKey$jscomp$8){
                        case "children":
                            children$jscomp$6 = propValue$jscomp$8;
                            break;
                        case "dangerouslySetInnerHTML":
                            innerHTML$jscomp$5 = propValue$jscomp$8;
                            break;
                        default:
                            pushAttribute(target$jscomp$0, propKey$jscomp$8, propValue$jscomp$8);
                    }
                }
                target$jscomp$0.push(endOfStartTag);
                var child = Array.isArray(children$jscomp$6) ? 2 > children$jscomp$6.length ? children$jscomp$6[0] : null : children$jscomp$6;
                "function" !== typeof child && "symbol" !== (typeof child === "undefined" ? "undefined" : _type_of(child)) && null !== child && void 0 !== child && target$jscomp$0.push(stringToChunk(("" + child).replace(styleRegex, styleReplacer)));
                pushInnerHTML(target$jscomp$0, innerHTML$jscomp$5, children$jscomp$6);
                target$jscomp$0.push(endChunkForTag("style"));
                var JSCompiler_inline_result$jscomp$6 = null;
            } else {
                var styleQueue$jscomp$0 = renderState.styles.get(precedence$jscomp$0);
                if (null !== (resumableState.styleResources.hasOwnProperty(href$jscomp$0) ? resumableState.styleResources[href$jscomp$0] : void 0)) {
                    resumableState.styleResources[href$jscomp$0] = null;
                    styleQueue$jscomp$0 || (styleQueue$jscomp$0 = {
                        precedence: stringToChunk(escapeTextForBrowser(precedence$jscomp$0)),
                        rules: [],
                        hrefs: [],
                        sheets: new Map()
                    }, renderState.styles.set(precedence$jscomp$0, styleQueue$jscomp$0));
                    var nonceStyle = renderState.nonce.style;
                    if (!nonceStyle || nonceStyle === nonce) {
                        styleQueue$jscomp$0.hrefs.push(stringToChunk(escapeTextForBrowser(href$jscomp$0)));
                        var target = styleQueue$jscomp$0.rules, children$jscomp$7 = null, innerHTML$jscomp$6 = null, propKey$jscomp$9;
                        for(propKey$jscomp$9 in props)if (hasOwnProperty.call(props, propKey$jscomp$9)) {
                            var propValue$jscomp$9 = props[propKey$jscomp$9];
                            if (null != propValue$jscomp$9) switch(propKey$jscomp$9){
                                case "children":
                                    children$jscomp$7 = propValue$jscomp$9;
                                    break;
                                case "dangerouslySetInnerHTML":
                                    innerHTML$jscomp$6 = propValue$jscomp$9;
                            }
                        }
                        var child$jscomp$0 = Array.isArray(children$jscomp$7) ? 2 > children$jscomp$7.length ? children$jscomp$7[0] : null : children$jscomp$7;
                        "function" !== typeof child$jscomp$0 && "symbol" !== (typeof child$jscomp$0 === "undefined" ? "undefined" : _type_of(child$jscomp$0)) && null !== child$jscomp$0 && void 0 !== child$jscomp$0 && target.push(stringToChunk(("" + child$jscomp$0).replace(styleRegex, styleReplacer)));
                        pushInnerHTML(target, innerHTML$jscomp$6, children$jscomp$7);
                    }
                }
                styleQueue$jscomp$0 && hoistableState && hoistableState.styles.add(styleQueue$jscomp$0);
                textEmbedded && target$jscomp$0.push(textSeparator);
                JSCompiler_inline_result$jscomp$6 = void 0;
            }
            return JSCompiler_inline_result$jscomp$6;
        case "meta":
            var noscriptTagInScope$jscomp$3 = formatContext.tagScope & 1, isFallback$jscomp$1 = formatContext.tagScope & 4;
            if (4 === formatContext.insertionMode || noscriptTagInScope$jscomp$3 || null != props.itemProp) var JSCompiler_inline_result$jscomp$7 = pushSelfClosing(target$jscomp$0, props, "meta");
            else textEmbedded && target$jscomp$0.push(textSeparator), JSCompiler_inline_result$jscomp$7 = isFallback$jscomp$1 ? null : "string" === typeof props.charSet ? pushSelfClosing(renderState.charsetChunks, props, "meta") : "viewport" === props.name ? pushSelfClosing(renderState.viewportChunks, props, "meta") : pushSelfClosing(renderState.hoistableChunks, props, "meta");
            return JSCompiler_inline_result$jscomp$7;
        case "listing":
        case "pre":
            target$jscomp$0.push(startChunkForTag(type));
            var children$jscomp$8 = null, innerHTML$jscomp$7 = null, propKey$jscomp$10;
            for(propKey$jscomp$10 in props)if (hasOwnProperty.call(props, propKey$jscomp$10)) {
                var propValue$jscomp$10 = props[propKey$jscomp$10];
                if (null != propValue$jscomp$10) switch(propKey$jscomp$10){
                    case "children":
                        children$jscomp$8 = propValue$jscomp$10;
                        break;
                    case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$7 = propValue$jscomp$10;
                        break;
                    default:
                        pushAttribute(target$jscomp$0, propKey$jscomp$10, propValue$jscomp$10);
                }
            }
            target$jscomp$0.push(endOfStartTag);
            if (null != innerHTML$jscomp$7) {
                if (null != children$jscomp$8) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
                if ("object" !== (typeof innerHTML$jscomp$7 === "undefined" ? "undefined" : _type_of(innerHTML$jscomp$7)) || !("__html" in innerHTML$jscomp$7)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://react.dev/link/dangerously-set-inner-html for more information.");
                var html = innerHTML$jscomp$7.__html;
                null !== html && void 0 !== html && ("string" === typeof html && 0 < html.length && "\n" === html[0] ? target$jscomp$0.push(leadingNewline, stringToChunk(html)) : target$jscomp$0.push(stringToChunk("" + html)));
            }
            "string" === typeof children$jscomp$8 && "\n" === children$jscomp$8[0] && target$jscomp$0.push(leadingNewline);
            return children$jscomp$8;
        case "img":
            var pictureOrNoScriptTagInScope = formatContext.tagScope & 3, src = props.src, srcSet = props.srcSet;
            if (!("lazy" === props.loading || !src && !srcSet || "string" !== typeof src && null != src || "string" !== typeof srcSet && null != srcSet || "low" === props.fetchPriority || pictureOrNoScriptTagInScope) && ("string" !== typeof src || ":" !== src[4] || "d" !== src[0] && "D" !== src[0] || "a" !== src[1] && "A" !== src[1] || "t" !== src[2] && "T" !== src[2] || "a" !== src[3] && "A" !== src[3]) && ("string" !== typeof srcSet || ":" !== srcSet[4] || "d" !== srcSet[0] && "D" !== srcSet[0] || "a" !== srcSet[1] && "A" !== srcSet[1] || "t" !== srcSet[2] && "T" !== srcSet[2] || "a" !== srcSet[3] && "A" !== srcSet[3])) {
                null !== hoistableState && formatContext.tagScope & 64 && (hoistableState.suspenseyImages = !0);
                var sizes = "string" === typeof props.sizes ? props.sizes : void 0, key$jscomp$0 = srcSet ? srcSet + "\n" + (sizes || "") : src, promotablePreloads = renderState.preloads.images, resource$jscomp$1 = promotablePreloads.get(key$jscomp$0);
                if (resource$jscomp$1) {
                    if ("high" === props.fetchPriority || 10 > renderState.highImagePreloads.size) promotablePreloads.delete(key$jscomp$0), renderState.highImagePreloads.add(resource$jscomp$1);
                } else if (!resumableState.imageResources.hasOwnProperty(key$jscomp$0)) {
                    resumableState.imageResources[key$jscomp$0] = PRELOAD_NO_CREDS;
                    var input = props.crossOrigin;
                    var JSCompiler_inline_result$jscomp$8 = "string" === typeof input ? "use-credentials" === input ? input : "" : void 0;
                    var headers = renderState.headers, header;
                    headers && 0 < headers.remainingCapacity && "string" !== typeof props.srcSet && ("high" === props.fetchPriority || 500 > headers.highImagePreloads.length) && (header = getPreloadAsHeader(src, "image", {
                        imageSrcSet: props.srcSet,
                        imageSizes: props.sizes,
                        crossOrigin: JSCompiler_inline_result$jscomp$8,
                        integrity: props.integrity,
                        nonce: props.nonce,
                        type: props.type,
                        fetchPriority: props.fetchPriority,
                        referrerPolicy: props.refererPolicy
                    }), 0 <= (headers.remainingCapacity -= header.length + 2)) ? (renderState.resets.image[key$jscomp$0] = PRELOAD_NO_CREDS, headers.highImagePreloads && (headers.highImagePreloads += ", "), headers.highImagePreloads += header) : (resource$jscomp$1 = [], pushLinkImpl(resource$jscomp$1, {
                        rel: "preload",
                        as: "image",
                        href: srcSet ? void 0 : src,
                        imageSrcSet: srcSet,
                        imageSizes: sizes,
                        crossOrigin: JSCompiler_inline_result$jscomp$8,
                        integrity: props.integrity,
                        type: props.type,
                        fetchPriority: props.fetchPriority,
                        referrerPolicy: props.referrerPolicy
                    }), "high" === props.fetchPriority || 10 > renderState.highImagePreloads.size ? renderState.highImagePreloads.add(resource$jscomp$1) : (renderState.bulkPreloads.add(resource$jscomp$1), promotablePreloads.set(key$jscomp$0, resource$jscomp$1)));
                }
            }
            return pushSelfClosing(target$jscomp$0, props, "img");
        case "base":
        case "area":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "param":
        case "source":
        case "track":
        case "wbr":
            return pushSelfClosing(target$jscomp$0, props, type);
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
            break;
        case "head":
            if (2 > formatContext.insertionMode) {
                var preamble = preambleState || renderState.preamble;
                if (preamble.headChunks) throw Error("The `<head>` tag may only be rendered once.");
                null !== preambleState && target$jscomp$0.push(headPreambleContributionChunk);
                preamble.headChunks = [];
                var JSCompiler_inline_result$jscomp$9 = pushStartSingletonElement(preamble.headChunks, props, "head");
            } else JSCompiler_inline_result$jscomp$9 = pushStartGenericElement(target$jscomp$0, props, "head");
            return JSCompiler_inline_result$jscomp$9;
        case "body":
            if (2 > formatContext.insertionMode) {
                var preamble$jscomp$0 = preambleState || renderState.preamble;
                if (preamble$jscomp$0.bodyChunks) throw Error("The `<body>` tag may only be rendered once.");
                null !== preambleState && target$jscomp$0.push(bodyPreambleContributionChunk);
                preamble$jscomp$0.bodyChunks = [];
                var JSCompiler_inline_result$jscomp$10 = pushStartSingletonElement(preamble$jscomp$0.bodyChunks, props, "body");
            } else JSCompiler_inline_result$jscomp$10 = pushStartGenericElement(target$jscomp$0, props, "body");
            return JSCompiler_inline_result$jscomp$10;
        case "html":
            if (0 === formatContext.insertionMode) {
                var preamble$jscomp$1 = preambleState || renderState.preamble;
                if (preamble$jscomp$1.htmlChunks) throw Error("The `<html>` tag may only be rendered once.");
                null !== preambleState && target$jscomp$0.push(htmlPreambleContributionChunk);
                preamble$jscomp$1.htmlChunks = [
                    doctypeChunk
                ];
                var JSCompiler_inline_result$jscomp$11 = pushStartSingletonElement(preamble$jscomp$1.htmlChunks, props, "html");
            } else JSCompiler_inline_result$jscomp$11 = pushStartGenericElement(target$jscomp$0, props, "html");
            return JSCompiler_inline_result$jscomp$11;
        default:
            if (-1 !== type.indexOf("-")) {
                target$jscomp$0.push(startChunkForTag(type));
                var children$jscomp$9 = null, innerHTML$jscomp$8 = null, propKey$jscomp$11;
                for(propKey$jscomp$11 in props)if (hasOwnProperty.call(props, propKey$jscomp$11)) {
                    var propValue$jscomp$11 = props[propKey$jscomp$11];
                    if (null != propValue$jscomp$11) {
                        var attributeName = propKey$jscomp$11;
                        switch(propKey$jscomp$11){
                            case "children":
                                children$jscomp$9 = propValue$jscomp$11;
                                break;
                            case "dangerouslySetInnerHTML":
                                innerHTML$jscomp$8 = propValue$jscomp$11;
                                break;
                            case "style":
                                pushStyleAttribute(target$jscomp$0, propValue$jscomp$11);
                                break;
                            case "suppressContentEditableWarning":
                            case "suppressHydrationWarning":
                            case "ref":
                                break;
                            case "className":
                                attributeName = "class";
                            default:
                                if (isAttributeNameSafe(propKey$jscomp$11) && "function" !== typeof propValue$jscomp$11 && "symbol" !== (typeof propValue$jscomp$11 === "undefined" ? "undefined" : _type_of(propValue$jscomp$11)) && !1 !== propValue$jscomp$11) {
                                    if (!0 === propValue$jscomp$11) propValue$jscomp$11 = "";
                                    else if ("object" === (typeof propValue$jscomp$11 === "undefined" ? "undefined" : _type_of(propValue$jscomp$11))) continue;
                                    target$jscomp$0.push(attributeSeparator, stringToChunk(attributeName), attributeAssign, stringToChunk(escapeTextForBrowser(propValue$jscomp$11)), attributeEnd);
                                }
                        }
                    }
                }
                target$jscomp$0.push(endOfStartTag);
                pushInnerHTML(target$jscomp$0, innerHTML$jscomp$8, children$jscomp$9);
                return children$jscomp$9;
            }
    }
    return pushStartGenericElement(target$jscomp$0, props, type);
}
var endTagCache = new Map();
function endChunkForTag(tag) {
    var chunk = endTagCache.get(tag);
    void 0 === chunk && (chunk = stringToPrecomputedChunk("</" + tag + ">"), endTagCache.set(tag, chunk));
    return chunk;
}
function hoistPreambleState(renderState, preambleState) {
    renderState = renderState.preamble;
    null === renderState.htmlChunks && preambleState.htmlChunks && (renderState.htmlChunks = preambleState.htmlChunks);
    null === renderState.headChunks && preambleState.headChunks && (renderState.headChunks = preambleState.headChunks);
    null === renderState.bodyChunks && preambleState.bodyChunks && (renderState.bodyChunks = preambleState.bodyChunks);
}
function writeBootstrap(destination, renderState) {
    renderState = renderState.bootstrapChunks;
    for(var i = 0; i < renderState.length - 1; i++)writeChunk(destination, renderState[i]);
    return i < renderState.length ? (i = renderState[i], renderState.length = 0, writeChunkAndReturn(destination, i)) : !0;
}
var shellTimeRuntimeScript = stringToPrecomputedChunk("requestAnimationFrame(function(){$RT=performance.now()});"), placeholder1 = stringToPrecomputedChunk('<template id="'), placeholder2 = stringToPrecomputedChunk('"></template>'), startActivityBoundary = stringToPrecomputedChunk("\x3c!--&--\x3e"), endActivityBoundary = stringToPrecomputedChunk("\x3c!--/&--\x3e"), startCompletedSuspenseBoundary = stringToPrecomputedChunk("\x3c!--$--\x3e"), startPendingSuspenseBoundary1 = stringToPrecomputedChunk('\x3c!--$?--\x3e<template id="'), startPendingSuspenseBoundary2 = stringToPrecomputedChunk('"></template>'), startClientRenderedSuspenseBoundary = stringToPrecomputedChunk("\x3c!--$!--\x3e"), endSuspenseBoundary = stringToPrecomputedChunk("\x3c!--/$--\x3e"), clientRenderedSuspenseBoundaryError1 = stringToPrecomputedChunk("<template"), clientRenderedSuspenseBoundaryErrorAttrInterstitial = stringToPrecomputedChunk('"'), clientRenderedSuspenseBoundaryError1A = stringToPrecomputedChunk(' data-dgst="');
stringToPrecomputedChunk(' data-msg="');
stringToPrecomputedChunk(' data-stck="');
stringToPrecomputedChunk(' data-cstck="');
var clientRenderedSuspenseBoundaryError2 = stringToPrecomputedChunk("></template>");
function writeStartPendingSuspenseBoundary(destination, renderState, id) {
    writeChunk(destination, startPendingSuspenseBoundary1);
    if (null === id) throw Error("An ID must have been assigned before we can complete the boundary.");
    writeChunk(destination, renderState.boundaryPrefix);
    writeChunk(destination, stringToChunk(id.toString(16)));
    return writeChunkAndReturn(destination, startPendingSuspenseBoundary2);
}
var startSegmentHTML = stringToPrecomputedChunk('<div hidden id="'), startSegmentHTML2 = stringToPrecomputedChunk('">'), endSegmentHTML = stringToPrecomputedChunk("</div>"), startSegmentSVG = stringToPrecomputedChunk('<svg aria-hidden="true" style="display:none" id="'), startSegmentSVG2 = stringToPrecomputedChunk('">'), endSegmentSVG = stringToPrecomputedChunk("</svg>"), startSegmentMathML = stringToPrecomputedChunk('<math aria-hidden="true" style="display:none" id="'), startSegmentMathML2 = stringToPrecomputedChunk('">'), endSegmentMathML = stringToPrecomputedChunk("</math>"), startSegmentTable = stringToPrecomputedChunk('<table hidden id="'), startSegmentTable2 = stringToPrecomputedChunk('">'), endSegmentTable = stringToPrecomputedChunk("</table>"), startSegmentTableBody = stringToPrecomputedChunk('<table hidden><tbody id="'), startSegmentTableBody2 = stringToPrecomputedChunk('">'), endSegmentTableBody = stringToPrecomputedChunk("</tbody></table>"), startSegmentTableRow = stringToPrecomputedChunk('<table hidden><tr id="'), startSegmentTableRow2 = stringToPrecomputedChunk('">'), endSegmentTableRow = stringToPrecomputedChunk("</tr></table>"), startSegmentColGroup = stringToPrecomputedChunk('<table hidden><colgroup id="'), startSegmentColGroup2 = stringToPrecomputedChunk('">'), endSegmentColGroup = stringToPrecomputedChunk("</colgroup></table>");
function writeStartSegment(destination, renderState, formatContext, id) {
    switch(formatContext.insertionMode){
        case 0:
        case 1:
        case 3:
        case 2:
            return writeChunk(destination, startSegmentHTML), writeChunk(destination, renderState.segmentPrefix), writeChunk(destination, stringToChunk(id.toString(16))), writeChunkAndReturn(destination, startSegmentHTML2);
        case 4:
            return writeChunk(destination, startSegmentSVG), writeChunk(destination, renderState.segmentPrefix), writeChunk(destination, stringToChunk(id.toString(16))), writeChunkAndReturn(destination, startSegmentSVG2);
        case 5:
            return writeChunk(destination, startSegmentMathML), writeChunk(destination, renderState.segmentPrefix), writeChunk(destination, stringToChunk(id.toString(16))), writeChunkAndReturn(destination, startSegmentMathML2);
        case 6:
            return writeChunk(destination, startSegmentTable), writeChunk(destination, renderState.segmentPrefix), writeChunk(destination, stringToChunk(id.toString(16))), writeChunkAndReturn(destination, startSegmentTable2);
        case 7:
            return writeChunk(destination, startSegmentTableBody), writeChunk(destination, renderState.segmentPrefix), writeChunk(destination, stringToChunk(id.toString(16))), writeChunkAndReturn(destination, startSegmentTableBody2);
        case 8:
            return writeChunk(destination, startSegmentTableRow), writeChunk(destination, renderState.segmentPrefix), writeChunk(destination, stringToChunk(id.toString(16))), writeChunkAndReturn(destination, startSegmentTableRow2);
        case 9:
            return writeChunk(destination, startSegmentColGroup), writeChunk(destination, renderState.segmentPrefix), writeChunk(destination, stringToChunk(id.toString(16))), writeChunkAndReturn(destination, startSegmentColGroup2);
        default:
            throw Error("Unknown insertion mode. This is a bug in React.");
    }
}
function writeEndSegment(destination, formatContext) {
    switch(formatContext.insertionMode){
        case 0:
        case 1:
        case 3:
        case 2:
            return writeChunkAndReturn(destination, endSegmentHTML);
        case 4:
            return writeChunkAndReturn(destination, endSegmentSVG);
        case 5:
            return writeChunkAndReturn(destination, endSegmentMathML);
        case 6:
            return writeChunkAndReturn(destination, endSegmentTable);
        case 7:
            return writeChunkAndReturn(destination, endSegmentTableBody);
        case 8:
            return writeChunkAndReturn(destination, endSegmentTableRow);
        case 9:
            return writeChunkAndReturn(destination, endSegmentColGroup);
        default:
            throw Error("Unknown insertion mode. This is a bug in React.");
    }
}
var completeSegmentScript1Full = stringToPrecomputedChunk('$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("'), completeSegmentScript1Partial = stringToPrecomputedChunk('$RS("'), completeSegmentScript2 = stringToPrecomputedChunk('","'), completeSegmentScriptEnd = stringToPrecomputedChunk('")\x3c/script>');
stringToPrecomputedChunk('<template data-rsi="" data-sid="');
stringToPrecomputedChunk('" data-pid="');
var completeBoundaryScriptFunctionOnly = stringToPrecomputedChunk('$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d||"/&"===d)if(0===h)break;else h--;else"$"!==d&&"$?"!==d&&"$~"!==d&&"$!"!==d&&"&"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data="$";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};\n$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data="$~",$RB.push(a,b),2===$RB.length&&("number"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};');
stringToChunk('$RV=function(A,g){function k(a,b){var e=a.getAttribute(b);e&&(b=a.style,l.push(a,b.viewTransitionName,b.viewTransitionClass),"auto"!==e&&(b.viewTransitionClass=e),(a=a.getAttribute("vt-name"))||(a="_T_"+K++ +"_"),b.viewTransitionName=a,B=!0)}var B=!1,K=0,l=[];try{var f=document.__reactViewTransition;if(f){f.finished.finally($RV.bind(null,g));return}var m=new Map;for(f=1;f<g.length;f+=2)for(var h=g[f].querySelectorAll("[vt-share]"),d=0;d<h.length;d++){var c=h[d];m.set(c.getAttribute("vt-name"),c)}var u=[];for(h=0;h<g.length;h+=2){var C=g[h],x=C.parentNode;if(x){var v=x.getBoundingClientRect();if(v.left||v.top||v.width||v.height){c=C;for(f=0;c;){if(8===c.nodeType){var r=c.data;if("/$"===r)if(0===f)break;else f--;else"$"!==r&&"$?"!==r&&"$~"!==r&&"$!"!==r||f++}else if(1===c.nodeType){d=c;var D=d.getAttribute("vt-name"),y=m.get(D);k(d,y?"vt-share":"vt-exit");y&&(k(y,"vt-share"),m.set(D,null));var E=d.querySelectorAll("[vt-share]");for(d=0;d<E.length;d++){var F=E[d],G=F.getAttribute("vt-name"),\nH=m.get(G);H&&(k(F,"vt-share"),k(H,"vt-share"),m.set(G,null))}}c=c.nextSibling}for(var I=g[h+1],t=I.firstElementChild;t;)null!==m.get(t.getAttribute("vt-name"))&&k(t,"vt-enter"),t=t.nextElementSibling;c=x;do for(var n=c.firstElementChild;n;){var J=n.getAttribute("vt-update");J&&"none"!==J&&!l.includes(n)&&k(n,"vt-update");n=n.nextElementSibling}while((c=c.parentNode)&&1===c.nodeType&&"none"!==c.getAttribute("vt-update"));u.push.apply(u,I.querySelectorAll(\'img[src]:not([loading="lazy"])\'))}}}if(B){var z=\ndocument.__reactViewTransition=document.startViewTransition({update:function(){A(g);for(var a=[document.documentElement.clientHeight,document.fonts.ready],b={},e=0;e<u.length;b={g:b.g},e++)if(b.g=u[e],!b.g.complete){var p=b.g.getBoundingClientRect();0<p.bottom&&0<p.right&&p.top<window.innerHeight&&p.left<window.innerWidth&&(p=new Promise(function(w){return function(q){w.g.addEventListener("load",q);w.g.addEventListener("error",q)}}(b)),a.push(p))}return Promise.race([Promise.all(a),new Promise(function(w){var q=\nperformance.now();setTimeout(w,2300>q&&2E3<q?2300-q:500)})])},types:[]});z.ready.finally(function(){for(var a=l.length-3;0<=a;a-=3){var b=l[a],e=b.style;e.viewTransitionName=l[a+1];e.viewTransitionClass=l[a+1];""===b.getAttribute("style")&&b.removeAttribute("style")}});z.finished.finally(function(){document.__reactViewTransition===z&&(document.__reactViewTransition=null)});$RB=[];return}}catch(a){}A(g)}.bind(null,$RV);');
var completeBoundaryScript1Partial = stringToPrecomputedChunk('$RC("'), completeBoundaryWithStylesScript1FullPartial = stringToPrecomputedChunk('$RM=new Map;$RR=function(n,w,p){function u(q){this._p=null;q()}for(var r=new Map,t=document,h,b,e=t.querySelectorAll("link[data-precedence],style[data-precedence]"),v=[],k=0;b=e[k++];)"not all"===b.getAttribute("media")?v.push(b):("LINK"===b.tagName&&$RM.set(b.getAttribute("href"),b),r.set(b.dataset.precedence,h=b));e=0;b=[];var l,a;for(k=!0;;){if(k){var f=p[e++];if(!f){k=!1;e=0;continue}var c=!1,m=0;var d=f[m++];if(a=$RM.get(d)){var g=a._p;c=!0}else{a=t.createElement("link");a.href=d;a.rel=\n"stylesheet";for(a.dataset.precedence=l=f[m++];g=f[m++];)a.setAttribute(g,f[m++]);g=a._p=new Promise(function(q,x){a.onload=u.bind(a,q);a.onerror=u.bind(a,x)});$RM.set(d,a)}d=a.getAttribute("media");!g||d&&!matchMedia(d).matches||b.push(g);if(c)continue}else{a=v[e++];if(!a)break;l=a.getAttribute("data-precedence");a.removeAttribute("media")}c=r.get(l)||h;c===h&&(h=a);r.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=t.head,c.insertBefore(a,c.firstChild))}if(p=document.getElementById(n))p.previousSibling.data=\n"$~";Promise.all(b).then($RC.bind(null,n,w),$RX.bind(null,n,"CSS failed to load"))};$RR("'), completeBoundaryWithStylesScript1Partial = stringToPrecomputedChunk('$RR("'), completeBoundaryScript2 = stringToPrecomputedChunk('","'), completeBoundaryScript3a = stringToPrecomputedChunk('",'), completeBoundaryScript3b = stringToPrecomputedChunk('"'), completeBoundaryScriptEnd = stringToPrecomputedChunk(")\x3c/script>");
stringToPrecomputedChunk('<template data-rci="" data-bid="');
stringToPrecomputedChunk('<template data-rri="" data-bid="');
stringToPrecomputedChunk('" data-sid="');
stringToPrecomputedChunk('" data-sty="');
var clientRenderScriptFunctionOnly = stringToPrecomputedChunk('$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};'), clientRenderScript1Full = stringToPrecomputedChunk('$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};;$RX("'), clientRenderScript1Partial = stringToPrecomputedChunk('$RX("'), clientRenderScript1A = stringToPrecomputedChunk('"'), clientRenderErrorScriptArgInterstitial = stringToPrecomputedChunk(","), clientRenderScriptEnd = stringToPrecomputedChunk(")\x3c/script>");
stringToPrecomputedChunk('<template data-rxi="" data-bid="');
stringToPrecomputedChunk('" data-dgst="');
stringToPrecomputedChunk('" data-msg="');
stringToPrecomputedChunk('" data-stck="');
stringToPrecomputedChunk('" data-cstck="');
var regexForJSStringsInInstructionScripts = /[<\u2028\u2029]/g;
function escapeJSStringsForInstructionScripts(input) {
    return JSON.stringify(input).replace(regexForJSStringsInInstructionScripts, function(match) {
        switch(match){
            case "<":
                return "\\u003c";
            case "\u2028":
                return "\\u2028";
            case "\u2029":
                return "\\u2029";
            default:
                throw Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
        }
    });
}
var regexForJSStringsInScripts = /[&><\u2028\u2029]/g;
function escapeJSObjectForInstructionScripts(input) {
    return JSON.stringify(input).replace(regexForJSStringsInScripts, function(match) {
        switch(match){
            case "&":
                return "\\u0026";
            case ">":
                return "\\u003e";
            case "<":
                return "\\u003c";
            case "\u2028":
                return "\\u2028";
            case "\u2029":
                return "\\u2029";
            default:
                throw Error("escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
        }
    });
}
var lateStyleTagResourceOpen1 = stringToPrecomputedChunk(' media="not all" data-precedence="'), lateStyleTagResourceOpen2 = stringToPrecomputedChunk('" data-href="'), lateStyleTagResourceOpen3 = stringToPrecomputedChunk('">'), lateStyleTagTemplateClose = stringToPrecomputedChunk("</style>"), currentlyRenderingBoundaryHasStylesToHoist = !1, destinationHasCapacity = !0;
function flushStyleTagsLateForBoundary(styleQueue) {
    var rules = styleQueue.rules, hrefs = styleQueue.hrefs, i = 0;
    if (hrefs.length) {
        writeChunk(this, currentlyFlushingRenderState.startInlineStyle);
        writeChunk(this, lateStyleTagResourceOpen1);
        writeChunk(this, styleQueue.precedence);
        for(writeChunk(this, lateStyleTagResourceOpen2); i < hrefs.length - 1; i++)writeChunk(this, hrefs[i]), writeChunk(this, spaceSeparator);
        writeChunk(this, hrefs[i]);
        writeChunk(this, lateStyleTagResourceOpen3);
        for(i = 0; i < rules.length; i++)writeChunk(this, rules[i]);
        destinationHasCapacity = writeChunkAndReturn(this, lateStyleTagTemplateClose);
        currentlyRenderingBoundaryHasStylesToHoist = !0;
        rules.length = 0;
        hrefs.length = 0;
    }
}
function hasStylesToHoist(stylesheet) {
    return 2 !== stylesheet.state ? currentlyRenderingBoundaryHasStylesToHoist = !0 : !1;
}
function writeHoistablesForBoundary(destination, hoistableState, renderState) {
    currentlyRenderingBoundaryHasStylesToHoist = !1;
    destinationHasCapacity = !0;
    currentlyFlushingRenderState = renderState;
    hoistableState.styles.forEach(flushStyleTagsLateForBoundary, destination);
    currentlyFlushingRenderState = null;
    hoistableState.stylesheets.forEach(hasStylesToHoist);
    currentlyRenderingBoundaryHasStylesToHoist && (renderState.stylesToHoist = !0);
    return destinationHasCapacity;
}
function flushResource(resource) {
    for(var i = 0; i < resource.length; i++)writeChunk(this, resource[i]);
    resource.length = 0;
}
var stylesheetFlushingQueue = [];
function flushStyleInPreamble(stylesheet) {
    pushLinkImpl(stylesheetFlushingQueue, stylesheet.props);
    for(var i = 0; i < stylesheetFlushingQueue.length; i++)writeChunk(this, stylesheetFlushingQueue[i]);
    stylesheetFlushingQueue.length = 0;
    stylesheet.state = 2;
}
var styleTagResourceOpen1 = stringToPrecomputedChunk(' data-precedence="'), styleTagResourceOpen2 = stringToPrecomputedChunk('" data-href="'), spaceSeparator = stringToPrecomputedChunk(" "), styleTagResourceOpen3 = stringToPrecomputedChunk('">'), styleTagResourceClose = stringToPrecomputedChunk("</style>");
function flushStylesInPreamble(styleQueue) {
    var hasStylesheets = 0 < styleQueue.sheets.size;
    styleQueue.sheets.forEach(flushStyleInPreamble, this);
    styleQueue.sheets.clear();
    var rules = styleQueue.rules, hrefs = styleQueue.hrefs;
    if (!hasStylesheets || hrefs.length) {
        writeChunk(this, currentlyFlushingRenderState.startInlineStyle);
        writeChunk(this, styleTagResourceOpen1);
        writeChunk(this, styleQueue.precedence);
        styleQueue = 0;
        if (hrefs.length) {
            for(writeChunk(this, styleTagResourceOpen2); styleQueue < hrefs.length - 1; styleQueue++)writeChunk(this, hrefs[styleQueue]), writeChunk(this, spaceSeparator);
            writeChunk(this, hrefs[styleQueue]);
        }
        writeChunk(this, styleTagResourceOpen3);
        for(styleQueue = 0; styleQueue < rules.length; styleQueue++)writeChunk(this, rules[styleQueue]);
        writeChunk(this, styleTagResourceClose);
        rules.length = 0;
        hrefs.length = 0;
    }
}
function preloadLateStyle(stylesheet) {
    if (0 === stylesheet.state) {
        stylesheet.state = 1;
        var props = stylesheet.props;
        pushLinkImpl(stylesheetFlushingQueue, {
            rel: "preload",
            as: "style",
            href: stylesheet.props.href,
            crossOrigin: props.crossOrigin,
            fetchPriority: props.fetchPriority,
            integrity: props.integrity,
            media: props.media,
            hrefLang: props.hrefLang,
            referrerPolicy: props.referrerPolicy
        });
        for(stylesheet = 0; stylesheet < stylesheetFlushingQueue.length; stylesheet++)writeChunk(this, stylesheetFlushingQueue[stylesheet]);
        stylesheetFlushingQueue.length = 0;
    }
}
function preloadLateStyles(styleQueue) {
    styleQueue.sheets.forEach(preloadLateStyle, this);
    styleQueue.sheets.clear();
}
stringToPrecomputedChunk('<link rel="expect" href="#');
stringToPrecomputedChunk('" blocking="render"/>');
var completedShellIdAttributeStart = stringToPrecomputedChunk(' id="');
function pushCompletedShellIdAttribute(target, resumableState) {
    0 === (resumableState.instructions & 32) && (resumableState.instructions |= 32, target.push(completedShellIdAttributeStart, stringToChunk(escapeTextForBrowser("_" + resumableState.idPrefix + "R_")), attributeEnd));
}
var arrayFirstOpenBracket = stringToPrecomputedChunk("["), arraySubsequentOpenBracket = stringToPrecomputedChunk(",["), arrayInterstitial = stringToPrecomputedChunk(","), arrayCloseBracket = stringToPrecomputedChunk("]");
function writeStyleResourceDependenciesInJS(destination, hoistableState) {
    writeChunk(destination, arrayFirstOpenBracket);
    var nextArrayOpenBrackChunk = arrayFirstOpenBracket;
    hoistableState.stylesheets.forEach(function(resource) {
        if (2 !== resource.state) if (3 === resource.state) writeChunk(destination, nextArrayOpenBrackChunk), writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts("" + resource.props.href))), writeChunk(destination, arrayCloseBracket), nextArrayOpenBrackChunk = arraySubsequentOpenBracket;
        else {
            writeChunk(destination, nextArrayOpenBrackChunk);
            var precedence = resource.props["data-precedence"], props = resource.props, coercedHref = sanitizeURL("" + resource.props.href);
            writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(coercedHref)));
            precedence = "" + precedence;
            writeChunk(destination, arrayInterstitial);
            writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(precedence)));
            for(var propKey in props)if (hasOwnProperty.call(props, propKey) && (precedence = props[propKey], null != precedence)) switch(propKey){
                case "href":
                case "rel":
                case "precedence":
                case "data-precedence":
                    break;
                case "children":
                case "dangerouslySetInnerHTML":
                    throw Error("link is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
                default:
                    writeStyleResourceAttributeInJS(destination, propKey, precedence);
            }
            writeChunk(destination, arrayCloseBracket);
            nextArrayOpenBrackChunk = arraySubsequentOpenBracket;
            resource.state = 3;
        }
    });
    writeChunk(destination, arrayCloseBracket);
}
function writeStyleResourceAttributeInJS(destination, name, value) {
    var attributeName = name.toLowerCase();
    switch(typeof value === "undefined" ? "undefined" : _type_of(value)){
        case "function":
        case "symbol":
            return;
    }
    switch(name){
        case "innerHTML":
        case "dangerouslySetInnerHTML":
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "style":
        case "ref":
            return;
        case "className":
            attributeName = "class";
            name = "" + value;
            break;
        case "hidden":
            if (!1 === value) return;
            name = "";
            break;
        case "src":
        case "href":
            value = sanitizeURL(value);
            name = "" + value;
            break;
        default:
            if (2 < name.length && ("o" === name[0] || "O" === name[0]) && ("n" === name[1] || "N" === name[1]) || !isAttributeNameSafe(name)) return;
            name = "" + value;
    }
    writeChunk(destination, arrayInterstitial);
    writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(attributeName)));
    writeChunk(destination, arrayInterstitial);
    writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(name)));
}
function createHoistableState() {
    return {
        styles: new Set(),
        stylesheets: new Set(),
        suspenseyImages: !1
    };
}
function prefetchDNS(href) {
    var request = resolveRequest();
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if ("string" === typeof href && href) {
            if (!resumableState.dnsResources.hasOwnProperty(href)) {
                resumableState.dnsResources[href] = null;
                resumableState = renderState.headers;
                var header, JSCompiler_temp;
                if (JSCompiler_temp = resumableState && 0 < resumableState.remainingCapacity) JSCompiler_temp = (header = "<" + ("" + href).replace(regexForHrefInLinkHeaderURLContext, escapeHrefForLinkHeaderURLContextReplacer) + ">; rel=dns-prefetch", 0 <= (resumableState.remainingCapacity -= header.length + 2));
                JSCompiler_temp ? (renderState.resets.dns[href] = null, resumableState.preconnects && (resumableState.preconnects += ", "), resumableState.preconnects += header) : (header = [], pushLinkImpl(header, {
                    href: href,
                    rel: "dns-prefetch"
                }), renderState.preconnects.add(header));
            }
            enqueueFlush(request);
        }
    } else previousDispatcher.D(href);
}
function preconnect(href, crossOrigin) {
    var request = resolveRequest();
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if ("string" === typeof href && href) {
            var bucket = "use-credentials" === crossOrigin ? "credentials" : "string" === typeof crossOrigin ? "anonymous" : "default";
            if (!resumableState.connectResources[bucket].hasOwnProperty(href)) {
                resumableState.connectResources[bucket][href] = null;
                resumableState = renderState.headers;
                var header, JSCompiler_temp;
                if (JSCompiler_temp = resumableState && 0 < resumableState.remainingCapacity) {
                    JSCompiler_temp = "<" + ("" + href).replace(regexForHrefInLinkHeaderURLContext, escapeHrefForLinkHeaderURLContextReplacer) + ">; rel=preconnect";
                    if ("string" === typeof crossOrigin) {
                        var escapedCrossOrigin = ("" + crossOrigin).replace(regexForLinkHeaderQuotedParamValueContext, escapeStringForLinkHeaderQuotedParamValueContextReplacer);
                        JSCompiler_temp += '; crossorigin="' + escapedCrossOrigin + '"';
                    }
                    JSCompiler_temp = (header = JSCompiler_temp, 0 <= (resumableState.remainingCapacity -= header.length + 2));
                }
                JSCompiler_temp ? (renderState.resets.connect[bucket][href] = null, resumableState.preconnects && (resumableState.preconnects += ", "), resumableState.preconnects += header) : (bucket = [], pushLinkImpl(bucket, {
                    rel: "preconnect",
                    href: href,
                    crossOrigin: crossOrigin
                }), renderState.preconnects.add(bucket));
            }
            enqueueFlush(request);
        }
    } else previousDispatcher.C(href, crossOrigin);
}
function preload(href, as, options) {
    var request = resolveRequest();
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if (as && href) {
            switch(as){
                case "image":
                    if (options) {
                        var imageSrcSet = options.imageSrcSet;
                        var imageSizes = options.imageSizes;
                        var fetchPriority = options.fetchPriority;
                    }
                    var key = imageSrcSet ? imageSrcSet + "\n" + (imageSizes || "") : href;
                    if (resumableState.imageResources.hasOwnProperty(key)) return;
                    resumableState.imageResources[key] = PRELOAD_NO_CREDS;
                    resumableState = renderState.headers;
                    var header;
                    resumableState && 0 < resumableState.remainingCapacity && "string" !== typeof imageSrcSet && "high" === fetchPriority && (header = getPreloadAsHeader(href, as, options), 0 <= (resumableState.remainingCapacity -= header.length + 2)) ? (renderState.resets.image[key] = PRELOAD_NO_CREDS, resumableState.highImagePreloads && (resumableState.highImagePreloads += ", "), resumableState.highImagePreloads += header) : (resumableState = [], pushLinkImpl(resumableState, assign({
                        rel: "preload",
                        href: imageSrcSet ? void 0 : href,
                        as: as
                    }, options)), "high" === fetchPriority ? renderState.highImagePreloads.add(resumableState) : (renderState.bulkPreloads.add(resumableState), renderState.preloads.images.set(key, resumableState)));
                    break;
                case "style":
                    if (resumableState.styleResources.hasOwnProperty(href)) return;
                    imageSrcSet = [];
                    pushLinkImpl(imageSrcSet, assign({
                        rel: "preload",
                        href: href,
                        as: as
                    }, options));
                    resumableState.styleResources[href] = !options || "string" !== typeof options.crossOrigin && "string" !== typeof options.integrity ? PRELOAD_NO_CREDS : [
                        options.crossOrigin,
                        options.integrity
                    ];
                    renderState.preloads.stylesheets.set(href, imageSrcSet);
                    renderState.bulkPreloads.add(imageSrcSet);
                    break;
                case "script":
                    if (resumableState.scriptResources.hasOwnProperty(href)) return;
                    imageSrcSet = [];
                    renderState.preloads.scripts.set(href, imageSrcSet);
                    renderState.bulkPreloads.add(imageSrcSet);
                    pushLinkImpl(imageSrcSet, assign({
                        rel: "preload",
                        href: href,
                        as: as
                    }, options));
                    resumableState.scriptResources[href] = !options || "string" !== typeof options.crossOrigin && "string" !== typeof options.integrity ? PRELOAD_NO_CREDS : [
                        options.crossOrigin,
                        options.integrity
                    ];
                    break;
                default:
                    if (resumableState.unknownResources.hasOwnProperty(as)) {
                        if (imageSrcSet = resumableState.unknownResources[as], imageSrcSet.hasOwnProperty(href)) return;
                    } else imageSrcSet = {}, resumableState.unknownResources[as] = imageSrcSet;
                    imageSrcSet[href] = PRELOAD_NO_CREDS;
                    if ((resumableState = renderState.headers) && 0 < resumableState.remainingCapacity && "font" === as && (key = getPreloadAsHeader(href, as, options), 0 <= (resumableState.remainingCapacity -= key.length + 2))) renderState.resets.font[href] = PRELOAD_NO_CREDS, resumableState.fontPreloads && (resumableState.fontPreloads += ", "), resumableState.fontPreloads += key;
                    else switch(resumableState = [], href = assign({
                        rel: "preload",
                        href: href,
                        as: as
                    }, options), pushLinkImpl(resumableState, href), as){
                        case "font":
                            renderState.fontPreloads.add(resumableState);
                            break;
                        default:
                            renderState.bulkPreloads.add(resumableState);
                    }
            }
            enqueueFlush(request);
        }
    } else previousDispatcher.L(href, as, options);
}
function preloadModule(href, options) {
    var request = resolveRequest();
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if (href) {
            var as = options && "string" === typeof options.as ? options.as : "script";
            switch(as){
                case "script":
                    if (resumableState.moduleScriptResources.hasOwnProperty(href)) return;
                    as = [];
                    resumableState.moduleScriptResources[href] = !options || "string" !== typeof options.crossOrigin && "string" !== typeof options.integrity ? PRELOAD_NO_CREDS : [
                        options.crossOrigin,
                        options.integrity
                    ];
                    renderState.preloads.moduleScripts.set(href, as);
                    break;
                default:
                    if (resumableState.moduleUnknownResources.hasOwnProperty(as)) {
                        var resources = resumableState.unknownResources[as];
                        if (resources.hasOwnProperty(href)) return;
                    } else resources = {}, resumableState.moduleUnknownResources[as] = resources;
                    as = [];
                    resources[href] = PRELOAD_NO_CREDS;
            }
            pushLinkImpl(as, assign({
                rel: "modulepreload",
                href: href
            }, options));
            renderState.bulkPreloads.add(as);
            enqueueFlush(request);
        }
    } else previousDispatcher.m(href, options);
}
function preinitStyle(href, precedence, options) {
    var request = resolveRequest();
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if (href) {
            precedence = precedence || "default";
            var styleQueue = renderState.styles.get(precedence), resourceState = resumableState.styleResources.hasOwnProperty(href) ? resumableState.styleResources[href] : void 0;
            null !== resourceState && (resumableState.styleResources[href] = null, styleQueue || (styleQueue = {
                precedence: stringToChunk(escapeTextForBrowser(precedence)),
                rules: [],
                hrefs: [],
                sheets: new Map()
            }, renderState.styles.set(precedence, styleQueue)), precedence = {
                state: 0,
                props: assign({
                    rel: "stylesheet",
                    href: href,
                    "data-precedence": precedence
                }, options)
            }, resourceState && (2 === resourceState.length && adoptPreloadCredentials(precedence.props, resourceState), (renderState = renderState.preloads.stylesheets.get(href)) && 0 < renderState.length ? renderState.length = 0 : precedence.state = 1), styleQueue.sheets.set(href, precedence), enqueueFlush(request));
        }
    } else previousDispatcher.S(href, precedence, options);
}
function preinitScript(src, options) {
    var request = resolveRequest();
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if (src) {
            var resourceState = resumableState.scriptResources.hasOwnProperty(src) ? resumableState.scriptResources[src] : void 0;
            null !== resourceState && (resumableState.scriptResources[src] = null, options = assign({
                src: src,
                async: !0
            }, options), resourceState && (2 === resourceState.length && adoptPreloadCredentials(options, resourceState), src = renderState.preloads.scripts.get(src)) && (src.length = 0), src = [], renderState.scripts.add(src), pushScriptImpl(src, options), enqueueFlush(request));
        }
    } else previousDispatcher.X(src, options);
}
function preinitModuleScript(src, options) {
    var request = resolveRequest();
    if (request) {
        var resumableState = request.resumableState, renderState = request.renderState;
        if (src) {
            var resourceState = resumableState.moduleScriptResources.hasOwnProperty(src) ? resumableState.moduleScriptResources[src] : void 0;
            null !== resourceState && (resumableState.moduleScriptResources[src] = null, options = assign({
                src: src,
                type: "module",
                async: !0
            }, options), resourceState && (2 === resourceState.length && adoptPreloadCredentials(options, resourceState), src = renderState.preloads.moduleScripts.get(src)) && (src.length = 0), src = [], renderState.scripts.add(src), pushScriptImpl(src, options), enqueueFlush(request));
        }
    } else previousDispatcher.M(src, options);
}
function adoptPreloadCredentials(target, preloadState) {
    null == target.crossOrigin && (target.crossOrigin = preloadState[0]);
    null == target.integrity && (target.integrity = preloadState[1]);
}
function getPreloadAsHeader(href, as, params) {
    href = ("" + href).replace(regexForHrefInLinkHeaderURLContext, escapeHrefForLinkHeaderURLContextReplacer);
    as = ("" + as).replace(regexForLinkHeaderQuotedParamValueContext, escapeStringForLinkHeaderQuotedParamValueContextReplacer);
    as = "<" + href + '>; rel=preload; as="' + as + '"';
    for(var paramName in params)hasOwnProperty.call(params, paramName) && (href = params[paramName], "string" === typeof href && (as += "; " + paramName.toLowerCase() + '="' + ("" + href).replace(regexForLinkHeaderQuotedParamValueContext, escapeStringForLinkHeaderQuotedParamValueContextReplacer) + '"'));
    return as;
}
var regexForHrefInLinkHeaderURLContext = /[<>\r\n]/g;
function escapeHrefForLinkHeaderURLContextReplacer(match) {
    switch(match){
        case "<":
            return "%3C";
        case ">":
            return "%3E";
        case "\n":
            return "%0A";
        case "\r":
            return "%0D";
        default:
            throw Error("escapeLinkHrefForHeaderContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
    }
}
var regexForLinkHeaderQuotedParamValueContext = /["';,\r\n]/g;
function escapeStringForLinkHeaderQuotedParamValueContextReplacer(match) {
    switch(match){
        case '"':
            return "%22";
        case "'":
            return "%27";
        case ";":
            return "%3B";
        case ",":
            return "%2C";
        case "\n":
            return "%0A";
        case "\r":
            return "%0D";
        default:
            throw Error("escapeStringForLinkHeaderQuotedParamValueContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
    }
}
function hoistStyleQueueDependency(styleQueue) {
    this.styles.add(styleQueue);
}
function hoistStylesheetDependency(stylesheet) {
    this.stylesheets.add(stylesheet);
}
function hoistHoistables(parentState, childState) {
    childState.styles.forEach(hoistStyleQueueDependency, parentState);
    childState.stylesheets.forEach(hoistStylesheetDependency, parentState);
    childState.suspenseyImages && (parentState.suspenseyImages = !0);
}
function hasSuspenseyContent(hoistableState) {
    return 0 < hoistableState.stylesheets.size || hoistableState.suspenseyImages;
}
var bind = Function.prototype.bind, supportsRequestStorage = "function" === typeof AsyncLocalStorage, requestStorage = supportsRequestStorage ? new AsyncLocalStorage() : null, REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
function getComponentNameFromType(type) {
    if (null == type) return null;
    if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
    if ("string" === typeof type) return type;
    switch(type){
        case REACT_FRAGMENT_TYPE:
            return "Fragment";
        case REACT_PROFILER_TYPE:
            return "Profiler";
        case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
        case REACT_SUSPENSE_TYPE:
            return "Suspense";
        case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
        case REACT_ACTIVITY_TYPE:
            return "Activity";
    }
    if ("object" === (typeof type === "undefined" ? "undefined" : _type_of(type))) switch(type.$$typeof){
        case REACT_PORTAL_TYPE:
            return "Portal";
        case REACT_CONTEXT_TYPE:
            return type.displayName || "Context";
        case REACT_CONSUMER_TYPE:
            return (type._context.displayName || "Context") + ".Consumer";
        case REACT_FORWARD_REF_TYPE:
            var innerType = type.render;
            type = type.displayName;
            type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
            return type;
        case REACT_MEMO_TYPE:
            return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
        case REACT_LAZY_TYPE:
            innerType = type._payload;
            type = type._init;
            try {
                return getComponentNameFromType(type(innerType));
            } catch (x) {}
    }
    return null;
}
var emptyContextObject = {}, currentActiveSnapshot = null;
function popToNearestCommonAncestor(prev, next) {
    if (prev !== next) {
        prev.context._currentValue = prev.parentValue;
        prev = prev.parent;
        var parentNext = next.parent;
        if (null === prev) {
            if (null !== parentNext) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
        } else {
            if (null === parentNext) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
            popToNearestCommonAncestor(prev, parentNext);
        }
        next.context._currentValue = next.value;
    }
}
function popAllPrevious(prev) {
    prev.context._currentValue = prev.parentValue;
    prev = prev.parent;
    null !== prev && popAllPrevious(prev);
}
function pushAllNext(next) {
    var parentNext = next.parent;
    null !== parentNext && pushAllNext(parentNext);
    next.context._currentValue = next.value;
}
function popPreviousToCommonLevel(prev, next) {
    prev.context._currentValue = prev.parentValue;
    prev = prev.parent;
    if (null === prev) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
    prev.depth === next.depth ? popToNearestCommonAncestor(prev, next) : popPreviousToCommonLevel(prev, next);
}
function popNextToCommonLevel(prev, next) {
    var parentNext = next.parent;
    if (null === parentNext) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
    prev.depth === parentNext.depth ? popToNearestCommonAncestor(prev, parentNext) : popNextToCommonLevel(prev, parentNext);
    next.context._currentValue = next.value;
}
function switchContext(newSnapshot) {
    var prev = currentActiveSnapshot;
    prev !== newSnapshot && (null === prev ? pushAllNext(newSnapshot) : null === newSnapshot ? popAllPrevious(prev) : prev.depth === newSnapshot.depth ? popToNearestCommonAncestor(prev, newSnapshot) : prev.depth > newSnapshot.depth ? popPreviousToCommonLevel(prev, newSnapshot) : popNextToCommonLevel(prev, newSnapshot), currentActiveSnapshot = newSnapshot);
}
var classComponentUpdater = {
    enqueueSetState: function enqueueSetState(inst, payload) {
        inst = inst._reactInternals;
        null !== inst.queue && inst.queue.push(payload);
    },
    enqueueReplaceState: function enqueueReplaceState(inst, payload) {
        inst = inst._reactInternals;
        inst.replace = !0;
        inst.queue = [
            payload
        ];
    },
    enqueueForceUpdate: function enqueueForceUpdate() {}
}, emptyTreeContext = {
    id: 1,
    overflow: ""
};
function pushTreeContext(baseContext, totalChildren, index) {
    var baseIdWithLeadingBit = baseContext.id;
    baseContext = baseContext.overflow;
    var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
    baseIdWithLeadingBit &= ~(1 << baseLength);
    index += 1;
    var length = 32 - clz32(totalChildren) + baseLength;
    if (30 < length) {
        var numberOfOverflowBits = baseLength - baseLength % 5;
        length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
        baseIdWithLeadingBit >>= numberOfOverflowBits;
        baseLength -= numberOfOverflowBits;
        return {
            id: 1 << 32 - clz32(totalChildren) + baseLength | index << baseLength | baseIdWithLeadingBit,
            overflow: length + baseContext
        };
    }
    return {
        id: 1 << length | index << baseLength | baseIdWithLeadingBit,
        overflow: baseContext
    };
}
var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback, log = Math.log, LN2 = Math.LN2;
function clz32Fallback(x) {
    x >>>= 0;
    return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
}
function noop() {}
var SuspenseException = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`.");
function trackUsedThenable(thenableState, thenable, index) {
    index = thenableState[index];
    void 0 === index ? thenableState.push(thenable) : index !== thenable && (thenable.then(noop, noop), thenable = index);
    switch(thenable.status){
        case "fulfilled":
            return thenable.value;
        case "rejected":
            throw thenable.reason;
        default:
            "string" === typeof thenable.status ? thenable.then(noop, noop) : (thenableState = thenable, thenableState.status = "pending", thenableState.then(function(fulfilledValue) {
                if ("pending" === thenable.status) {
                    var fulfilledThenable = thenable;
                    fulfilledThenable.status = "fulfilled";
                    fulfilledThenable.value = fulfilledValue;
                }
            }, function(error) {
                if ("pending" === thenable.status) {
                    var rejectedThenable = thenable;
                    rejectedThenable.status = "rejected";
                    rejectedThenable.reason = error;
                }
            }));
            switch(thenable.status){
                case "fulfilled":
                    return thenable.value;
                case "rejected":
                    throw thenable.reason;
            }
            suspendedThenable = thenable;
            throw SuspenseException;
    }
}
var suspendedThenable = null;
function getSuspendedThenable() {
    if (null === suspendedThenable) throw Error("Expected a suspended thenable. This is a bug in React. Please file an issue.");
    var thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
}
function is(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
}
var objectIs = "function" === typeof Object.is ? Object.is : is, currentlyRenderingComponent = null, currentlyRenderingTask = null, currentlyRenderingRequest = null, currentlyRenderingKeyPath = null, firstWorkInProgressHook = null, workInProgressHook = null, isReRender = !1, didScheduleRenderPhaseUpdate = !1, localIdCounter = 0, actionStateCounter = 0, actionStateMatchingIndex = -1, thenableIndexCounter = 0, thenableState = null, renderPhaseUpdates = null, numberOfReRenders = 0;
function resolveCurrentlyRenderingComponent() {
    if (null === currentlyRenderingComponent) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.");
    return currentlyRenderingComponent;
}
function createHook() {
    if (0 < numberOfReRenders) throw Error("Rendered more hooks than during the previous render");
    return {
        memoizedState: null,
        queue: null,
        next: null
    };
}
function createWorkInProgressHook() {
    null === workInProgressHook ? null === firstWorkInProgressHook ? (isReRender = !1, firstWorkInProgressHook = workInProgressHook = createHook()) : (isReRender = !0, workInProgressHook = firstWorkInProgressHook) : null === workInProgressHook.next ? (isReRender = !1, workInProgressHook = workInProgressHook.next = createHook()) : (isReRender = !0, workInProgressHook = workInProgressHook.next);
    return workInProgressHook;
}
function getThenableStateAfterSuspending() {
    var state = thenableState;
    thenableState = null;
    return state;
}
function resetHooksState() {
    currentlyRenderingKeyPath = currentlyRenderingRequest = currentlyRenderingTask = currentlyRenderingComponent = null;
    didScheduleRenderPhaseUpdate = !1;
    firstWorkInProgressHook = null;
    numberOfReRenders = 0;
    workInProgressHook = renderPhaseUpdates = null;
}
function basicStateReducer(state, action) {
    return "function" === typeof action ? action(state) : action;
}
function useReducer(reducer, initialArg, init) {
    currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
    workInProgressHook = createWorkInProgressHook();
    if (isReRender) {
        var queue = workInProgressHook.queue;
        initialArg = queue.dispatch;
        if (null !== renderPhaseUpdates && (init = renderPhaseUpdates.get(queue), void 0 !== init)) {
            renderPhaseUpdates.delete(queue);
            queue = workInProgressHook.memoizedState;
            do queue = reducer(queue, init.action), init = init.next;
            while (null !== init);
            workInProgressHook.memoizedState = queue;
            return [
                queue,
                initialArg
            ];
        }
        return [
            workInProgressHook.memoizedState,
            initialArg
        ];
    }
    reducer = reducer === basicStateReducer ? "function" === typeof initialArg ? initialArg() : initialArg : void 0 !== init ? init(initialArg) : initialArg;
    workInProgressHook.memoizedState = reducer;
    reducer = workInProgressHook.queue = {
        last: null,
        dispatch: null
    };
    reducer = reducer.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, reducer);
    return [
        workInProgressHook.memoizedState,
        reducer
    ];
}
function useMemo(nextCreate, deps) {
    currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
    workInProgressHook = createWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    if (null !== workInProgressHook) {
        var prevState = workInProgressHook.memoizedState;
        if (null !== prevState && null !== deps) {
            var prevDeps = prevState[1];
            a: if (null === prevDeps) prevDeps = !1;
            else {
                for(var i = 0; i < prevDeps.length && i < deps.length; i++)if (!objectIs(deps[i], prevDeps[i])) {
                    prevDeps = !1;
                    break a;
                }
                prevDeps = !0;
            }
            if (prevDeps) return prevState[0];
        }
    }
    nextCreate = nextCreate();
    workInProgressHook.memoizedState = [
        nextCreate,
        deps
    ];
    return nextCreate;
}
function dispatchAction(componentIdentity, queue, action) {
    if (25 <= numberOfReRenders) throw Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
    if (componentIdentity === currentlyRenderingComponent) if (didScheduleRenderPhaseUpdate = !0, componentIdentity = {
        action: action,
        next: null
    }, null === renderPhaseUpdates && (renderPhaseUpdates = new Map()), action = renderPhaseUpdates.get(queue), void 0 === action) renderPhaseUpdates.set(queue, componentIdentity);
    else {
        for(queue = action; null !== queue.next;)queue = queue.next;
        queue.next = componentIdentity;
    }
}
function throwOnUseEffectEventCall() {
    throw Error("A function wrapped in useEffectEvent can't be called during rendering.");
}
function unsupportedStartTransition() {
    throw Error("startTransition cannot be called during server rendering.");
}
function unsupportedSetOptimisticState() {
    throw Error("Cannot update optimistic state while rendering.");
}
function useActionState(action, initialState, permalink) {
    resolveCurrentlyRenderingComponent();
    var actionStateHookIndex = actionStateCounter++, request = currentlyRenderingRequest;
    if ("function" === typeof action.$$FORM_ACTION) {
        var nextPostbackStateKey = null, componentKeyPath = currentlyRenderingKeyPath;
        request = request.formState;
        var isSignatureEqual = action.$$IS_SIGNATURE_EQUAL;
        if (null !== request && "function" === typeof isSignatureEqual) {
            var postbackKey = request[1];
            isSignatureEqual.call(action, request[2], request[3]) && (nextPostbackStateKey = void 0 !== permalink ? "p" + permalink : "k" + murmurhash3_32_gc(JSON.stringify([
                componentKeyPath,
                null,
                actionStateHookIndex
            ]), 0), postbackKey === nextPostbackStateKey && (actionStateMatchingIndex = actionStateHookIndex, initialState = request[0]));
        }
        var boundAction = action.bind(null, initialState);
        action = function action(payload) {
            boundAction(payload);
        };
        "function" === typeof boundAction.$$FORM_ACTION && (action.$$FORM_ACTION = function(prefix) {
            prefix = boundAction.$$FORM_ACTION(prefix);
            void 0 !== permalink && (permalink += "", prefix.action = permalink);
            var formData = prefix.data;
            formData && (null === nextPostbackStateKey && (nextPostbackStateKey = void 0 !== permalink ? "p" + permalink : "k" + murmurhash3_32_gc(JSON.stringify([
                componentKeyPath,
                null,
                actionStateHookIndex
            ]), 0)), formData.append("$ACTION_KEY", nextPostbackStateKey));
            return prefix;
        });
        return [
            initialState,
            action,
            !1
        ];
    }
    var boundAction$22 = action.bind(null, initialState);
    return [
        initialState,
        function(payload) {
            boundAction$22(payload);
        },
        !1
    ];
}
function unwrapThenable(thenable) {
    var index = thenableIndexCounter;
    thenableIndexCounter += 1;
    null === thenableState && (thenableState = []);
    return trackUsedThenable(thenableState, thenable, index);
}
function unsupportedRefresh() {
    throw Error("Cache cannot be refreshed during server rendering.");
}
var HooksDispatcher = {
    readContext: function readContext(context) {
        return context._currentValue;
    },
    use: function use(usable) {
        if (null !== usable && "object" === (typeof usable === "undefined" ? "undefined" : _type_of(usable))) {
            if ("function" === typeof usable.then) return unwrapThenable(usable);
            if (usable.$$typeof === REACT_CONTEXT_TYPE) return usable._currentValue;
        }
        throw Error("An unsupported type was passed to use(): " + String(usable));
    },
    useContext: function useContext(context) {
        resolveCurrentlyRenderingComponent();
        return context._currentValue;
    },
    useMemo: useMemo,
    useReducer: useReducer,
    useRef: function useRef(initialValue) {
        currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
        workInProgressHook = createWorkInProgressHook();
        var previousRef = workInProgressHook.memoizedState;
        return null === previousRef ? (initialValue = {
            current: initialValue
        }, workInProgressHook.memoizedState = initialValue) : previousRef;
    },
    useState: function useState(initialState) {
        return useReducer(basicStateReducer, initialState);
    },
    useInsertionEffect: noop,
    useLayoutEffect: noop,
    useCallback: function useCallback(callback, deps) {
        return useMemo(function() {
            return callback;
        }, deps);
    },
    useImperativeHandle: noop,
    useEffect: noop,
    useDebugValue: noop,
    useDeferredValue: function useDeferredValue(value, initialValue) {
        resolveCurrentlyRenderingComponent();
        return void 0 !== initialValue ? initialValue : value;
    },
    useTransition: function useTransition() {
        resolveCurrentlyRenderingComponent();
        return [
            !1,
            unsupportedStartTransition
        ];
    },
    useId: function useId() {
        var JSCompiler_inline_result = currentlyRenderingTask.treeContext;
        var overflow = JSCompiler_inline_result.overflow;
        JSCompiler_inline_result = JSCompiler_inline_result.id;
        JSCompiler_inline_result = (JSCompiler_inline_result & ~(1 << 32 - clz32(JSCompiler_inline_result) - 1)).toString(32) + overflow;
        var resumableState = currentResumableState;
        if (null === resumableState) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
        overflow = localIdCounter++;
        JSCompiler_inline_result = "_" + resumableState.idPrefix + "R_" + JSCompiler_inline_result;
        0 < overflow && (JSCompiler_inline_result += "H" + overflow.toString(32));
        return JSCompiler_inline_result + "_";
    },
    useSyncExternalStore: function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
        if (void 0 === getServerSnapshot) throw Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
        return getServerSnapshot();
    },
    useOptimistic: function useOptimistic(passthrough) {
        resolveCurrentlyRenderingComponent();
        return [
            passthrough,
            unsupportedSetOptimisticState
        ];
    },
    useActionState: useActionState,
    useFormState: useActionState,
    useHostTransitionStatus: function useHostTransitionStatus() {
        resolveCurrentlyRenderingComponent();
        return sharedNotPendingObject;
    },
    useMemoCache: function useMemoCache(size) {
        for(var data = Array(size), i = 0; i < size; i++)data[i] = REACT_MEMO_CACHE_SENTINEL;
        return data;
    },
    useCacheRefresh: function useCacheRefresh() {
        return unsupportedRefresh;
    },
    useEffectEvent: function useEffectEvent() {
        return throwOnUseEffectEventCall;
    }
}, currentResumableState = null, DefaultAsyncDispatcher = {
    getCacheForType: function getCacheForType() {
        throw Error("Not implemented.");
    },
    cacheSignal: function cacheSignal() {
        throw Error("Not implemented.");
    }
};
function prepareStackTrace(error, structuredStackTrace) {
    error = (error.name || "Error") + ": " + (error.message || "");
    for(var i = 0; i < structuredStackTrace.length; i++)error += "\n    at " + structuredStackTrace[i].toString();
    return error;
}
var prefix, suffix;
function describeBuiltInComponentFrame(name) {
    if (void 0 === prefix) try {
        throw Error();
    } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || "";
        suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
    }
    return "\n" + prefix + name + suffix;
}
var reentry = !1;
function describeNativeComponentFrame(fn, construct) {
    if (!fn || reentry) return "";
    reentry = !0;
    var previousPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = prepareStackTrace;
    try {
        var RunInRootFrame = {
            DetermineComponentFrameRoot: function DetermineComponentFrameRoot() {
                try {
                    if (construct) {
                        var Fake = function Fake() {
                            throw Error();
                        };
                        Object.defineProperty(Fake.prototype, "props", {
                            set: function set() {
                                throw Error();
                            }
                        });
                        if ("object" === (typeof Reflect === "undefined" ? "undefined" : _type_of(Reflect)) && Reflect.construct) {
                            try {
                                Reflect.construct(Fake, []);
                            } catch (x) {
                                var control = x;
                            }
                            Reflect.construct(fn, [], Fake);
                        } else {
                            try {
                                Fake.call();
                            } catch (x$24) {
                                control = x$24;
                            }
                            fn.call(Fake.prototype);
                        }
                    } else {
                        try {
                            throw Error();
                        } catch (x$25) {
                            control = x$25;
                        }
                        (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {});
                    }
                } catch (sample) {
                    if (sample && control && "string" === typeof sample.stack) return [
                        sample.stack,
                        control.stack
                    ];
                }
                return [
                    null,
                    null
                ];
            }
        };
        RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
        var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, "name");
        namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", {
            value: "DetermineComponentFrameRoot"
        });
        var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
        if (sampleStack && controlStack) {
            var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
            for(namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");)RunInRootFrame++;
            for(; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot");)namePropDescriptor++;
            if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length) for(RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];)namePropDescriptor--;
            for(; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
                    do if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                        var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                        fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                        return frame;
                    }
                    while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
                }
                break;
            }
        }
    } finally{
        reentry = !1, Error.prepareStackTrace = previousPrepareStackTrace;
    }
    return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
}
function describeComponentStackByType(type) {
    if ("string" === typeof type) return describeBuiltInComponentFrame(type);
    if ("function" === typeof type) return type.prototype && type.prototype.isReactComponent ? describeNativeComponentFrame(type, !0) : describeNativeComponentFrame(type, !1);
    if ("object" === (typeof type === "undefined" ? "undefined" : _type_of(type)) && null !== type) {
        switch(type.$$typeof){
            case REACT_FORWARD_REF_TYPE:
                return describeNativeComponentFrame(type.render, !1);
            case REACT_MEMO_TYPE:
                return describeNativeComponentFrame(type.type, !1);
            case REACT_LAZY_TYPE:
                var lazyComponent = type, payload = lazyComponent._payload;
                lazyComponent = lazyComponent._init;
                try {
                    type = lazyComponent(payload);
                } catch (x) {
                    return describeBuiltInComponentFrame("Lazy");
                }
                return describeComponentStackByType(type);
        }
        if ("string" === typeof type.name) {
            a: {
                payload = type.name;
                lazyComponent = type.env;
                var location = type.debugLocation;
                if (null != location && (type = Error.prepareStackTrace, Error.prepareStackTrace = prepareStackTrace, location = location.stack, Error.prepareStackTrace = type, location.startsWith("Error: react-stack-top-frame\n") && (location = location.slice(29)), type = location.indexOf("\n"), -1 !== type && (location = location.slice(type + 1)), type = location.indexOf("react_stack_bottom_frame"), -1 !== type && (type = location.lastIndexOf("\n", type)), type = -1 !== type ? location = location.slice(0, type) : "", location = type.lastIndexOf("\n"), type = -1 === location ? type : type.slice(location + 1), -1 !== type.indexOf(payload))) {
                    payload = "\n" + type;
                    break a;
                }
                payload = describeBuiltInComponentFrame(payload + (lazyComponent ? " [" + lazyComponent + "]" : ""));
            }
            return payload;
        }
    }
    switch(type){
        case REACT_SUSPENSE_LIST_TYPE:
            return describeBuiltInComponentFrame("SuspenseList");
        case REACT_SUSPENSE_TYPE:
            return describeBuiltInComponentFrame("Suspense");
    }
    return "";
}
function isEligibleForOutlining(request, boundary) {
    return (500 < boundary.byteSize || hasSuspenseyContent(boundary.contentState)) && null === boundary.contentPreamble;
}
function defaultErrorHandler(error) {
    if ("object" === (typeof error === "undefined" ? "undefined" : _type_of(error)) && null !== error && "string" === typeof error.environmentName) {
        var JSCompiler_inline_result = error.environmentName;
        error = [
            error
        ].slice(0);
        "string" === typeof error[0] ? error.splice(0, 1, "\u001b[0m\u001b[7m%c%s\u001b[0m%c " + error[0], "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px", " " + JSCompiler_inline_result + " ", "") : error.splice(0, 0, "\u001b[0m\u001b[7m%c%s\u001b[0m%c", "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px", " " + JSCompiler_inline_result + " ", "");
        error.unshift(console);
        JSCompiler_inline_result = bind.apply(console.error, error);
        JSCompiler_inline_result();
    } else console.error(error);
    return null;
}
function RequestInstance(resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, formState) {
    var abortSet = new Set();
    this.destination = null;
    this.flushScheduled = !1;
    this.resumableState = resumableState;
    this.renderState = renderState;
    this.rootFormatContext = rootFormatContext;
    this.progressiveChunkSize = void 0 === progressiveChunkSize ? 12800 : progressiveChunkSize;
    this.status = 10;
    this.fatalError = null;
    this.pendingRootTasks = this.allPendingTasks = this.nextSegmentId = 0;
    this.completedPreambleSegments = this.completedRootSegment = null;
    this.byteSize = 0;
    this.abortableTasks = abortSet;
    this.pingedTasks = [];
    this.clientRenderedBoundaries = [];
    this.completedBoundaries = [];
    this.partialBoundaries = [];
    this.trackedPostpones = null;
    this.onError = void 0 === onError ? defaultErrorHandler : onError;
    this.onPostpone = void 0 === onPostpone ? noop : onPostpone;
    this.onAllReady = void 0 === onAllReady ? noop : onAllReady;
    this.onShellReady = void 0 === onShellReady ? noop : onShellReady;
    this.onShellError = void 0 === onShellError ? noop : onShellError;
    this.onFatalError = void 0 === onFatalError ? noop : onFatalError;
    this.formState = void 0 === formState ? null : formState;
}
function createRequest(children, resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, formState) {
    resumableState = new RequestInstance(resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, formState);
    renderState = createPendingSegment(resumableState, 0, null, rootFormatContext, !1, !1);
    renderState.parentFlushed = !0;
    children = createRenderTask(resumableState, null, children, -1, null, renderState, null, null, resumableState.abortableTasks, null, rootFormatContext, null, emptyTreeContext, null, null);
    pushComponentStack(children);
    resumableState.pingedTasks.push(children);
    return resumableState;
}
function createPrerenderRequest(children, resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone) {
    children = createRequest(children, resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, void 0);
    children.trackedPostpones = {
        workingMap: new Map(),
        rootNodes: [],
        rootSlots: null
    };
    return children;
}
function resumeRequest(children, postponedState, renderState, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone) {
    renderState = new RequestInstance(postponedState.resumableState, renderState, postponedState.rootFormatContext, postponedState.progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, null);
    renderState.nextSegmentId = postponedState.nextSegmentId;
    if ("number" === typeof postponedState.replaySlots) return onError = createPendingSegment(renderState, 0, null, postponedState.rootFormatContext, !1, !1), onError.parentFlushed = !0, children = createRenderTask(renderState, null, children, -1, null, onError, null, null, renderState.abortableTasks, null, postponedState.rootFormatContext, null, emptyTreeContext, null, null), pushComponentStack(children), renderState.pingedTasks.push(children), renderState;
    children = createReplayTask(renderState, null, {
        nodes: postponedState.replayNodes,
        slots: postponedState.replaySlots,
        pendingTasks: 0
    }, children, -1, null, null, renderState.abortableTasks, null, postponedState.rootFormatContext, null, emptyTreeContext, null, null);
    pushComponentStack(children);
    renderState.pingedTasks.push(children);
    return renderState;
}
function resumeAndPrerenderRequest(children, postponedState, renderState, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone) {
    children = resumeRequest(children, postponedState, renderState, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone);
    children.trackedPostpones = {
        workingMap: new Map(),
        rootNodes: [],
        rootSlots: null
    };
    return children;
}
var currentRequest = null;
function resolveRequest() {
    if (currentRequest) return currentRequest;
    if (supportsRequestStorage) {
        var store = requestStorage.getStore();
        if (store) return store;
    }
    return null;
}
function pingTask(request, task) {
    request.pingedTasks.push(task);
    1 === request.pingedTasks.length && (request.flushScheduled = null !== request.destination, null !== request.trackedPostpones || 10 === request.status ? scheduleMicrotask(function() {
        return performWork(request);
    }) : setTimeout(function() {
        return performWork(request);
    }, 0));
}
function createSuspenseBoundary(request, row, fallbackAbortableTasks, contentPreamble, fallbackPreamble) {
    fallbackAbortableTasks = {
        status: 0,
        rootSegmentID: -1,
        parentFlushed: !1,
        pendingTasks: 0,
        row: row,
        completedSegments: [],
        byteSize: 0,
        fallbackAbortableTasks: fallbackAbortableTasks,
        errorDigest: null,
        contentState: createHoistableState(),
        fallbackState: createHoistableState(),
        contentPreamble: contentPreamble,
        fallbackPreamble: fallbackPreamble,
        trackedContentKeyPath: null,
        trackedFallbackNode: null
    };
    null !== row && (row.pendingTasks++, contentPreamble = row.boundaries, null !== contentPreamble && (request.allPendingTasks++, fallbackAbortableTasks.pendingTasks++, contentPreamble.push(fallbackAbortableTasks)), request = row.inheritedHoistables, null !== request && hoistHoistables(fallbackAbortableTasks.contentState, request));
    return fallbackAbortableTasks;
}
function createRenderTask(request, thenableState, node, childIndex, blockedBoundary, blockedSegment, blockedPreamble, hoistableState, abortSet, keyPath, formatContext, context, treeContext, row, componentStack) {
    request.allPendingTasks++;
    null === blockedBoundary ? request.pendingRootTasks++ : blockedBoundary.pendingTasks++;
    null !== row && row.pendingTasks++;
    var task = {
        replay: null,
        node: node,
        childIndex: childIndex,
        ping: function ping() {
            return pingTask(request, task);
        },
        blockedBoundary: blockedBoundary,
        blockedSegment: blockedSegment,
        blockedPreamble: blockedPreamble,
        hoistableState: hoistableState,
        abortSet: abortSet,
        keyPath: keyPath,
        formatContext: formatContext,
        context: context,
        treeContext: treeContext,
        row: row,
        componentStack: componentStack,
        thenableState: thenableState
    };
    abortSet.add(task);
    return task;
}
function createReplayTask(request, thenableState, replay, node, childIndex, blockedBoundary, hoistableState, abortSet, keyPath, formatContext, context, treeContext, row, componentStack) {
    request.allPendingTasks++;
    null === blockedBoundary ? request.pendingRootTasks++ : blockedBoundary.pendingTasks++;
    null !== row && row.pendingTasks++;
    replay.pendingTasks++;
    var task = {
        replay: replay,
        node: node,
        childIndex: childIndex,
        ping: function ping() {
            return pingTask(request, task);
        },
        blockedBoundary: blockedBoundary,
        blockedSegment: null,
        blockedPreamble: null,
        hoistableState: hoistableState,
        abortSet: abortSet,
        keyPath: keyPath,
        formatContext: formatContext,
        context: context,
        treeContext: treeContext,
        row: row,
        componentStack: componentStack,
        thenableState: thenableState
    };
    abortSet.add(task);
    return task;
}
function createPendingSegment(request, index, boundary, parentFormatContext, lastPushedText, textEmbedded) {
    return {
        status: 0,
        parentFlushed: !1,
        id: -1,
        index: index,
        chunks: [],
        children: [],
        preambleChildren: [],
        parentFormatContext: parentFormatContext,
        boundary: boundary,
        lastPushedText: lastPushedText,
        textEmbedded: textEmbedded
    };
}
function pushComponentStack(task) {
    var node = task.node;
    if ("object" === (typeof node === "undefined" ? "undefined" : _type_of(node)) && null !== node) switch(node.$$typeof){
        case REACT_ELEMENT_TYPE:
            task.componentStack = {
                parent: task.componentStack,
                type: node.type
            };
    }
}
function replaceSuspenseComponentStackWithSuspenseFallbackStack(componentStack) {
    return null === componentStack ? null : {
        parent: componentStack.parent,
        type: "Suspense Fallback"
    };
}
function getThrownInfo(node$jscomp$0) {
    var errorInfo = {};
    node$jscomp$0 && Object.defineProperty(errorInfo, "componentStack", {
        configurable: !0,
        enumerable: !0,
        get: function get() {
            try {
                var info = "", node = node$jscomp$0;
                do info += describeComponentStackByType(node.type), node = node.parent;
                while (node);
                var JSCompiler_inline_result = info;
            } catch (x) {
                JSCompiler_inline_result = "\nError generating stack: " + x.message + "\n" + x.stack;
            }
            Object.defineProperty(errorInfo, "componentStack", {
                value: JSCompiler_inline_result
            });
            return JSCompiler_inline_result;
        }
    });
    return errorInfo;
}
function logRecoverableError(request, error, errorInfo) {
    request = request.onError;
    error = request(error, errorInfo);
    if (null == error || "string" === typeof error) return error;
}
function fatalError(request, error) {
    var onShellError = request.onShellError, onFatalError = request.onFatalError;
    onShellError(error);
    onFatalError(error);
    null !== request.destination ? (request.status = 14, closeWithError(request.destination, error)) : (request.status = 13, request.fatalError = error);
}
function finishSuspenseListRow(request, row) {
    unblockSuspenseListRow(request, row.next, row.hoistables);
}
function unblockSuspenseListRow(request, unblockedRow, inheritedHoistables) {
    for(; null !== unblockedRow;){
        null !== inheritedHoistables && (hoistHoistables(unblockedRow.hoistables, inheritedHoistables), unblockedRow.inheritedHoistables = inheritedHoistables);
        var unblockedBoundaries = unblockedRow.boundaries;
        if (null !== unblockedBoundaries) {
            unblockedRow.boundaries = null;
            for(var i = 0; i < unblockedBoundaries.length; i++){
                var unblockedBoundary = unblockedBoundaries[i];
                null !== inheritedHoistables && hoistHoistables(unblockedBoundary.contentState, inheritedHoistables);
                finishedTask(request, unblockedBoundary, null, null);
            }
        }
        unblockedRow.pendingTasks--;
        if (0 < unblockedRow.pendingTasks) break;
        inheritedHoistables = unblockedRow.hoistables;
        unblockedRow = unblockedRow.next;
    }
}
function tryToResolveTogetherRow(request, togetherRow) {
    var boundaries = togetherRow.boundaries;
    if (null !== boundaries && togetherRow.pendingTasks === boundaries.length) {
        for(var allCompleteAndInlinable = !0, i = 0; i < boundaries.length; i++){
            var rowBoundary = boundaries[i];
            if (1 !== rowBoundary.pendingTasks || rowBoundary.parentFlushed || isEligibleForOutlining(request, rowBoundary)) {
                allCompleteAndInlinable = !1;
                break;
            }
        }
        allCompleteAndInlinable && unblockSuspenseListRow(request, togetherRow, togetherRow.hoistables);
    }
}
function createSuspenseListRow(previousRow) {
    var newRow = {
        pendingTasks: 1,
        boundaries: null,
        hoistables: createHoistableState(),
        inheritedHoistables: null,
        together: !1,
        next: null
    };
    null !== previousRow && 0 < previousRow.pendingTasks && (newRow.pendingTasks++, newRow.boundaries = [], previousRow.next = newRow);
    return newRow;
}
function renderSuspenseListRows(request, task, keyPath, rows, revealOrder) {
    var prevKeyPath = task.keyPath, prevTreeContext = task.treeContext, prevRow = task.row;
    task.keyPath = keyPath;
    keyPath = rows.length;
    var previousSuspenseListRow = null;
    if (null !== task.replay) {
        var resumeSlots = task.replay.slots;
        if (null !== resumeSlots && "object" === (typeof resumeSlots === "undefined" ? "undefined" : _type_of(resumeSlots))) for(var n = 0; n < keyPath; n++){
            var i = "backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder ? n : keyPath - 1 - n, node = rows[i];
            task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
            task.treeContext = pushTreeContext(prevTreeContext, keyPath, i);
            var resumeSegmentID = resumeSlots[i];
            "number" === typeof resumeSegmentID ? (resumeNode(request, task, resumeSegmentID, node, i), delete resumeSlots[i]) : renderNode(request, task, node, i);
            0 === --previousSuspenseListRow.pendingTasks && finishSuspenseListRow(request, previousSuspenseListRow);
        }
        else for(resumeSlots = 0; resumeSlots < keyPath; resumeSlots++)n = "backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder ? resumeSlots : keyPath - 1 - resumeSlots, i = rows[n], task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow), task.treeContext = pushTreeContext(prevTreeContext, keyPath, n), renderNode(request, task, i, n), 0 === --previousSuspenseListRow.pendingTasks && finishSuspenseListRow(request, previousSuspenseListRow);
    } else if ("backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder) for(revealOrder = 0; revealOrder < keyPath; revealOrder++)resumeSlots = rows[revealOrder], task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow), task.treeContext = pushTreeContext(prevTreeContext, keyPath, revealOrder), renderNode(request, task, resumeSlots, revealOrder), 0 === --previousSuspenseListRow.pendingTasks && finishSuspenseListRow(request, previousSuspenseListRow);
    else {
        revealOrder = task.blockedSegment;
        resumeSlots = revealOrder.children.length;
        n = revealOrder.chunks.length;
        for(i = keyPath - 1; 0 <= i; i--){
            node = rows[i];
            task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
            task.treeContext = pushTreeContext(prevTreeContext, keyPath, i);
            resumeSegmentID = createPendingSegment(request, n, null, task.formatContext, 0 === i ? revealOrder.lastPushedText : !0, !0);
            revealOrder.children.splice(resumeSlots, 0, resumeSegmentID);
            task.blockedSegment = resumeSegmentID;
            try {
                renderNode(request, task, node, i), resumeSegmentID.lastPushedText && resumeSegmentID.textEmbedded && resumeSegmentID.chunks.push(textSeparator), resumeSegmentID.status = 1, finishedSegment(request, task.blockedBoundary, resumeSegmentID), 0 === --previousSuspenseListRow.pendingTasks && finishSuspenseListRow(request, previousSuspenseListRow);
            } catch (thrownValue) {
                throw resumeSegmentID.status = 12 === request.status ? 3 : 4, thrownValue;
            }
        }
        task.blockedSegment = revealOrder;
        revealOrder.lastPushedText = !1;
    }
    null !== prevRow && null !== previousSuspenseListRow && 0 < previousSuspenseListRow.pendingTasks && (prevRow.pendingTasks++, previousSuspenseListRow.next = prevRow);
    task.treeContext = prevTreeContext;
    task.row = prevRow;
    task.keyPath = prevKeyPath;
}
function renderWithHooks(request, task, keyPath, Component, props, secondArg) {
    var prevThenableState = task.thenableState;
    task.thenableState = null;
    currentlyRenderingComponent = {};
    currentlyRenderingTask = task;
    currentlyRenderingRequest = request;
    currentlyRenderingKeyPath = keyPath;
    actionStateCounter = localIdCounter = 0;
    actionStateMatchingIndex = -1;
    thenableIndexCounter = 0;
    thenableState = prevThenableState;
    for(request = Component(props, secondArg); didScheduleRenderPhaseUpdate;)didScheduleRenderPhaseUpdate = !1, actionStateCounter = localIdCounter = 0, actionStateMatchingIndex = -1, thenableIndexCounter = 0, numberOfReRenders += 1, workInProgressHook = null, request = Component(props, secondArg);
    resetHooksState();
    return request;
}
function finishFunctionComponent(request, task, keyPath, children, hasId, actionStateCount, actionStateMatchingIndex) {
    var didEmitActionStateMarkers = !1;
    if (0 !== actionStateCount && null !== request.formState) {
        var segment = task.blockedSegment;
        if (null !== segment) {
            didEmitActionStateMarkers = !0;
            segment = segment.chunks;
            for(var i = 0; i < actionStateCount; i++)i === actionStateMatchingIndex ? segment.push(formStateMarkerIsMatching) : segment.push(formStateMarkerIsNotMatching);
        }
    }
    actionStateCount = task.keyPath;
    task.keyPath = keyPath;
    hasId ? (keyPath = task.treeContext, task.treeContext = pushTreeContext(keyPath, 1, 0), renderNode(request, task, children, -1), task.treeContext = keyPath) : didEmitActionStateMarkers ? renderNode(request, task, children, -1) : renderNodeDestructive(request, task, children, -1);
    task.keyPath = actionStateCount;
}
function renderElement(request, task, keyPath, type, props, ref) {
    if ("function" === typeof type) if (type.prototype && type.prototype.isReactComponent) {
        var newProps = props;
        if ("ref" in props) {
            newProps = {};
            for(var propName in props)"ref" !== propName && (newProps[propName] = props[propName]);
        }
        var defaultProps = type.defaultProps;
        if (defaultProps) {
            newProps === props && (newProps = assign({}, newProps, props));
            for(var propName$44 in defaultProps)void 0 === newProps[propName$44] && (newProps[propName$44] = defaultProps[propName$44]);
        }
        props = newProps;
        newProps = emptyContextObject;
        defaultProps = type.contextType;
        "object" === (typeof defaultProps === "undefined" ? "undefined" : _type_of(defaultProps)) && null !== defaultProps && (newProps = defaultProps._currentValue);
        newProps = new type(props, newProps);
        var initialState = void 0 !== newProps.state ? newProps.state : null;
        newProps.updater = classComponentUpdater;
        newProps.props = props;
        newProps.state = initialState;
        defaultProps = {
            queue: [],
            replace: !1
        };
        newProps._reactInternals = defaultProps;
        ref = type.contextType;
        newProps.context = "object" === (typeof ref === "undefined" ? "undefined" : _type_of(ref)) && null !== ref ? ref._currentValue : emptyContextObject;
        ref = type.getDerivedStateFromProps;
        "function" === typeof ref && (ref = ref(props, initialState), initialState = null === ref || void 0 === ref ? initialState : assign({}, initialState, ref), newProps.state = initialState);
        if ("function" !== typeof type.getDerivedStateFromProps && "function" !== typeof newProps.getSnapshotBeforeUpdate && ("function" === typeof newProps.UNSAFE_componentWillMount || "function" === typeof newProps.componentWillMount)) if (type = newProps.state, "function" === typeof newProps.componentWillMount && newProps.componentWillMount(), "function" === typeof newProps.UNSAFE_componentWillMount && newProps.UNSAFE_componentWillMount(), type !== newProps.state && classComponentUpdater.enqueueReplaceState(newProps, newProps.state, null), null !== defaultProps.queue && 0 < defaultProps.queue.length) if (type = defaultProps.queue, ref = defaultProps.replace, defaultProps.queue = null, defaultProps.replace = !1, ref && 1 === type.length) newProps.state = type[0];
        else {
            defaultProps = ref ? type[0] : newProps.state;
            initialState = !0;
            for(ref = ref ? 1 : 0; ref < type.length; ref++)propName$44 = type[ref], propName$44 = "function" === typeof propName$44 ? propName$44.call(newProps, defaultProps, props, void 0) : propName$44, null != propName$44 && (initialState ? (initialState = !1, defaultProps = assign({}, defaultProps, propName$44)) : assign(defaultProps, propName$44));
            newProps.state = defaultProps;
        }
        else defaultProps.queue = null;
        type = newProps.render();
        if (12 === request.status) throw null;
        props = task.keyPath;
        task.keyPath = keyPath;
        renderNodeDestructive(request, task, type, -1);
        task.keyPath = props;
    } else {
        type = renderWithHooks(request, task, keyPath, type, props, void 0);
        if (12 === request.status) throw null;
        finishFunctionComponent(request, task, keyPath, type, 0 !== localIdCounter, actionStateCounter, actionStateMatchingIndex);
    }
    else if ("string" === typeof type) if (newProps = task.blockedSegment, null === newProps) newProps = props.children, defaultProps = task.formatContext, initialState = task.keyPath, task.formatContext = getChildFormatContext(defaultProps, type, props), task.keyPath = keyPath, renderNode(request, task, newProps, -1), task.formatContext = defaultProps, task.keyPath = initialState;
    else {
        initialState = pushStartInstance(newProps.chunks, type, props, request.resumableState, request.renderState, task.blockedPreamble, task.hoistableState, task.formatContext, newProps.lastPushedText);
        newProps.lastPushedText = !1;
        defaultProps = task.formatContext;
        ref = task.keyPath;
        task.keyPath = keyPath;
        if (3 === (task.formatContext = getChildFormatContext(defaultProps, type, props)).insertionMode) {
            keyPath = createPendingSegment(request, 0, null, task.formatContext, !1, !1);
            newProps.preambleChildren.push(keyPath);
            task.blockedSegment = keyPath;
            try {
                keyPath.status = 6, renderNode(request, task, initialState, -1), keyPath.lastPushedText && keyPath.textEmbedded && keyPath.chunks.push(textSeparator), keyPath.status = 1, finishedSegment(request, task.blockedBoundary, keyPath);
            } finally{
                task.blockedSegment = newProps;
            }
        } else renderNode(request, task, initialState, -1);
        task.formatContext = defaultProps;
        task.keyPath = ref;
        a: {
            task = newProps.chunks;
            request = request.resumableState;
            switch(type){
                case "title":
                case "style":
                case "script":
                case "area":
                case "base":
                case "br":
                case "col":
                case "embed":
                case "hr":
                case "img":
                case "input":
                case "keygen":
                case "link":
                case "meta":
                case "param":
                case "source":
                case "track":
                case "wbr":
                    break a;
                case "body":
                    if (1 >= defaultProps.insertionMode) {
                        request.hasBody = !0;
                        break a;
                    }
                    break;
                case "html":
                    if (0 === defaultProps.insertionMode) {
                        request.hasHtml = !0;
                        break a;
                    }
                    break;
                case "head":
                    if (1 >= defaultProps.insertionMode) break a;
            }
            task.push(endChunkForTag(type));
        }
        newProps.lastPushedText = !1;
    }
    else {
        switch(type){
            case REACT_LEGACY_HIDDEN_TYPE:
            case REACT_STRICT_MODE_TYPE:
            case REACT_PROFILER_TYPE:
            case REACT_FRAGMENT_TYPE:
                type = task.keyPath;
                task.keyPath = keyPath;
                renderNodeDestructive(request, task, props.children, -1);
                task.keyPath = type;
                return;
            case REACT_ACTIVITY_TYPE:
                type = task.blockedSegment;
                null === type ? "hidden" !== props.mode && (type = task.keyPath, task.keyPath = keyPath, renderNode(request, task, props.children, -1), task.keyPath = type) : "hidden" !== props.mode && (type.chunks.push(startActivityBoundary), type.lastPushedText = !1, newProps = task.keyPath, task.keyPath = keyPath, renderNode(request, task, props.children, -1), task.keyPath = newProps, type.chunks.push(endActivityBoundary), type.lastPushedText = !1);
                return;
            case REACT_SUSPENSE_LIST_TYPE:
                a: {
                    type = props.children;
                    props = props.revealOrder;
                    if ("forwards" === props || "backwards" === props || "unstable_legacy-backwards" === props) {
                        if (isArrayImpl(type)) {
                            renderSuspenseListRows(request, task, keyPath, type, props);
                            break a;
                        }
                        if (newProps = getIteratorFn(type)) {
                            if (newProps = newProps.call(type)) {
                                defaultProps = newProps.next();
                                if (!defaultProps.done) {
                                    do defaultProps = newProps.next();
                                    while (!defaultProps.done);
                                    renderSuspenseListRows(request, task, keyPath, type, props);
                                }
                                break a;
                            }
                        }
                    }
                    "together" === props ? (props = task.keyPath, newProps = task.row, defaultProps = task.row = createSuspenseListRow(null), defaultProps.boundaries = [], defaultProps.together = !0, task.keyPath = keyPath, renderNodeDestructive(request, task, type, -1), 0 === --defaultProps.pendingTasks && finishSuspenseListRow(request, defaultProps), task.keyPath = props, task.row = newProps, null !== newProps && 0 < defaultProps.pendingTasks && (newProps.pendingTasks++, defaultProps.next = newProps)) : (props = task.keyPath, task.keyPath = keyPath, renderNodeDestructive(request, task, type, -1), task.keyPath = props);
                }
                return;
            case REACT_VIEW_TRANSITION_TYPE:
            case REACT_SCOPE_TYPE:
                throw Error("ReactDOMServer does not yet support scope components.");
            case REACT_SUSPENSE_TYPE:
                a: if (null !== task.replay) {
                    type = task.keyPath;
                    newProps = task.formatContext;
                    defaultProps = task.row;
                    task.keyPath = keyPath;
                    task.formatContext = getSuspenseContentFormatContext(request.resumableState, newProps);
                    task.row = null;
                    keyPath = props.children;
                    try {
                        renderNode(request, task, keyPath, -1);
                    } finally{
                        task.keyPath = type, task.formatContext = newProps, task.row = defaultProps;
                    }
                } else {
                    type = task.keyPath;
                    ref = task.formatContext;
                    var prevRow = task.row;
                    propName$44 = task.blockedBoundary;
                    propName = task.blockedPreamble;
                    var parentHoistableState = task.hoistableState, parentSegment = task.blockedSegment, fallback = props.fallback;
                    props = props.children;
                    var fallbackAbortSet = new Set();
                    var newBoundary = 2 > task.formatContext.insertionMode ? createSuspenseBoundary(request, task.row, fallbackAbortSet, createPreambleState(), createPreambleState()) : createSuspenseBoundary(request, task.row, fallbackAbortSet, null, null);
                    null !== request.trackedPostpones && (newBoundary.trackedContentKeyPath = keyPath);
                    var boundarySegment = createPendingSegment(request, parentSegment.chunks.length, newBoundary, task.formatContext, !1, !1);
                    parentSegment.children.push(boundarySegment);
                    parentSegment.lastPushedText = !1;
                    var contentRootSegment = createPendingSegment(request, 0, null, task.formatContext, !1, !1);
                    contentRootSegment.parentFlushed = !0;
                    if (null !== request.trackedPostpones) {
                        newProps = task.componentStack;
                        defaultProps = [
                            keyPath[0],
                            "Suspense Fallback",
                            keyPath[2]
                        ];
                        initialState = [
                            defaultProps[1],
                            defaultProps[2],
                            [],
                            null
                        ];
                        request.trackedPostpones.workingMap.set(defaultProps, initialState);
                        newBoundary.trackedFallbackNode = initialState;
                        task.blockedSegment = boundarySegment;
                        task.blockedPreamble = newBoundary.fallbackPreamble;
                        task.keyPath = defaultProps;
                        task.formatContext = getSuspenseFallbackFormatContext(request.resumableState, ref);
                        task.componentStack = replaceSuspenseComponentStackWithSuspenseFallbackStack(newProps);
                        boundarySegment.status = 6;
                        try {
                            renderNode(request, task, fallback, -1), boundarySegment.lastPushedText && boundarySegment.textEmbedded && boundarySegment.chunks.push(textSeparator), boundarySegment.status = 1, finishedSegment(request, propName$44, boundarySegment);
                        } catch (thrownValue) {
                            throw boundarySegment.status = 12 === request.status ? 3 : 4, thrownValue;
                        } finally{
                            task.blockedSegment = parentSegment, task.blockedPreamble = propName, task.keyPath = type, task.formatContext = ref;
                        }
                        task = createRenderTask(request, null, props, -1, newBoundary, contentRootSegment, newBoundary.contentPreamble, newBoundary.contentState, task.abortSet, keyPath, getSuspenseContentFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, null, newProps);
                        pushComponentStack(task);
                        request.pingedTasks.push(task);
                    } else {
                        task.blockedBoundary = newBoundary;
                        task.blockedPreamble = newBoundary.contentPreamble;
                        task.hoistableState = newBoundary.contentState;
                        task.blockedSegment = contentRootSegment;
                        task.keyPath = keyPath;
                        task.formatContext = getSuspenseContentFormatContext(request.resumableState, ref);
                        task.row = null;
                        contentRootSegment.status = 6;
                        try {
                            if (renderNode(request, task, props, -1), contentRootSegment.lastPushedText && contentRootSegment.textEmbedded && contentRootSegment.chunks.push(textSeparator), contentRootSegment.status = 1, finishedSegment(request, newBoundary, contentRootSegment), queueCompletedSegment(newBoundary, contentRootSegment), 0 === newBoundary.pendingTasks && 0 === newBoundary.status) {
                                if (newBoundary.status = 1, !isEligibleForOutlining(request, newBoundary)) {
                                    null !== prevRow && 0 === --prevRow.pendingTasks && finishSuspenseListRow(request, prevRow);
                                    0 === request.pendingRootTasks && task.blockedPreamble && preparePreamble(request);
                                    break a;
                                }
                            } else null !== prevRow && prevRow.together && tryToResolveTogetherRow(request, prevRow);
                        } catch (thrownValue$31) {
                            newBoundary.status = 4, 12 === request.status ? (contentRootSegment.status = 3, newProps = request.fatalError) : (contentRootSegment.status = 4, newProps = thrownValue$31), defaultProps = getThrownInfo(task.componentStack), initialState = logRecoverableError(request, newProps, defaultProps), newBoundary.errorDigest = initialState, untrackBoundary(request, newBoundary);
                        } finally{
                            task.blockedBoundary = propName$44, task.blockedPreamble = propName, task.hoistableState = parentHoistableState, task.blockedSegment = parentSegment, task.keyPath = type, task.formatContext = ref, task.row = prevRow;
                        }
                        task = createRenderTask(request, null, fallback, -1, propName$44, boundarySegment, newBoundary.fallbackPreamble, newBoundary.fallbackState, fallbackAbortSet, [
                            keyPath[0],
                            "Suspense Fallback",
                            keyPath[2]
                        ], getSuspenseFallbackFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, task.row, replaceSuspenseComponentStackWithSuspenseFallbackStack(task.componentStack));
                        pushComponentStack(task);
                        request.pingedTasks.push(task);
                    }
                }
                return;
        }
        if ("object" === (typeof type === "undefined" ? "undefined" : _type_of(type)) && null !== type) switch(type.$$typeof){
            case REACT_FORWARD_REF_TYPE:
                if ("ref" in props) for(parentSegment in newProps = {}, props)"ref" !== parentSegment && (newProps[parentSegment] = props[parentSegment]);
                else newProps = props;
                type = renderWithHooks(request, task, keyPath, type.render, newProps, ref);
                finishFunctionComponent(request, task, keyPath, type, 0 !== localIdCounter, actionStateCounter, actionStateMatchingIndex);
                return;
            case REACT_MEMO_TYPE:
                renderElement(request, task, keyPath, type.type, props, ref);
                return;
            case REACT_CONTEXT_TYPE:
                defaultProps = props.children;
                newProps = task.keyPath;
                props = props.value;
                initialState = type._currentValue;
                type._currentValue = props;
                ref = currentActiveSnapshot;
                currentActiveSnapshot = type = {
                    parent: ref,
                    depth: null === ref ? 0 : ref.depth + 1,
                    context: type,
                    parentValue: initialState,
                    value: props
                };
                task.context = type;
                task.keyPath = keyPath;
                renderNodeDestructive(request, task, defaultProps, -1);
                request = currentActiveSnapshot;
                if (null === request) throw Error("Tried to pop a Context at the root of the app. This is a bug in React.");
                request.context._currentValue = request.parentValue;
                request = currentActiveSnapshot = request.parent;
                task.context = request;
                task.keyPath = newProps;
                return;
            case REACT_CONSUMER_TYPE:
                props = props.children;
                type = props(type._context._currentValue);
                props = task.keyPath;
                task.keyPath = keyPath;
                renderNodeDestructive(request, task, type, -1);
                task.keyPath = props;
                return;
            case REACT_LAZY_TYPE:
                newProps = type._init;
                type = newProps(type._payload);
                if (12 === request.status) throw null;
                renderElement(request, task, keyPath, type, props, ref);
                return;
        }
        throw Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + ((null == type ? type : typeof type === "undefined" ? "undefined" : _type_of(type)) + "."));
    }
}
function resumeNode(request, task, segmentId, node, childIndex) {
    var prevReplay = task.replay, blockedBoundary = task.blockedBoundary, resumedSegment = createPendingSegment(request, 0, null, task.formatContext, !1, !1);
    resumedSegment.id = segmentId;
    resumedSegment.parentFlushed = !0;
    try {
        task.replay = null, task.blockedSegment = resumedSegment, renderNode(request, task, node, childIndex), resumedSegment.status = 1, finishedSegment(request, blockedBoundary, resumedSegment), null === blockedBoundary ? request.completedRootSegment = resumedSegment : (queueCompletedSegment(blockedBoundary, resumedSegment), blockedBoundary.parentFlushed && request.partialBoundaries.push(blockedBoundary));
    } finally{
        task.replay = prevReplay, task.blockedSegment = null;
    }
}
function renderNodeDestructive(request, task, node, childIndex) {
    null !== task.replay && "number" === typeof task.replay.slots ? resumeNode(request, task, task.replay.slots, node, childIndex) : (task.node = node, task.childIndex = childIndex, node = task.componentStack, pushComponentStack(task), retryNode(request, task), task.componentStack = node);
}
function retryNode(request, task) {
    var node = task.node, childIndex = task.childIndex;
    if (null !== node) {
        if ("object" === (typeof node === "undefined" ? "undefined" : _type_of(node))) {
            switch(node.$$typeof){
                case REACT_ELEMENT_TYPE:
                    var type = node.type, key = node.key, props = node.props;
                    node = props.ref;
                    var ref = void 0 !== node ? node : null, name = getComponentNameFromType(type), keyOrIndex = null == key ? -1 === childIndex ? 0 : childIndex : key;
                    key = [
                        task.keyPath,
                        name,
                        keyOrIndex
                    ];
                    if (null !== task.replay) a: {
                        var replay = task.replay;
                        childIndex = replay.nodes;
                        for(node = 0; node < childIndex.length; node++){
                            var node$jscomp$0 = childIndex[node];
                            if (keyOrIndex === node$jscomp$0[1]) {
                                if (4 === node$jscomp$0.length) {
                                    if (null !== name && name !== node$jscomp$0[0]) throw Error("Expected the resume to render <" + node$jscomp$0[0] + "> in this slot but instead it rendered <" + name + ">. The tree doesn't match so React will fallback to client rendering.");
                                    var childNodes = node$jscomp$0[2];
                                    name = node$jscomp$0[3];
                                    keyOrIndex = task.node;
                                    task.replay = {
                                        nodes: childNodes,
                                        slots: name,
                                        pendingTasks: 1
                                    };
                                    try {
                                        renderElement(request, task, key, type, props, ref);
                                        if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
                                        task.replay.pendingTasks--;
                                    } catch (x) {
                                        if ("object" === (typeof x === "undefined" ? "undefined" : _type_of(x)) && null !== x && (x === SuspenseException || "function" === typeof x.then)) throw task.node === keyOrIndex ? task.replay = replay : childIndex.splice(node, 1), x;
                                        task.replay.pendingTasks--;
                                        props = getThrownInfo(task.componentStack);
                                        key = request;
                                        request = task.blockedBoundary;
                                        type = x;
                                        props = logRecoverableError(key, type, props);
                                        abortRemainingReplayNodes(key, request, childNodes, name, type, props);
                                    }
                                    task.replay = replay;
                                } else {
                                    if (type !== REACT_SUSPENSE_TYPE) throw Error("Expected the resume to render <Suspense> in this slot but instead it rendered <" + (getComponentNameFromType(type) || "Unknown") + ">. The tree doesn't match so React will fallback to client rendering.");
                                    b: {
                                        replay = void 0;
                                        type = node$jscomp$0[5];
                                        ref = node$jscomp$0[2];
                                        name = node$jscomp$0[3];
                                        keyOrIndex = null === node$jscomp$0[4] ? [] : node$jscomp$0[4][2];
                                        node$jscomp$0 = null === node$jscomp$0[4] ? null : node$jscomp$0[4][3];
                                        var prevKeyPath = task.keyPath, prevContext = task.formatContext, prevRow = task.row, previousReplaySet = task.replay, parentBoundary = task.blockedBoundary, parentHoistableState = task.hoistableState, content = props.children, fallback = props.fallback, fallbackAbortSet = new Set();
                                        props = 2 > task.formatContext.insertionMode ? createSuspenseBoundary(request, task.row, fallbackAbortSet, createPreambleState(), createPreambleState()) : createSuspenseBoundary(request, task.row, fallbackAbortSet, null, null);
                                        props.parentFlushed = !0;
                                        props.rootSegmentID = type;
                                        task.blockedBoundary = props;
                                        task.hoistableState = props.contentState;
                                        task.keyPath = key;
                                        task.formatContext = getSuspenseContentFormatContext(request.resumableState, prevContext);
                                        task.row = null;
                                        task.replay = {
                                            nodes: ref,
                                            slots: name,
                                            pendingTasks: 1
                                        };
                                        try {
                                            renderNode(request, task, content, -1);
                                            if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
                                            task.replay.pendingTasks--;
                                            if (0 === props.pendingTasks && 0 === props.status) {
                                                props.status = 1;
                                                request.completedBoundaries.push(props);
                                                break b;
                                            }
                                        } catch (error) {
                                            props.status = 4, childNodes = getThrownInfo(task.componentStack), replay = logRecoverableError(request, error, childNodes), props.errorDigest = replay, task.replay.pendingTasks--, request.clientRenderedBoundaries.push(props);
                                        } finally{
                                            task.blockedBoundary = parentBoundary, task.hoistableState = parentHoistableState, task.replay = previousReplaySet, task.keyPath = prevKeyPath, task.formatContext = prevContext, task.row = prevRow;
                                        }
                                        childNodes = createReplayTask(request, null, {
                                            nodes: keyOrIndex,
                                            slots: node$jscomp$0,
                                            pendingTasks: 0
                                        }, fallback, -1, parentBoundary, props.fallbackState, fallbackAbortSet, [
                                            key[0],
                                            "Suspense Fallback",
                                            key[2]
                                        ], getSuspenseFallbackFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, task.row, replaceSuspenseComponentStackWithSuspenseFallbackStack(task.componentStack));
                                        pushComponentStack(childNodes);
                                        request.pingedTasks.push(childNodes);
                                    }
                                }
                                childIndex.splice(node, 1);
                                break a;
                            }
                        }
                    }
                    else renderElement(request, task, key, type, props, ref);
                    return;
                case REACT_PORTAL_TYPE:
                    throw Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
                case REACT_LAZY_TYPE:
                    childNodes = node._init;
                    node = childNodes(node._payload);
                    if (12 === request.status) throw null;
                    renderNodeDestructive(request, task, node, childIndex);
                    return;
            }
            if (isArrayImpl(node)) {
                renderChildrenArray(request, task, node, childIndex);
                return;
            }
            if (childNodes = getIteratorFn(node)) {
                if (childNodes = childNodes.call(node)) {
                    node = childNodes.next();
                    if (!node.done) {
                        props = [];
                        do props.push(node.value), node = childNodes.next();
                        while (!node.done);
                        renderChildrenArray(request, task, props, childIndex);
                    }
                    return;
                }
            }
            if ("function" === typeof node.then) return task.thenableState = null, renderNodeDestructive(request, task, unwrapThenable(node), childIndex);
            if (node.$$typeof === REACT_CONTEXT_TYPE) return renderNodeDestructive(request, task, node._currentValue, childIndex);
            childIndex = Object.prototype.toString.call(node);
            throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === childIndex ? "object with keys {" + Object.keys(node).join(", ") + "}" : childIndex) + "). If you meant to render a collection of children, use an array instead.");
        }
        if ("string" === typeof node) childIndex = task.blockedSegment, null !== childIndex && (childIndex.lastPushedText = pushTextInstance(childIndex.chunks, node, request.renderState, childIndex.lastPushedText));
        else if ("number" === typeof node || "bigint" === (typeof node === "undefined" ? "undefined" : _type_of(node))) childIndex = task.blockedSegment, null !== childIndex && (childIndex.lastPushedText = pushTextInstance(childIndex.chunks, "" + node, request.renderState, childIndex.lastPushedText));
    }
}
function renderChildrenArray(request, task, children, childIndex) {
    var prevKeyPath = task.keyPath;
    if (-1 !== childIndex && (task.keyPath = [
        task.keyPath,
        "Fragment",
        childIndex
    ], null !== task.replay)) {
        for(var replay = task.replay, replayNodes = replay.nodes, j = 0; j < replayNodes.length; j++){
            var node = replayNodes[j];
            if (node[1] === childIndex) {
                childIndex = node[2];
                node = node[3];
                task.replay = {
                    nodes: childIndex,
                    slots: node,
                    pendingTasks: 1
                };
                try {
                    renderChildrenArray(request, task, children, -1);
                    if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
                    task.replay.pendingTasks--;
                } catch (x) {
                    if ("object" === (typeof x === "undefined" ? "undefined" : _type_of(x)) && null !== x && (x === SuspenseException || "function" === typeof x.then)) throw x;
                    task.replay.pendingTasks--;
                    children = getThrownInfo(task.componentStack);
                    var boundary = task.blockedBoundary, error = x;
                    children = logRecoverableError(request, error, children);
                    abortRemainingReplayNodes(request, boundary, childIndex, node, error, children);
                }
                task.replay = replay;
                replayNodes.splice(j, 1);
                break;
            }
        }
        task.keyPath = prevKeyPath;
        return;
    }
    replay = task.treeContext;
    replayNodes = children.length;
    if (null !== task.replay && (j = task.replay.slots, null !== j && "object" === (typeof j === "undefined" ? "undefined" : _type_of(j)))) {
        for(childIndex = 0; childIndex < replayNodes; childIndex++)node = children[childIndex], task.treeContext = pushTreeContext(replay, replayNodes, childIndex), boundary = j[childIndex], "number" === typeof boundary ? (resumeNode(request, task, boundary, node, childIndex), delete j[childIndex]) : renderNode(request, task, node, childIndex);
        task.treeContext = replay;
        task.keyPath = prevKeyPath;
        return;
    }
    for(j = 0; j < replayNodes; j++)childIndex = children[j], task.treeContext = pushTreeContext(replay, replayNodes, j), renderNode(request, task, childIndex, j);
    task.treeContext = replay;
    task.keyPath = prevKeyPath;
}
function trackPostponedBoundary(request, trackedPostpones, boundary) {
    boundary.status = 5;
    boundary.rootSegmentID = request.nextSegmentId++;
    request = boundary.trackedContentKeyPath;
    if (null === request) throw Error("It should not be possible to postpone at the root. This is a bug in React.");
    var fallbackReplayNode = boundary.trackedFallbackNode, children = [], boundaryNode = trackedPostpones.workingMap.get(request);
    if (void 0 === boundaryNode) return boundary = [
        request[1],
        request[2],
        children,
        null,
        fallbackReplayNode,
        boundary.rootSegmentID
    ], trackedPostpones.workingMap.set(request, boundary), addToReplayParent(boundary, request[0], trackedPostpones), boundary;
    boundaryNode[4] = fallbackReplayNode;
    boundaryNode[5] = boundary.rootSegmentID;
    return boundaryNode;
}
function trackPostpone(request, trackedPostpones, task, segment) {
    segment.status = 5;
    var keyPath = task.keyPath, boundary = task.blockedBoundary;
    if (null === boundary) segment.id = request.nextSegmentId++, trackedPostpones.rootSlots = segment.id, null !== request.completedRootSegment && (request.completedRootSegment.status = 5);
    else {
        if (null !== boundary && 0 === boundary.status) {
            var boundaryNode = trackPostponedBoundary(request, trackedPostpones, boundary);
            if (boundary.trackedContentKeyPath === keyPath && -1 === task.childIndex) {
                -1 === segment.id && (segment.id = segment.parentFlushed ? boundary.rootSegmentID : request.nextSegmentId++);
                boundaryNode[3] = segment.id;
                return;
            }
        }
        -1 === segment.id && (segment.id = segment.parentFlushed && null !== boundary ? boundary.rootSegmentID : request.nextSegmentId++);
        if (-1 === task.childIndex) null === keyPath ? trackedPostpones.rootSlots = segment.id : (task = trackedPostpones.workingMap.get(keyPath), void 0 === task ? (task = [
            keyPath[1],
            keyPath[2],
            [],
            segment.id
        ], addToReplayParent(task, keyPath[0], trackedPostpones)) : task[3] = segment.id);
        else {
            if (null === keyPath) if (request = trackedPostpones.rootSlots, null === request) request = trackedPostpones.rootSlots = {};
            else {
                if ("number" === typeof request) throw Error("It should not be possible to postpone both at the root of an element as well as a slot below. This is a bug in React.");
            }
            else if (boundary = trackedPostpones.workingMap, boundaryNode = boundary.get(keyPath), void 0 === boundaryNode) request = {}, boundaryNode = [
                keyPath[1],
                keyPath[2],
                [],
                request
            ], boundary.set(keyPath, boundaryNode), addToReplayParent(boundaryNode, keyPath[0], trackedPostpones);
            else if (request = boundaryNode[3], null === request) request = boundaryNode[3] = {};
            else if ("number" === typeof request) throw Error("It should not be possible to postpone both at the root of an element as well as a slot below. This is a bug in React.");
            request[task.childIndex] = segment.id;
        }
    }
}
function untrackBoundary(request, boundary) {
    request = request.trackedPostpones;
    null !== request && (boundary = boundary.trackedContentKeyPath, null !== boundary && (boundary = request.workingMap.get(boundary), void 0 !== boundary && (boundary.length = 4, boundary[2] = [], boundary[3] = null)));
}
function spawnNewSuspendedReplayTask(request, task, thenableState) {
    return createReplayTask(request, thenableState, task.replay, task.node, task.childIndex, task.blockedBoundary, task.hoistableState, task.abortSet, task.keyPath, task.formatContext, task.context, task.treeContext, task.row, task.componentStack);
}
function spawnNewSuspendedRenderTask(request, task, thenableState) {
    var segment = task.blockedSegment, newSegment = createPendingSegment(request, segment.chunks.length, null, task.formatContext, segment.lastPushedText, !0);
    segment.children.push(newSegment);
    segment.lastPushedText = !1;
    return createRenderTask(request, thenableState, task.node, task.childIndex, task.blockedBoundary, newSegment, task.blockedPreamble, task.hoistableState, task.abortSet, task.keyPath, task.formatContext, task.context, task.treeContext, task.row, task.componentStack);
}
function renderNode(request, task, node, childIndex) {
    var previousFormatContext = task.formatContext, previousContext = task.context, previousKeyPath = task.keyPath, previousTreeContext = task.treeContext, previousComponentStack = task.componentStack, segment = task.blockedSegment;
    if (null === segment) {
        segment = task.replay;
        try {
            return renderNodeDestructive(request, task, node, childIndex);
        } catch (thrownValue) {
            if (resetHooksState(), node = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue, 12 !== request.status && "object" === (typeof node === "undefined" ? "undefined" : _type_of(node)) && null !== node) {
                if ("function" === typeof node.then) {
                    childIndex = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                    request = spawnNewSuspendedReplayTask(request, task, childIndex).ping;
                    node.then(request, request);
                    task.formatContext = previousFormatContext;
                    task.context = previousContext;
                    task.keyPath = previousKeyPath;
                    task.treeContext = previousTreeContext;
                    task.componentStack = previousComponentStack;
                    task.replay = segment;
                    switchContext(previousContext);
                    return;
                }
                if ("Maximum call stack size exceeded" === node.message) {
                    node = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                    node = spawnNewSuspendedReplayTask(request, task, node);
                    request.pingedTasks.push(node);
                    task.formatContext = previousFormatContext;
                    task.context = previousContext;
                    task.keyPath = previousKeyPath;
                    task.treeContext = previousTreeContext;
                    task.componentStack = previousComponentStack;
                    task.replay = segment;
                    switchContext(previousContext);
                    return;
                }
            }
        }
    } else {
        var childrenLength = segment.children.length, chunkLength = segment.chunks.length;
        try {
            return renderNodeDestructive(request, task, node, childIndex);
        } catch (thrownValue$63) {
            if (resetHooksState(), segment.children.length = childrenLength, segment.chunks.length = chunkLength, node = thrownValue$63 === SuspenseException ? getSuspendedThenable() : thrownValue$63, 12 !== request.status && "object" === (typeof node === "undefined" ? "undefined" : _type_of(node)) && null !== node) {
                if ("function" === typeof node.then) {
                    segment = node;
                    node = thrownValue$63 === SuspenseException ? getThenableStateAfterSuspending() : null;
                    request = spawnNewSuspendedRenderTask(request, task, node).ping;
                    segment.then(request, request);
                    task.formatContext = previousFormatContext;
                    task.context = previousContext;
                    task.keyPath = previousKeyPath;
                    task.treeContext = previousTreeContext;
                    task.componentStack = previousComponentStack;
                    switchContext(previousContext);
                    return;
                }
                if ("Maximum call stack size exceeded" === node.message) {
                    segment = thrownValue$63 === SuspenseException ? getThenableStateAfterSuspending() : null;
                    segment = spawnNewSuspendedRenderTask(request, task, segment);
                    request.pingedTasks.push(segment);
                    task.formatContext = previousFormatContext;
                    task.context = previousContext;
                    task.keyPath = previousKeyPath;
                    task.treeContext = previousTreeContext;
                    task.componentStack = previousComponentStack;
                    switchContext(previousContext);
                    return;
                }
            }
        }
    }
    task.formatContext = previousFormatContext;
    task.context = previousContext;
    task.keyPath = previousKeyPath;
    task.treeContext = previousTreeContext;
    switchContext(previousContext);
    throw node;
}
function abortTaskSoft(task) {
    var boundary = task.blockedBoundary, segment = task.blockedSegment;
    null !== segment && (segment.status = 3, finishedTask(this, boundary, task.row, segment));
}
function abortRemainingReplayNodes(request$jscomp$0, boundary, nodes, slots, error, errorDigest$jscomp$0) {
    for(var i = 0; i < nodes.length; i++){
        var node = nodes[i];
        if (4 === node.length) abortRemainingReplayNodes(request$jscomp$0, boundary, node[2], node[3], error, errorDigest$jscomp$0);
        else {
            node = node[5];
            var request = request$jscomp$0, errorDigest = errorDigest$jscomp$0, resumedBoundary = createSuspenseBoundary(request, null, new Set(), null, null);
            resumedBoundary.parentFlushed = !0;
            resumedBoundary.rootSegmentID = node;
            resumedBoundary.status = 4;
            resumedBoundary.errorDigest = errorDigest;
            resumedBoundary.parentFlushed && request.clientRenderedBoundaries.push(resumedBoundary);
        }
    }
    nodes.length = 0;
    if (null !== slots) {
        if (null === boundary) throw Error("We should not have any resumable nodes in the shell. This is a bug in React.");
        4 !== boundary.status && (boundary.status = 4, boundary.errorDigest = errorDigest$jscomp$0, boundary.parentFlushed && request$jscomp$0.clientRenderedBoundaries.push(boundary));
        if ("object" === (typeof slots === "undefined" ? "undefined" : _type_of(slots))) for(var index in slots)delete slots[index];
    }
}
function abortTask(task, request, error) {
    var boundary = task.blockedBoundary, segment = task.blockedSegment;
    if (null !== segment) {
        if (6 === segment.status) return;
        segment.status = 3;
    }
    var errorInfo = getThrownInfo(task.componentStack);
    if (null === boundary) {
        if (13 !== request.status && 14 !== request.status) {
            boundary = task.replay;
            if (null === boundary) {
                null !== request.trackedPostpones && null !== segment ? (boundary = request.trackedPostpones, logRecoverableError(request, error, errorInfo), trackPostpone(request, boundary, task, segment), finishedTask(request, null, task.row, segment)) : (logRecoverableError(request, error, errorInfo), fatalError(request, error));
                return;
            }
            boundary.pendingTasks--;
            0 === boundary.pendingTasks && 0 < boundary.nodes.length && (segment = logRecoverableError(request, error, errorInfo), abortRemainingReplayNodes(request, null, boundary.nodes, boundary.slots, error, segment));
            request.pendingRootTasks--;
            0 === request.pendingRootTasks && completeShell(request);
        }
    } else {
        var trackedPostpones$64 = request.trackedPostpones;
        if (4 !== boundary.status) {
            if (null !== trackedPostpones$64 && null !== segment) return logRecoverableError(request, error, errorInfo), trackPostpone(request, trackedPostpones$64, task, segment), boundary.fallbackAbortableTasks.forEach(function(fallbackTask) {
                return abortTask(fallbackTask, request, error);
            }), boundary.fallbackAbortableTasks.clear(), finishedTask(request, boundary, task.row, segment);
            boundary.status = 4;
            segment = logRecoverableError(request, error, errorInfo);
            boundary.status = 4;
            boundary.errorDigest = segment;
            untrackBoundary(request, boundary);
            boundary.parentFlushed && request.clientRenderedBoundaries.push(boundary);
        }
        boundary.pendingTasks--;
        segment = boundary.row;
        null !== segment && 0 === --segment.pendingTasks && finishSuspenseListRow(request, segment);
        boundary.fallbackAbortableTasks.forEach(function(fallbackTask) {
            return abortTask(fallbackTask, request, error);
        });
        boundary.fallbackAbortableTasks.clear();
    }
    task = task.row;
    null !== task && 0 === --task.pendingTasks && finishSuspenseListRow(request, task);
    request.allPendingTasks--;
    0 === request.allPendingTasks && completeAll(request);
}
function safelyEmitEarlyPreloads(request, shellComplete) {
    try {
        var renderState = request.renderState, onHeaders = renderState.onHeaders;
        if (onHeaders) {
            var headers = renderState.headers;
            if (headers) {
                renderState.headers = null;
                var linkHeader = headers.preconnects;
                headers.fontPreloads && (linkHeader && (linkHeader += ", "), linkHeader += headers.fontPreloads);
                headers.highImagePreloads && (linkHeader && (linkHeader += ", "), linkHeader += headers.highImagePreloads);
                if (!shellComplete) {
                    var queueIter = renderState.styles.values(), queueStep = queueIter.next();
                    b: for(; 0 < headers.remainingCapacity && !queueStep.done; queueStep = queueIter.next())for(var sheetIter = queueStep.value.sheets.values(), sheetStep = sheetIter.next(); 0 < headers.remainingCapacity && !sheetStep.done; sheetStep = sheetIter.next()){
                        var sheet = sheetStep.value, props = sheet.props, key = props.href, props$jscomp$0 = sheet.props, header = getPreloadAsHeader(props$jscomp$0.href, "style", {
                            crossOrigin: props$jscomp$0.crossOrigin,
                            integrity: props$jscomp$0.integrity,
                            nonce: props$jscomp$0.nonce,
                            type: props$jscomp$0.type,
                            fetchPriority: props$jscomp$0.fetchPriority,
                            referrerPolicy: props$jscomp$0.referrerPolicy,
                            media: props$jscomp$0.media
                        });
                        if (0 <= (headers.remainingCapacity -= header.length + 2)) renderState.resets.style[key] = PRELOAD_NO_CREDS, linkHeader && (linkHeader += ", "), linkHeader += header, renderState.resets.style[key] = "string" === typeof props.crossOrigin || "string" === typeof props.integrity ? [
                            props.crossOrigin,
                            props.integrity
                        ] : PRELOAD_NO_CREDS;
                        else break b;
                    }
                }
                linkHeader ? onHeaders({
                    Link: linkHeader
                }) : onHeaders({});
            }
        }
    } catch (error) {
        logRecoverableError(request, error, {});
    }
}
function completeShell(request) {
    null === request.trackedPostpones && safelyEmitEarlyPreloads(request, !0);
    null === request.trackedPostpones && preparePreamble(request);
    request.onShellError = noop;
    request = request.onShellReady;
    request();
}
function completeAll(request) {
    safelyEmitEarlyPreloads(request, null === request.trackedPostpones ? !0 : null === request.completedRootSegment || 5 !== request.completedRootSegment.status);
    preparePreamble(request);
    request = request.onAllReady;
    request();
}
function queueCompletedSegment(boundary, segment) {
    if (0 === segment.chunks.length && 1 === segment.children.length && null === segment.children[0].boundary && -1 === segment.children[0].id) {
        var childSegment = segment.children[0];
        childSegment.id = segment.id;
        childSegment.parentFlushed = !0;
        1 !== childSegment.status && 3 !== childSegment.status && 4 !== childSegment.status || queueCompletedSegment(boundary, childSegment);
    } else boundary.completedSegments.push(segment);
}
function finishedSegment(request, boundary, segment) {
    if (null !== byteLengthOfChunk) {
        segment = segment.chunks;
        for(var segmentByteSize = 0, i = 0; i < segment.length; i++)segmentByteSize += segment[i].byteLength;
        null === boundary ? request.byteSize += segmentByteSize : boundary.byteSize += segmentByteSize;
    }
}
function finishedTask(request, boundary, row, segment) {
    null !== row && (0 === --row.pendingTasks ? finishSuspenseListRow(request, row) : row.together && tryToResolveTogetherRow(request, row));
    request.allPendingTasks--;
    if (null === boundary) {
        if (null !== segment && segment.parentFlushed) {
            if (null !== request.completedRootSegment) throw Error("There can only be one root segment. This is a bug in React.");
            request.completedRootSegment = segment;
        }
        request.pendingRootTasks--;
        0 === request.pendingRootTasks && completeShell(request);
    } else if (boundary.pendingTasks--, 4 !== boundary.status) if (0 === boundary.pendingTasks) if (0 === boundary.status && (boundary.status = 1), null !== segment && segment.parentFlushed && (1 === segment.status || 3 === segment.status) && queueCompletedSegment(boundary, segment), boundary.parentFlushed && request.completedBoundaries.push(boundary), 1 === boundary.status) row = boundary.row, null !== row && hoistHoistables(row.hoistables, boundary.contentState), isEligibleForOutlining(request, boundary) || (boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request), boundary.fallbackAbortableTasks.clear(), null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row)), 0 === request.pendingRootTasks && null === request.trackedPostpones && null !== boundary.contentPreamble && preparePreamble(request);
    else {
        if (5 === boundary.status && (boundary = boundary.row, null !== boundary)) {
            if (null !== request.trackedPostpones) {
                row = request.trackedPostpones;
                var postponedRow = boundary.next;
                if (null !== postponedRow && (segment = postponedRow.boundaries, null !== segment)) for(postponedRow.boundaries = null, postponedRow = 0; postponedRow < segment.length; postponedRow++){
                    var postponedBoundary = segment[postponedRow];
                    trackPostponedBoundary(request, row, postponedBoundary);
                    finishedTask(request, postponedBoundary, null, null);
                }
            }
            0 === --boundary.pendingTasks && finishSuspenseListRow(request, boundary);
        }
    }
    else null === segment || !segment.parentFlushed || 1 !== segment.status && 3 !== segment.status || (queueCompletedSegment(boundary, segment), 1 === boundary.completedSegments.length && boundary.parentFlushed && request.partialBoundaries.push(boundary)), boundary = boundary.row, null !== boundary && boundary.together && tryToResolveTogetherRow(request, boundary);
    0 === request.allPendingTasks && completeAll(request);
}
function performWork(request$jscomp$2) {
    if (14 !== request$jscomp$2.status && 13 !== request$jscomp$2.status) {
        var prevContext = currentActiveSnapshot, prevDispatcher = ReactSharedInternals.H;
        ReactSharedInternals.H = HooksDispatcher;
        var prevAsyncDispatcher = ReactSharedInternals.A;
        ReactSharedInternals.A = DefaultAsyncDispatcher;
        var prevRequest = currentRequest;
        currentRequest = request$jscomp$2;
        var prevResumableState = currentResumableState;
        currentResumableState = request$jscomp$2.resumableState;
        try {
            var pingedTasks = request$jscomp$2.pingedTasks, i;
            for(i = 0; i < pingedTasks.length; i++){
                var task = pingedTasks[i], request = request$jscomp$2, segment = task.blockedSegment;
                if (null === segment) {
                    var request$jscomp$0 = request;
                    if (0 !== task.replay.pendingTasks) {
                        switchContext(task.context);
                        try {
                            "number" === typeof task.replay.slots ? resumeNode(request$jscomp$0, task, task.replay.slots, task.node, task.childIndex) : retryNode(request$jscomp$0, task);
                            if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
                            task.replay.pendingTasks--;
                            task.abortSet.delete(task);
                            finishedTask(request$jscomp$0, task.blockedBoundary, task.row, null);
                        } catch (thrownValue) {
                            resetHooksState();
                            var x = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue;
                            if ("object" === (typeof x === "undefined" ? "undefined" : _type_of(x)) && null !== x && "function" === typeof x.then) {
                                var ping = task.ping;
                                x.then(ping, ping);
                                task.thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                            } else {
                                task.replay.pendingTasks--;
                                task.abortSet.delete(task);
                                var errorInfo = getThrownInfo(task.componentStack);
                                request = void 0;
                                var request$jscomp$1 = request$jscomp$0, boundary = task.blockedBoundary, error$jscomp$0 = 12 === request$jscomp$0.status ? request$jscomp$0.fatalError : x, replayNodes = task.replay.nodes, resumeSlots = task.replay.slots;
                                request = logRecoverableError(request$jscomp$1, error$jscomp$0, errorInfo);
                                abortRemainingReplayNodes(request$jscomp$1, boundary, replayNodes, resumeSlots, error$jscomp$0, request);
                                request$jscomp$0.pendingRootTasks--;
                                0 === request$jscomp$0.pendingRootTasks && completeShell(request$jscomp$0);
                                request$jscomp$0.allPendingTasks--;
                                0 === request$jscomp$0.allPendingTasks && completeAll(request$jscomp$0);
                            }
                        } finally{}
                    }
                } else if (request$jscomp$0 = void 0, request$jscomp$1 = segment, 0 === request$jscomp$1.status) {
                    request$jscomp$1.status = 6;
                    switchContext(task.context);
                    var childrenLength = request$jscomp$1.children.length, chunkLength = request$jscomp$1.chunks.length;
                    try {
                        retryNode(request, task), request$jscomp$1.lastPushedText && request$jscomp$1.textEmbedded && request$jscomp$1.chunks.push(textSeparator), task.abortSet.delete(task), request$jscomp$1.status = 1, finishedSegment(request, task.blockedBoundary, request$jscomp$1), finishedTask(request, task.blockedBoundary, task.row, request$jscomp$1);
                    } catch (thrownValue) {
                        resetHooksState();
                        request$jscomp$1.children.length = childrenLength;
                        request$jscomp$1.chunks.length = chunkLength;
                        var x$jscomp$0 = thrownValue === SuspenseException ? getSuspendedThenable() : 12 === request.status ? request.fatalError : thrownValue;
                        if (12 === request.status && null !== request.trackedPostpones) {
                            var trackedPostpones = request.trackedPostpones, thrownInfo = getThrownInfo(task.componentStack);
                            task.abortSet.delete(task);
                            logRecoverableError(request, x$jscomp$0, thrownInfo);
                            trackPostpone(request, trackedPostpones, task, request$jscomp$1);
                            finishedTask(request, task.blockedBoundary, task.row, request$jscomp$1);
                        } else if ("object" === (typeof x$jscomp$0 === "undefined" ? "undefined" : _type_of(x$jscomp$0)) && null !== x$jscomp$0 && "function" === typeof x$jscomp$0.then) {
                            request$jscomp$1.status = 0;
                            task.thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                            var ping$jscomp$0 = task.ping;
                            x$jscomp$0.then(ping$jscomp$0, ping$jscomp$0);
                        } else {
                            var errorInfo$jscomp$0 = getThrownInfo(task.componentStack);
                            task.abortSet.delete(task);
                            request$jscomp$1.status = 4;
                            var boundary$jscomp$0 = task.blockedBoundary, row = task.row;
                            null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row);
                            request.allPendingTasks--;
                            request$jscomp$0 = logRecoverableError(request, x$jscomp$0, errorInfo$jscomp$0);
                            if (null === boundary$jscomp$0) fatalError(request, x$jscomp$0);
                            else if (boundary$jscomp$0.pendingTasks--, 4 !== boundary$jscomp$0.status) {
                                boundary$jscomp$0.status = 4;
                                boundary$jscomp$0.errorDigest = request$jscomp$0;
                                untrackBoundary(request, boundary$jscomp$0);
                                var boundaryRow = boundary$jscomp$0.row;
                                null !== boundaryRow && 0 === --boundaryRow.pendingTasks && finishSuspenseListRow(request, boundaryRow);
                                boundary$jscomp$0.parentFlushed && request.clientRenderedBoundaries.push(boundary$jscomp$0);
                                0 === request.pendingRootTasks && null === request.trackedPostpones && null !== boundary$jscomp$0.contentPreamble && preparePreamble(request);
                            }
                            0 === request.allPendingTasks && completeAll(request);
                        }
                    } finally{}
                }
            }
            pingedTasks.splice(0, i);
            null !== request$jscomp$2.destination && flushCompletedQueues(request$jscomp$2, request$jscomp$2.destination);
        } catch (error) {
            logRecoverableError(request$jscomp$2, error, {}), fatalError(request$jscomp$2, error);
        } finally{
            currentResumableState = prevResumableState, ReactSharedInternals.H = prevDispatcher, ReactSharedInternals.A = prevAsyncDispatcher, prevDispatcher === HooksDispatcher && switchContext(prevContext), currentRequest = prevRequest;
        }
    }
}
function preparePreambleFromSubtree(request, segment, collectedPreambleSegments) {
    segment.preambleChildren.length && collectedPreambleSegments.push(segment.preambleChildren);
    for(var pendingPreambles = !1, i = 0; i < segment.children.length; i++)pendingPreambles = preparePreambleFromSegment(request, segment.children[i], collectedPreambleSegments) || pendingPreambles;
    return pendingPreambles;
}
function preparePreambleFromSegment(request, segment, collectedPreambleSegments) {
    var boundary = segment.boundary;
    if (null === boundary) return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
    var preamble = boundary.contentPreamble, fallbackPreamble = boundary.fallbackPreamble;
    if (null === preamble || null === fallbackPreamble) return !1;
    switch(boundary.status){
        case 1:
            hoistPreambleState(request.renderState, preamble);
            request.byteSize += boundary.byteSize;
            segment = boundary.completedSegments[0];
            if (!segment) throw Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
            return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
        case 5:
            if (null !== request.trackedPostpones) return !0;
        case 4:
            if (1 === segment.status) return hoistPreambleState(request.renderState, fallbackPreamble), preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
        default:
            return !0;
    }
}
function preparePreamble(request) {
    if (request.completedRootSegment && null === request.completedPreambleSegments) {
        var collectedPreambleSegments = [], originalRequestByteSize = request.byteSize, hasPendingPreambles = preparePreambleFromSegment(request, request.completedRootSegment, collectedPreambleSegments), preamble = request.renderState.preamble;
        !1 === hasPendingPreambles || preamble.headChunks && preamble.bodyChunks ? request.completedPreambleSegments = collectedPreambleSegments : request.byteSize = originalRequestByteSize;
    }
}
function flushSubtree(request, destination, segment, hoistableState) {
    segment.parentFlushed = !0;
    switch(segment.status){
        case 0:
            segment.id = request.nextSegmentId++;
        case 5:
            return hoistableState = segment.id, segment.lastPushedText = !1, segment.textEmbedded = !1, request = request.renderState, writeChunk(destination, placeholder1), writeChunk(destination, request.placeholderPrefix), request = stringToChunk(hoistableState.toString(16)), writeChunk(destination, request), writeChunkAndReturn(destination, placeholder2);
        case 1:
            segment.status = 2;
            var r = !0, chunks = segment.chunks, chunkIdx = 0;
            segment = segment.children;
            for(var childIdx = 0; childIdx < segment.length; childIdx++){
                for(r = segment[childIdx]; chunkIdx < r.index; chunkIdx++)writeChunk(destination, chunks[chunkIdx]);
                r = flushSegment(request, destination, r, hoistableState);
            }
            for(; chunkIdx < chunks.length - 1; chunkIdx++)writeChunk(destination, chunks[chunkIdx]);
            chunkIdx < chunks.length && (r = writeChunkAndReturn(destination, chunks[chunkIdx]));
            return r;
        case 3:
            return !0;
        default:
            throw Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
    }
}
var flushedByteSize = 0;
function flushSegment(request, destination, segment, hoistableState) {
    var boundary = segment.boundary;
    if (null === boundary) return flushSubtree(request, destination, segment, hoistableState);
    boundary.parentFlushed = !0;
    if (4 === boundary.status) {
        var row = boundary.row;
        null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row);
        boundary = boundary.errorDigest;
        writeChunkAndReturn(destination, startClientRenderedSuspenseBoundary);
        writeChunk(destination, clientRenderedSuspenseBoundaryError1);
        boundary && (writeChunk(destination, clientRenderedSuspenseBoundaryError1A), writeChunk(destination, stringToChunk(escapeTextForBrowser(boundary))), writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial));
        writeChunkAndReturn(destination, clientRenderedSuspenseBoundaryError2);
        flushSubtree(request, destination, segment, hoistableState);
    } else if (1 !== boundary.status) 0 === boundary.status && (boundary.rootSegmentID = request.nextSegmentId++), 0 < boundary.completedSegments.length && request.partialBoundaries.push(boundary), writeStartPendingSuspenseBoundary(destination, request.renderState, boundary.rootSegmentID), hoistableState && hoistHoistables(hoistableState, boundary.fallbackState), flushSubtree(request, destination, segment, hoistableState);
    else if (!flushingPartialBoundaries && isEligibleForOutlining(request, boundary) && (flushedByteSize + boundary.byteSize > request.progressiveChunkSize || hasSuspenseyContent(boundary.contentState))) boundary.rootSegmentID = request.nextSegmentId++, request.completedBoundaries.push(boundary), writeStartPendingSuspenseBoundary(destination, request.renderState, boundary.rootSegmentID), flushSubtree(request, destination, segment, hoistableState);
    else {
        flushedByteSize += boundary.byteSize;
        hoistableState && hoistHoistables(hoistableState, boundary.contentState);
        segment = boundary.row;
        null !== segment && isEligibleForOutlining(request, boundary) && 0 === --segment.pendingTasks && finishSuspenseListRow(request, segment);
        writeChunkAndReturn(destination, startCompletedSuspenseBoundary);
        segment = boundary.completedSegments;
        if (1 !== segment.length) throw Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
        flushSegment(request, destination, segment[0], hoistableState);
    }
    return writeChunkAndReturn(destination, endSuspenseBoundary);
}
function flushSegmentContainer(request, destination, segment, hoistableState) {
    writeStartSegment(destination, request.renderState, segment.parentFormatContext, segment.id);
    flushSegment(request, destination, segment, hoistableState);
    return writeEndSegment(destination, segment.parentFormatContext);
}
function flushCompletedBoundary(request, destination, boundary) {
    flushedByteSize = boundary.byteSize;
    for(var completedSegments = boundary.completedSegments, i = 0; i < completedSegments.length; i++)flushPartiallyCompletedSegment(request, destination, boundary, completedSegments[i]);
    completedSegments.length = 0;
    completedSegments = boundary.row;
    null !== completedSegments && isEligibleForOutlining(request, boundary) && 0 === --completedSegments.pendingTasks && finishSuspenseListRow(request, completedSegments);
    writeHoistablesForBoundary(destination, boundary.contentState, request.renderState);
    completedSegments = request.resumableState;
    request = request.renderState;
    i = boundary.rootSegmentID;
    boundary = boundary.contentState;
    var requiresStyleInsertion = request.stylesToHoist;
    request.stylesToHoist = !1;
    writeChunk(destination, request.startInlineScript);
    writeChunk(destination, endOfStartTag);
    requiresStyleInsertion ? (0 === (completedSegments.instructions & 4) && (completedSegments.instructions |= 4, writeChunk(destination, clientRenderScriptFunctionOnly)), 0 === (completedSegments.instructions & 2) && (completedSegments.instructions |= 2, writeChunk(destination, completeBoundaryScriptFunctionOnly)), 0 === (completedSegments.instructions & 8) ? (completedSegments.instructions |= 8, writeChunk(destination, completeBoundaryWithStylesScript1FullPartial)) : writeChunk(destination, completeBoundaryWithStylesScript1Partial)) : (0 === (completedSegments.instructions & 2) && (completedSegments.instructions |= 2, writeChunk(destination, completeBoundaryScriptFunctionOnly)), writeChunk(destination, completeBoundaryScript1Partial));
    completedSegments = stringToChunk(i.toString(16));
    writeChunk(destination, request.boundaryPrefix);
    writeChunk(destination, completedSegments);
    writeChunk(destination, completeBoundaryScript2);
    writeChunk(destination, request.segmentPrefix);
    writeChunk(destination, completedSegments);
    requiresStyleInsertion ? (writeChunk(destination, completeBoundaryScript3a), writeStyleResourceDependenciesInJS(destination, boundary)) : writeChunk(destination, completeBoundaryScript3b);
    boundary = writeChunkAndReturn(destination, completeBoundaryScriptEnd);
    return writeBootstrap(destination, request) && boundary;
}
function flushPartiallyCompletedSegment(request, destination, boundary, segment) {
    if (2 === segment.status) return !0;
    var hoistableState = boundary.contentState, segmentID = segment.id;
    if (-1 === segmentID) {
        if (-1 === (segment.id = boundary.rootSegmentID)) throw Error("A root segment ID must have been assigned by now. This is a bug in React.");
        return flushSegmentContainer(request, destination, segment, hoistableState);
    }
    if (segmentID === boundary.rootSegmentID) return flushSegmentContainer(request, destination, segment, hoistableState);
    flushSegmentContainer(request, destination, segment, hoistableState);
    boundary = request.resumableState;
    request = request.renderState;
    writeChunk(destination, request.startInlineScript);
    writeChunk(destination, endOfStartTag);
    0 === (boundary.instructions & 1) ? (boundary.instructions |= 1, writeChunk(destination, completeSegmentScript1Full)) : writeChunk(destination, completeSegmentScript1Partial);
    writeChunk(destination, request.segmentPrefix);
    segmentID = stringToChunk(segmentID.toString(16));
    writeChunk(destination, segmentID);
    writeChunk(destination, completeSegmentScript2);
    writeChunk(destination, request.placeholderPrefix);
    writeChunk(destination, segmentID);
    destination = writeChunkAndReturn(destination, completeSegmentScriptEnd);
    return destination;
}
var flushingPartialBoundaries = !1;
function flushCompletedQueues(request, destination) {
    currentView = new Uint8Array(2048);
    writtenBytes = 0;
    try {
        if (!(0 < request.pendingRootTasks)) {
            var i, completedRootSegment = request.completedRootSegment;
            if (null !== completedRootSegment) {
                if (5 === completedRootSegment.status) return;
                var completedPreambleSegments = request.completedPreambleSegments;
                if (null === completedPreambleSegments) return;
                flushedByteSize = request.byteSize;
                var resumableState = request.resumableState, renderState = request.renderState, preamble = renderState.preamble, htmlChunks = preamble.htmlChunks, headChunks = preamble.headChunks, i$jscomp$0;
                if (htmlChunks) {
                    for(i$jscomp$0 = 0; i$jscomp$0 < htmlChunks.length; i$jscomp$0++)writeChunk(destination, htmlChunks[i$jscomp$0]);
                    if (headChunks) for(i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)writeChunk(destination, headChunks[i$jscomp$0]);
                    else writeChunk(destination, startChunkForTag("head")), writeChunk(destination, endOfStartTag);
                } else if (headChunks) for(i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)writeChunk(destination, headChunks[i$jscomp$0]);
                var charsetChunks = renderState.charsetChunks;
                for(i$jscomp$0 = 0; i$jscomp$0 < charsetChunks.length; i$jscomp$0++)writeChunk(destination, charsetChunks[i$jscomp$0]);
                charsetChunks.length = 0;
                renderState.preconnects.forEach(flushResource, destination);
                renderState.preconnects.clear();
                var viewportChunks = renderState.viewportChunks;
                for(i$jscomp$0 = 0; i$jscomp$0 < viewportChunks.length; i$jscomp$0++)writeChunk(destination, viewportChunks[i$jscomp$0]);
                viewportChunks.length = 0;
                renderState.fontPreloads.forEach(flushResource, destination);
                renderState.fontPreloads.clear();
                renderState.highImagePreloads.forEach(flushResource, destination);
                renderState.highImagePreloads.clear();
                currentlyFlushingRenderState = renderState;
                renderState.styles.forEach(flushStylesInPreamble, destination);
                currentlyFlushingRenderState = null;
                var importMapChunks = renderState.importMapChunks;
                for(i$jscomp$0 = 0; i$jscomp$0 < importMapChunks.length; i$jscomp$0++)writeChunk(destination, importMapChunks[i$jscomp$0]);
                importMapChunks.length = 0;
                renderState.bootstrapScripts.forEach(flushResource, destination);
                renderState.scripts.forEach(flushResource, destination);
                renderState.scripts.clear();
                renderState.bulkPreloads.forEach(flushResource, destination);
                renderState.bulkPreloads.clear();
                htmlChunks || headChunks || (resumableState.instructions |= 32);
                var hoistableChunks = renderState.hoistableChunks;
                for(i$jscomp$0 = 0; i$jscomp$0 < hoistableChunks.length; i$jscomp$0++)writeChunk(destination, hoistableChunks[i$jscomp$0]);
                for(resumableState = hoistableChunks.length = 0; resumableState < completedPreambleSegments.length; resumableState++){
                    var segments = completedPreambleSegments[resumableState];
                    for(renderState = 0; renderState < segments.length; renderState++)flushSegment(request, destination, segments[renderState], null);
                }
                var preamble$jscomp$0 = request.renderState.preamble, headChunks$jscomp$0 = preamble$jscomp$0.headChunks;
                (preamble$jscomp$0.htmlChunks || headChunks$jscomp$0) && writeChunk(destination, endChunkForTag("head"));
                var bodyChunks = preamble$jscomp$0.bodyChunks;
                if (bodyChunks) for(completedPreambleSegments = 0; completedPreambleSegments < bodyChunks.length; completedPreambleSegments++)writeChunk(destination, bodyChunks[completedPreambleSegments]);
                flushSegment(request, destination, completedRootSegment, null);
                request.completedRootSegment = null;
                var renderState$jscomp$0 = request.renderState;
                if (0 !== request.allPendingTasks || 0 !== request.clientRenderedBoundaries.length || 0 !== request.completedBoundaries.length || null !== request.trackedPostpones && (0 !== request.trackedPostpones.rootNodes.length || null !== request.trackedPostpones.rootSlots)) {
                    var resumableState$jscomp$0 = request.resumableState;
                    if (0 === (resumableState$jscomp$0.instructions & 64)) {
                        resumableState$jscomp$0.instructions |= 64;
                        writeChunk(destination, renderState$jscomp$0.startInlineScript);
                        if (0 === (resumableState$jscomp$0.instructions & 32)) {
                            resumableState$jscomp$0.instructions |= 32;
                            var shellId = "_" + resumableState$jscomp$0.idPrefix + "R_";
                            writeChunk(destination, completedShellIdAttributeStart);
                            writeChunk(destination, stringToChunk(escapeTextForBrowser(shellId)));
                            writeChunk(destination, attributeEnd);
                        }
                        writeChunk(destination, endOfStartTag);
                        writeChunk(destination, shellTimeRuntimeScript);
                        writeChunkAndReturn(destination, endInlineScript);
                    }
                }
                writeBootstrap(destination, renderState$jscomp$0);
            }
            var renderState$jscomp$1 = request.renderState;
            completedRootSegment = 0;
            var viewportChunks$jscomp$0 = renderState$jscomp$1.viewportChunks;
            for(completedRootSegment = 0; completedRootSegment < viewportChunks$jscomp$0.length; completedRootSegment++)writeChunk(destination, viewportChunks$jscomp$0[completedRootSegment]);
            viewportChunks$jscomp$0.length = 0;
            renderState$jscomp$1.preconnects.forEach(flushResource, destination);
            renderState$jscomp$1.preconnects.clear();
            renderState$jscomp$1.fontPreloads.forEach(flushResource, destination);
            renderState$jscomp$1.fontPreloads.clear();
            renderState$jscomp$1.highImagePreloads.forEach(flushResource, destination);
            renderState$jscomp$1.highImagePreloads.clear();
            renderState$jscomp$1.styles.forEach(preloadLateStyles, destination);
            renderState$jscomp$1.scripts.forEach(flushResource, destination);
            renderState$jscomp$1.scripts.clear();
            renderState$jscomp$1.bulkPreloads.forEach(flushResource, destination);
            renderState$jscomp$1.bulkPreloads.clear();
            var hoistableChunks$jscomp$0 = renderState$jscomp$1.hoistableChunks;
            for(completedRootSegment = 0; completedRootSegment < hoistableChunks$jscomp$0.length; completedRootSegment++)writeChunk(destination, hoistableChunks$jscomp$0[completedRootSegment]);
            hoistableChunks$jscomp$0.length = 0;
            var clientRenderedBoundaries = request.clientRenderedBoundaries;
            for(i = 0; i < clientRenderedBoundaries.length; i++){
                var boundary = clientRenderedBoundaries[i];
                renderState$jscomp$1 = destination;
                var resumableState$jscomp$1 = request.resumableState, renderState$jscomp$2 = request.renderState, id = boundary.rootSegmentID, errorDigest = boundary.errorDigest;
                writeChunk(renderState$jscomp$1, renderState$jscomp$2.startInlineScript);
                writeChunk(renderState$jscomp$1, endOfStartTag);
                0 === (resumableState$jscomp$1.instructions & 4) ? (resumableState$jscomp$1.instructions |= 4, writeChunk(renderState$jscomp$1, clientRenderScript1Full)) : writeChunk(renderState$jscomp$1, clientRenderScript1Partial);
                writeChunk(renderState$jscomp$1, renderState$jscomp$2.boundaryPrefix);
                writeChunk(renderState$jscomp$1, stringToChunk(id.toString(16)));
                writeChunk(renderState$jscomp$1, clientRenderScript1A);
                errorDigest && (writeChunk(renderState$jscomp$1, clientRenderErrorScriptArgInterstitial), writeChunk(renderState$jscomp$1, stringToChunk(escapeJSStringsForInstructionScripts(errorDigest || ""))));
                var JSCompiler_inline_result = writeChunkAndReturn(renderState$jscomp$1, clientRenderScriptEnd);
                if (!JSCompiler_inline_result) {
                    request.destination = null;
                    i++;
                    clientRenderedBoundaries.splice(0, i);
                    return;
                }
            }
            clientRenderedBoundaries.splice(0, i);
            var completedBoundaries = request.completedBoundaries;
            for(i = 0; i < completedBoundaries.length; i++)if (!flushCompletedBoundary(request, destination, completedBoundaries[i])) {
                request.destination = null;
                i++;
                completedBoundaries.splice(0, i);
                return;
            }
            completedBoundaries.splice(0, i);
            completeWriting(destination);
            currentView = new Uint8Array(2048);
            writtenBytes = 0;
            flushingPartialBoundaries = !0;
            var partialBoundaries = request.partialBoundaries;
            for(i = 0; i < partialBoundaries.length; i++){
                var boundary$70 = partialBoundaries[i];
                a: {
                    clientRenderedBoundaries = request;
                    boundary = destination;
                    flushedByteSize = boundary$70.byteSize;
                    var completedSegments = boundary$70.completedSegments;
                    for(JSCompiler_inline_result = 0; JSCompiler_inline_result < completedSegments.length; JSCompiler_inline_result++)if (!flushPartiallyCompletedSegment(clientRenderedBoundaries, boundary, boundary$70, completedSegments[JSCompiler_inline_result])) {
                        JSCompiler_inline_result++;
                        completedSegments.splice(0, JSCompiler_inline_result);
                        var JSCompiler_inline_result$jscomp$0 = !1;
                        break a;
                    }
                    completedSegments.splice(0, JSCompiler_inline_result);
                    var row = boundary$70.row;
                    null !== row && row.together && 1 === boundary$70.pendingTasks && (1 === row.pendingTasks ? unblockSuspenseListRow(clientRenderedBoundaries, row, row.hoistables) : row.pendingTasks--);
                    JSCompiler_inline_result$jscomp$0 = writeHoistablesForBoundary(boundary, boundary$70.contentState, clientRenderedBoundaries.renderState);
                }
                if (!JSCompiler_inline_result$jscomp$0) {
                    request.destination = null;
                    i++;
                    partialBoundaries.splice(0, i);
                    return;
                }
            }
            partialBoundaries.splice(0, i);
            flushingPartialBoundaries = !1;
            var largeBoundaries = request.completedBoundaries;
            for(i = 0; i < largeBoundaries.length; i++)if (!flushCompletedBoundary(request, destination, largeBoundaries[i])) {
                request.destination = null;
                i++;
                largeBoundaries.splice(0, i);
                return;
            }
            largeBoundaries.splice(0, i);
        }
    } finally{
        flushingPartialBoundaries = !1, 0 === request.allPendingTasks && 0 === request.clientRenderedBoundaries.length && 0 === request.completedBoundaries.length ? (request.flushScheduled = !1, i = request.resumableState, i.hasBody && writeChunk(destination, endChunkForTag("body")), i.hasHtml && writeChunk(destination, endChunkForTag("html")), completeWriting(destination), request.status = 14, destination.close(), request.destination = null) : completeWriting(destination);
    }
}
function startWork(request) {
    request.flushScheduled = null !== request.destination;
    supportsRequestStorage ? scheduleMicrotask(function() {
        return requestStorage.run(request, performWork, request);
    }) : scheduleMicrotask(function() {
        return performWork(request);
    });
    setTimeout(function() {
        10 === request.status && (request.status = 11);
        null === request.trackedPostpones && (supportsRequestStorage ? requestStorage.run(request, enqueueEarlyPreloadsAfterInitialWork, request) : enqueueEarlyPreloadsAfterInitialWork(request));
    }, 0);
}
function enqueueEarlyPreloadsAfterInitialWork(request) {
    safelyEmitEarlyPreloads(request, 0 === request.pendingRootTasks);
}
function enqueueFlush(request) {
    !1 === request.flushScheduled && 0 === request.pingedTasks.length && null !== request.destination && (request.flushScheduled = !0, setTimeout(function() {
        var destination = request.destination;
        destination ? flushCompletedQueues(request, destination) : request.flushScheduled = !1;
    }, 0));
}
function startFlowing(request, destination) {
    if (13 === request.status) request.status = 14, closeWithError(destination, request.fatalError);
    else if (14 !== request.status && null === request.destination) {
        request.destination = destination;
        try {
            flushCompletedQueues(request, destination);
        } catch (error) {
            logRecoverableError(request, error, {}), fatalError(request, error);
        }
    }
}
function abort(request, reason) {
    if (11 === request.status || 10 === request.status) request.status = 12;
    try {
        var abortableTasks = request.abortableTasks;
        if (0 < abortableTasks.size) {
            var error = void 0 === reason ? Error("The render was aborted by the server without a reason.") : "object" === (typeof reason === "undefined" ? "undefined" : _type_of(reason)) && null !== reason && "function" === typeof reason.then ? Error("The render was aborted by the server with a promise.") : reason;
            request.fatalError = error;
            abortableTasks.forEach(function(task) {
                return abortTask(task, request, error);
            });
            abortableTasks.clear();
        }
        null !== request.destination && flushCompletedQueues(request, request.destination);
    } catch (error$72) {
        logRecoverableError(request, error$72, {}), fatalError(request, error$72);
    }
}
function addToReplayParent(node, parentKeyPath, trackedPostpones) {
    if (null === parentKeyPath) trackedPostpones.rootNodes.push(node);
    else {
        var workingMap = trackedPostpones.workingMap, parentNode = workingMap.get(parentKeyPath);
        void 0 === parentNode && (parentNode = [
            parentKeyPath[1],
            parentKeyPath[2],
            [],
            null
        ], workingMap.set(parentKeyPath, parentNode), addToReplayParent(parentNode, parentKeyPath[0], trackedPostpones));
        parentNode[2].push(node);
    }
}
function getPostponedState(request) {
    var trackedPostpones = request.trackedPostpones;
    if (null === trackedPostpones || 0 === trackedPostpones.rootNodes.length && null === trackedPostpones.rootSlots) return request.trackedPostpones = null;
    if (null === request.completedRootSegment || 5 !== request.completedRootSegment.status && null !== request.completedPreambleSegments) {
        var nextSegmentId = request.nextSegmentId;
        var replaySlots = trackedPostpones.rootSlots;
        var resumableState = request.resumableState;
        resumableState.bootstrapScriptContent = void 0;
        resumableState.bootstrapScripts = void 0;
        resumableState.bootstrapModules = void 0;
    } else {
        nextSegmentId = 0;
        replaySlots = -1;
        resumableState = request.resumableState;
        var renderState = request.renderState;
        resumableState.nextFormID = 0;
        resumableState.hasBody = !1;
        resumableState.hasHtml = !1;
        resumableState.unknownResources = {
            font: renderState.resets.font
        };
        resumableState.dnsResources = renderState.resets.dns;
        resumableState.connectResources = renderState.resets.connect;
        resumableState.imageResources = renderState.resets.image;
        resumableState.styleResources = renderState.resets.style;
        resumableState.scriptResources = {};
        resumableState.moduleUnknownResources = {};
        resumableState.moduleScriptResources = {};
        resumableState.instructions = 0;
    }
    return {
        nextSegmentId: nextSegmentId,
        rootFormatContext: request.rootFormatContext,
        progressiveChunkSize: request.progressiveChunkSize,
        resumableState: request.resumableState,
        replayNodes: trackedPostpones.rootNodes,
        replaySlots: replaySlots
    };
}
function ensureCorrectIsomorphicReactVersion() {
    var isomorphicReactPackageVersion = React.version;
    if ("19.2.7" !== isomorphicReactPackageVersion) throw Error('Incompatible React versions: The "react" and "react-dom" packages must have the exact same version. Instead got:\n  - react:      ' + (isomorphicReactPackageVersion + "\n  - react-dom:  19.2.7\nLearn more: https://react.dev/warnings/version-mismatch"));
}
ensureCorrectIsomorphicReactVersion();
ensureCorrectIsomorphicReactVersion();
exports.prerender = function(children, options) {
    return new Promise(function(resolve, reject) {
        var onHeaders = options ? options.onHeaders : void 0, onHeadersImpl;
        onHeaders && (onHeadersImpl = function onHeadersImpl(headersDescriptor) {
            onHeaders(new Headers(headersDescriptor));
        });
        var resources = createResumableState(options ? options.identifierPrefix : void 0, options ? options.unstable_externalRuntimeSrc : void 0, options ? options.bootstrapScriptContent : void 0, options ? options.bootstrapScripts : void 0, options ? options.bootstrapModules : void 0), request = createPrerenderRequest(children, resources, createRenderState(resources, void 0, options ? options.unstable_externalRuntimeSrc : void 0, options ? options.importMap : void 0, onHeadersImpl, options ? options.maxHeadersLength : void 0), createRootFormatContext(options ? options.namespaceURI : void 0), options ? options.progressiveChunkSize : void 0, options ? options.onError : void 0, function() {
            var stream = new ReadableStream({
                type: "bytes",
                pull: function pull(controller) {
                    startFlowing(request, controller);
                },
                cancel: function cancel(reason) {
                    request.destination = null;
                    abort(request, reason);
                }
            }, {
                highWaterMark: 0
            });
            stream = {
                postponed: getPostponedState(request),
                prelude: stream
            };
            resolve(stream);
        }, void 0, void 0, reject, options ? options.onPostpone : void 0);
        if (options && options.signal) {
            var signal = options.signal;
            if (signal.aborted) abort(request, signal.reason);
            else {
                var listener = function listener1() {
                    abort(request, signal.reason);
                    signal.removeEventListener("abort", listener);
                };
                signal.addEventListener("abort", listener);
            }
        }
        startWork(request);
    });
};
exports.renderToReadableStream = function(children, options) {
    return new Promise(function(resolve, reject) {
        var onFatalError, onAllReady, allReady = new Promise(function(res, rej) {
            onAllReady = res;
            onFatalError = rej;
        }), onHeaders = options ? options.onHeaders : void 0, onHeadersImpl;
        onHeaders && (onHeadersImpl = function onHeadersImpl(headersDescriptor) {
            onHeaders(new Headers(headersDescriptor));
        });
        var resumableState = createResumableState(options ? options.identifierPrefix : void 0, options ? options.unstable_externalRuntimeSrc : void 0, options ? options.bootstrapScriptContent : void 0, options ? options.bootstrapScripts : void 0, options ? options.bootstrapModules : void 0), request = createRequest(children, resumableState, createRenderState(resumableState, options ? options.nonce : void 0, options ? options.unstable_externalRuntimeSrc : void 0, options ? options.importMap : void 0, onHeadersImpl, options ? options.maxHeadersLength : void 0), createRootFormatContext(options ? options.namespaceURI : void 0), options ? options.progressiveChunkSize : void 0, options ? options.onError : void 0, onAllReady, function() {
            var stream = new ReadableStream({
                type: "bytes",
                pull: function pull(controller) {
                    startFlowing(request, controller);
                },
                cancel: function cancel(reason) {
                    request.destination = null;
                    abort(request, reason);
                }
            }, {
                highWaterMark: 0
            });
            stream.allReady = allReady;
            resolve(stream);
        }, function(error) {
            allReady.catch(function() {});
            reject(error);
        }, onFatalError, options ? options.onPostpone : void 0, options ? options.formState : void 0);
        if (options && options.signal) {
            var signal = options.signal;
            if (signal.aborted) abort(request, signal.reason);
            else {
                var listener = function listener1() {
                    abort(request, signal.reason);
                    signal.removeEventListener("abort", listener);
                };
                signal.addEventListener("abort", listener);
            }
        }
        startWork(request);
    });
};
exports.resume = function(children, postponedState, options) {
    return new Promise(function(resolve, reject) {
        var onFatalError, onAllReady, allReady = new Promise(function(res, rej) {
            onAllReady = res;
            onFatalError = rej;
        }), request = resumeRequest(children, postponedState, createRenderState(postponedState.resumableState, options ? options.nonce : void 0, void 0, void 0, void 0, void 0), options ? options.onError : void 0, onAllReady, function() {
            var stream = new ReadableStream({
                type: "bytes",
                pull: function pull(controller) {
                    startFlowing(request, controller);
                },
                cancel: function cancel(reason) {
                    request.destination = null;
                    abort(request, reason);
                }
            }, {
                highWaterMark: 0
            });
            stream.allReady = allReady;
            resolve(stream);
        }, function(error) {
            allReady.catch(function() {});
            reject(error);
        }, onFatalError, options ? options.onPostpone : void 0);
        if (options && options.signal) {
            var signal = options.signal;
            if (signal.aborted) abort(request, signal.reason);
            else {
                var listener = function listener1() {
                    abort(request, signal.reason);
                    signal.removeEventListener("abort", listener);
                };
                signal.addEventListener("abort", listener);
            }
        }
        startWork(request);
    });
};
exports.resumeAndPrerender = function(children, postponedState, options) {
    return new Promise(function(resolve, reject) {
        var request = resumeAndPrerenderRequest(children, postponedState, createRenderState(postponedState.resumableState, void 0, void 0, void 0, void 0, void 0), options ? options.onError : void 0, function() {
            var stream = new ReadableStream({
                type: "bytes",
                pull: function pull(controller) {
                    startFlowing(request, controller);
                },
                cancel: function cancel(reason) {
                    request.destination = null;
                    abort(request, reason);
                }
            }, {
                highWaterMark: 0
            });
            stream = {
                postponed: getPostponedState(request),
                prelude: stream
            };
            resolve(stream);
        }, void 0, void 0, reject, options ? options.onPostpone : void 0);
        if (options && options.signal) {
            var signal = options.signal;
            if (signal.aborted) abort(request, signal.reason);
            else {
                var listener = function listener1() {
                    abort(request, signal.reason);
                    signal.removeEventListener("abort", listener);
                };
                signal.addEventListener("abort", listener);
            }
        }
        startWork(request);
    });
};
exports.version = "19.2.7";


},
913
/*!************************************************************!*\
  !*** ./node_modules/react-dom/cjs/react-dom.production.js ***!
  \************************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var React = __webpack_require__(/*! react */ 3380);
function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
        url += "?args[]=" + encodeURIComponent(arguments[1]);
        for(var i = 2; i < arguments.length; i++)url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
function noop() {}
var Internals = {
    d: {
        f: noop,
        r: function r() {
            throw Error(formatProdErrorMessage(522));
        },
        D: noop,
        C: noop,
        L: noop,
        m: noop,
        X: noop,
        S: noop,
        M: noop
    },
    p: 0,
    findDOMNode: null
}, REACT_PORTAL_TYPE = Symbol.for("react.portal");
function createPortal$1(children, containerInfo, implementation) {
    var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
    return {
        $$typeof: REACT_PORTAL_TYPE,
        key: null == key ? null : "" + key,
        children: children,
        containerInfo: containerInfo,
        implementation: implementation
    };
}
var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
function getCrossOriginStringAs(as, input) {
    if ("font" === as) return "";
    if ("string" === typeof input) return "use-credentials" === input ? input : "";
}
exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
exports.createPortal = function(children, container) {
    var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
    if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType) throw Error(formatProdErrorMessage(299));
    return createPortal$1(children, container, null, key);
};
exports.flushSync = function(fn) {
    var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
    try {
        if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
    } finally{
        ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
    }
};
exports.preconnect = function(href, options) {
    "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
};
exports.prefetchDNS = function(href) {
    "string" === typeof href && Internals.d.D(href);
};
exports.preinit = function(href, options) {
    if ("string" === typeof href && options && "string" === typeof options.as) {
        var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
        "style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
            crossOrigin: crossOrigin,
            integrity: integrity,
            fetchPriority: fetchPriority
        }) : "script" === as && Internals.d.X(href, {
            crossOrigin: crossOrigin,
            integrity: integrity,
            fetchPriority: fetchPriority,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
        });
    }
};
exports.preinitModule = function(href, options) {
    if ("string" === typeof href) if ("object" === (typeof options === "undefined" ? "undefined" : _type_of(options)) && null !== options) {
        if (null == options.as || "script" === options.as) {
            var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
            Internals.d.M(href, {
                crossOrigin: crossOrigin,
                integrity: "string" === typeof options.integrity ? options.integrity : void 0,
                nonce: "string" === typeof options.nonce ? options.nonce : void 0
            });
        }
    } else null == options && Internals.d.M(href);
};
exports.preload = function(href, options) {
    if ("string" === typeof href && "object" === (typeof options === "undefined" ? "undefined" : _type_of(options)) && null !== options && "string" === typeof options.as) {
        var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
        Internals.d.L(href, as, {
            crossOrigin: crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0,
            type: "string" === typeof options.type ? options.type : void 0,
            fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
            referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
            imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
            imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
            media: "string" === typeof options.media ? options.media : void 0
        });
    }
};
exports.preloadModule = function(href, options) {
    if ("string" === typeof href) if (options) {
        var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d.m(href, {
            as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
            crossOrigin: crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0
        });
    } else Internals.d.m(href);
};
exports.requestFormReset = function(form) {
    Internals.d.r(form);
};
exports.unstable_batchedUpdates = function(fn, a) {
    return fn(a);
};
exports.useFormState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useFormState(action, initialState, permalink);
};
exports.useFormStatus = function() {
    return ReactSharedInternals.H.useHostTransitionStatus();
};
exports.version = "19.2.7";


},
6686
/*!*************************************************************************!*\
  !*** ./node_modules/react-dom/cjs/react-dom.react-server.production.js ***!
  \*************************************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";
/**
 * @license React
 * react-dom.react-server.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var React = __webpack_require__(/*! react */ 9404);
function noop() {}
var Internals = {
    d: {
        f: noop,
        r: function r() {
            throw Error("Invalid form element. requestFormReset must be passed a form that was rendered by React.");
        },
        D: noop,
        C: noop,
        L: noop,
        m: noop,
        X: noop,
        S: noop,
        M: noop
    },
    p: 0,
    findDOMNode: null
};
if (!React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) throw Error('The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.');
function getCrossOriginStringAs(as, input) {
    if ("font" === as) return "";
    if ("string" === typeof input) return "use-credentials" === input ? input : "";
}
exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
exports.preconnect = function(href, options) {
    "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
};
exports.prefetchDNS = function(href) {
    "string" === typeof href && Internals.d.D(href);
};
exports.preinit = function(href, options) {
    if ("string" === typeof href && options && "string" === typeof options.as) {
        var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
        "style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
            crossOrigin: crossOrigin,
            integrity: integrity,
            fetchPriority: fetchPriority
        }) : "script" === as && Internals.d.X(href, {
            crossOrigin: crossOrigin,
            integrity: integrity,
            fetchPriority: fetchPriority,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
        });
    }
};
exports.preinitModule = function(href, options) {
    if ("string" === typeof href) if ("object" === (typeof options === "undefined" ? "undefined" : _type_of(options)) && null !== options) {
        if (null == options.as || "script" === options.as) {
            var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
            Internals.d.M(href, {
                crossOrigin: crossOrigin,
                integrity: "string" === typeof options.integrity ? options.integrity : void 0,
                nonce: "string" === typeof options.nonce ? options.nonce : void 0
            });
        }
    } else null == options && Internals.d.M(href);
};
exports.preload = function(href, options) {
    if ("string" === typeof href && "object" === (typeof options === "undefined" ? "undefined" : _type_of(options)) && null !== options && "string" === typeof options.as) {
        var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
        Internals.d.L(href, as, {
            crossOrigin: crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0,
            type: "string" === typeof options.type ? options.type : void 0,
            fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
            referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
            imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
            imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
            media: "string" === typeof options.media ? options.media : void 0
        });
    }
};
exports.preloadModule = function(href, options) {
    if ("string" === typeof href) if (options) {
        var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d.m(href, {
            as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
            crossOrigin: crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0
        });
    } else Internals.d.m(href);
};
exports.version = "19.2.7";


},
9253
/*!*****************************************!*\
  !*** ./node_modules/react-dom/index.js ***!
  \*****************************************/
(module, __unused_rspack_exports, __webpack_require__) {
"use strict";

function checkDCE() {
    /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */ if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function') {
        return;
    }
    if (false) {}
    try {
        // Verify that the code above has been dead code eliminated (DCE'd).
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
        // DevTools shouldn't crash React, no matter what.
        // We should still report in case we break this code.
        console.error(err);
    }
}
if (true) {
    // DCE check should happen before ReactDOM bundle executes so that
    // DevTools can report bad minification during injection.
    checkDCE();
    module.exports = __webpack_require__(/*! ./cjs/react-dom.production.js */ 913);
} else {}


},
5088
/*!**********************************************************!*\
  !*** ./node_modules/react-dom/react-dom.react-server.js ***!
  \**********************************************************/
(module, __unused_rspack_exports, __webpack_require__) {
"use strict";

if (true) {
    module.exports = __webpack_require__(/*! ./cjs/react-dom.react-server.production.js */ 6686);
} else {}


},
1515
/*!***********************************************!*\
  !*** ./node_modules/react-dom/server.edge.js ***!
  \***********************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";

var b;
var l;
if (true) {
    b = __webpack_require__(/*! ./cjs/react-dom-server.edge.production.js */ 3024);
    l = __webpack_require__(/*! ./cjs/react-dom-server-legacy.browser.production.js */ 987);
} else {}
exports.version = b.version;
exports.renderToReadableStream = b.renderToReadableStream;
exports.renderToString = l.renderToString;
exports.renderToStaticMarkup = l.renderToStaticMarkup;
exports.resume = b.resume;


},
9615
/*!****************************************************************************************************!*\
  !*** ./node_modules/react-server-dom-rspack/cjs/react-server-dom-rspack-client.node.production.js ***!
  \****************************************************************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";
/**
 * @license React
 * react-server-dom-rspack-client.node.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var util = __webpack_require__(/*! util */ 9023), ReactDOM = __webpack_require__(/*! react-dom */ 9253), decoderOptions = {
    stream: !0
}, hasOwnProperty = Object.prototype.hasOwnProperty;
function resolveClientReference(bundlerConfig, metadata) {
    if (bundlerConfig) {
        var moduleExports = bundlerConfig[metadata[0]];
        if (bundlerConfig = moduleExports && moduleExports[metadata[2]]) moduleExports = bundlerConfig.name;
        else {
            bundlerConfig = moduleExports && moduleExports["*"];
            if (!bundlerConfig) throw Error('Could not find the module "' + metadata[0] + '" in the React Server Consumer Manifest. This is probably a bug in the React Server Components bundler.');
            moduleExports = metadata[2];
        }
        return 4 === metadata.length ? [
            bundlerConfig.id,
            bundlerConfig.chunks,
            moduleExports,
            1
        ] : [
            bundlerConfig.id,
            bundlerConfig.chunks,
            moduleExports
        ];
    }
    return metadata;
}
function resolveServerReference(bundlerConfig, id) {
    var name = "", resolvedModuleData = bundlerConfig[id];
    if (resolvedModuleData) name = resolvedModuleData.name;
    else {
        var idx = id.lastIndexOf("#");
        -1 !== idx && (name = id.slice(idx + 1), resolvedModuleData = bundlerConfig[id.slice(0, idx)]);
        if (!resolvedModuleData) throw Error('Could not find the module "' + id + '" in the React Server Manifest. This is probably a bug in the React Server Components bundler.');
    }
    return resolvedModuleData.async ? [
        resolvedModuleData.id,
        resolvedModuleData.chunks,
        name,
        1
    ] : [
        resolvedModuleData.id,
        resolvedModuleData.chunks,
        name
    ];
}
var chunkCache = new Map();
function requireAsyncModule(id) {
    var promise = __webpack_require__(id);
    if ("function" !== typeof promise.then || "fulfilled" === promise.status) return null;
    promise.then(function(value) {
        promise.status = "fulfilled";
        promise.value = value;
    }, function(reason) {
        promise.status = "rejected";
        promise.reason = reason;
    });
    return promise;
}
function ignoreReject() {}
function preloadModule(metadata) {
    for(var chunks = metadata[1], promises = [], i = 0; i < chunks.length;){
        var chunkId = chunks[i++];
        chunks[i++];
        var entry = chunkCache.get(chunkId);
        if (void 0 === entry) {
            entry = __webpack_require__.e(chunkId);
            promises.push(entry);
            var resolve = chunkCache.set.bind(chunkCache, chunkId, null);
            entry.then(resolve, ignoreReject);
            chunkCache.set(chunkId, entry);
        } else null !== entry && promises.push(entry);
    }
    return 4 === metadata.length ? 0 === promises.length ? requireAsyncModule(metadata[0]) : Promise.all(promises).then(function() {
        return requireAsyncModule(metadata[0]);
    }) : 0 < promises.length ? Promise.all(promises) : null;
}
function requireModule(metadata) {
    var moduleExports = __webpack_require__(metadata[0]);
    if (4 === metadata.length && "function" === typeof moduleExports.then) if ("fulfilled" === moduleExports.status) moduleExports = moduleExports.value;
    else throw moduleExports.reason;
    if ("*" === metadata[2]) return moduleExports;
    if ("" === metadata[2]) return moduleExports.__esModule ? moduleExports.default : moduleExports;
    if (hasOwnProperty.call(moduleExports, metadata[2])) return moduleExports[metadata[2]];
}
function prepareDestinationWithChunks(moduleLoading, chunks, nonce$jscomp$0) {
    if (null !== moduleLoading) for(var i = 1; i < chunks.length; i += 2){
        var nonce = nonce$jscomp$0, JSCompiler_temp_const = ReactDOMSharedInternals.d, JSCompiler_temp_const$jscomp$0 = JSCompiler_temp_const.X, JSCompiler_temp_const$jscomp$1 = moduleLoading.prefix + chunks[i];
        var JSCompiler_inline_result = moduleLoading.crossOrigin;
        JSCompiler_inline_result = "string" === typeof JSCompiler_inline_result ? "use-credentials" === JSCompiler_inline_result ? JSCompiler_inline_result : "" : void 0;
        JSCompiler_temp_const$jscomp$0.call(JSCompiler_temp_const, JSCompiler_temp_const$jscomp$1, {
            crossOrigin: JSCompiler_inline_result,
            nonce: nonce
        });
    }
}
var ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== (typeof maybeIterable === "undefined" ? "undefined" : _type_of(maybeIterable))) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
}
var ASYNC_ITERATOR = Symbol.asyncIterator, isArrayImpl = Array.isArray, getPrototypeOf = Object.getPrototypeOf, ObjectPrototype = Object.prototype, knownServerReferences = new WeakMap();
function serializeNumber(number) {
    return Number.isFinite(number) ? 0 === number && -Infinity === 1 / number ? "$-0" : number : Infinity === number ? "$Infinity" : -Infinity === number ? "$-Infinity" : "$NaN";
}
function processReply(root, formFieldPrefix, temporaryReferences, resolve, reject) {
    function serializeTypedArray(tag, typedArray) {
        typedArray = new Blob([
            new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength)
        ]);
        var blobId = nextPartId++;
        null === formData && (formData = new FormData());
        formData.append(formFieldPrefix + blobId, typedArray);
        return "$" + tag + blobId.toString(16);
    }
    function serializeBinaryReader(reader) {
        function progress(entry) {
            entry.done ? (entry = nextPartId++, data.append(formFieldPrefix + entry, new Blob(buffer)), data.append(formFieldPrefix + streamId, '"$o' + entry.toString(16) + '"'), data.append(formFieldPrefix + streamId, "C"), pendingParts--, 0 === pendingParts && resolve(data)) : (buffer.push(entry.value), reader.read(new Uint8Array(1024)).then(progress, reject));
        }
        null === formData && (formData = new FormData());
        var data = formData;
        pendingParts++;
        var streamId = nextPartId++, buffer = [];
        reader.read(new Uint8Array(1024)).then(progress, reject);
        return "$r" + streamId.toString(16);
    }
    function serializeReader(reader) {
        function progress(entry) {
            if (entry.done) data.append(formFieldPrefix + streamId, "C"), pendingParts--, 0 === pendingParts && resolve(data);
            else try {
                var partJSON = JSON.stringify(entry.value, resolveToJSON);
                data.append(formFieldPrefix + streamId, partJSON);
                reader.read().then(progress, reject);
            } catch (x) {
                reject(x);
            }
        }
        null === formData && (formData = new FormData());
        var data = formData;
        pendingParts++;
        var streamId = nextPartId++;
        reader.read().then(progress, reject);
        return "$R" + streamId.toString(16);
    }
    function serializeReadableStream(stream) {
        try {
            var binaryReader = stream.getReader({
                mode: "byob"
            });
        } catch (x) {
            return serializeReader(stream.getReader());
        }
        return serializeBinaryReader(binaryReader);
    }
    function serializeAsyncIterable(iterable, iterator) {
        function progress(entry) {
            if (entry.done) {
                if (void 0 === entry.value) data.append(formFieldPrefix + streamId, "C");
                else try {
                    var partJSON = JSON.stringify(entry.value, resolveToJSON);
                    data.append(formFieldPrefix + streamId, "C" + partJSON);
                } catch (x) {
                    reject(x);
                    return;
                }
                pendingParts--;
                0 === pendingParts && resolve(data);
            } else try {
                var partJSON$21 = JSON.stringify(entry.value, resolveToJSON);
                data.append(formFieldPrefix + streamId, partJSON$21);
                iterator.next().then(progress, reject);
            } catch (x$22) {
                reject(x$22);
            }
        }
        null === formData && (formData = new FormData());
        var data = formData;
        pendingParts++;
        var streamId = nextPartId++;
        iterable = iterable === iterator;
        iterator.next().then(progress, reject);
        return "$" + (iterable ? "x" : "X") + streamId.toString(16);
    }
    function resolveToJSON(key, value) {
        if (null === value) return null;
        if ("object" === (typeof value === "undefined" ? "undefined" : _type_of(value))) {
            switch(value.$$typeof){
                case REACT_ELEMENT_TYPE:
                    if (void 0 !== temporaryReferences && -1 === key.indexOf(":")) {
                        var parentReference = writtenObjects.get(this);
                        if (void 0 !== parentReference) return temporaryReferences.set(parentReference + ":" + key, value), "$T";
                    }
                    throw Error("React Element cannot be passed to Server Functions from the Client without a temporary reference set. Pass a TemporaryReferenceSet to the options.");
                case REACT_LAZY_TYPE:
                    parentReference = value._payload;
                    var init = value._init;
                    null === formData && (formData = new FormData());
                    pendingParts++;
                    try {
                        var resolvedModel = init(parentReference), lazyId = nextPartId++, partJSON = serializeModel(resolvedModel, lazyId);
                        formData.append(formFieldPrefix + lazyId, partJSON);
                        return "$" + lazyId.toString(16);
                    } catch (x) {
                        if ("object" === (typeof x === "undefined" ? "undefined" : _type_of(x)) && null !== x && "function" === typeof x.then) {
                            pendingParts++;
                            var lazyId$23 = nextPartId++;
                            parentReference = function parentReference() {
                                try {
                                    var partJSON$24 = serializeModel(value, lazyId$23), data$25 = formData;
                                    data$25.append(formFieldPrefix + lazyId$23, partJSON$24);
                                    pendingParts--;
                                    0 === pendingParts && resolve(data$25);
                                } catch (reason) {
                                    reject(reason);
                                }
                            };
                            x.then(parentReference, parentReference);
                            return "$" + lazyId$23.toString(16);
                        }
                        reject(x);
                        return null;
                    } finally{
                        pendingParts--;
                    }
            }
            parentReference = writtenObjects.get(value);
            if ("function" === typeof value.then) {
                if (void 0 !== parentReference) if (modelRoot === value) modelRoot = null;
                else return parentReference;
                null === formData && (formData = new FormData());
                pendingParts++;
                var promiseId = nextPartId++;
                key = "$@" + promiseId.toString(16);
                writtenObjects.set(value, key);
                value.then(function(partValue) {
                    try {
                        var previousReference = writtenObjects.get(partValue);
                        var partJSON$27 = void 0 !== previousReference ? JSON.stringify(previousReference) : serializeModel(partValue, promiseId);
                        partValue = formData;
                        partValue.append(formFieldPrefix + promiseId, partJSON$27);
                        pendingParts--;
                        0 === pendingParts && resolve(partValue);
                    } catch (reason) {
                        reject(reason);
                    }
                }, reject);
                return key;
            }
            if (void 0 !== parentReference) if (modelRoot === value) modelRoot = null;
            else return parentReference;
            else -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference && (key = parentReference + ":" + key, writtenObjects.set(value, key), void 0 !== temporaryReferences && temporaryReferences.set(key, value)));
            if (isArrayImpl(value)) return value;
            if (_instanceof(value, FormData)) {
                null === formData && (formData = new FormData());
                var data$31 = formData;
                key = nextPartId++;
                var prefix = formFieldPrefix + key + "_";
                value.forEach(function(originalValue, originalKey) {
                    data$31.append(prefix + originalKey, originalValue);
                });
                return "$K" + key.toString(16);
            }
            if (_instanceof(value, Map)) return key = nextPartId++, parentReference = serializeModel(Array.from(value), key), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$Q" + key.toString(16);
            if (_instanceof(value, Set)) return key = nextPartId++, parentReference = serializeModel(Array.from(value), key), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$W" + key.toString(16);
            if (_instanceof(value, ArrayBuffer)) return key = new Blob([
                value
            ]), parentReference = nextPartId++, null === formData && (formData = new FormData()), formData.append(formFieldPrefix + parentReference, key), "$A" + parentReference.toString(16);
            if (_instanceof(value, Int8Array)) return serializeTypedArray("O", value);
            if (_instanceof(value, Uint8Array)) return serializeTypedArray("o", value);
            if (_instanceof(value, Uint8ClampedArray)) return serializeTypedArray("U", value);
            if (_instanceof(value, Int16Array)) return serializeTypedArray("S", value);
            if (_instanceof(value, Uint16Array)) return serializeTypedArray("s", value);
            if (_instanceof(value, Int32Array)) return serializeTypedArray("L", value);
            if (_instanceof(value, Uint32Array)) return serializeTypedArray("l", value);
            if (_instanceof(value, Float32Array)) return serializeTypedArray("G", value);
            if (_instanceof(value, Float64Array)) return serializeTypedArray("g", value);
            if (_instanceof(value, BigInt64Array)) return serializeTypedArray("M", value);
            if (_instanceof(value, BigUint64Array)) return serializeTypedArray("m", value);
            if (_instanceof(value, DataView)) return serializeTypedArray("V", value);
            if ("function" === typeof Blob && _instanceof(value, Blob)) return null === formData && (formData = new FormData()), key = nextPartId++, formData.append(formFieldPrefix + key, value), "$B" + key.toString(16);
            if (key = getIteratorFn(value)) return parentReference = key.call(value), parentReference === value ? (key = nextPartId++, parentReference = serializeModel(Array.from(parentReference), key), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$i" + key.toString(16)) : Array.from(parentReference);
            if ("function" === typeof ReadableStream && _instanceof(value, ReadableStream)) return serializeReadableStream(value);
            key = value[ASYNC_ITERATOR];
            if ("function" === typeof key) return serializeAsyncIterable(value, key.call(value));
            key = getPrototypeOf(value);
            if (key !== ObjectPrototype && (null === key || null !== getPrototypeOf(key))) {
                if (void 0 === temporaryReferences) throw Error("Only plain objects, and a few built-ins, can be passed to Server Functions. Classes or null prototypes are not supported.");
                return "$T";
            }
            return value;
        }
        if ("string" === typeof value) {
            if ("Z" === value[value.length - 1] && _instanceof(this[key], Date)) return "$D" + value;
            key = "$" === value[0] ? "$" + value : value;
            return key;
        }
        if ("boolean" === typeof value) return value;
        if ("number" === typeof value) return serializeNumber(value);
        if ("undefined" === typeof value) return "$undefined";
        if ("function" === typeof value) {
            parentReference = knownServerReferences.get(value);
            if (void 0 !== parentReference) return key = JSON.stringify({
                id: parentReference.id,
                bound: parentReference.bound
            }, resolveToJSON), null === formData && (formData = new FormData()), parentReference = nextPartId++, formData.set(formFieldPrefix + parentReference, key), "$h" + parentReference.toString(16);
            if (void 0 !== temporaryReferences && -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference)) return temporaryReferences.set(parentReference + ":" + key, value), "$T";
            throw Error("Client Functions cannot be passed directly to Server Functions. Only Functions passed from the Server can be passed back again.");
        }
        if ("symbol" === (typeof value === "undefined" ? "undefined" : _type_of(value))) {
            if (void 0 !== temporaryReferences && -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference)) return temporaryReferences.set(parentReference + ":" + key, value), "$T";
            throw Error("Symbols cannot be passed to a Server Function without a temporary reference set. Pass a TemporaryReferenceSet to the options.");
        }
        if ("bigint" === (typeof value === "undefined" ? "undefined" : _type_of(value))) return "$n" + value.toString(10);
        throw Error("Type " + (typeof value === "undefined" ? "undefined" : _type_of(value)) + " is not supported as an argument to a Server Function.");
    }
    function serializeModel(model, id) {
        "object" === (typeof model === "undefined" ? "undefined" : _type_of(model)) && null !== model && (id = "$" + id.toString(16), writtenObjects.set(model, id), void 0 !== temporaryReferences && temporaryReferences.set(id, model));
        modelRoot = model;
        return JSON.stringify(model, resolveToJSON);
    }
    var nextPartId = 1, pendingParts = 0, formData = null, writtenObjects = new WeakMap(), modelRoot = root, json = serializeModel(root, 0);
    null === formData ? resolve(json) : (formData.set(formFieldPrefix + "0", json), 0 === pendingParts && resolve(formData));
    return function() {
        0 < pendingParts && (pendingParts = 0, null === formData ? resolve(json) : resolve(formData));
    };
}
var boundCache = new WeakMap();
function encodeFormData(reference) {
    var resolve, reject, thenable = new Promise(function(res, rej) {
        resolve = res;
        reject = rej;
    });
    processReply(reference, "", void 0, function(body) {
        if ("string" === typeof body) {
            var data = new FormData();
            data.append("0", body);
            body = data;
        }
        thenable.status = "fulfilled";
        thenable.value = body;
        resolve(body);
    }, function(e) {
        thenable.status = "rejected";
        thenable.reason = e;
        reject(e);
    });
    return thenable;
}
function defaultEncodeFormAction(identifierPrefix) {
    var referenceClosure = knownServerReferences.get(this);
    if (!referenceClosure) throw Error("Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React.");
    var data = null;
    if (null !== referenceClosure.bound) {
        data = boundCache.get(referenceClosure);
        data || (data = encodeFormData({
            id: referenceClosure.id,
            bound: referenceClosure.bound
        }), boundCache.set(referenceClosure, data));
        if ("rejected" === data.status) throw data.reason;
        if ("fulfilled" !== data.status) throw data;
        referenceClosure = data.value;
        var prefixedData = new FormData();
        referenceClosure.forEach(function(value, key) {
            prefixedData.append("$ACTION_" + identifierPrefix + ":" + key, value);
        });
        data = prefixedData;
        referenceClosure = "$ACTION_REF_" + identifierPrefix;
    } else referenceClosure = "$ACTION_ID_" + referenceClosure.id;
    return {
        name: referenceClosure,
        method: "POST",
        encType: "multipart/form-data",
        data: data
    };
}
function isSignatureEqual(referenceId, numberOfBoundArgs) {
    var referenceClosure = knownServerReferences.get(this);
    if (!referenceClosure) throw Error("Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React.");
    if (referenceClosure.id !== referenceId) return !1;
    var boundPromise = referenceClosure.bound;
    if (null === boundPromise) return 0 === numberOfBoundArgs;
    switch(boundPromise.status){
        case "fulfilled":
            return boundPromise.value.length === numberOfBoundArgs;
        case "pending":
            throw boundPromise;
        case "rejected":
            throw boundPromise.reason;
        default:
            throw "string" !== typeof boundPromise.status && (boundPromise.status = "pending", boundPromise.then(function(boundArgs) {
                boundPromise.status = "fulfilled";
                boundPromise.value = boundArgs;
            }, function(error) {
                boundPromise.status = "rejected";
                boundPromise.reason = error;
            })), boundPromise;
    }
}
function registerBoundServerReference(reference, id, bound, encodeFormAction) {
    knownServerReferences.has(reference) || (knownServerReferences.set(reference, {
        id: id,
        originalBind: reference.bind,
        bound: bound
    }), Object.defineProperties(reference, {
        $$FORM_ACTION: {
            value: void 0 === encodeFormAction ? defaultEncodeFormAction : function() {
                var referenceClosure = knownServerReferences.get(this);
                if (!referenceClosure) throw Error("Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React.");
                var boundPromise = referenceClosure.bound;
                null === boundPromise && (boundPromise = Promise.resolve([]));
                return encodeFormAction(referenceClosure.id, boundPromise);
            }
        },
        $$IS_SIGNATURE_EQUAL: {
            value: isSignatureEqual
        },
        bind: {
            value: bind
        }
    }));
}
var FunctionBind = Function.prototype.bind, ArraySlice = Array.prototype.slice;
function bind() {
    var referenceClosure = knownServerReferences.get(this);
    if (!referenceClosure) return FunctionBind.apply(this, arguments);
    var newFn = referenceClosure.originalBind.apply(this, arguments), args = ArraySlice.call(arguments, 1), boundPromise = null;
    boundPromise = null !== referenceClosure.bound ? Promise.resolve(referenceClosure.bound).then(function(boundArgs) {
        return boundArgs.concat(args);
    }) : Promise.resolve(args);
    knownServerReferences.set(newFn, {
        id: referenceClosure.id,
        originalBind: newFn.bind,
        bound: boundPromise
    });
    Object.defineProperties(newFn, {
        $$FORM_ACTION: {
            value: this.$$FORM_ACTION
        },
        $$IS_SIGNATURE_EQUAL: {
            value: isSignatureEqual
        },
        bind: {
            value: bind
        }
    });
    return newFn;
}
function createBoundServerReference(metaData, callServer, encodeFormAction) {
    function action() {
        var args = Array.prototype.slice.call(arguments);
        return bound ? "fulfilled" === bound.status ? callServer(id, bound.value.concat(args)) : Promise.resolve(bound).then(function(boundArgs) {
            return callServer(id, boundArgs.concat(args));
        }) : callServer(id, args);
    }
    var id = metaData.id, bound = metaData.bound;
    registerBoundServerReference(action, id, bound, encodeFormAction);
    return action;
}
function createServerReference$1(id, callServer, encodeFormAction) {
    function action() {
        var args = Array.prototype.slice.call(arguments);
        return callServer(id, args);
    }
    registerBoundServerReference(action, id, null, encodeFormAction);
    return action;
}
function ReactPromise(status, value, reason) {
    this.status = status;
    this.value = value;
    this.reason = reason;
}
ReactPromise.prototype = Object.create(Promise.prototype);
ReactPromise.prototype.then = function(resolve, reject) {
    switch(this.status){
        case "resolved_model":
            initializeModelChunk(this);
            break;
        case "resolved_module":
            initializeModuleChunk(this);
    }
    switch(this.status){
        case "fulfilled":
            "function" === typeof resolve && resolve(this.value);
            break;
        case "pending":
        case "blocked":
            "function" === typeof resolve && (null === this.value && (this.value = []), this.value.push(resolve));
            "function" === typeof reject && (null === this.reason && (this.reason = []), this.reason.push(reject));
            break;
        case "halted":
            break;
        default:
            "function" === typeof reject && reject(this.reason);
    }
};
function readChunk(chunk) {
    switch(chunk.status){
        case "resolved_model":
            initializeModelChunk(chunk);
            break;
        case "resolved_module":
            initializeModuleChunk(chunk);
    }
    switch(chunk.status){
        case "fulfilled":
            return chunk.value;
        case "pending":
        case "blocked":
        case "halted":
            throw chunk;
        default:
            throw chunk.reason;
    }
}
function wakeChunk(response, listeners, value, chunk) {
    for(var i = 0; i < listeners.length; i++){
        var listener = listeners[i];
        "function" === typeof listener ? listener(value) : fulfillReference(response, listener, value, chunk);
    }
}
function rejectChunk(response, listeners, error) {
    for(var i = 0; i < listeners.length; i++){
        var listener = listeners[i];
        "function" === typeof listener ? listener(error) : rejectReference(response, listener.handler, error);
    }
}
function resolveBlockedCycle(resolvedChunk, reference) {
    var referencedChunk = reference.handler.chunk;
    if (null === referencedChunk) return null;
    if (referencedChunk === resolvedChunk) return reference.handler;
    reference = referencedChunk.value;
    if (null !== reference) for(referencedChunk = 0; referencedChunk < reference.length; referencedChunk++){
        var listener = reference[referencedChunk];
        if ("function" !== typeof listener && (listener = resolveBlockedCycle(resolvedChunk, listener), null !== listener)) return listener;
    }
    return null;
}
function wakeChunkIfInitialized(response, chunk, resolveListeners, rejectListeners) {
    switch(chunk.status){
        case "fulfilled":
            wakeChunk(response, resolveListeners, chunk.value, chunk);
            break;
        case "blocked":
            for(var i = 0; i < resolveListeners.length; i++){
                var listener = resolveListeners[i];
                if ("function" !== typeof listener) {
                    var cyclicHandler = resolveBlockedCycle(chunk, listener);
                    if (null !== cyclicHandler) switch(fulfillReference(response, listener, cyclicHandler.value, chunk), resolveListeners.splice(i, 1), i--, null !== rejectListeners && (listener = rejectListeners.indexOf(listener), -1 !== listener && rejectListeners.splice(listener, 1)), chunk.status){
                        case "fulfilled":
                            wakeChunk(response, resolveListeners, chunk.value, chunk);
                            return;
                        case "rejected":
                            null !== rejectListeners && rejectChunk(response, rejectListeners, chunk.reason);
                            return;
                    }
                }
            }
        case "pending":
            if (chunk.value) for(response = 0; response < resolveListeners.length; response++)chunk.value.push(resolveListeners[response]);
            else chunk.value = resolveListeners;
            if (chunk.reason) {
                if (rejectListeners) for(resolveListeners = 0; resolveListeners < rejectListeners.length; resolveListeners++)chunk.reason.push(rejectListeners[resolveListeners]);
            } else chunk.reason = rejectListeners;
            break;
        case "rejected":
            rejectListeners && rejectChunk(response, rejectListeners, chunk.reason);
    }
}
function triggerErrorOnChunk(response, chunk, error) {
    if ("pending" !== chunk.status && "blocked" !== chunk.status) chunk.reason.error(error);
    else {
        var listeners = chunk.reason;
        chunk.status = "rejected";
        chunk.reason = error;
        null !== listeners && rejectChunk(response, listeners, error);
    }
}
function createResolvedIteratorResultChunk(response, value, done) {
    return new ReactPromise("resolved_model", (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}", response);
}
function resolveIteratorResultChunk(response, chunk, value, done) {
    resolveModelChunk(response, chunk, (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}");
}
function resolveModelChunk(response, chunk, value) {
    if ("pending" !== chunk.status) chunk.reason.enqueueModel(value);
    else {
        var resolveListeners = chunk.value, rejectListeners = chunk.reason;
        chunk.status = "resolved_model";
        chunk.value = value;
        chunk.reason = response;
        null !== resolveListeners && (initializeModelChunk(chunk), wakeChunkIfInitialized(response, chunk, resolveListeners, rejectListeners));
    }
}
function resolveModuleChunk(response, chunk, value) {
    if ("pending" === chunk.status || "blocked" === chunk.status) {
        var resolveListeners = chunk.value, rejectListeners = chunk.reason;
        chunk.status = "resolved_module";
        chunk.value = value;
        chunk.reason = null;
        null !== resolveListeners && (initializeModuleChunk(chunk), wakeChunkIfInitialized(response, chunk, resolveListeners, rejectListeners));
    }
}
var initializingHandler = null;
function initializeModelChunk(chunk) {
    var prevHandler = initializingHandler;
    initializingHandler = null;
    var resolvedModel = chunk.value, response = chunk.reason;
    chunk.status = "blocked";
    chunk.value = null;
    chunk.reason = null;
    try {
        var value = JSON.parse(resolvedModel, response._fromJSON), resolveListeners = chunk.value;
        if (null !== resolveListeners) for(chunk.value = null, chunk.reason = null, resolvedModel = 0; resolvedModel < resolveListeners.length; resolvedModel++){
            var listener = resolveListeners[resolvedModel];
            "function" === typeof listener ? listener(value) : fulfillReference(response, listener, value, chunk);
        }
        if (null !== initializingHandler) {
            if (initializingHandler.errored) throw initializingHandler.reason;
            if (0 < initializingHandler.deps) {
                initializingHandler.value = value;
                initializingHandler.chunk = chunk;
                return;
            }
        }
        chunk.status = "fulfilled";
        chunk.value = value;
    } catch (error) {
        chunk.status = "rejected", chunk.reason = error;
    } finally{
        initializingHandler = prevHandler;
    }
}
function initializeModuleChunk(chunk) {
    try {
        var value = requireModule(chunk.value);
        chunk.status = "fulfilled";
        chunk.value = value;
    } catch (error) {
        chunk.status = "rejected", chunk.reason = error;
    }
}
function reportGlobalError(weakResponse, error) {
    weakResponse._closed = !0;
    weakResponse._closedReason = error;
    weakResponse._chunks.forEach(function(chunk) {
        "pending" === chunk.status ? triggerErrorOnChunk(weakResponse, chunk, error) : "fulfilled" === chunk.status && null !== chunk.reason && chunk.reason.error(error);
    });
}
function createLazyChunkWrapper(chunk) {
    return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: chunk,
        _init: readChunk
    };
}
function getChunk(response, id) {
    var chunks = response._chunks, chunk = chunks.get(id);
    chunk || (chunk = response._closed ? new ReactPromise("rejected", null, response._closedReason) : new ReactPromise("pending", null, null), chunks.set(id, chunk));
    return chunk;
}
function fulfillReference(response, reference, value) {
    var handler = reference.handler, parentObject = reference.parentObject, key = reference.key, map = reference.map, path = reference.path;
    try {
        for(var i = 1; i < path.length; i++){
            for(; "object" === (typeof value === "undefined" ? "undefined" : _type_of(value)) && null !== value && value.$$typeof === REACT_LAZY_TYPE;){
                var referencedChunk = value._payload;
                if (referencedChunk === handler.chunk) value = handler.value;
                else {
                    switch(referencedChunk.status){
                        case "resolved_model":
                            initializeModelChunk(referencedChunk);
                            break;
                        case "resolved_module":
                            initializeModuleChunk(referencedChunk);
                    }
                    switch(referencedChunk.status){
                        case "fulfilled":
                            value = referencedChunk.value;
                            continue;
                        case "blocked":
                            var cyclicHandler = resolveBlockedCycle(referencedChunk, reference);
                            if (null !== cyclicHandler) {
                                value = cyclicHandler.value;
                                continue;
                            }
                        case "pending":
                            path.splice(0, i - 1);
                            null === referencedChunk.value ? referencedChunk.value = [
                                reference
                            ] : referencedChunk.value.push(reference);
                            null === referencedChunk.reason ? referencedChunk.reason = [
                                reference
                            ] : referencedChunk.reason.push(reference);
                            return;
                        case "halted":
                            return;
                        default:
                            rejectReference(response, reference.handler, referencedChunk.reason);
                            return;
                    }
                }
            }
            value = value[path[i]];
        }
        for(; "object" === (typeof value === "undefined" ? "undefined" : _type_of(value)) && null !== value && value.$$typeof === REACT_LAZY_TYPE;){
            var referencedChunk$43 = value._payload;
            if (referencedChunk$43 === handler.chunk) value = handler.value;
            else {
                switch(referencedChunk$43.status){
                    case "resolved_model":
                        initializeModelChunk(referencedChunk$43);
                        break;
                    case "resolved_module":
                        initializeModuleChunk(referencedChunk$43);
                }
                switch(referencedChunk$43.status){
                    case "fulfilled":
                        value = referencedChunk$43.value;
                        continue;
                }
                break;
            }
        }
        var mappedValue = map(response, value, parentObject, key);
        parentObject[key] = mappedValue;
        "" === key && null === handler.value && (handler.value = mappedValue);
        if (parentObject[0] === REACT_ELEMENT_TYPE && "object" === _type_of(handler.value) && null !== handler.value && handler.value.$$typeof === REACT_ELEMENT_TYPE) {
            var element = handler.value;
            switch(key){
                case "3":
                    element.props = mappedValue;
            }
        }
    } catch (error) {
        rejectReference(response, reference.handler, error);
        return;
    }
    handler.deps--;
    0 === handler.deps && (reference = handler.chunk, null !== reference && "blocked" === reference.status && (value = reference.value, reference.status = "fulfilled", reference.value = handler.value, reference.reason = handler.reason, null !== value && wakeChunk(response, value, handler.value, reference)));
}
function rejectReference(response, handler, error) {
    handler.errored || (handler.errored = !0, handler.value = null, handler.reason = error, handler = handler.chunk, null !== handler && "blocked" === handler.status && triggerErrorOnChunk(response, handler, error));
}
function waitForReference(referencedChunk, parentObject, key, response, map, path) {
    initializingHandler ? (response = initializingHandler, response.deps++) : response = initializingHandler = {
        parent: null,
        chunk: null,
        value: null,
        reason: null,
        deps: 1,
        errored: !1
    };
    parentObject = {
        handler: response,
        parentObject: parentObject,
        key: key,
        map: map,
        path: path
    };
    null === referencedChunk.value ? referencedChunk.value = [
        parentObject
    ] : referencedChunk.value.push(parentObject);
    null === referencedChunk.reason ? referencedChunk.reason = [
        parentObject
    ] : referencedChunk.reason.push(parentObject);
    return null;
}
function loadServerReference(response, metaData, parentObject, key) {
    if (!response._serverReferenceConfig) return createBoundServerReference(metaData, response._callServer, response._encodeFormAction);
    var serverReference = resolveServerReference(response._serverReferenceConfig, metaData.id), promise = preloadModule(serverReference);
    if (promise) metaData.bound && (promise = Promise.all([
        promise,
        metaData.bound
    ]));
    else if (metaData.bound) promise = Promise.resolve(metaData.bound);
    else return promise = requireModule(serverReference), registerBoundServerReference(promise, metaData.id, metaData.bound, response._encodeFormAction), promise;
    if (initializingHandler) {
        var handler = initializingHandler;
        handler.deps++;
    } else handler = initializingHandler = {
        parent: null,
        chunk: null,
        value: null,
        reason: null,
        deps: 1,
        errored: !1
    };
    promise.then(function() {
        var resolvedValue = requireModule(serverReference);
        if (metaData.bound) {
            var boundArgs = metaData.bound.value.slice(0);
            boundArgs.unshift(null);
            resolvedValue = resolvedValue.bind.apply(resolvedValue, boundArgs);
        }
        registerBoundServerReference(resolvedValue, metaData.id, metaData.bound, response._encodeFormAction);
        parentObject[key] = resolvedValue;
        "" === key && null === handler.value && (handler.value = resolvedValue);
        if (parentObject[0] === REACT_ELEMENT_TYPE && "object" === _type_of(handler.value) && null !== handler.value && handler.value.$$typeof === REACT_ELEMENT_TYPE) switch(boundArgs = handler.value, key){
            case "3":
                boundArgs.props = resolvedValue;
        }
        handler.deps--;
        0 === handler.deps && (resolvedValue = handler.chunk, null !== resolvedValue && "blocked" === resolvedValue.status && (boundArgs = resolvedValue.value, resolvedValue.status = "fulfilled", resolvedValue.value = handler.value, resolvedValue.reason = null, null !== boundArgs && wakeChunk(response, boundArgs, handler.value, resolvedValue)));
    }, function(error) {
        if (!handler.errored) {
            handler.errored = !0;
            handler.value = null;
            handler.reason = error;
            var chunk = handler.chunk;
            null !== chunk && "blocked" === chunk.status && triggerErrorOnChunk(response, chunk, error);
        }
    });
    return null;
}
function getOutlinedModel(response, reference, parentObject, key, map) {
    reference = reference.split(":");
    var id = parseInt(reference[0], 16);
    id = getChunk(response, id);
    switch(id.status){
        case "resolved_model":
            initializeModelChunk(id);
            break;
        case "resolved_module":
            initializeModuleChunk(id);
    }
    switch(id.status){
        case "fulfilled":
            id = id.value;
            for(var i = 1; i < reference.length; i++){
                for(; "object" === (typeof id === "undefined" ? "undefined" : _type_of(id)) && null !== id && id.$$typeof === REACT_LAZY_TYPE;){
                    id = id._payload;
                    switch(id.status){
                        case "resolved_model":
                            initializeModelChunk(id);
                            break;
                        case "resolved_module":
                            initializeModuleChunk(id);
                    }
                    switch(id.status){
                        case "fulfilled":
                            id = id.value;
                            break;
                        case "blocked":
                        case "pending":
                            return waitForReference(id, parentObject, key, response, map, reference.slice(i - 1));
                        case "halted":
                            return initializingHandler ? (response = initializingHandler, response.deps++) : initializingHandler = {
                                parent: null,
                                chunk: null,
                                value: null,
                                reason: null,
                                deps: 1,
                                errored: !1
                            }, null;
                        default:
                            return initializingHandler ? (initializingHandler.errored = !0, initializingHandler.value = null, initializingHandler.reason = id.reason) : initializingHandler = {
                                parent: null,
                                chunk: null,
                                value: null,
                                reason: id.reason,
                                deps: 0,
                                errored: !0
                            }, null;
                    }
                }
                id = id[reference[i]];
            }
            for(; "object" === (typeof id === "undefined" ? "undefined" : _type_of(id)) && null !== id && id.$$typeof === REACT_LAZY_TYPE;){
                reference = id._payload;
                switch(reference.status){
                    case "resolved_model":
                        initializeModelChunk(reference);
                        break;
                    case "resolved_module":
                        initializeModuleChunk(reference);
                }
                switch(reference.status){
                    case "fulfilled":
                        id = reference.value;
                        continue;
                }
                break;
            }
            return map(response, id, parentObject, key);
        case "pending":
        case "blocked":
            return waitForReference(id, parentObject, key, response, map, reference);
        case "halted":
            return initializingHandler ? (response = initializingHandler, response.deps++) : initializingHandler = {
                parent: null,
                chunk: null,
                value: null,
                reason: null,
                deps: 1,
                errored: !1
            }, null;
        default:
            return initializingHandler ? (initializingHandler.errored = !0, initializingHandler.value = null, initializingHandler.reason = id.reason) : initializingHandler = {
                parent: null,
                chunk: null,
                value: null,
                reason: id.reason,
                deps: 0,
                errored: !0
            }, null;
    }
}
function createMap(response, model) {
    return new Map(model);
}
function createSet(response, model) {
    return new Set(model);
}
function createBlob(response, model) {
    return new Blob(model.slice(1), {
        type: model[0]
    });
}
function createFormData(response, model) {
    response = new FormData();
    for(var i = 0; i < model.length; i++)response.append(model[i][0], model[i][1]);
    return response;
}
function extractIterator(response, model) {
    return model[Symbol.iterator]();
}
function createModel(response, model) {
    return model;
}
function parseModelString(response, parentObject, key, value) {
    if ("$" === value[0]) {
        if ("$" === value) return null !== initializingHandler && "0" === key && (initializingHandler = {
            parent: initializingHandler,
            chunk: null,
            value: null,
            reason: null,
            deps: 0,
            errored: !1
        }), REACT_ELEMENT_TYPE;
        switch(value[1]){
            case "$":
                return value.slice(1);
            case "L":
                return parentObject = parseInt(value.slice(2), 16), response = getChunk(response, parentObject), createLazyChunkWrapper(response);
            case "@":
                return parentObject = parseInt(value.slice(2), 16), getChunk(response, parentObject);
            case "S":
                return Symbol.for(value.slice(2));
            case "h":
                return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, loadServerReference);
            case "T":
                parentObject = "$" + value.slice(2);
                response = response._tempRefs;
                if (null == response) throw Error("Missing a temporary reference set but the RSC response returned a temporary reference. Pass a temporaryReference option with the set that was used with the reply.");
                return response.get(parentObject);
            case "Q":
                return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createMap);
            case "W":
                return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createSet);
            case "B":
                return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createBlob);
            case "K":
                return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createFormData);
            case "Z":
                return resolveErrorProd();
            case "i":
                return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, extractIterator);
            case "I":
                return Infinity;
            case "-":
                return "$-0" === value ? -0 : -Infinity;
            case "N":
                return NaN;
            case "u":
                return;
            case "D":
                return new Date(Date.parse(value.slice(2)));
            case "n":
                return BigInt(value.slice(2));
            default:
                return value = value.slice(1), getOutlinedModel(response, value, parentObject, key, createModel);
        }
    }
    return value;
}
function missingCall() {
    throw Error('Trying to call a function from "use server" but the callServer option was not implemented in your router runtime.');
}
function ResponseInstance(bundlerConfig, serverReferenceConfig, moduleLoading, callServer, encodeFormAction, nonce, temporaryReferences) {
    var chunks = new Map();
    this._bundlerConfig = bundlerConfig;
    this._serverReferenceConfig = serverReferenceConfig;
    this._moduleLoading = moduleLoading;
    this._callServer = void 0 !== callServer ? callServer : missingCall;
    this._encodeFormAction = encodeFormAction;
    this._nonce = nonce;
    this._chunks = chunks;
    this._stringDecoder = new util.TextDecoder();
    this._fromJSON = null;
    this._closed = !1;
    this._closedReason = null;
    this._tempRefs = temporaryReferences;
    this._fromJSON = createFromJSONCallback(this);
}
function createStreamState() {
    return {
        _rowState: 0,
        _rowID: 0,
        _rowTag: 0,
        _rowLength: 0,
        _buffer: []
    };
}
function resolveBuffer(response, id, buffer) {
    response = response._chunks;
    var chunk = response.get(id);
    chunk && "pending" !== chunk.status ? chunk.reason.enqueueValue(buffer) : (buffer = new ReactPromise("fulfilled", buffer, null), response.set(id, buffer));
}
function resolveModule(response, id, model) {
    var chunks = response._chunks, chunk = chunks.get(id);
    model = JSON.parse(model, response._fromJSON);
    var clientReference = resolveClientReference(response._bundlerConfig, model);
    prepareDestinationWithChunks(response._moduleLoading, model[1], response._nonce);
    if (model = preloadModule(clientReference)) {
        if (chunk) {
            var blockedChunk = chunk;
            blockedChunk.status = "blocked";
        } else blockedChunk = new ReactPromise("blocked", null, null), chunks.set(id, blockedChunk);
        model.then(function() {
            return resolveModuleChunk(response, blockedChunk, clientReference);
        }, function(error) {
            return triggerErrorOnChunk(response, blockedChunk, error);
        });
    } else chunk ? resolveModuleChunk(response, chunk, clientReference) : (chunk = new ReactPromise("resolved_module", clientReference, null), chunks.set(id, chunk));
}
function resolveStream(response, id, stream, controller) {
    var chunks = response._chunks, chunk = chunks.get(id);
    chunk ? "pending" === chunk.status && (id = chunk.value, chunk.status = "fulfilled", chunk.value = stream, chunk.reason = controller, null !== id && wakeChunk(response, id, chunk.value, chunk)) : (response = new ReactPromise("fulfilled", stream, controller), chunks.set(id, response));
}
function startReadableStream(response, id, type) {
    var controller = null, closed = !1;
    type = new ReadableStream({
        type: type,
        start: function start(c) {
            controller = c;
        }
    });
    var previousBlockedChunk = null;
    resolveStream(response, id, type, {
        enqueueValue: function enqueueValue(value) {
            null === previousBlockedChunk ? controller.enqueue(value) : previousBlockedChunk.then(function() {
                controller.enqueue(value);
            });
        },
        enqueueModel: function enqueueModel(json) {
            if (null === previousBlockedChunk) {
                var chunk = new ReactPromise("resolved_model", json, response);
                initializeModelChunk(chunk);
                "fulfilled" === chunk.status ? controller.enqueue(chunk.value) : (chunk.then(function(v) {
                    return controller.enqueue(v);
                }, function(e) {
                    return controller.error(e);
                }), previousBlockedChunk = chunk);
            } else {
                chunk = previousBlockedChunk;
                var chunk$54 = new ReactPromise("pending", null, null);
                chunk$54.then(function(v) {
                    return controller.enqueue(v);
                }, function(e) {
                    return controller.error(e);
                });
                previousBlockedChunk = chunk$54;
                chunk.then(function() {
                    previousBlockedChunk === chunk$54 && (previousBlockedChunk = null);
                    resolveModelChunk(response, chunk$54, json);
                });
            }
        },
        close: function close() {
            if (!closed) if (closed = !0, null === previousBlockedChunk) controller.close();
            else {
                var blockedChunk = previousBlockedChunk;
                previousBlockedChunk = null;
                blockedChunk.then(function() {
                    return controller.close();
                });
            }
        },
        error: function error(error) {
            if (!closed) if (closed = !0, null === previousBlockedChunk) controller.error(error);
            else {
                var blockedChunk = previousBlockedChunk;
                previousBlockedChunk = null;
                blockedChunk.then(function() {
                    return controller.error(error);
                });
            }
        }
    });
}
function asyncIterator() {
    return this;
}
function createIterator(next) {
    next = {
        next: next
    };
    next[ASYNC_ITERATOR] = asyncIterator;
    return next;
}
function startAsyncIterable(response, id, iterator) {
    var buffer = [], closed = !1, nextWriteIndex = 0, iterable = {};
    iterable[ASYNC_ITERATOR] = function() {
        var nextReadIndex = 0;
        return createIterator(function(arg) {
            if (void 0 !== arg) throw Error("Values cannot be passed to next() of AsyncIterables passed to Client Components.");
            if (nextReadIndex === buffer.length) {
                if (closed) return new ReactPromise("fulfilled", {
                    done: !0,
                    value: void 0
                }, null);
                buffer[nextReadIndex] = new ReactPromise("pending", null, null);
            }
            return buffer[nextReadIndex++];
        });
    };
    resolveStream(response, id, iterator ? iterable[ASYNC_ITERATOR]() : iterable, {
        enqueueValue: function enqueueValue(value) {
            if (nextWriteIndex === buffer.length) buffer[nextWriteIndex] = new ReactPromise("fulfilled", {
                done: !1,
                value: value
            }, null);
            else {
                var chunk = buffer[nextWriteIndex], resolveListeners = chunk.value, rejectListeners = chunk.reason;
                chunk.status = "fulfilled";
                chunk.value = {
                    done: !1,
                    value: value
                };
                chunk.reason = null;
                null !== resolveListeners && wakeChunkIfInitialized(response, chunk, resolveListeners, rejectListeners);
            }
            nextWriteIndex++;
        },
        enqueueModel: function enqueueModel(value) {
            nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(response, value, !1) : resolveIteratorResultChunk(response, buffer[nextWriteIndex], value, !1);
            nextWriteIndex++;
        },
        close: function close(value) {
            if (!closed) for(closed = !0, nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(response, value, !0) : resolveIteratorResultChunk(response, buffer[nextWriteIndex], value, !0), nextWriteIndex++; nextWriteIndex < buffer.length;)resolveIteratorResultChunk(response, buffer[nextWriteIndex++], '"$undefined"', !0);
        },
        error: function error(_error) {
            if (!closed) for(closed = !0, nextWriteIndex === buffer.length && (buffer[nextWriteIndex] = new ReactPromise("pending", null, null)); nextWriteIndex < buffer.length;)triggerErrorOnChunk(response, buffer[nextWriteIndex++], _error);
        }
    });
}
function resolveErrorProd() {
    var error = Error("An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.");
    error.stack = "Error: " + error.message;
    return error;
}
function mergeBuffer(buffer, lastChunk) {
    for(var l = buffer.length, byteLength = lastChunk.length, i = 0; i < l; i++)byteLength += buffer[i].byteLength;
    byteLength = new Uint8Array(byteLength);
    for(var i$55 = i = 0; i$55 < l; i$55++){
        var chunk = buffer[i$55];
        byteLength.set(chunk, i);
        i += chunk.byteLength;
    }
    byteLength.set(lastChunk, i);
    return byteLength;
}
function resolveTypedArray(response, id, buffer, lastChunk, constructor, bytesPerElement) {
    buffer = 0 === buffer.length && 0 === lastChunk.byteOffset % bytesPerElement ? lastChunk : mergeBuffer(buffer, lastChunk);
    constructor = new constructor(buffer.buffer, buffer.byteOffset, buffer.byteLength / bytesPerElement);
    resolveBuffer(response, id, constructor);
}
function processFullBinaryRow(response, streamState, id, tag, buffer, chunk) {
    switch(tag){
        case 65:
            resolveBuffer(response, id, mergeBuffer(buffer, chunk).buffer);
            return;
        case 79:
            resolveTypedArray(response, id, buffer, chunk, Int8Array, 1);
            return;
        case 111:
            resolveBuffer(response, id, 0 === buffer.length ? chunk : mergeBuffer(buffer, chunk));
            return;
        case 85:
            resolveTypedArray(response, id, buffer, chunk, Uint8ClampedArray, 1);
            return;
        case 83:
            resolveTypedArray(response, id, buffer, chunk, Int16Array, 2);
            return;
        case 115:
            resolveTypedArray(response, id, buffer, chunk, Uint16Array, 2);
            return;
        case 76:
            resolveTypedArray(response, id, buffer, chunk, Int32Array, 4);
            return;
        case 108:
            resolveTypedArray(response, id, buffer, chunk, Uint32Array, 4);
            return;
        case 71:
            resolveTypedArray(response, id, buffer, chunk, Float32Array, 4);
            return;
        case 103:
            resolveTypedArray(response, id, buffer, chunk, Float64Array, 8);
            return;
        case 77:
            resolveTypedArray(response, id, buffer, chunk, BigInt64Array, 8);
            return;
        case 109:
            resolveTypedArray(response, id, buffer, chunk, BigUint64Array, 8);
            return;
        case 86:
            resolveTypedArray(response, id, buffer, chunk, DataView, 1);
            return;
    }
    for(var stringDecoder = response._stringDecoder, row = "", i = 0; i < buffer.length; i++)row += stringDecoder.decode(buffer[i], decoderOptions);
    row += stringDecoder.decode(chunk);
    processFullStringRow(response, streamState, id, tag, row);
}
function processFullStringRow(response, streamState, id, tag, row) {
    switch(tag){
        case 73:
            resolveModule(response, id, row);
            break;
        case 72:
            id = row[0];
            row = row.slice(1);
            response = JSON.parse(row, response._fromJSON);
            row = ReactDOMSharedInternals.d;
            switch(id){
                case "D":
                    row.D(response);
                    break;
                case "C":
                    "string" === typeof response ? row.C(response) : row.C(response[0], response[1]);
                    break;
                case "L":
                    id = response[0];
                    streamState = response[1];
                    3 === response.length ? row.L(id, streamState, response[2]) : row.L(id, streamState);
                    break;
                case "m":
                    "string" === typeof response ? row.m(response) : row.m(response[0], response[1]);
                    break;
                case "X":
                    "string" === typeof response ? row.X(response) : row.X(response[0], response[1]);
                    break;
                case "S":
                    "string" === typeof response ? row.S(response) : row.S(response[0], 0 === response[1] ? void 0 : response[1], 3 === response.length ? response[2] : void 0);
                    break;
                case "M":
                    "string" === typeof response ? row.M(response) : row.M(response[0], response[1]);
            }
            break;
        case 69:
            streamState = response._chunks;
            tag = streamState.get(id);
            row = JSON.parse(row);
            var error = resolveErrorProd();
            error.digest = row.digest;
            tag ? triggerErrorOnChunk(response, tag, error) : (response = new ReactPromise("rejected", null, error), streamState.set(id, response));
            break;
        case 84:
            response = response._chunks;
            (streamState = response.get(id)) && "pending" !== streamState.status ? streamState.reason.enqueueValue(row) : (row = new ReactPromise("fulfilled", row, null), response.set(id, row));
            break;
        case 78:
        case 68:
        case 74:
        case 87:
            throw Error("Failed to read a RSC payload created by a development version of React on the server while using a production version on the client. Always use matching versions on the server and the client.");
        case 82:
            startReadableStream(response, id, void 0);
            break;
        case 114:
            startReadableStream(response, id, "bytes");
            break;
        case 88:
            startAsyncIterable(response, id, !1);
            break;
        case 120:
            startAsyncIterable(response, id, !0);
            break;
        case 67:
            (id = response._chunks.get(id)) && "fulfilled" === id.status && id.reason.close("" === row ? '"$undefined"' : row);
            break;
        default:
            streamState = response._chunks, (tag = streamState.get(id)) ? resolveModelChunk(response, tag, row) : (response = new ReactPromise("resolved_model", row, response), streamState.set(id, response));
    }
}
function processBinaryChunk(weakResponse, streamState, chunk) {
    for(var i = 0, rowState = streamState._rowState, rowID = streamState._rowID, rowTag = streamState._rowTag, rowLength = streamState._rowLength, buffer = streamState._buffer, chunkLength = chunk.length; i < chunkLength;){
        var lastIdx = -1;
        switch(rowState){
            case 0:
                lastIdx = chunk[i++];
                58 === lastIdx ? rowState = 1 : rowID = rowID << 4 | (96 < lastIdx ? lastIdx - 87 : lastIdx - 48);
                continue;
            case 1:
                rowState = chunk[i];
                84 === rowState || 65 === rowState || 79 === rowState || 111 === rowState || 98 === rowState || 85 === rowState || 83 === rowState || 115 === rowState || 76 === rowState || 108 === rowState || 71 === rowState || 103 === rowState || 77 === rowState || 109 === rowState || 86 === rowState ? (rowTag = rowState, rowState = 2, i++) : 64 < rowState && 91 > rowState || 35 === rowState || 114 === rowState || 120 === rowState ? (rowTag = rowState, rowState = 3, i++) : (rowTag = 0, rowState = 3);
                continue;
            case 2:
                lastIdx = chunk[i++];
                44 === lastIdx ? rowState = 4 : rowLength = rowLength << 4 | (96 < lastIdx ? lastIdx - 87 : lastIdx - 48);
                continue;
            case 3:
                lastIdx = chunk.indexOf(10, i);
                break;
            case 4:
                lastIdx = i + rowLength, lastIdx > chunk.length && (lastIdx = -1);
        }
        var offset = chunk.byteOffset + i;
        if (-1 < lastIdx) rowLength = new Uint8Array(chunk.buffer, offset, lastIdx - i), 98 === rowTag ? resolveBuffer(weakResponse, rowID, lastIdx === chunkLength ? rowLength : rowLength.slice()) : processFullBinaryRow(weakResponse, streamState, rowID, rowTag, buffer, rowLength), i = lastIdx, 3 === rowState && i++, rowLength = rowID = rowTag = rowState = 0, buffer.length = 0;
        else {
            chunk = new Uint8Array(chunk.buffer, offset, chunk.byteLength - i);
            98 === rowTag ? (rowLength -= chunk.byteLength, resolveBuffer(weakResponse, rowID, chunk)) : (buffer.push(chunk), rowLength -= chunk.byteLength);
            break;
        }
    }
    streamState._rowState = rowState;
    streamState._rowID = rowID;
    streamState._rowTag = rowTag;
    streamState._rowLength = rowLength;
}
function createFromJSONCallback(response) {
    return function(key, value) {
        if ("string" === typeof value) return parseModelString(response, this, key, value);
        if ("object" === (typeof value === "undefined" ? "undefined" : _type_of(value)) && null !== value) {
            if (value[0] === REACT_ELEMENT_TYPE) {
                if (key = {
                    $$typeof: REACT_ELEMENT_TYPE,
                    type: value[1],
                    key: value[2],
                    ref: null,
                    props: value[3]
                }, null !== initializingHandler) {
                    if (value = initializingHandler, initializingHandler = value.parent, value.errored) key = new ReactPromise("rejected", null, value.reason), key = createLazyChunkWrapper(key);
                    else if (0 < value.deps) {
                        var blockedChunk = new ReactPromise("blocked", null, null);
                        value.value = key;
                        value.chunk = blockedChunk;
                        key = createLazyChunkWrapper(blockedChunk);
                    }
                }
            } else key = value;
            return key;
        }
        return value;
    };
}
function close(weakResponse) {
    reportGlobalError(weakResponse, Error("Connection closed."));
}
function noServerCall$1() {
    throw Error("Server Functions cannot be called during initial render. This would create a fetch waterfall. Try to use a Server Component to pass data to Client Components instead.");
}
function createResponseFromOptions(options) {
    return new ResponseInstance(__webpack_require__.rscM.serverConsumerModuleMap, __webpack_require__.rscM.serverManifest, __webpack_require__.rscM.moduleLoading, noServerCall$1, options.encodeFormAction, "string" === typeof options.nonce ? options.nonce : void 0, options && options.temporaryReferences ? options.temporaryReferences : void 0);
}
function startReadingFromStream$1(response, stream, onDone) {
    function progress(_ref) {
        var value = _ref.value;
        if (_ref.done) return onDone();
        processBinaryChunk(response, streamState, value);
        return reader.read().then(progress).catch(error);
    }
    function error(e) {
        reportGlobalError(response, e);
    }
    var streamState = createStreamState(), reader = stream.getReader();
    reader.read().then(progress).catch(error);
}
function noServerCall() {
    throw Error("Server Functions cannot be called during initial render. This would create a fetch waterfall. Try to use a Server Component to pass data to Client Components instead.");
}
function startReadingFromStream(response, stream, onEnd) {
    var streamState = createStreamState();
    stream.on("data", function(chunk) {
        if ("string" === typeof chunk) {
            for(var i = 0, rowState = streamState._rowState, rowID = streamState._rowID, rowTag = streamState._rowTag, rowLength = streamState._rowLength, buffer = streamState._buffer, chunkLength = chunk.length; i < chunkLength;){
                var lastIdx = -1;
                switch(rowState){
                    case 0:
                        lastIdx = chunk.charCodeAt(i++);
                        58 === lastIdx ? rowState = 1 : rowID = rowID << 4 | (96 < lastIdx ? lastIdx - 87 : lastIdx - 48);
                        continue;
                    case 1:
                        rowState = chunk.charCodeAt(i);
                        84 === rowState || 65 === rowState || 79 === rowState || 111 === rowState || 85 === rowState || 83 === rowState || 115 === rowState || 76 === rowState || 108 === rowState || 71 === rowState || 103 === rowState || 77 === rowState || 109 === rowState || 86 === rowState ? (rowTag = rowState, rowState = 2, i++) : 64 < rowState && 91 > rowState || 114 === rowState || 120 === rowState ? (rowTag = rowState, rowState = 3, i++) : (rowTag = 0, rowState = 3);
                        continue;
                    case 2:
                        lastIdx = chunk.charCodeAt(i++);
                        44 === lastIdx ? rowState = 4 : rowLength = rowLength << 4 | (96 < lastIdx ? lastIdx - 87 : lastIdx - 48);
                        continue;
                    case 3:
                        lastIdx = chunk.indexOf("\n", i);
                        break;
                    case 4:
                        if (84 !== rowTag) throw Error("Binary RSC chunks cannot be encoded as strings. This is a bug in the wiring of the React streams.");
                        if (rowLength < chunk.length || chunk.length > 3 * rowLength) throw Error("String chunks need to be passed in their original shape. Not split into smaller string chunks. This is a bug in the wiring of the React streams.");
                        lastIdx = chunk.length;
                }
                if (-1 < lastIdx) {
                    if (0 < buffer.length) throw Error("String chunks need to be passed in their original shape. Not split into smaller string chunks. This is a bug in the wiring of the React streams.");
                    i = chunk.slice(i, lastIdx);
                    processFullStringRow(response, streamState, rowID, rowTag, i);
                    i = lastIdx;
                    3 === rowState && i++;
                    rowLength = rowID = rowTag = rowState = 0;
                    buffer.length = 0;
                } else if (chunk.length !== i) throw Error("String chunks need to be passed in their original shape. Not split into smaller string chunks. This is a bug in the wiring of the React streams.");
            }
            streamState._rowState = rowState;
            streamState._rowID = rowID;
            streamState._rowTag = rowTag;
            streamState._rowLength = rowLength;
        } else processBinaryChunk(response, streamState, chunk);
    });
    stream.on("error", function(error) {
        reportGlobalError(response, error);
    });
    stream.on("end", onEnd);
}
exports.createFromFetch = function(promiseForResponse) {
    var response = createResponseFromOptions(1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {});
    promiseForResponse.then(function(r) {
        startReadingFromStream$1(response, r.body, close.bind(null, response));
    }, function(e) {
        reportGlobalError(response, e);
    });
    return getChunk(response, 0);
};
exports.createFromNodeStream = function(stream, options) {
    options = new ResponseInstance(__webpack_require__.rscM.serverConsumerModuleMap, __webpack_require__.rscM.serverManifest, __webpack_require__.rscM.moduleLoading, noServerCall, options ? options.encodeFormAction : void 0, options && "string" === typeof options.nonce ? options.nonce : void 0, void 0);
    startReadingFromStream(options, stream, close.bind(null, options));
    return getChunk(options, 0);
};
exports.createFromReadableStream = function(stream) {
    var response = createResponseFromOptions(1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {});
    startReadingFromStream$1(response, stream, close.bind(null, response));
    return getChunk(response, 0);
};
exports.createServerReference = function(id) {
    return createServerReference$1(id, noServerCall$1);
};
exports.createTemporaryReferenceSet = function() {
    return new Map();
};
exports.encodeReply = function(value, options) {
    return new Promise(function(resolve, reject) {
        var abort = processReply(value, "", options && options.temporaryReferences ? options.temporaryReferences : void 0, resolve, reject);
        if (options && options.signal) {
            var signal = options.signal;
            if (signal.aborted) abort(signal.reason);
            else {
                var listener = function listener1() {
                    abort(signal.reason);
                    signal.removeEventListener("abort", listener);
                };
                signal.addEventListener("abort", listener);
            }
        }
    });
};
exports.registerServerReference = function(reference, id, encodeFormAction) {
    registerBoundServerReference(reference, id, null, encodeFormAction);
    return reference;
};


},
6735
/*!****************************************************************************************************!*\
  !*** ./node_modules/react-server-dom-rspack/cjs/react-server-dom-rspack-server.node.production.js ***!
  \****************************************************************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";
/**
 * @license React
 * react-server-dom-rspack-server.node.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var stream = __webpack_require__(/*! stream */ 2203), util = __webpack_require__(/*! util */ 9023);
__webpack_require__(/*! crypto */ 6982);
var async_hooks = __webpack_require__(/*! async_hooks */ 290), ReactDOM = __webpack_require__(/*! react-dom */ 5088), React = __webpack_require__(/*! react */ 9404), assign = Object.assign, CLIENT_REFERENCE_TAG$1 = Symbol.for("react.client.reference"), SERVER_REFERENCE_TAG = Symbol.for("react.server.reference"), FunctionBind = Function.prototype.bind, ArraySlice = Array.prototype.slice;
function bind() {
    var newFn = FunctionBind.apply(this, arguments);
    if (this.$$typeof === SERVER_REFERENCE_TAG) {
        var args = ArraySlice.call(arguments, 1), $$typeof = {
            value: SERVER_REFERENCE_TAG
        }, $$id = {
            value: this.$$id
        };
        args = {
            value: this.$$bound ? this.$$bound.concat(args) : args
        };
        return Object.defineProperties(newFn, {
            $$typeof: $$typeof,
            $$id: $$id,
            $$bound: args,
            bind: {
                value: bind,
                configurable: !0
            }
        });
    }
    return newFn;
}
var serverReferenceToString = {
    value: function value() {
        return "function () { [omitted code] }";
    },
    configurable: !0,
    writable: !0
}, currentStrategy = {
    encrypt: function encrypt(_actionId) {
        for(var _len = arguments.length, args = Array(1 < _len ? _len - 1 : 0), _key = 1; _key < _len; _key++)args[_key - 1] = arguments[_key];
        return Promise.resolve(args);
    },
    decrypt: function decrypt(_actionId, payloadPromise) {
        return payloadPromise;
    }
}, REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== (typeof maybeIterable === "undefined" ? "undefined" : _type_of(maybeIterable))) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
}
var ASYNC_ITERATOR = Symbol.asyncIterator, REACT_OPTIMISTIC_KEY = Symbol.for("react.optimistic_key"), scheduleMicrotask = queueMicrotask, currentView = null, writtenBytes = 0, destinationHasCapacity = !0;
function writeToDestination(destination, view) {
    destination = destination.write(view);
    destinationHasCapacity = destinationHasCapacity && destination;
}
function writeChunkAndReturn(destination, chunk) {
    if ("string" === typeof chunk) {
        if (0 !== chunk.length) if (4096 < 3 * chunk.length) 0 < writtenBytes && (writeToDestination(destination, currentView.subarray(0, writtenBytes)), currentView = new Uint8Array(4096), writtenBytes = 0), writeToDestination(destination, chunk);
        else {
            var target = currentView;
            0 < writtenBytes && (target = currentView.subarray(writtenBytes));
            target = textEncoder.encodeInto(chunk, target);
            var read = target.read;
            writtenBytes += target.written;
            read < chunk.length && (writeToDestination(destination, currentView.subarray(0, writtenBytes)), currentView = new Uint8Array(4096), writtenBytes = textEncoder.encodeInto(chunk.slice(read), currentView).written);
            4096 === writtenBytes && (writeToDestination(destination, currentView), currentView = new Uint8Array(4096), writtenBytes = 0);
        }
    } else 0 !== chunk.byteLength && (4096 < chunk.byteLength ? (0 < writtenBytes && (writeToDestination(destination, currentView.subarray(0, writtenBytes)), currentView = new Uint8Array(4096), writtenBytes = 0), writeToDestination(destination, chunk)) : (target = currentView.length - writtenBytes, target < chunk.byteLength && (0 === target ? writeToDestination(destination, currentView) : (currentView.set(chunk.subarray(0, target), writtenBytes), writtenBytes += target, writeToDestination(destination, currentView), chunk = chunk.subarray(target)), currentView = new Uint8Array(4096), writtenBytes = 0), currentView.set(chunk, writtenBytes), writtenBytes += chunk.byteLength, 4096 === writtenBytes && (writeToDestination(destination, currentView), currentView = new Uint8Array(4096), writtenBytes = 0)));
    return destinationHasCapacity;
}
var textEncoder = new util.TextEncoder();
function byteLengthOfChunk(chunk) {
    return "string" === typeof chunk ? Buffer.byteLength(chunk, "utf8") : chunk.byteLength;
}
var ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, previousDispatcher = ReactDOMSharedInternals.d;
ReactDOMSharedInternals.d = {
    f: previousDispatcher.f,
    r: previousDispatcher.r,
    D: prefetchDNS,
    C: preconnect,
    L: preload,
    m: preloadModule$1,
    X: preinitScript,
    S: preinitStyle,
    M: preinitModuleScript
};
function prefetchDNS(href) {
    if ("string" === typeof href && href) {
        var request = resolveRequest();
        if (request) {
            var hints = request.hints, key = "D|" + href;
            hints.has(key) || (hints.add(key), emitHint(request, "D", href));
        } else previousDispatcher.D(href);
    }
}
function preconnect(href, crossOrigin) {
    if ("string" === typeof href) {
        var request = resolveRequest();
        if (request) {
            var hints = request.hints, key = "C|" + (null == crossOrigin ? "null" : crossOrigin) + "|" + href;
            hints.has(key) || (hints.add(key), "string" === typeof crossOrigin ? emitHint(request, "C", [
                href,
                crossOrigin
            ]) : emitHint(request, "C", href));
        } else previousDispatcher.C(href, crossOrigin);
    }
}
function preload(href, as, options) {
    if ("string" === typeof href) {
        var request = resolveRequest();
        if (request) {
            var hints = request.hints, key = "L";
            if ("image" === as && options) {
                var imageSrcSet = options.imageSrcSet, imageSizes = options.imageSizes, uniquePart = "";
                "string" === typeof imageSrcSet && "" !== imageSrcSet ? (uniquePart += "[" + imageSrcSet + "]", "string" === typeof imageSizes && (uniquePart += "[" + imageSizes + "]")) : uniquePart += "[][]" + href;
                key += "[image]" + uniquePart;
            } else key += "[" + as + "]" + href;
            hints.has(key) || (hints.add(key), (options = trimOptions(options)) ? emitHint(request, "L", [
                href,
                as,
                options
            ]) : emitHint(request, "L", [
                href,
                as
            ]));
        } else previousDispatcher.L(href, as, options);
    }
}
function preloadModule$1(href, options) {
    if ("string" === typeof href) {
        var request = resolveRequest();
        if (request) {
            var hints = request.hints, key = "m|" + href;
            if (hints.has(key)) return;
            hints.add(key);
            return (options = trimOptions(options)) ? emitHint(request, "m", [
                href,
                options
            ]) : emitHint(request, "m", href);
        }
        previousDispatcher.m(href, options);
    }
}
function preinitStyle(href, precedence, options) {
    if ("string" === typeof href) {
        var request = resolveRequest();
        if (request) {
            var hints = request.hints, key = "S|" + href;
            if (hints.has(key)) return;
            hints.add(key);
            return (options = trimOptions(options)) ? emitHint(request, "S", [
                href,
                "string" === typeof precedence ? precedence : 0,
                options
            ]) : "string" === typeof precedence ? emitHint(request, "S", [
                href,
                precedence
            ]) : emitHint(request, "S", href);
        }
        previousDispatcher.S(href, precedence, options);
    }
}
function preinitScript(src, options) {
    if ("string" === typeof src) {
        var request = resolveRequest();
        if (request) {
            var hints = request.hints, key = "X|" + src;
            if (hints.has(key)) return;
            hints.add(key);
            return (options = trimOptions(options)) ? emitHint(request, "X", [
                src,
                options
            ]) : emitHint(request, "X", src);
        }
        previousDispatcher.X(src, options);
    }
}
function preinitModuleScript(src, options) {
    if ("string" === typeof src) {
        var request = resolveRequest();
        if (request) {
            var hints = request.hints, key = "M|" + src;
            if (hints.has(key)) return;
            hints.add(key);
            return (options = trimOptions(options)) ? emitHint(request, "M", [
                src,
                options
            ]) : emitHint(request, "M", src);
        }
        previousDispatcher.M(src, options);
    }
}
function trimOptions(options) {
    if (null == options) return null;
    var hasProperties = !1, trimmed = {}, key;
    for(key in options)null != options[key] && (hasProperties = !0, trimmed[key] = options[key]);
    return hasProperties ? trimmed : null;
}
function getChildFormatContext(parentContext, type, props) {
    switch(type){
        case "img":
            type = props.src;
            var srcSet = props.srcSet;
            if (!("lazy" === props.loading || !type && !srcSet || "string" !== typeof type && null != type || "string" !== typeof srcSet && null != srcSet || "low" === props.fetchPriority || parentContext & 3) && ("string" !== typeof type || ":" !== type[4] || "d" !== type[0] && "D" !== type[0] || "a" !== type[1] && "A" !== type[1] || "t" !== type[2] && "T" !== type[2] || "a" !== type[3] && "A" !== type[3]) && ("string" !== typeof srcSet || ":" !== srcSet[4] || "d" !== srcSet[0] && "D" !== srcSet[0] || "a" !== srcSet[1] && "A" !== srcSet[1] || "t" !== srcSet[2] && "T" !== srcSet[2] || "a" !== srcSet[3] && "A" !== srcSet[3])) {
                var sizes = "string" === typeof props.sizes ? props.sizes : void 0;
                var input = props.crossOrigin;
                preload(type || "", "image", {
                    imageSrcSet: srcSet,
                    imageSizes: sizes,
                    crossOrigin: "string" === typeof input ? "use-credentials" === input ? input : "" : void 0,
                    integrity: props.integrity,
                    type: props.type,
                    fetchPriority: props.fetchPriority,
                    referrerPolicy: props.referrerPolicy
                });
            }
            return parentContext;
        case "link":
            type = props.rel;
            srcSet = props.href;
            if (!(parentContext & 1 || null != props.itemProp || "string" !== typeof type || "string" !== typeof srcSet || "" === srcSet)) switch(type){
                case "preload":
                    preload(srcSet, props.as, {
                        crossOrigin: props.crossOrigin,
                        integrity: props.integrity,
                        nonce: props.nonce,
                        type: props.type,
                        fetchPriority: props.fetchPriority,
                        referrerPolicy: props.referrerPolicy,
                        imageSrcSet: props.imageSrcSet,
                        imageSizes: props.imageSizes,
                        media: props.media
                    });
                    break;
                case "modulepreload":
                    preloadModule$1(srcSet, {
                        as: props.as,
                        crossOrigin: props.crossOrigin,
                        integrity: props.integrity,
                        nonce: props.nonce
                    });
                    break;
                case "stylesheet":
                    preload(srcSet, "style", {
                        crossOrigin: props.crossOrigin,
                        integrity: props.integrity,
                        nonce: props.nonce,
                        type: props.type,
                        fetchPriority: props.fetchPriority,
                        referrerPolicy: props.referrerPolicy,
                        media: props.media
                    });
            }
            return parentContext;
        case "picture":
            return parentContext | 2;
        case "noscript":
            return parentContext | 1;
        default:
            return parentContext;
    }
}
var requestStorage = new async_hooks.AsyncLocalStorage(), TEMPORARY_REFERENCE_TAG = Symbol.for("react.temporary.reference"), proxyHandlers = {
    get: function get(target, name) {
        switch(name){
            case "$$typeof":
                return target.$$typeof;
            case "name":
                return;
            case "displayName":
                return;
            case "defaultProps":
                return;
            case "_debugInfo":
                return;
            case "toJSON":
                return;
            case Symbol.toPrimitive:
                return Object.prototype[Symbol.toPrimitive];
            case Symbol.toStringTag:
                return Object.prototype[Symbol.toStringTag];
            case "Provider":
                throw Error("Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider.");
            case "then":
                return;
        }
        throw Error("Cannot access " + String(name) + " on the server. You cannot dot into a temporary client reference from a server component. You can only pass the value through to the client.");
    },
    set: function set() {
        throw Error("Cannot assign to a temporary client reference from a server module.");
    }
};
function createTemporaryReference(temporaryReferences, id) {
    var reference = Object.defineProperties(function() {
        throw Error("Attempted to call a temporary Client Reference from the server but it is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
    }, {
        $$typeof: {
            value: TEMPORARY_REFERENCE_TAG
        }
    });
    reference = new Proxy(reference, proxyHandlers);
    temporaryReferences.set(reference, id);
    return reference;
}
function noop() {}
var SuspenseException = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`.");
function trackUsedThenable(thenableState, thenable, index) {
    index = thenableState[index];
    void 0 === index ? thenableState.push(thenable) : index !== thenable && (thenable.then(noop, noop), thenable = index);
    switch(thenable.status){
        case "fulfilled":
            return thenable.value;
        case "rejected":
            throw thenable.reason;
        default:
            "string" === typeof thenable.status ? thenable.then(noop, noop) : (thenableState = thenable, thenableState.status = "pending", thenableState.then(function(fulfilledValue) {
                if ("pending" === thenable.status) {
                    var fulfilledThenable = thenable;
                    fulfilledThenable.status = "fulfilled";
                    fulfilledThenable.value = fulfilledValue;
                }
            }, function(error) {
                if ("pending" === thenable.status) {
                    var rejectedThenable = thenable;
                    rejectedThenable.status = "rejected";
                    rejectedThenable.reason = error;
                }
            }));
            switch(thenable.status){
                case "fulfilled":
                    return thenable.value;
                case "rejected":
                    throw thenable.reason;
            }
            suspendedThenable = thenable;
            throw SuspenseException;
    }
}
var suspendedThenable = null;
function getSuspendedThenable() {
    if (null === suspendedThenable) throw Error("Expected a suspended thenable. This is a bug in React. Please file an issue.");
    var thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
}
var currentRequest$1 = null, thenableIndexCounter = 0, thenableState = null;
function getThenableStateAfterSuspending() {
    var state = thenableState || [];
    thenableState = null;
    return state;
}
var HooksDispatcher = {
    readContext: unsupportedContext,
    use: use,
    useCallback: function useCallback(callback) {
        return callback;
    },
    useContext: unsupportedContext,
    useEffect: unsupportedHook,
    useImperativeHandle: unsupportedHook,
    useLayoutEffect: unsupportedHook,
    useInsertionEffect: unsupportedHook,
    useMemo: function useMemo(nextCreate) {
        return nextCreate();
    },
    useReducer: unsupportedHook,
    useRef: unsupportedHook,
    useState: unsupportedHook,
    useDebugValue: function useDebugValue() {},
    useDeferredValue: unsupportedHook,
    useTransition: unsupportedHook,
    useSyncExternalStore: unsupportedHook,
    useId: useId,
    useHostTransitionStatus: unsupportedHook,
    useFormState: unsupportedHook,
    useActionState: unsupportedHook,
    useOptimistic: unsupportedHook,
    useMemoCache: function useMemoCache(size) {
        for(var data = Array(size), i = 0; i < size; i++)data[i] = REACT_MEMO_CACHE_SENTINEL;
        return data;
    },
    useCacheRefresh: function useCacheRefresh() {
        return unsupportedRefresh;
    }
};
HooksDispatcher.useEffectEvent = unsupportedHook;
function unsupportedHook() {
    throw Error("This Hook is not supported in Server Components.");
}
function unsupportedRefresh() {
    throw Error("Refreshing the cache is not supported in Server Components.");
}
function unsupportedContext() {
    throw Error("Cannot read a Client Context from a Server Component.");
}
function useId() {
    if (null === currentRequest$1) throw Error("useId can only be used while React is rendering");
    var id = currentRequest$1.identifierCount++;
    return "_" + currentRequest$1.identifierPrefix + "S_" + id.toString(32) + "_";
}
function use(usable) {
    if (null !== usable && "object" === (typeof usable === "undefined" ? "undefined" : _type_of(usable)) || "function" === typeof usable) {
        if ("function" === typeof usable.then) {
            var index = thenableIndexCounter;
            thenableIndexCounter += 1;
            null === thenableState && (thenableState = []);
            return trackUsedThenable(thenableState, usable, index);
        }
        usable.$$typeof === REACT_CONTEXT_TYPE && unsupportedContext();
    }
    if (usable.$$typeof === CLIENT_REFERENCE_TAG$1) {
        if (null != usable.value && usable.value.$$typeof === REACT_CONTEXT_TYPE) throw Error("Cannot read a Client Context from a Server Component.");
        throw Error("Cannot use() an already resolved Client Reference.");
    }
    throw Error("An unsupported type was passed to use(): " + String(usable));
}
var DefaultAsyncDispatcher = {
    getCacheForType: function getCacheForType(resourceType) {
        var JSCompiler_inline_result = (JSCompiler_inline_result = resolveRequest()) ? JSCompiler_inline_result.cache : new Map();
        var entry = JSCompiler_inline_result.get(resourceType);
        void 0 === entry && (entry = resourceType(), JSCompiler_inline_result.set(resourceType, entry));
        return entry;
    },
    cacheSignal: function cacheSignal() {
        var request = resolveRequest();
        return request ? request.cacheController.signal : null;
    }
}, ReactSharedInternalsServer = React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
if (!ReactSharedInternalsServer) throw Error('The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.');
var isArrayImpl = Array.isArray, getPrototypeOf = Object.getPrototypeOf;
function objectName(object) {
    object = Object.prototype.toString.call(object);
    return object.slice(8, object.length - 1);
}
function describeValueForErrorMessage(value) {
    switch(typeof value === "undefined" ? "undefined" : _type_of(value)){
        case "string":
            return JSON.stringify(10 >= value.length ? value : value.slice(0, 10) + "...");
        case "object":
            if (isArrayImpl(value)) return "[...]";
            if (null !== value && value.$$typeof === CLIENT_REFERENCE_TAG) return "client";
            value = objectName(value);
            return "Object" === value ? "{...}" : value;
        case "function":
            return value.$$typeof === CLIENT_REFERENCE_TAG ? "client" : (value = value.displayName || value.name) ? "function " + value : "function";
        default:
            return String(value);
    }
}
function describeElementType(type) {
    if ("string" === typeof type) return type;
    switch(type){
        case REACT_SUSPENSE_TYPE:
            return "Suspense";
        case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
        case REACT_VIEW_TRANSITION_TYPE:
            return "ViewTransition";
    }
    if ("object" === (typeof type === "undefined" ? "undefined" : _type_of(type))) switch(type.$$typeof){
        case REACT_FORWARD_REF_TYPE:
            return describeElementType(type.render);
        case REACT_MEMO_TYPE:
            return describeElementType(type.type);
        case REACT_LAZY_TYPE:
            var payload = type._payload;
            type = type._init;
            try {
                return describeElementType(type(payload));
            } catch (x) {}
    }
    return "";
}
var CLIENT_REFERENCE_TAG = Symbol.for("react.client.reference");
function describeObjectForErrorMessage(objectOrArray, expandedName) {
    var objKind = objectName(objectOrArray);
    if ("Object" !== objKind && "Array" !== objKind) return objKind;
    objKind = -1;
    var length = 0;
    if (isArrayImpl(objectOrArray)) {
        var str = "[";
        for(var i = 0; i < objectOrArray.length; i++){
            0 < i && (str += ", ");
            var value = objectOrArray[i];
            value = "object" === (typeof value === "undefined" ? "undefined" : _type_of(value)) && null !== value ? describeObjectForErrorMessage(value) : describeValueForErrorMessage(value);
            "" + i === expandedName ? (objKind = str.length, length = value.length, str += value) : str = 10 > value.length && 40 > str.length + value.length ? str + value : str + "...";
        }
        str += "]";
    } else if (objectOrArray.$$typeof === REACT_ELEMENT_TYPE) str = "<" + describeElementType(objectOrArray.type) + "/>";
    else {
        if (objectOrArray.$$typeof === CLIENT_REFERENCE_TAG) return "client";
        str = "{";
        i = Object.keys(objectOrArray);
        for(value = 0; value < i.length; value++){
            0 < value && (str += ", ");
            var name = i[value], encodedKey = JSON.stringify(name);
            str += ('"' + name + '"' === encodedKey ? name : encodedKey) + ": ";
            encodedKey = objectOrArray[name];
            encodedKey = "object" === (typeof encodedKey === "undefined" ? "undefined" : _type_of(encodedKey)) && null !== encodedKey ? describeObjectForErrorMessage(encodedKey) : describeValueForErrorMessage(encodedKey);
            name === expandedName ? (objKind = str.length, length = encodedKey.length, str += encodedKey) : str = 10 > encodedKey.length && 40 > str.length + encodedKey.length ? str + encodedKey : str + "...";
        }
        str += "}";
    }
    return void 0 === expandedName ? str : -1 < objKind && 0 < length ? (objectOrArray = " ".repeat(objKind) + "^".repeat(length), "\n  " + str + "\n  " + objectOrArray) : "\n  " + str;
}
var hasOwnProperty = Object.prototype.hasOwnProperty, ObjectPrototype$1 = Object.prototype, stringify = JSON.stringify;
function defaultErrorHandler(error) {
    console.error(error);
}
function RequestInstance(type, model, bundlerConfig, onError, onAllReady, onFatalError, identifierPrefix, temporaryReferences) {
    if (null !== ReactSharedInternalsServer.A && ReactSharedInternalsServer.A !== DefaultAsyncDispatcher) throw Error("Currently React only supports one RSC renderer at a time.");
    ReactSharedInternalsServer.A = DefaultAsyncDispatcher;
    var abortSet = new Set(), pingedTasks = [], hints = new Set();
    this.type = type;
    this.status = 10;
    this.flushScheduled = !1;
    this.destination = this.fatalError = null;
    this.bundlerConfig = bundlerConfig;
    this.cache = new Map();
    this.cacheController = new AbortController();
    this.pendingChunks = this.nextChunkId = 0;
    this.hints = hints;
    this.abortableTasks = abortSet;
    this.pingedTasks = pingedTasks;
    this.completedImportChunks = [];
    this.completedHintChunks = [];
    this.completedRegularChunks = [];
    this.completedErrorChunks = [];
    this.writtenSymbols = new Map();
    this.writtenClientReferences = new Map();
    this.writtenServerReferences = new Map();
    this.writtenObjects = new WeakMap();
    this.temporaryReferences = temporaryReferences;
    this.identifierPrefix = identifierPrefix || "";
    this.identifierCount = 1;
    this.taintCleanupQueue = [];
    this.onError = void 0 === onError ? defaultErrorHandler : onError;
    this.onAllReady = onAllReady;
    this.onFatalError = onFatalError;
    type = createTask(this, model, null, !1, 0, abortSet);
    pingedTasks.push(type);
}
var currentRequest = null;
function resolveRequest() {
    if (currentRequest) return currentRequest;
    var store = requestStorage.getStore();
    return store ? store : null;
}
function serializeThenable(request, task, thenable) {
    var newTask = createTask(request, thenable, task.keyPath, task.implicitSlot, task.formatContext, request.abortableTasks);
    switch(thenable.status){
        case "fulfilled":
            return newTask.model = thenable.value, pingTask(request, newTask), newTask.id;
        case "rejected":
            return erroredTask(request, newTask, thenable.reason), newTask.id;
        default:
            if (12 === request.status) return request.abortableTasks.delete(newTask), 21 === request.type ? (haltTask(newTask), finishHaltedTask(newTask, request)) : (task = request.fatalError, abortTask(newTask), finishAbortedTask(newTask, request, task)), newTask.id;
            "string" !== typeof thenable.status && (thenable.status = "pending", thenable.then(function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            }, function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            }));
    }
    thenable.then(function(value) {
        newTask.model = value;
        pingTask(request, newTask);
    }, function(reason) {
        0 === newTask.status && (erroredTask(request, newTask, reason), enqueueFlush(request));
    });
    return newTask.id;
}
function serializeReadableStream(request, task, stream) {
    function progress(entry) {
        if (0 === streamTask.status) if (entry.done) streamTask.status = 1, entry = streamTask.id.toString(16) + ":C\n", request.completedRegularChunks.push(entry), request.abortableTasks.delete(streamTask), request.cacheController.signal.removeEventListener("abort", abortStream), enqueueFlush(request), callOnAllReadyIfReady(request);
        else try {
            request.pendingChunks++, streamTask.model = entry.value, isByteStream ? emitTypedArrayChunk(request, streamTask.id, "b", streamTask.model, !1) : tryStreamTask(request, streamTask), enqueueFlush(request), reader.read().then(progress, error);
        } catch (x$11) {
            error(x$11);
        }
    }
    function error(reason) {
        0 === streamTask.status && (request.cacheController.signal.removeEventListener("abort", abortStream), erroredTask(request, streamTask, reason), enqueueFlush(request), reader.cancel(reason).then(error, error));
    }
    function abortStream() {
        if (0 === streamTask.status) {
            var signal = request.cacheController.signal;
            signal.removeEventListener("abort", abortStream);
            signal = signal.reason;
            21 === request.type ? (request.abortableTasks.delete(streamTask), haltTask(streamTask), finishHaltedTask(streamTask, request)) : (erroredTask(request, streamTask, signal), enqueueFlush(request));
            reader.cancel(signal).then(error, error);
        }
    }
    var supportsBYOB = stream.supportsBYOB;
    if (void 0 === supportsBYOB) try {
        stream.getReader({
            mode: "byob"
        }).releaseLock(), supportsBYOB = !0;
    } catch (x) {
        supportsBYOB = !1;
    }
    var isByteStream = supportsBYOB, reader = stream.getReader(), streamTask = createTask(request, task.model, task.keyPath, task.implicitSlot, task.formatContext, request.abortableTasks);
    request.pendingChunks++;
    task = streamTask.id.toString(16) + ":" + (isByteStream ? "r" : "R") + "\n";
    request.completedRegularChunks.push(task);
    request.cacheController.signal.addEventListener("abort", abortStream);
    reader.read().then(progress, error);
    return serializeByValueID(streamTask.id);
}
function serializeAsyncIterable(request, task, iterable, iterator) {
    function progress(entry) {
        if (0 === streamTask.status) if (entry.done) {
            streamTask.status = 1;
            if (void 0 === entry.value) var endStreamRow = streamTask.id.toString(16) + ":C\n";
            else try {
                var chunkId = outlineModelWithFormatContext(request, entry.value, 0);
                endStreamRow = streamTask.id.toString(16) + ":C" + stringify(serializeByValueID(chunkId)) + "\n";
            } catch (x) {
                error(x);
                return;
            }
            request.completedRegularChunks.push(endStreamRow);
            request.abortableTasks.delete(streamTask);
            request.cacheController.signal.removeEventListener("abort", abortIterable);
            enqueueFlush(request);
            callOnAllReadyIfReady(request);
        } else try {
            streamTask.model = entry.value, request.pendingChunks++, tryStreamTask(request, streamTask), enqueueFlush(request), iterator.next().then(progress, error);
        } catch (x$12) {
            error(x$12);
        }
    }
    function error(reason) {
        0 === streamTask.status && (request.cacheController.signal.removeEventListener("abort", abortIterable), erroredTask(request, streamTask, reason), enqueueFlush(request), "function" === typeof iterator.throw && iterator.throw(reason).then(error, error));
    }
    function abortIterable() {
        if (0 === streamTask.status) {
            var signal = request.cacheController.signal;
            signal.removeEventListener("abort", abortIterable);
            var reason = signal.reason;
            21 === request.type ? (request.abortableTasks.delete(streamTask), haltTask(streamTask), finishHaltedTask(streamTask, request)) : (erroredTask(request, streamTask, signal.reason), enqueueFlush(request));
            "function" === typeof iterator.throw && iterator.throw(reason).then(error, error);
        }
    }
    iterable = iterable === iterator;
    var streamTask = createTask(request, task.model, task.keyPath, task.implicitSlot, task.formatContext, request.abortableTasks);
    request.pendingChunks++;
    task = streamTask.id.toString(16) + ":" + (iterable ? "x" : "X") + "\n";
    request.completedRegularChunks.push(task);
    request.cacheController.signal.addEventListener("abort", abortIterable);
    iterator.next().then(progress, error);
    return serializeByValueID(streamTask.id);
}
function emitHint(request, code, model) {
    model = stringify(model);
    request.completedHintChunks.push(":H" + code + model + "\n");
    enqueueFlush(request);
}
function readThenable(thenable) {
    if ("fulfilled" === thenable.status) return thenable.value;
    if ("rejected" === thenable.status) throw thenable.reason;
    throw thenable;
}
function createLazyWrapperAroundWakeable(request, task, wakeable) {
    switch(wakeable.status){
        case "fulfilled":
            return wakeable.value;
        case "rejected":
            break;
        default:
            "string" !== typeof wakeable.status && (wakeable.status = "pending", wakeable.then(function(fulfilledValue) {
                "pending" === wakeable.status && (wakeable.status = "fulfilled", wakeable.value = fulfilledValue);
            }, function(error) {
                "pending" === wakeable.status && (wakeable.status = "rejected", wakeable.reason = error);
            }));
    }
    return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: wakeable,
        _init: readThenable
    };
}
function voidHandler() {}
function processServerComponentReturnValue(request, task, Component, result) {
    if ("object" !== (typeof result === "undefined" ? "undefined" : _type_of(result)) || null === result || result.$$typeof === CLIENT_REFERENCE_TAG$1) return result;
    if ("function" === typeof result.then) return createLazyWrapperAroundWakeable(request, task, result);
    var iteratorFn = getIteratorFn(result);
    return iteratorFn ? (request = {}, request[Symbol.iterator] = function() {
        return iteratorFn.call(result);
    }, request) : "function" !== typeof result[ASYNC_ITERATOR] || "function" === typeof ReadableStream && _instanceof(result, ReadableStream) ? result : (request = {}, request[ASYNC_ITERATOR] = function() {
        return result[ASYNC_ITERATOR]();
    }, request);
}
function renderFunctionComponent(request, task, key, Component, props) {
    var prevThenableState = task.thenableState;
    task.thenableState = null;
    thenableIndexCounter = 0;
    thenableState = prevThenableState;
    props = Component(props, void 0);
    if (12 === request.status) throw "object" === (typeof props === "undefined" ? "undefined" : _type_of(props)) && null !== props && "function" === typeof props.then && props.$$typeof !== CLIENT_REFERENCE_TAG$1 && props.then(voidHandler, voidHandler), null;
    props = processServerComponentReturnValue(request, task, Component, props);
    Component = task.keyPath;
    prevThenableState = task.implicitSlot;
    null !== key ? task.keyPath = key === REACT_OPTIMISTIC_KEY || Component === REACT_OPTIMISTIC_KEY ? REACT_OPTIMISTIC_KEY : null === Component ? key : Component + "," + key : null === Component && (task.implicitSlot = !0);
    request = renderModelDestructive(request, task, emptyRoot, "", props);
    task.keyPath = Component;
    task.implicitSlot = prevThenableState;
    return request;
}
function renderFragment(request, task, children) {
    return null !== task.keyPath ? (request = [
        REACT_ELEMENT_TYPE,
        REACT_FRAGMENT_TYPE,
        task.keyPath,
        {
            children: children
        }
    ], task.implicitSlot ? [
        request
    ] : request) : children;
}
var serializedSize = 0;
function deferTask(request, task) {
    task = createTask(request, task.model, task.keyPath, task.implicitSlot, task.formatContext, request.abortableTasks);
    pingTask(request, task);
    return serializeLazyID(task.id);
}
function renderElement(request, task, type, key, ref, props) {
    if (null !== ref && void 0 !== ref) throw Error("Refs cannot be used in Server Components, nor passed to Client Components.");
    if ("function" === typeof type && type.$$typeof !== CLIENT_REFERENCE_TAG$1 && type.$$typeof !== TEMPORARY_REFERENCE_TAG) return renderFunctionComponent(request, task, key, type, props);
    if (type === REACT_FRAGMENT_TYPE && null === key) return type = task.implicitSlot, null === task.keyPath && (task.implicitSlot = !0), props = renderModelDestructive(request, task, emptyRoot, "", props.children), task.implicitSlot = type, props;
    if (null != type && "object" === (typeof type === "undefined" ? "undefined" : _type_of(type)) && type.$$typeof !== CLIENT_REFERENCE_TAG$1) switch(type.$$typeof){
        case REACT_LAZY_TYPE:
            var init = type._init;
            type = init(type._payload);
            if (12 === request.status) throw null;
            return renderElement(request, task, type, key, ref, props);
        case REACT_FORWARD_REF_TYPE:
            return renderFunctionComponent(request, task, key, type.render, props);
        case REACT_MEMO_TYPE:
            return renderElement(request, task, type.type, key, ref, props);
    }
    else "string" === typeof type && (ref = task.formatContext, init = getChildFormatContext(ref, type, props), ref !== init && null != props.children && outlineModelWithFormatContext(request, props.children, init));
    request = key;
    key = task.keyPath;
    null === request ? request = key : null !== key && (request = key === REACT_OPTIMISTIC_KEY || request === REACT_OPTIMISTIC_KEY ? REACT_OPTIMISTIC_KEY : key + "," + request);
    props = [
        REACT_ELEMENT_TYPE,
        type,
        request,
        props
    ];
    task = task.implicitSlot && null !== request ? [
        props
    ] : props;
    return task;
}
function pingTask(request, task) {
    var pingedTasks = request.pingedTasks;
    pingedTasks.push(task);
    1 === pingedTasks.length && (request.flushScheduled = null !== request.destination, 21 === request.type || 10 === request.status ? scheduleMicrotask(function() {
        return performWork(request);
    }) : setImmediate(function() {
        return performWork(request);
    }));
}
function createTask(request, model, keyPath, implicitSlot, formatContext, abortSet) {
    request.pendingChunks++;
    var id = request.nextChunkId++;
    "object" !== (typeof model === "undefined" ? "undefined" : _type_of(model)) || null === model || null !== keyPath || implicitSlot || request.writtenObjects.set(model, serializeByValueID(id));
    var task = {
        id: id,
        status: 0,
        model: model,
        keyPath: keyPath,
        implicitSlot: implicitSlot,
        formatContext: formatContext,
        ping: function ping() {
            return pingTask(request, task);
        },
        toJSON: function toJSON(parentPropertyName, value) {
            serializedSize += parentPropertyName.length;
            var prevKeyPath = task.keyPath, prevImplicitSlot = task.implicitSlot;
            try {
                var JSCompiler_inline_result = renderModelDestructive(request, task, this, parentPropertyName, value);
            } catch (thrownValue) {
                if (parentPropertyName = task.model, parentPropertyName = "object" === (typeof parentPropertyName === "undefined" ? "undefined" : _type_of(parentPropertyName)) && null !== parentPropertyName && (parentPropertyName.$$typeof === REACT_ELEMENT_TYPE || parentPropertyName.$$typeof === REACT_LAZY_TYPE), 12 === request.status) task.status = 3, 21 === request.type ? (prevKeyPath = request.nextChunkId++, prevKeyPath = parentPropertyName ? serializeLazyID(prevKeyPath) : serializeByValueID(prevKeyPath), JSCompiler_inline_result = prevKeyPath) : (prevKeyPath = request.fatalError, JSCompiler_inline_result = parentPropertyName ? serializeLazyID(prevKeyPath) : serializeByValueID(prevKeyPath));
                else if (value = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue, "object" === (typeof value === "undefined" ? "undefined" : _type_of(value)) && null !== value && "function" === typeof value.then) {
                    JSCompiler_inline_result = createTask(request, task.model, task.keyPath, task.implicitSlot, task.formatContext, request.abortableTasks);
                    var ping = JSCompiler_inline_result.ping;
                    value.then(ping, ping);
                    JSCompiler_inline_result.thenableState = getThenableStateAfterSuspending();
                    task.keyPath = prevKeyPath;
                    task.implicitSlot = prevImplicitSlot;
                    JSCompiler_inline_result = parentPropertyName ? serializeLazyID(JSCompiler_inline_result.id) : serializeByValueID(JSCompiler_inline_result.id);
                } else task.keyPath = prevKeyPath, task.implicitSlot = prevImplicitSlot, request.pendingChunks++, prevKeyPath = request.nextChunkId++, prevImplicitSlot = logRecoverableError(request, value, task), emitErrorChunk(request, prevKeyPath, prevImplicitSlot), JSCompiler_inline_result = parentPropertyName ? serializeLazyID(prevKeyPath) : serializeByValueID(prevKeyPath);
            }
            return JSCompiler_inline_result;
        },
        thenableState: null
    };
    abortSet.add(task);
    return task;
}
function serializeByValueID(id) {
    return "$" + id.toString(16);
}
function serializeLazyID(id) {
    return "$L" + id.toString(16);
}
function encodeReferenceChunk(request, id, reference) {
    request = stringify(reference);
    return id.toString(16) + ":" + request + "\n";
}
function serializeClientReference(request, parent, parentPropertyName, clientReference) {
    var clientReferenceKey = clientReference.$$async ? clientReference.$$id + "#async" : clientReference.$$id, writtenClientReferences = request.writtenClientReferences, existingId = writtenClientReferences.get(clientReferenceKey);
    if (void 0 !== existingId) return parent[0] === REACT_ELEMENT_TYPE && "1" === parentPropertyName ? serializeLazyID(existingId) : serializeByValueID(existingId);
    try {
        var config = request.bundlerConfig, modulePath = clientReference.$$id;
        existingId = "";
        var resolvedModuleData = config[modulePath];
        if (resolvedModuleData) existingId = resolvedModuleData.name;
        else {
            var idx = modulePath.lastIndexOf("#");
            -1 !== idx && (existingId = modulePath.slice(idx + 1), resolvedModuleData = config[modulePath.slice(0, idx)]);
            if (!resolvedModuleData) throw Error('Could not find the module "' + modulePath + '" in the React Client Manifest. This is probably a bug in the React Server Components bundler.');
        }
        if (!0 === resolvedModuleData.async && !0 === clientReference.$$async) throw Error('The module "' + modulePath + '" is marked as an async ESM module but was loaded as a CJS proxy. This is probably a bug in the React Server Components bundler.');
        var JSCompiler_inline_result = !0 === resolvedModuleData.async || !0 === clientReference.$$async ? [
            resolvedModuleData.id,
            resolvedModuleData.chunks,
            existingId,
            1
        ] : [
            resolvedModuleData.id,
            resolvedModuleData.chunks,
            existingId
        ];
        request.pendingChunks++;
        var importId = request.nextChunkId++, json = stringify(JSCompiler_inline_result), processedChunk = importId.toString(16) + ":I" + json + "\n";
        request.completedImportChunks.push(processedChunk);
        writtenClientReferences.set(clientReferenceKey, importId);
        return parent[0] === REACT_ELEMENT_TYPE && "1" === parentPropertyName ? serializeLazyID(importId) : serializeByValueID(importId);
    } catch (x) {
        return request.pendingChunks++, parent = request.nextChunkId++, parentPropertyName = logRecoverableError(request, x, null), emitErrorChunk(request, parent, parentPropertyName), serializeByValueID(parent);
    }
}
function outlineModelWithFormatContext(request, value, formatContext) {
    value = createTask(request, value, null, !1, formatContext, request.abortableTasks);
    retryTask(request, value);
    return value.id;
}
function serializeTypedArray(request, tag, typedArray) {
    request.pendingChunks++;
    var bufferId = request.nextChunkId++;
    emitTypedArrayChunk(request, bufferId, tag, typedArray, !1);
    return serializeByValueID(bufferId);
}
function serializeBlob(request, blob) {
    function progress(entry) {
        if (0 === newTask.status) if (entry.done) request.cacheController.signal.removeEventListener("abort", abortBlob), pingTask(request, newTask);
        else return model.push(entry.value), reader.read().then(progress).catch(error);
    }
    function error(reason) {
        0 === newTask.status && (request.cacheController.signal.removeEventListener("abort", abortBlob), erroredTask(request, newTask, reason), enqueueFlush(request), reader.cancel(reason).then(error, error));
    }
    function abortBlob() {
        if (0 === newTask.status) {
            var signal = request.cacheController.signal;
            signal.removeEventListener("abort", abortBlob);
            signal = signal.reason;
            21 === request.type ? (request.abortableTasks.delete(newTask), haltTask(newTask), finishHaltedTask(newTask, request)) : (erroredTask(request, newTask, signal), enqueueFlush(request));
            reader.cancel(signal).then(error, error);
        }
    }
    var model = [
        blob.type
    ], newTask = createTask(request, model, null, !1, 0, request.abortableTasks), reader = blob.stream().getReader();
    request.cacheController.signal.addEventListener("abort", abortBlob);
    reader.read().then(progress).catch(error);
    return "$B" + newTask.id.toString(16);
}
var modelRoot = !1;
function renderModelDestructive(request, task, parent, parentPropertyName, value) {
    task.model = value;
    if (value === REACT_ELEMENT_TYPE) return "$";
    if (null === value) return null;
    if ("object" === (typeof value === "undefined" ? "undefined" : _type_of(value))) {
        switch(value.$$typeof){
            case REACT_ELEMENT_TYPE:
                var elementReference = null, writtenObjects = request.writtenObjects;
                if (null === task.keyPath && !task.implicitSlot) {
                    var existingReference = writtenObjects.get(value);
                    if (void 0 !== existingReference) if (modelRoot === value) modelRoot = null;
                    else return existingReference;
                    else -1 === parentPropertyName.indexOf(":") && (parent = writtenObjects.get(parent), void 0 !== parent && (elementReference = parent + ":" + parentPropertyName, writtenObjects.set(value, elementReference)));
                }
                if (3200 < serializedSize) return deferTask(request, task);
                parentPropertyName = value.props;
                parent = parentPropertyName.ref;
                request = renderElement(request, task, value.type, value.key, void 0 !== parent ? parent : null, parentPropertyName);
                "object" === (typeof request === "undefined" ? "undefined" : _type_of(request)) && null !== request && null !== elementReference && (writtenObjects.has(request) || writtenObjects.set(request, elementReference));
                return request;
            case REACT_LAZY_TYPE:
                if (3200 < serializedSize) return deferTask(request, task);
                task.thenableState = null;
                parentPropertyName = value._init;
                value = parentPropertyName(value._payload);
                if (12 === request.status) throw null;
                return renderModelDestructive(request, task, emptyRoot, "", value);
            case REACT_LEGACY_ELEMENT_TYPE:
                throw Error('A React Element from an older version of React was rendered. This is not supported. It can happen if:\n- Multiple copies of the "react" package is used.\n- A library pre-bundled an old copy of "react" or "react/jsx-runtime".\n- A compiler tries to "inline" JSX instead of using the runtime.');
        }
        if (value.$$typeof === CLIENT_REFERENCE_TAG$1) return serializeClientReference(request, parent, parentPropertyName, value);
        if (void 0 !== request.temporaryReferences && (elementReference = request.temporaryReferences.get(value), void 0 !== elementReference)) return "$T" + elementReference;
        elementReference = request.writtenObjects;
        writtenObjects = elementReference.get(value);
        if ("function" === typeof value.then) {
            if (void 0 !== writtenObjects) {
                if (null !== task.keyPath || task.implicitSlot) return "$@" + serializeThenable(request, task, value).toString(16);
                if (modelRoot === value) modelRoot = null;
                else return writtenObjects;
            }
            request = "$@" + serializeThenable(request, task, value).toString(16);
            elementReference.set(value, request);
            return request;
        }
        if (void 0 !== writtenObjects) if (modelRoot === value) {
            if (writtenObjects !== serializeByValueID(task.id)) return writtenObjects;
            modelRoot = null;
        } else return writtenObjects;
        else if (-1 === parentPropertyName.indexOf(":") && (writtenObjects = elementReference.get(parent), void 0 !== writtenObjects)) {
            existingReference = parentPropertyName;
            if (isArrayImpl(parent) && parent[0] === REACT_ELEMENT_TYPE) switch(parentPropertyName){
                case "1":
                    existingReference = "type";
                    break;
                case "2":
                    existingReference = "key";
                    break;
                case "3":
                    existingReference = "props";
                    break;
                case "4":
                    existingReference = "_owner";
            }
            elementReference.set(value, writtenObjects + ":" + existingReference);
        }
        if (isArrayImpl(value)) return renderFragment(request, task, value);
        if (_instanceof(value, Map)) return value = Array.from(value), "$Q" + outlineModelWithFormatContext(request, value, 0).toString(16);
        if (_instanceof(value, Set)) return value = Array.from(value), "$W" + outlineModelWithFormatContext(request, value, 0).toString(16);
        if ("function" === typeof FormData && _instanceof(value, FormData)) return value = Array.from(value.entries()), "$K" + outlineModelWithFormatContext(request, value, 0).toString(16);
        if (_instanceof(value, Error)) return "$Z";
        if (_instanceof(value, ArrayBuffer)) return serializeTypedArray(request, "A", new Uint8Array(value));
        if (_instanceof(value, Int8Array)) return serializeTypedArray(request, "O", value);
        if (_instanceof(value, Uint8Array)) return serializeTypedArray(request, "o", value);
        if (_instanceof(value, Uint8ClampedArray)) return serializeTypedArray(request, "U", value);
        if (_instanceof(value, Int16Array)) return serializeTypedArray(request, "S", value);
        if (_instanceof(value, Uint16Array)) return serializeTypedArray(request, "s", value);
        if (_instanceof(value, Int32Array)) return serializeTypedArray(request, "L", value);
        if (_instanceof(value, Uint32Array)) return serializeTypedArray(request, "l", value);
        if (_instanceof(value, Float32Array)) return serializeTypedArray(request, "G", value);
        if (_instanceof(value, Float64Array)) return serializeTypedArray(request, "g", value);
        if (_instanceof(value, BigInt64Array)) return serializeTypedArray(request, "M", value);
        if (_instanceof(value, BigUint64Array)) return serializeTypedArray(request, "m", value);
        if (_instanceof(value, DataView)) return serializeTypedArray(request, "V", value);
        if ("function" === typeof Blob && _instanceof(value, Blob)) return serializeBlob(request, value);
        if (elementReference = getIteratorFn(value)) return parentPropertyName = elementReference.call(value), parentPropertyName === value ? (value = Array.from(parentPropertyName), "$i" + outlineModelWithFormatContext(request, value, 0).toString(16)) : renderFragment(request, task, Array.from(parentPropertyName));
        if ("function" === typeof ReadableStream && _instanceof(value, ReadableStream)) return serializeReadableStream(request, task, value);
        elementReference = value[ASYNC_ITERATOR];
        if ("function" === typeof elementReference) return null !== task.keyPath ? (request = [
            REACT_ELEMENT_TYPE,
            REACT_FRAGMENT_TYPE,
            task.keyPath,
            {
                children: value
            }
        ], request = task.implicitSlot ? [
            request
        ] : request) : (parentPropertyName = elementReference.call(value), request = serializeAsyncIterable(request, task, value, parentPropertyName)), request;
        if (_instanceof(value, Date)) return "$D" + value.toJSON();
        request = getPrototypeOf(value);
        if (request !== ObjectPrototype$1 && (null === request || null !== getPrototypeOf(request))) throw Error("Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported." + describeObjectForErrorMessage(parent, parentPropertyName));
        return value;
    }
    if ("string" === typeof value) {
        serializedSize += value.length;
        if ("Z" === value[value.length - 1] && _instanceof(parent[parentPropertyName], Date)) return "$D" + value;
        if (1024 <= value.length && null !== byteLengthOfChunk) return request.pendingChunks++, task = request.nextChunkId++, emitTextChunk(request, task, value, !1), serializeByValueID(task);
        request = "$" === value[0] ? "$" + value : value;
        return request;
    }
    if ("boolean" === typeof value) return value;
    if ("number" === typeof value) return Number.isFinite(value) ? 0 === value && -Infinity === 1 / value ? "$-0" : value : Infinity === value ? "$Infinity" : -Infinity === value ? "$-Infinity" : "$NaN";
    if ("undefined" === typeof value) return "$undefined";
    if ("function" === typeof value) {
        if (value.$$typeof === CLIENT_REFERENCE_TAG$1) return serializeClientReference(request, parent, parentPropertyName, value);
        if (value.$$typeof === SERVER_REFERENCE_TAG) return task = request.writtenServerReferences, parentPropertyName = task.get(value), void 0 !== parentPropertyName ? request = "$h" + parentPropertyName.toString(16) : (parentPropertyName = value.$$bound, parentPropertyName = null === parentPropertyName ? null : Promise.resolve(parentPropertyName), request = outlineModelWithFormatContext(request, {
            id: value.$$id,
            bound: parentPropertyName
        }, 0), task.set(value, request), request = "$h" + request.toString(16)), request;
        if (void 0 !== request.temporaryReferences && (request = request.temporaryReferences.get(value), void 0 !== request)) return "$T" + request;
        if (value.$$typeof === TEMPORARY_REFERENCE_TAG) throw Error("Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server.");
        if (/^on[A-Z]/.test(parentPropertyName)) throw Error("Event handlers cannot be passed to Client Component props." + describeObjectForErrorMessage(parent, parentPropertyName) + "\nIf you need interactivity, consider converting part of this to a Client Component.");
        throw Error('Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.' + describeObjectForErrorMessage(parent, parentPropertyName));
    }
    if ("symbol" === (typeof value === "undefined" ? "undefined" : _type_of(value))) {
        task = request.writtenSymbols;
        elementReference = task.get(value);
        if (void 0 !== elementReference) return serializeByValueID(elementReference);
        elementReference = value.description;
        if (Symbol.for(elementReference) !== value) throw Error("Only global symbols received from Symbol.for(...) can be passed to Client Components. The symbol Symbol.for(" + (value.description + ") cannot be found among global symbols.") + describeObjectForErrorMessage(parent, parentPropertyName));
        request.pendingChunks++;
        parentPropertyName = request.nextChunkId++;
        parent = encodeReferenceChunk(request, parentPropertyName, "$S" + elementReference);
        request.completedImportChunks.push(parent);
        task.set(value, parentPropertyName);
        return serializeByValueID(parentPropertyName);
    }
    if ("bigint" === (typeof value === "undefined" ? "undefined" : _type_of(value))) return "$n" + value.toString(10);
    throw Error("Type " + (typeof value === "undefined" ? "undefined" : _type_of(value)) + " is not supported in Client Component props." + describeObjectForErrorMessage(parent, parentPropertyName));
}
function logRecoverableError(request, error) {
    var prevRequest = currentRequest;
    currentRequest = null;
    try {
        var errorDigest = requestStorage.run(void 0, request.onError, error);
    } finally{
        currentRequest = prevRequest;
    }
    if (null != errorDigest && "string" !== typeof errorDigest) throw Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + (typeof errorDigest === "undefined" ? "undefined" : _type_of(errorDigest)) + '" instead');
    return errorDigest || "";
}
function fatalError(request, error) {
    var onFatalError = request.onFatalError;
    onFatalError(error);
    null !== request.destination ? (request.status = 14, request.destination.destroy(error)) : (request.status = 13, request.fatalError = error);
    request.cacheController.abort(Error("The render was aborted due to a fatal error.", {
        cause: error
    }));
}
function emitErrorChunk(request, id, digest) {
    digest = {
        digest: digest
    };
    id = id.toString(16) + ":E" + stringify(digest) + "\n";
    request.completedErrorChunks.push(id);
}
function emitTypedArrayChunk(request, id, tag, typedArray, debug) {
    debug ? request.pendingDebugChunks++ : request.pendingChunks++;
    typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    debug = typedArray.byteLength;
    id = id.toString(16) + ":" + tag + debug.toString(16) + ",";
    request.completedRegularChunks.push(id, typedArray);
}
function emitTextChunk(request, id, text, debug) {
    if (null === byteLengthOfChunk) throw Error("Existence of byteLengthOfChunk should have already been checked. This is a bug in React.");
    debug ? request.pendingDebugChunks++ : request.pendingChunks++;
    debug = byteLengthOfChunk(text);
    id = id.toString(16) + ":T" + debug.toString(16) + ",";
    request.completedRegularChunks.push(id, text);
}
function emitChunk(request, task, value) {
    var id = task.id;
    "string" === typeof value && null !== byteLengthOfChunk ? emitTextChunk(request, id, value, !1) : _instanceof(value, ArrayBuffer) ? emitTypedArrayChunk(request, id, "A", new Uint8Array(value), !1) : _instanceof(value, Int8Array) ? emitTypedArrayChunk(request, id, "O", value, !1) : _instanceof(value, Uint8Array) ? emitTypedArrayChunk(request, id, "o", value, !1) : _instanceof(value, Uint8ClampedArray) ? emitTypedArrayChunk(request, id, "U", value, !1) : _instanceof(value, Int16Array) ? emitTypedArrayChunk(request, id, "S", value, !1) : _instanceof(value, Uint16Array) ? emitTypedArrayChunk(request, id, "s", value, !1) : _instanceof(value, Int32Array) ? emitTypedArrayChunk(request, id, "L", value, !1) : _instanceof(value, Uint32Array) ? emitTypedArrayChunk(request, id, "l", value, !1) : _instanceof(value, Float32Array) ? emitTypedArrayChunk(request, id, "G", value, !1) : _instanceof(value, Float64Array) ? emitTypedArrayChunk(request, id, "g", value, !1) : _instanceof(value, BigInt64Array) ? emitTypedArrayChunk(request, id, "M", value, !1) : _instanceof(value, BigUint64Array) ? emitTypedArrayChunk(request, id, "m", value, !1) : _instanceof(value, DataView) ? emitTypedArrayChunk(request, id, "V", value, !1) : (value = stringify(value, task.toJSON), task = task.id.toString(16) + ":" + value + "\n", request.completedRegularChunks.push(task));
}
function erroredTask(request, task, error) {
    task.status = 4;
    error = logRecoverableError(request, error, task);
    emitErrorChunk(request, task.id, error);
    request.abortableTasks.delete(task);
    callOnAllReadyIfReady(request);
}
var emptyRoot = {};
function retryTask(request, task) {
    if (0 === task.status) {
        task.status = 5;
        var parentSerializedSize = serializedSize;
        try {
            modelRoot = task.model;
            var resolvedModel = renderModelDestructive(request, task, emptyRoot, "", task.model);
            modelRoot = resolvedModel;
            task.keyPath = null;
            task.implicitSlot = !1;
            if ("object" === (typeof resolvedModel === "undefined" ? "undefined" : _type_of(resolvedModel)) && null !== resolvedModel) request.writtenObjects.set(resolvedModel, serializeByValueID(task.id)), emitChunk(request, task, resolvedModel);
            else {
                var json = stringify(resolvedModel), processedChunk = task.id.toString(16) + ":" + json + "\n";
                request.completedRegularChunks.push(processedChunk);
            }
            task.status = 1;
            request.abortableTasks.delete(task);
            callOnAllReadyIfReady(request);
        } catch (thrownValue) {
            if (12 === request.status) if (request.abortableTasks.delete(task), task.status = 0, 21 === request.type) haltTask(task), finishHaltedTask(task, request);
            else {
                var errorId = request.fatalError;
                abortTask(task);
                finishAbortedTask(task, request, errorId);
            }
            else {
                var x = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue;
                if ("object" === (typeof x === "undefined" ? "undefined" : _type_of(x)) && null !== x && "function" === typeof x.then) {
                    task.status = 0;
                    task.thenableState = getThenableStateAfterSuspending();
                    var ping = task.ping;
                    x.then(ping, ping);
                } else erroredTask(request, task, x);
            }
        } finally{
            serializedSize = parentSerializedSize;
        }
    }
}
function tryStreamTask(request, task) {
    var parentSerializedSize = serializedSize;
    try {
        emitChunk(request, task, task.model);
    } finally{
        serializedSize = parentSerializedSize;
    }
}
function performWork(request) {
    var prevDispatcher = ReactSharedInternalsServer.H;
    ReactSharedInternalsServer.H = HooksDispatcher;
    var prevRequest = currentRequest;
    currentRequest$1 = currentRequest = request;
    try {
        var pingedTasks = request.pingedTasks;
        request.pingedTasks = [];
        for(var i = 0; i < pingedTasks.length; i++)retryTask(request, pingedTasks[i]);
        flushCompletedChunks(request);
    } catch (error) {
        logRecoverableError(request, error, null), fatalError(request, error);
    } finally{
        ReactSharedInternalsServer.H = prevDispatcher, currentRequest$1 = null, currentRequest = prevRequest;
    }
}
function abortTask(task) {
    0 === task.status && (task.status = 3);
}
function finishAbortedTask(task, request, errorId) {
    3 === task.status && (errorId = serializeByValueID(errorId), task = encodeReferenceChunk(request, task.id, errorId), request.completedErrorChunks.push(task));
}
function haltTask(task) {
    0 === task.status && (task.status = 3);
}
function finishHaltedTask(task, request) {
    3 === task.status && request.pendingChunks--;
}
function flushCompletedChunks(request) {
    var destination = request.destination;
    if (null !== destination) {
        currentView = new Uint8Array(4096);
        writtenBytes = 0;
        destinationHasCapacity = !0;
        try {
            for(var importsChunks = request.completedImportChunks, i = 0; i < importsChunks.length; i++)if (request.pendingChunks--, !writeChunkAndReturn(destination, importsChunks[i])) {
                request.destination = null;
                i++;
                break;
            }
            importsChunks.splice(0, i);
            var hintChunks = request.completedHintChunks;
            for(i = 0; i < hintChunks.length; i++)if (!writeChunkAndReturn(destination, hintChunks[i])) {
                request.destination = null;
                i++;
                break;
            }
            hintChunks.splice(0, i);
            var regularChunks = request.completedRegularChunks;
            for(i = 0; i < regularChunks.length; i++)if (request.pendingChunks--, !writeChunkAndReturn(destination, regularChunks[i])) {
                request.destination = null;
                i++;
                break;
            }
            regularChunks.splice(0, i);
            var errorChunks = request.completedErrorChunks;
            for(i = 0; i < errorChunks.length; i++)if (request.pendingChunks--, !writeChunkAndReturn(destination, errorChunks[i])) {
                request.destination = null;
                i++;
                break;
            }
            errorChunks.splice(0, i);
        } finally{
            request.flushScheduled = !1, currentView && 0 < writtenBytes && destination.write(currentView.subarray(0, writtenBytes)), currentView = null, writtenBytes = 0, destinationHasCapacity = !0;
        }
        "function" === typeof destination.flush && destination.flush();
    }
    0 === request.pendingChunks && (12 > request.status && request.cacheController.abort(Error("This render completed successfully. All cacheSignals are now aborted to allow clean up of any unused resources.")), null !== request.destination && (request.status = 14, request.destination.end(), request.destination = null));
}
function startWork(request) {
    request.flushScheduled = null !== request.destination;
    scheduleMicrotask(function() {
        requestStorage.run(request, performWork, request);
    });
    setImmediate(function() {
        10 === request.status && (request.status = 11);
    });
}
function enqueueFlush(request) {
    !1 === request.flushScheduled && 0 === request.pingedTasks.length && null !== request.destination && (request.flushScheduled = !0, setImmediate(function() {
        request.flushScheduled = !1;
        flushCompletedChunks(request);
    }));
}
function callOnAllReadyIfReady(request) {
    0 === request.abortableTasks.size && (request = request.onAllReady, request());
}
function startFlowing(request, destination) {
    if (13 === request.status) request.status = 14, destination.destroy(request.fatalError);
    else if (14 !== request.status && null === request.destination) {
        request.destination = destination;
        try {
            flushCompletedChunks(request);
        } catch (error) {
            logRecoverableError(request, error, null), fatalError(request, error);
        }
    }
}
function finishHalt(request, abortedTasks) {
    try {
        abortedTasks.forEach(function(task) {
            return finishHaltedTask(task, request);
        });
        var onAllReady = request.onAllReady;
        onAllReady();
        flushCompletedChunks(request);
    } catch (error) {
        logRecoverableError(request, error, null), fatalError(request, error);
    }
}
function finishAbort(request, abortedTasks, errorId) {
    try {
        abortedTasks.forEach(function(task) {
            return finishAbortedTask(task, request, errorId);
        });
        var onAllReady = request.onAllReady;
        onAllReady();
        flushCompletedChunks(request);
    } catch (error) {
        logRecoverableError(request, error, null), fatalError(request, error);
    }
}
function abort(request, reason) {
    if (!(11 < request.status)) try {
        request.status = 12;
        request.cacheController.abort(reason);
        var abortableTasks = request.abortableTasks;
        if (0 < abortableTasks.size) if (21 === request.type) abortableTasks.forEach(function(task) {
            return haltTask(task, request);
        }), setImmediate(function() {
            return finishHalt(request, abortableTasks);
        });
        else {
            var error = void 0 === reason ? Error("The render was aborted by the server without a reason.") : "object" === (typeof reason === "undefined" ? "undefined" : _type_of(reason)) && null !== reason && "function" === typeof reason.then ? Error("The render was aborted by the server with a promise.") : reason, digest = logRecoverableError(request, error, null), errorId = request.nextChunkId++;
            request.fatalError = errorId;
            request.pendingChunks++;
            emitErrorChunk(request, errorId, digest, error, !1, null);
            abortableTasks.forEach(function(task) {
                return abortTask(task, request, errorId);
            });
            setImmediate(function() {
                return finishAbort(request, abortableTasks, errorId);
            });
        }
        else {
            var onAllReady = request.onAllReady;
            onAllReady();
            flushCompletedChunks(request);
        }
    } catch (error$26) {
        logRecoverableError(request, error$26, null), fatalError(request, error$26);
    }
}
function resolveServerReference(bundlerConfig, id) {
    var name = "", resolvedModuleData = bundlerConfig[id];
    if (resolvedModuleData) name = resolvedModuleData.name;
    else {
        var idx = id.lastIndexOf("#");
        -1 !== idx && (name = id.slice(idx + 1), resolvedModuleData = bundlerConfig[id.slice(0, idx)]);
        if (!resolvedModuleData) throw Error('Could not find the module "' + id + '" in the React Server Manifest. This is probably a bug in the React Server Components bundler.');
    }
    return resolvedModuleData.async ? [
        resolvedModuleData.id,
        resolvedModuleData.chunks,
        name,
        1
    ] : [
        resolvedModuleData.id,
        resolvedModuleData.chunks,
        name
    ];
}
var chunkCache = new Map();
function requireAsyncModule(id) {
    var promise = __webpack_require__(id);
    if ("function" !== typeof promise.then || "fulfilled" === promise.status) return null;
    promise.then(function(value) {
        promise.status = "fulfilled";
        promise.value = value;
    }, function(reason) {
        promise.status = "rejected";
        promise.reason = reason;
    });
    return promise;
}
function ignoreReject() {}
function preloadModule(metadata) {
    for(var chunks = metadata[1], promises = [], i = 0; i < chunks.length;){
        var chunkId = chunks[i++];
        chunks[i++];
        var entry = chunkCache.get(chunkId);
        if (void 0 === entry) {
            entry = __webpack_require__.e(chunkId);
            promises.push(entry);
            var resolve = chunkCache.set.bind(chunkCache, chunkId, null);
            entry.then(resolve, ignoreReject);
            chunkCache.set(chunkId, entry);
        } else null !== entry && promises.push(entry);
    }
    return 4 === metadata.length ? 0 === promises.length ? requireAsyncModule(metadata[0]) : Promise.all(promises).then(function() {
        return requireAsyncModule(metadata[0]);
    }) : 0 < promises.length ? Promise.all(promises) : null;
}
function requireModule(metadata) {
    var moduleExports = __webpack_require__(metadata[0]);
    if (4 === metadata.length && "function" === typeof moduleExports.then) if ("fulfilled" === moduleExports.status) moduleExports = moduleExports.value;
    else throw moduleExports.reason;
    if ("*" === metadata[2]) return moduleExports;
    if ("" === metadata[2]) return moduleExports.__esModule ? moduleExports.default : moduleExports;
    if (hasOwnProperty.call(moduleExports, metadata[2])) return moduleExports[metadata[2]];
}
var RESPONSE_SYMBOL = Symbol();
function ReactPromise(status, value, reason) {
    this.status = status;
    this.value = value;
    this.reason = reason;
}
ReactPromise.prototype = Object.create(Promise.prototype);
ReactPromise.prototype.then = function(resolve, reject) {
    switch(this.status){
        case "resolved_model":
            initializeModelChunk(this);
    }
    switch(this.status){
        case "fulfilled":
            if ("function" === typeof resolve) {
                for(var inspectedValue = this.value, cycleProtection = 0, visited = new Set(); _instanceof(inspectedValue, ReactPromise);){
                    cycleProtection++;
                    if (inspectedValue === this || visited.has(inspectedValue) || 1e3 < cycleProtection) {
                        "function" === typeof reject && reject(Error("Cannot have cyclic thenables."));
                        return;
                    }
                    visited.add(inspectedValue);
                    if ("fulfilled" === inspectedValue.status) inspectedValue = inspectedValue.value;
                    else break;
                }
                resolve(this.value);
            }
            break;
        case "pending":
        case "blocked":
            "function" === typeof resolve && (null === this.value && (this.value = []), this.value.push(resolve));
            "function" === typeof reject && (null === this.reason && (this.reason = []), this.reason.push(reject));
            break;
        default:
            "function" === typeof reject && reject(this.reason);
    }
};
var ObjectPrototype = Object.prototype, ArrayPrototype = Array.prototype;
function wakeChunk(response, listeners, value) {
    for(var i = 0; i < listeners.length; i++){
        var listener = listeners[i];
        "function" === typeof listener ? listener(value) : fulfillReference(response, listener, value);
    }
}
function rejectChunk(response, listeners, error) {
    for(var i = 0; i < listeners.length; i++){
        var listener = listeners[i];
        "function" === typeof listener ? listener(error) : rejectReference(response, listener.handler, error);
    }
}
function resolveBlockedCycle(resolvedChunk, reference) {
    var referencedChunk = reference.handler.chunk;
    if (null === referencedChunk) return null;
    if (referencedChunk === resolvedChunk) return reference.handler;
    reference = referencedChunk.value;
    if (null !== reference) for(referencedChunk = 0; referencedChunk < reference.length; referencedChunk++){
        var listener = reference[referencedChunk];
        if ("function" !== typeof listener && (listener = resolveBlockedCycle(resolvedChunk, listener), null !== listener)) return listener;
    }
    return null;
}
function triggerErrorOnChunk(response, chunk, error) {
    if ("pending" !== chunk.status && "blocked" !== chunk.status) chunk.reason.error(error);
    else {
        var listeners = chunk.reason;
        chunk.status = "rejected";
        chunk.reason = error;
        null !== listeners && rejectChunk(response, listeners, error);
    }
}
function createResolvedModelChunk(response, value, id) {
    var $jscomp$compprop2 = {};
    return new ReactPromise("resolved_model", value, ($jscomp$compprop2.id = id, $jscomp$compprop2[RESPONSE_SYMBOL] = response, $jscomp$compprop2));
}
function resolveModelChunk(response, chunk, value, id) {
    if ("pending" !== chunk.status) chunk = chunk.reason, "C" === value[0] ? chunk.close("C" === value ? '"$undefined"' : value.slice(1)) : chunk.enqueueModel(value);
    else {
        var resolveListeners = chunk.value, rejectListeners = chunk.reason;
        chunk.status = "resolved_model";
        chunk.value = value;
        value = {};
        chunk.reason = (value.id = id, value[RESPONSE_SYMBOL] = response, value);
        if (null !== resolveListeners) a: switch(initializeModelChunk(chunk), chunk.status){
            case "fulfilled":
                wakeChunk(response, resolveListeners, chunk.value);
                break;
            case "blocked":
                for(value = 0; value < resolveListeners.length; value++)if (id = resolveListeners[value], "function" !== typeof id) {
                    var cyclicHandler = resolveBlockedCycle(chunk, id);
                    if (null !== cyclicHandler) switch(fulfillReference(response, id, cyclicHandler.value), resolveListeners.splice(value, 1), value--, null !== rejectListeners && (id = rejectListeners.indexOf(id), -1 !== id && rejectListeners.splice(id, 1)), chunk.status){
                        case "fulfilled":
                            wakeChunk(response, resolveListeners, chunk.value);
                            break a;
                        case "rejected":
                            null !== rejectListeners && rejectChunk(response, rejectListeners, chunk.reason);
                            break a;
                    }
                }
            case "pending":
                if (chunk.value) for(response = 0; response < resolveListeners.length; response++)chunk.value.push(resolveListeners[response]);
                else chunk.value = resolveListeners;
                if (chunk.reason) {
                    if (rejectListeners) for(resolveListeners = 0; resolveListeners < rejectListeners.length; resolveListeners++)chunk.reason.push(rejectListeners[resolveListeners]);
                } else chunk.reason = rejectListeners;
                break;
            case "rejected":
                rejectListeners && wakeChunk(response, rejectListeners, chunk.reason);
        }
    }
}
function createResolvedIteratorResultChunk(response, value, done) {
    var $jscomp$compprop4 = {};
    return new ReactPromise("resolved_model", (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}", ($jscomp$compprop4.id = -1, $jscomp$compprop4[RESPONSE_SYMBOL] = response, $jscomp$compprop4));
}
function resolveIteratorResultChunk(response, chunk, value, done) {
    resolveModelChunk(response, chunk, (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}", -1);
}
function loadServerReference$1(response, metaData, parentObject, key) {
    var id = metaData.id;
    if ("string" !== typeof id || "then" === key) return null;
    var serverReference = resolveServerReference(response._bundlerConfig, id);
    id = metaData.bound;
    var promise = preloadModule(serverReference);
    if (promise) _instanceof(id, ReactPromise) && (promise = Promise.all([
        promise,
        id
    ]));
    else if (_instanceof(id, ReactPromise)) promise = Promise.resolve(id);
    else return requireModule(serverReference);
    if (initializingHandler) {
        var handler = initializingHandler;
        handler.deps++;
    } else handler = initializingHandler = {
        chunk: null,
        value: null,
        reason: null,
        deps: 1,
        errored: !1
    };
    promise.then(function() {
        var resolvedValue = requireModule(serverReference);
        if (metaData.bound) {
            var promiseValue = metaData.bound.value;
            promiseValue = Array.isArray(promiseValue) ? promiseValue.slice(0) : [];
            promiseValue.unshift(null);
            resolvedValue = resolvedValue.bind.apply(resolvedValue, promiseValue);
        }
        parentObject[key] = resolvedValue;
        "" === key && null === handler.value && (handler.value = resolvedValue);
        handler.deps--;
        0 === handler.deps && (resolvedValue = handler.chunk, null !== resolvedValue && "blocked" === resolvedValue.status && (promiseValue = resolvedValue.value, resolvedValue.status = "fulfilled", resolvedValue.value = handler.value, resolvedValue.reason = null, null !== promiseValue && wakeChunk(response, promiseValue, handler.value)));
    }, function(error) {
        if (!handler.errored) {
            handler.errored = !0;
            handler.value = null;
            handler.reason = error;
            var chunk = handler.chunk;
            null !== chunk && "blocked" === chunk.status && triggerErrorOnChunk(response, chunk, error);
        }
    });
    return null;
}
function reviveModel(response, parentObj, parentKey, value, reference) {
    if ("string" === typeof value) return parseModelString(response, parentObj, parentKey, value, reference);
    if ("object" === (typeof value === "undefined" ? "undefined" : _type_of(value)) && null !== value) if (void 0 !== reference && void 0 !== response._temporaryReferences && response._temporaryReferences.set(value, reference), Array.isArray(value)) for(var i = 0; i < value.length; i++)value[i] = reviveModel(response, value, "" + i, value[i], void 0 !== reference ? reference + ":" + i : void 0);
    else for(i in value)hasOwnProperty.call(value, i) && (parentObj = void 0 !== reference && -1 === i.indexOf(":") ? reference + ":" + i : void 0, parentObj = reviveModel(response, value, i, value[i], parentObj), void 0 !== parentObj || "__proto__" === i ? value[i] = parentObj : delete value[i]);
    return value;
}
var initializingHandler = null;
function initializeModelChunk(chunk) {
    var prevHandler = initializingHandler;
    initializingHandler = null;
    var _chunk$reason = chunk.reason, response = _chunk$reason[RESPONSE_SYMBOL];
    _chunk$reason = _chunk$reason.id;
    _chunk$reason = -1 === _chunk$reason ? void 0 : _chunk$reason.toString(16);
    var resolvedModel = chunk.value;
    chunk.status = "blocked";
    chunk.value = null;
    chunk.reason = null;
    try {
        var rawModel = JSON.parse(resolvedModel), value = reviveModel(response, {
            "": rawModel
        }, "", rawModel, _chunk$reason), resolveListeners = chunk.value;
        if (null !== resolveListeners) for(chunk.value = null, chunk.reason = null, rawModel = 0; rawModel < resolveListeners.length; rawModel++){
            var listener = resolveListeners[rawModel];
            "function" === typeof listener ? listener(value) : fulfillReference(response, listener, value);
        }
        if (null !== initializingHandler) {
            if (initializingHandler.errored) throw initializingHandler.reason;
            if (0 < initializingHandler.deps) {
                initializingHandler.value = value;
                initializingHandler.chunk = chunk;
                return;
            }
        }
        chunk.status = "fulfilled";
        chunk.value = value;
        chunk.reason = null;
    } catch (error) {
        chunk.status = "rejected", chunk.reason = error;
    } finally{
        initializingHandler = prevHandler;
    }
}
function reportGlobalError(response, error) {
    response._closed = !0;
    response._closedReason = error;
    response._chunks.forEach(function(chunk) {
        "pending" === chunk.status ? triggerErrorOnChunk(response, chunk, error) : "fulfilled" === chunk.status && null !== chunk.reason && chunk.reason.error(error);
    });
}
function getChunk(response, id) {
    var chunks = response._chunks, chunk = chunks.get(id);
    chunk || (chunk = response._formData.get(response._prefix + id), chunk = "string" === typeof chunk ? createResolvedModelChunk(response, chunk, id) : response._closed ? new ReactPromise("rejected", null, response._closedReason) : new ReactPromise("pending", null, null), chunks.set(id, chunk));
    return chunk;
}
function fulfillReference(response, reference, value) {
    var handler = reference.handler, parentObject = reference.parentObject, key = reference.key, map = reference.map, path = reference.path;
    try {
        for(var i = 1; i < path.length; i++){
            var name = path[i];
            if ("object" !== (typeof value === "undefined" ? "undefined" : _type_of(value)) || null === value || getPrototypeOf(value) !== ObjectPrototype && getPrototypeOf(value) !== ArrayPrototype || !hasOwnProperty.call(value, name)) throw Error("Invalid reference.");
            value = value[name];
        }
        var mappedValue = map(response, value, parentObject, key);
        parentObject[key] = mappedValue;
        "" === key && null === handler.value && (handler.value = mappedValue);
    } catch (error) {
        rejectReference(response, reference.handler, error);
        return;
    }
    handler.deps--;
    0 === handler.deps && (reference = handler.chunk, null !== reference && "blocked" === reference.status && (value = reference.value, reference.status = "fulfilled", reference.value = handler.value, reference.reason = handler.reason, null !== value && wakeChunk(response, value, handler.value)));
}
function rejectReference(response, handler, error) {
    handler.errored || (handler.errored = !0, handler.value = null, handler.reason = error, handler = handler.chunk, null !== handler && "blocked" === handler.status && triggerErrorOnChunk(response, handler, error));
}
function getOutlinedModel(response, reference, parentObject, key, map) {
    reference = reference.split(":");
    var id = parseInt(reference[0], 16);
    id = getChunk(response, id);
    switch(id.status){
        case "resolved_model":
            initializeModelChunk(id);
    }
    switch(id.status){
        case "fulfilled":
            id = id.value;
            for(var i = 1; i < reference.length; i++){
                var name = reference[i];
                if ("object" !== (typeof id === "undefined" ? "undefined" : _type_of(id)) || null === id || getPrototypeOf(id) !== ObjectPrototype && getPrototypeOf(id) !== ArrayPrototype || !hasOwnProperty.call(id, name)) throw Error("Invalid reference.");
                id = id[name];
            }
            return map(response, id, parentObject, key);
        case "pending":
        case "blocked":
            return initializingHandler ? (response = initializingHandler, response.deps++) : response = initializingHandler = {
                chunk: null,
                value: null,
                reason: null,
                deps: 1,
                errored: !1
            }, parentObject = {
                handler: response,
                parentObject: parentObject,
                key: key,
                map: map,
                path: reference
            }, null === id.value ? id.value = [
                parentObject
            ] : id.value.push(parentObject), null === id.reason ? id.reason = [
                parentObject
            ] : id.reason.push(parentObject), null;
        default:
            return initializingHandler ? (initializingHandler.errored = !0, initializingHandler.value = null, initializingHandler.reason = id.reason) : initializingHandler = {
                chunk: null,
                value: null,
                reason: id.reason,
                deps: 0,
                errored: !0
            }, null;
    }
}
function createMap(response, model) {
    return new Map(model);
}
function createSet(response, model) {
    return new Set(model);
}
function extractIterator(response, model) {
    return model[Symbol.iterator]();
}
function createModel(response, model, parentObject, key) {
    return "then" === key && "function" === typeof model ? null : model;
}
function parseTypedArray(response, reference, constructor, bytesPerElement, parentObject, parentKey) {
    reference = parseInt(reference.slice(2), 16);
    bytesPerElement = response._prefix + reference;
    if (response._chunks.has(reference)) throw Error("Already initialized typed array.");
    reference = response._formData.get(bytesPerElement).arrayBuffer();
    if (initializingHandler) {
        var handler = initializingHandler;
        handler.deps++;
    } else handler = initializingHandler = {
        chunk: null,
        value: null,
        reason: null,
        deps: 1,
        errored: !1
    };
    reference.then(function(buffer) {
        buffer = constructor === ArrayBuffer ? buffer : new constructor(buffer);
        parentObject[parentKey] = buffer;
        "" === parentKey && null === handler.value && (handler.value = buffer);
        handler.deps--;
        if (0 === handler.deps && (buffer = handler.chunk, null !== buffer && "blocked" === buffer.status)) {
            var resolveListeners = buffer.value;
            buffer.status = "fulfilled";
            buffer.value = handler.value;
            buffer.reason = null;
            null !== resolveListeners && wakeChunk(response, resolveListeners, handler.value);
        }
    }, function(error) {
        if (!handler.errored) {
            handler.errored = !0;
            handler.value = null;
            handler.reason = error;
            var chunk = handler.chunk;
            null !== chunk && "blocked" === chunk.status && triggerErrorOnChunk(response, chunk, error);
        }
    });
    return null;
}
function resolveStream(response, id, stream, controller) {
    var chunks = response._chunks;
    stream = new ReactPromise("fulfilled", stream, controller);
    chunks.set(id, stream);
    response = response._formData.getAll(response._prefix + id);
    for(id = 0; id < response.length; id++)chunks = response[id], "string" === typeof chunks && ("C" === chunks[0] ? controller.close("C" === chunks ? '"$undefined"' : chunks.slice(1)) : controller.enqueueModel(chunks));
}
function parseReadableStream(response, reference, type) {
    reference = parseInt(reference.slice(2), 16);
    if (response._chunks.has(reference)) throw Error("Already initialized stream.");
    var controller = null, closed = !1;
    type = new ReadableStream({
        type: type,
        start: function start(c) {
            controller = c;
        }
    });
    var previousBlockedChunk = null;
    resolveStream(response, reference, type, {
        enqueueModel: function enqueueModel(json) {
            if (null === previousBlockedChunk) {
                var chunk = createResolvedModelChunk(response, json, -1);
                initializeModelChunk(chunk);
                "fulfilled" === chunk.status ? controller.enqueue(chunk.value) : (chunk.then(function(v) {
                    return controller.enqueue(v);
                }, function(e) {
                    return controller.error(e);
                }), previousBlockedChunk = chunk);
            } else {
                chunk = previousBlockedChunk;
                var chunk$30 = new ReactPromise("pending", null, null);
                chunk$30.then(function(v) {
                    return controller.enqueue(v);
                }, function(e) {
                    return controller.error(e);
                });
                previousBlockedChunk = chunk$30;
                chunk.then(function() {
                    previousBlockedChunk === chunk$30 && (previousBlockedChunk = null);
                    resolveModelChunk(response, chunk$30, json, -1);
                });
            }
        },
        close: function close() {
            if (!closed) if (closed = !0, null === previousBlockedChunk) controller.close();
            else {
                var blockedChunk = previousBlockedChunk;
                previousBlockedChunk = null;
                blockedChunk.then(function() {
                    return controller.close();
                });
            }
        },
        error: function error(error) {
            if (!closed) if (closed = !0, null === previousBlockedChunk) controller.error(error);
            else {
                var blockedChunk = previousBlockedChunk;
                previousBlockedChunk = null;
                blockedChunk.then(function() {
                    return controller.error(error);
                });
            }
        }
    });
    return type;
}
function asyncIterator() {
    return this;
}
function createIterator(next) {
    next = {
        next: next
    };
    next[ASYNC_ITERATOR] = asyncIterator;
    return next;
}
function parseAsyncIterable(response, reference, iterator) {
    reference = parseInt(reference.slice(2), 16);
    if (response._chunks.has(reference)) throw Error("Already initialized stream.");
    var buffer = [], closed = !1, nextWriteIndex = 0, $jscomp$compprop5 = {};
    $jscomp$compprop5 = ($jscomp$compprop5[ASYNC_ITERATOR] = function() {
        var nextReadIndex = 0;
        return createIterator(function(arg) {
            if (void 0 !== arg) throw Error("Values cannot be passed to next() of AsyncIterables passed to Client Components.");
            if (nextReadIndex === buffer.length) {
                if (closed) return new ReactPromise("fulfilled", {
                    done: !0,
                    value: void 0
                }, null);
                buffer[nextReadIndex] = new ReactPromise("pending", null, null);
            }
            return buffer[nextReadIndex++];
        });
    }, $jscomp$compprop5);
    iterator = iterator ? $jscomp$compprop5[ASYNC_ITERATOR]() : $jscomp$compprop5;
    resolveStream(response, reference, iterator, {
        enqueueModel: function enqueueModel(value) {
            nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(response, value, !1) : resolveIteratorResultChunk(response, buffer[nextWriteIndex], value, !1);
            nextWriteIndex++;
        },
        close: function close(value) {
            if (!closed) for(closed = !0, nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(response, value, !0) : resolveIteratorResultChunk(response, buffer[nextWriteIndex], value, !0), nextWriteIndex++; nextWriteIndex < buffer.length;)resolveIteratorResultChunk(response, buffer[nextWriteIndex++], '"$undefined"', !0);
        },
        error: function error(_error) {
            if (!closed) for(closed = !0, nextWriteIndex === buffer.length && (buffer[nextWriteIndex] = new ReactPromise("pending", null, null)); nextWriteIndex < buffer.length;)triggerErrorOnChunk(response, buffer[nextWriteIndex++], _error);
        }
    });
    return iterator;
}
function parseModelString(response, obj, key, value, reference) {
    if ("$" === value[0]) {
        switch(value[1]){
            case "$":
                return value.slice(1);
            case "@":
                return obj = parseInt(value.slice(2), 16), getChunk(response, obj);
            case "h":
                return value = value.slice(2), getOutlinedModel(response, value, obj, key, loadServerReference$1);
            case "T":
                if (void 0 === reference || void 0 === response._temporaryReferences) throw Error("Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server.");
                return createTemporaryReference(response._temporaryReferences, reference);
            case "Q":
                return value = value.slice(2), getOutlinedModel(response, value, obj, key, createMap);
            case "W":
                return value = value.slice(2), getOutlinedModel(response, value, obj, key, createSet);
            case "K":
                obj = value.slice(2);
                var formPrefix = response._prefix + obj + "_", data = new FormData();
                response._formData.forEach(function(entry, entryKey) {
                    entryKey.startsWith(formPrefix) && data.append(entryKey.slice(formPrefix.length), entry);
                });
                return data;
            case "i":
                return value = value.slice(2), getOutlinedModel(response, value, obj, key, extractIterator);
            case "I":
                return Infinity;
            case "-":
                return "$-0" === value ? -0 : -Infinity;
            case "N":
                return NaN;
            case "u":
                return;
            case "D":
                return new Date(Date.parse(value.slice(2)));
            case "n":
                return BigInt(value.slice(2));
        }
        switch(value[1]){
            case "A":
                return parseTypedArray(response, value, ArrayBuffer, 1, obj, key);
            case "O":
                return parseTypedArray(response, value, Int8Array, 1, obj, key);
            case "o":
                return parseTypedArray(response, value, Uint8Array, 1, obj, key);
            case "U":
                return parseTypedArray(response, value, Uint8ClampedArray, 1, obj, key);
            case "S":
                return parseTypedArray(response, value, Int16Array, 2, obj, key);
            case "s":
                return parseTypedArray(response, value, Uint16Array, 2, obj, key);
            case "L":
                return parseTypedArray(response, value, Int32Array, 4, obj, key);
            case "l":
                return parseTypedArray(response, value, Uint32Array, 4, obj, key);
            case "G":
                return parseTypedArray(response, value, Float32Array, 4, obj, key);
            case "g":
                return parseTypedArray(response, value, Float64Array, 8, obj, key);
            case "M":
                return parseTypedArray(response, value, BigInt64Array, 8, obj, key);
            case "m":
                return parseTypedArray(response, value, BigUint64Array, 8, obj, key);
            case "V":
                return parseTypedArray(response, value, DataView, 1, obj, key);
            case "B":
                return obj = parseInt(value.slice(2), 16), response._formData.get(response._prefix + obj);
        }
        switch(value[1]){
            case "R":
                return parseReadableStream(response, value, void 0);
            case "r":
                return parseReadableStream(response, value, "bytes");
            case "X":
                return parseAsyncIterable(response, value, !1);
            case "x":
                return parseAsyncIterable(response, value, !0);
        }
        value = value.slice(1);
        return getOutlinedModel(response, value, obj, key, createModel);
    }
    return value;
}
function createResponse(bundlerConfig, formFieldPrefix, temporaryReferences) {
    var backingFormData = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : new FormData(), chunks = new Map();
    return {
        _bundlerConfig: bundlerConfig,
        _prefix: formFieldPrefix,
        _formData: backingFormData,
        _chunks: chunks,
        _closed: !1,
        _closedReason: null,
        _temporaryReferences: temporaryReferences
    };
}
function resolveField(response, key, value) {
    response._formData.append(key, value);
    var prefix = response._prefix;
    if (key.startsWith(prefix)) {
        var chunks = response._chunks;
        key = +key.slice(prefix.length);
        (chunks = chunks.get(key)) && resolveModelChunk(response, chunks, value, key);
    }
}
function close(response) {
    reportGlobalError(response, Error("Connection closed."));
}
function loadServerReference(bundlerConfig, id, bound) {
    var serverReference = resolveServerReference(bundlerConfig, id);
    bundlerConfig = preloadModule(serverReference);
    return bound ? Promise.all([
        bound,
        bundlerConfig
    ]).then(function(_ref) {
        _ref = _ref[0];
        var fn = requireModule(serverReference);
        return fn.bind.apply(fn, [
            null
        ].concat(_ref));
    }) : bundlerConfig ? Promise.resolve(bundlerConfig).then(function() {
        return requireModule(serverReference);
    }) : Promise.resolve(requireModule(serverReference));
}
function decodeBoundActionMetaData(body, serverManifest, formFieldPrefix) {
    body = createResponse(serverManifest, formFieldPrefix, void 0, body);
    close(body);
    body = getChunk(body, 0);
    body.then(function() {});
    if ("fulfilled" !== body.status) throw body.reason;
    return body.value;
}
function createDrainHandler(destination, request) {
    return function() {
        return startFlowing(request, destination);
    };
}
function createCancelHandler(request, reason) {
    return function() {
        request.destination = null;
        abort(request, Error(reason));
    };
}
function createFakeWritableFromReadableStreamController(controller) {
    return {
        write: function write(chunk) {
            "string" === typeof chunk && (chunk = textEncoder.encode(chunk));
            controller.enqueue(chunk);
            return !0;
        },
        end: function end() {
            controller.close();
        },
        destroy: function destroy(error) {
            "function" === typeof controller.error ? controller.error(error) : controller.close();
        }
    };
}
function createFakeWritableFromNodeReadable(readable) {
    return {
        write: function write(chunk) {
            return readable.push(chunk);
        },
        end: function end() {
            readable.push(null);
        },
        destroy: function destroy(error) {
            readable.destroy(error);
        }
    };
}
exports.createServerEntry = function(value, resource) {
    var entryJsFiles = __webpack_require__.rscM.entryJsFiles || [], entryCssFiles = __webpack_require__.rscM.entryCssFiles[resource] || [];
    ("function" === typeof value || "object" === (typeof value === "undefined" ? "undefined" : _type_of(value)) && null !== value) && assign(value, {
        resource: resource,
        entryJsFiles: entryJsFiles,
        entryCssFiles: entryCssFiles
    });
    return value;
};
exports.createTemporaryReferenceSet = function() {
    return new WeakMap();
};
exports.decodeAction = function(body, serverManifest) {
    var formData = new FormData(), action = null;
    body.forEach(function(value, key) {
        key.startsWith("$ACTION_") ? key.startsWith("$ACTION_REF_") ? (value = "$ACTION_" + key.slice(12) + ":", value = decodeBoundActionMetaData(body, serverManifest, value), action = loadServerReference(serverManifest, value.id, value.bound)) : key.startsWith("$ACTION_ID_") && (value = key.slice(11), action = loadServerReference(serverManifest, value, null)) : formData.append(key, value);
    });
    return null === action ? null : action.then(function(fn) {
        return fn.bind(null, formData);
    });
};
exports.decodeFormState = function(actionResult, body, serverManifest) {
    var keyPath = body.get("$ACTION_KEY");
    if ("string" !== typeof keyPath) return Promise.resolve(null);
    var metaData = null;
    body.forEach(function(value, key) {
        key.startsWith("$ACTION_REF_") && (value = "$ACTION_" + key.slice(12) + ":", metaData = decodeBoundActionMetaData(body, serverManifest, value));
    });
    if (null === metaData) return Promise.resolve(null);
    var referenceId = metaData.id;
    return Promise.resolve(metaData.bound).then(function(bound) {
        return null === bound ? null : [
            actionResult,
            keyPath,
            referenceId,
            bound.length - 1
        ];
    });
};
exports.decodeReply = function(body, options) {
    if ("string" === typeof body) {
        var form = new FormData();
        form.append("0", body);
        body = form;
    }
    body = createResponse(__webpack_require__.rscM.serverManifest, "", options ? options.temporaryReferences : void 0, body);
    options = getChunk(body, 0);
    close(body);
    return options;
};
exports.decodeReplyFromAsyncIterable = function(iterable, options) {
    function progress(entry) {
        if (entry.done) close(response);
        else {
            var _entry$value = entry.value;
            entry = _entry$value[0];
            _entry$value = _entry$value[1];
            "string" === typeof _entry$value ? resolveField(response, entry, _entry$value) : response._formData.append(entry, _entry$value);
            iterator.next().then(progress, error);
        }
    }
    function error(reason) {
        reportGlobalError(response, reason);
        "function" === typeof iterator.throw && iterator.throw(reason).then(error, error);
    }
    var iterator = iterable[ASYNC_ITERATOR](), response = createResponse(__webpack_require__.rscM.serverManifest, "", options ? options.temporaryReferences : void 0);
    iterator.next().then(progress, error);
    return getChunk(response, 0);
};
exports.decodeReplyFromBusboy = function(busboyStream, options) {
    var response = createResponse(__webpack_require__.rscM.serverManifest, "", options ? options.temporaryReferences : void 0), pendingFiles = 0, queuedFields = [];
    busboyStream.on("field", function(name, value) {
        if (0 < pendingFiles) queuedFields.push(name, value);
        else try {
            resolveField(response, name, value);
        } catch (error) {
            busboyStream.destroy(error);
        }
    });
    busboyStream.on("file", function(name, value, _ref2) {
        var filename = _ref2.filename, mimeType = _ref2.mimeType;
        if ("base64" === _ref2.encoding.toLowerCase()) busboyStream.destroy(Error("React doesn't accept base64 encoded file uploads because we don't expect form data passed from a browser to ever encode data that way. If that's the wrong assumption, we can easily fix it."));
        else {
            pendingFiles++;
            var JSCompiler_object_inline_chunks_291 = [];
            value.on("data", function(chunk) {
                JSCompiler_object_inline_chunks_291.push(chunk);
            });
            value.on("end", function() {
                try {
                    var blob = new Blob(JSCompiler_object_inline_chunks_291, {
                        type: mimeType
                    });
                    response._formData.append(name, blob, filename);
                    pendingFiles--;
                    if (0 === pendingFiles) {
                        for(blob = 0; blob < queuedFields.length; blob += 2)resolveField(response, queuedFields[blob], queuedFields[blob + 1]);
                        queuedFields.length = 0;
                    }
                } catch (error) {
                    busboyStream.destroy(error);
                }
            });
        }
    });
    busboyStream.on("finish", function() {
        close(response);
    });
    busboyStream.on("error", function(err) {
        reportGlobalError(response, err);
    });
    return getChunk(response, 0);
};
exports.decryptServerActionBoundArgs = function(actionId, encryptedPromise) {
    return currentStrategy.decrypt(actionId, encryptedPromise);
};
exports.encryptServerActionBoundArgs = function(actionId) {
    for(var _currentStrategy, _len2 = arguments.length, args = Array(1 < _len2 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++)args[_key2 - 1] = arguments[_key2];
    return (_currentStrategy = currentStrategy).encrypt.apply(_currentStrategy, [
        actionId
    ].concat(args));
};
exports.ensureServerActions = function(actions) {
    for(var i = 0; i < actions.length; i++){
        var action = actions[i];
        if ("function" !== typeof action) throw Error('A "use server" file can only export async functions, found ' + (typeof action === "undefined" ? "undefined" : _type_of(action)) + ".");
    }
};
exports.loadServerAction = function(actionId) {
    var actionModId = __webpack_require__.rscM.serverManifest[actionId].id;
    if (!actionModId) throw Error('Failed to find Server Action "' + actionId + '". This request might be from an older or newer deployment.');
    actionId = __webpack_require__(actionModId)[actionId];
    if ("function" !== typeof actionId) throw Error("Server actions must be functions");
    return actionId;
};
exports.prerender = function(model, options) {
    return new Promise(function(resolve, reject) {
        var request = new RequestInstance(21, model, __webpack_require__.rscM.clientManifest, options ? options.onError : void 0, function() {
            var writable, stream = new ReadableStream({
                type: "bytes",
                start: function start(controller) {
                    writable = createFakeWritableFromReadableStreamController(controller);
                },
                pull: function pull() {
                    startFlowing(request, writable);
                },
                cancel: function cancel(reason) {
                    request.destination = null;
                    abort(request, reason);
                }
            }, {
                highWaterMark: 0
            });
            resolve({
                prelude: stream
            });
        }, reject, options ? options.identifierPrefix : void 0, options ? options.temporaryReferences : void 0);
        if (options && options.signal) {
            var signal = options.signal;
            if (signal.aborted) abort(request, signal.reason);
            else {
                var listener = function listener1() {
                    abort(request, signal.reason);
                    signal.removeEventListener("abort", listener);
                };
                signal.addEventListener("abort", listener);
            }
        }
        startWork(request);
    });
};
exports.prerenderToNodeStream = function(model, options) {
    return new Promise(function(resolve, reject) {
        var request = new RequestInstance(21, model, __webpack_require__.rscM.clientManifest, options ? options.onError : void 0, function() {
            var readable = new stream.Readable({
                read: function read() {
                    startFlowing(request, writable);
                }
            }), writable = createFakeWritableFromNodeReadable(readable);
            resolve({
                prelude: readable
            });
        }, reject, options ? options.identifierPrefix : void 0, options ? options.temporaryReferences : void 0);
        if (options && options.signal) {
            var signal = options.signal;
            if (signal.aborted) abort(request, signal.reason);
            else {
                var listener = function listener1() {
                    abort(request, signal.reason);
                    signal.removeEventListener("abort", listener);
                };
                signal.addEventListener("abort", listener);
            }
        }
        startWork(request);
    });
};
exports.registerClientReference = function(proxyImplementation, id, exportName) {
    return Object.defineProperties(proxyImplementation, {
        $$typeof: {
            value: CLIENT_REFERENCE_TAG$1
        },
        $$id: {
            value: id + "#" + exportName
        },
        $$async: {
            value: !1
        }
    });
};
exports.registerServerReference = function(reference, id, exportName) {
    return Object.defineProperties(reference, {
        $$typeof: {
            value: SERVER_REFERENCE_TAG
        },
        $$id: {
            value: null === exportName ? id : id + "#" + exportName,
            configurable: !0
        },
        $$bound: {
            value: null,
            configurable: !0
        },
        bind: {
            value: bind,
            configurable: !0
        },
        toString: serverReferenceToString
    });
};
exports.renderToPipeableStream = function(model, options) {
    var request = new RequestInstance(20, model, __webpack_require__.rscM.clientManifest, options ? options.onError : void 0, noop, noop, options ? options.identifierPrefix : void 0, options ? options.temporaryReferences : void 0), hasStartedFlowing = !1;
    startWork(request);
    return {
        pipe: function pipe(destination) {
            if (hasStartedFlowing) throw Error("React currently only supports piping to one writable stream.");
            hasStartedFlowing = !0;
            startFlowing(request, destination);
            destination.on("drain", createDrainHandler(destination, request));
            destination.on("error", createCancelHandler(request, "The destination stream errored while writing data."));
            destination.on("close", createCancelHandler(request, "The destination stream closed early."));
            return destination;
        },
        abort: function abort1(reason) {
            abort(request, reason);
        }
    };
};
exports.renderToReadableStream = function(model, options) {
    var request = new RequestInstance(20, model, __webpack_require__.rscM.clientManifest, options ? options.onError : void 0, noop, noop, options ? options.identifierPrefix : void 0, options ? options.temporaryReferences : void 0);
    if (options && options.signal) {
        var signal = options.signal;
        if (signal.aborted) abort(request, signal.reason);
        else {
            var listener = function listener1() {
                abort(request, signal.reason);
                signal.removeEventListener("abort", listener);
            };
            signal.addEventListener("abort", listener);
        }
    }
    var writable;
    return new ReadableStream({
        type: "bytes",
        start: function start(controller) {
            writable = createFakeWritableFromReadableStreamController(controller);
            startWork(request);
        },
        pull: function pull() {
            startFlowing(request, writable);
        },
        cancel: function cancel(reason) {
            request.destination = null;
            abort(request, reason);
        }
    }, {
        highWaterMark: 0
    });
};
exports.setServerActionBoundArgsEncryption = function(strategy) {
    currentStrategy = strategy;
};


},
3693
/*!*************************************************************!*\
  !*** ./node_modules/react-server-dom-rspack/client.node.js ***!
  \*************************************************************/
(module, __unused_rspack_exports, __webpack_require__) {
"use strict";

if (true) {
    module.exports = __webpack_require__(/*! ./cjs/react-server-dom-rspack-client.node.production.js */ 9615);
} else {}


},
9261
/*!*************************************************************!*\
  !*** ./node_modules/react-server-dom-rspack/server.node.js ***!
  \*************************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";

var s;
if (true) {
    s = __webpack_require__(/*! ./cjs/react-server-dom-rspack-server.node.production.js */ 6735);
} else {}
exports.renderToReadableStream = s.renderToReadableStream;
exports.renderToPipeableStream = s.renderToPipeableStream;
exports.decodeReply = s.decodeReply;
exports.decodeReplyFromBusboy = s.decodeReplyFromBusboy;
exports.decodeReplyFromAsyncIterable = s.decodeReplyFromAsyncIterable;
exports.decodeAction = s.decodeAction;
exports.decodeFormState = s.decodeFormState;
exports.registerServerReference = s.registerServerReference;
exports.registerClientReference = s.registerClientReference;
exports.createTemporaryReferenceSet = s.createTemporaryReferenceSet;
exports.setServerActionBoundArgsEncryption = s.setServerActionBoundArgsEncryption;
exports.encryptServerActionBoundArgs = s.encryptServerActionBoundArgs;
exports.decryptServerActionBoundArgs = s.decryptServerActionBoundArgs;
exports.loadServerAction = s.loadServerAction;
exports.createServerEntry = s.createServerEntry;
exports.ensureServerActions = s.ensureServerActions;


},
9226
/*!****************************************************************!*\
  !*** ./node_modules/react/cjs/react-jsx-runtime.production.js ***!
  \****************************************************************/
(__unused_rspack_module, exports) {
"use strict";
var __webpack_unused_export__;
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 
var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
function jsxProd(type, config, maybeKey) {
    var key = null;
    void 0 !== maybeKey && (key = "" + maybeKey);
    void 0 !== config.key && (key = "" + config.key);
    if ("key" in config) {
        maybeKey = {};
        for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
    } else maybeKey = config;
    config = maybeKey.ref;
    return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        key: key,
        ref: void 0 !== config ? config : null,
        props: maybeKey
    };
}
__webpack_unused_export__ = REACT_FRAGMENT_TYPE;
exports.jsx = jsxProd;
exports.jsxs = jsxProd;


},
5215
/*!*****************************************************************************!*\
  !*** ./node_modules/react/cjs/react-jsx-runtime.react-server.production.js ***!
  \*****************************************************************************/
(__unused_rspack_module, exports, __webpack_require__) {
"use strict";
var __webpack_unused_export__;
/**
 * @license React
 * react-jsx-runtime.react-server.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 
var React = __webpack_require__(/*! react */ 9404), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
if (!React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) throw Error('The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.');
function jsxProd(type, config, maybeKey) {
    var key = null;
    void 0 !== maybeKey && (key = "" + maybeKey);
    void 0 !== config.key && (key = "" + config.key);
    if ("key" in config) {
        maybeKey = {};
        for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
    } else maybeKey = config;
    config = maybeKey.ref;
    return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        key: key,
        ref: void 0 !== config ? config : null,
        props: maybeKey
    };
}
__webpack_unused_export__ = REACT_FRAGMENT_TYPE;
exports.jsx = jsxProd;
__webpack_unused_export__ = void 0;
exports.jsxs = jsxProd;


},
7953
/*!****************************************************!*\
  !*** ./node_modules/react/cjs/react.production.js ***!
  \****************************************************/
(__unused_rspack_module, exports) {
"use strict";
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== (typeof maybeIterable === "undefined" ? "undefined" : _type_of(maybeIterable))) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
}
var ReactNoopUpdateQueue = {
    isMounted: function isMounted() {
        return !1;
    },
    enqueueForceUpdate: function enqueueForceUpdate() {},
    enqueueReplaceState: function enqueueReplaceState() {},
    enqueueSetState: function enqueueSetState() {}
}, assign = Object.assign, emptyObject = {};
function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
}
Component.prototype.isReactComponent = {};
Component.prototype.setState = function(partialState, callback) {
    if ("object" !== (typeof partialState === "undefined" ? "undefined" : _type_of(partialState)) && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, partialState, callback, "setState");
};
Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
};
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;
function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
}
var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
pureComponentPrototype.constructor = PureComponent;
assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = !0;
var isArrayImpl = Array.isArray;
function noop() {}
var ReactSharedInternals = {
    H: null,
    A: null,
    T: null,
    S: null
}, hasOwnProperty = Object.prototype.hasOwnProperty;
function ReactElement(type, key, props) {
    var refProp = props.ref;
    return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        key: key,
        ref: void 0 !== refProp ? refProp : null,
        props: props
    };
}
function cloneAndReplaceKey(oldElement, newKey) {
    return ReactElement(oldElement.type, newKey, oldElement.props);
}
function isValidElement(object) {
    return "object" === (typeof object === "undefined" ? "undefined" : _type_of(object)) && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
}
function escape(key) {
    var escaperLookup = {
        "=": "=0",
        ":": "=2"
    };
    return "$" + key.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
    });
}
var userProvidedKeyEscapeRegex = /\/+/g;
function getElementKey(element, index) {
    return "object" === (typeof element === "undefined" ? "undefined" : _type_of(element)) && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
}
function resolveThenable(thenable) {
    switch(thenable.status){
        case "fulfilled":
            return thenable.value;
        case "rejected":
            throw thenable.reason;
        default:
            switch("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            }, function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            })), thenable.status){
                case "fulfilled":
                    return thenable.value;
                case "rejected":
                    throw thenable.reason;
            }
    }
    throw thenable;
}
function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    var type = typeof children === "undefined" ? "undefined" : _type_of(children);
    if ("undefined" === type || "boolean" === type) children = null;
    var invokeCallback = !1;
    if (null === children) invokeCallback = !0;
    else switch(type){
        case "bigint":
        case "string":
        case "number":
            invokeCallback = !0;
            break;
        case "object":
            switch(children.$$typeof){
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                    invokeCallback = !0;
                    break;
                case REACT_LAZY_TYPE:
                    return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
            }
    }
    if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
        return c;
    })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
    invokeCallback = 0;
    var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
    if (isArrayImpl(children)) for(var i = 0; i < children.length; i++)nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
    else if (i = getIteratorFn(children), "function" === typeof i) for(children = i.call(children), i = 0; !(nameSoFar = children.next()).done;)nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
    else if ("object" === type) {
        if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
        array = String(children);
        throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
    }
    return invokeCallback;
}
function mapChildren(children, func, context) {
    if (null == children) return children;
    var result = [], count = 0;
    mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
    });
    return result;
}
function lazyInitializer(payload) {
    if (-1 === payload._status) {
        var ctor = payload._result;
        ctor = ctor();
        ctor.then(function(moduleObject) {
            if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
        }, function(error) {
            if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
        });
        -1 === payload._status && (payload._status = 0, payload._result = ctor);
    }
    if (1 === payload._status) return payload._result.default;
    throw payload._result;
}
var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
    if ("object" === (typeof window === "undefined" ? "undefined" : _type_of(window)) && "function" === typeof window.ErrorEvent) {
        var event = new window.ErrorEvent("error", {
            bubbles: !0,
            cancelable: !0,
            message: "object" === (typeof error === "undefined" ? "undefined" : _type_of(error)) && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error: error
        });
        if (!window.dispatchEvent(event)) return;
    } else if ("object" === (typeof process === "undefined" ? "undefined" : _type_of(process)) && "function" === typeof process.emit) {
        process.emit("uncaughtException", error);
        return;
    }
    console.error(error);
}, Children = {
    map: mapChildren,
    forEach: function forEach(children, forEachFunc, forEachContext) {
        mapChildren(children, function() {
            forEachFunc.apply(this, arguments);
        }, forEachContext);
    },
    count: function count(children) {
        var n = 0;
        mapChildren(children, function() {
            n++;
        });
        return n;
    },
    toArray: function toArray(children) {
        return mapChildren(children, function(child) {
            return child;
        }) || [];
    },
    only: function only(children) {
        if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
        return children;
    }
};
exports.Activity = REACT_ACTIVITY_TYPE;
exports.Children = Children;
exports.Component = Component;
exports.Fragment = REACT_FRAGMENT_TYPE;
exports.Profiler = REACT_PROFILER_TYPE;
exports.PureComponent = PureComponent;
exports.StrictMode = REACT_STRICT_MODE_TYPE;
exports.Suspense = REACT_SUSPENSE_TYPE;
exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
exports.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function c(size) {
        return ReactSharedInternals.H.useMemoCache(size);
    }
};
exports.cache = function(fn) {
    return function() {
        return fn.apply(null, arguments);
    };
};
exports.cacheSignal = function() {
    return null;
};
exports.cloneElement = function(element, config, children) {
    if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
    var props = assign({}, element.props), key = element.key;
    if (null != config) for(propName in void 0 !== config.key && (key = "" + config.key), config)!hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
    var propName = arguments.length - 2;
    if (1 === propName) props.children = children;
    else if (1 < propName) {
        for(var childArray = Array(propName), i = 0; i < propName; i++)childArray[i] = arguments[i + 2];
        props.children = childArray;
    }
    return ReactElement(element.type, key, props);
};
exports.createContext = function(defaultValue) {
    defaultValue = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null
    };
    defaultValue.Provider = defaultValue;
    defaultValue.Consumer = {
        $$typeof: REACT_CONSUMER_TYPE,
        _context: defaultValue
    };
    return defaultValue;
};
exports.createElement = function(type, config, children) {
    var propName, props = {}, key = null;
    if (null != config) for(propName in void 0 !== config.key && (key = "" + config.key), config)hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) props.children = children;
    else if (1 < childrenLength) {
        for(var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)childArray[i] = arguments[i + 2];
        props.children = childArray;
    }
    if (type && type.defaultProps) for(propName in childrenLength = type.defaultProps, childrenLength)void 0 === props[propName] && (props[propName] = childrenLength[propName]);
    return ReactElement(type, key, props);
};
exports.createRef = function() {
    return {
        current: null
    };
};
exports.forwardRef = function(render) {
    return {
        $$typeof: REACT_FORWARD_REF_TYPE,
        render: render
    };
};
exports.isValidElement = isValidElement;
exports.lazy = function(ctor) {
    return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: {
            _status: -1,
            _result: ctor
        },
        _init: lazyInitializer
    };
};
exports.memo = function(type, compare) {
    return {
        $$typeof: REACT_MEMO_TYPE,
        type: type,
        compare: void 0 === compare ? null : compare
    };
};
exports.startTransition = function(scope) {
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    try {
        var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        "object" === (typeof returnValue === "undefined" ? "undefined" : _type_of(returnValue)) && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
    } catch (error) {
        reportGlobalError(error);
    } finally{
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
    }
};
exports.unstable_useCacheRefresh = function() {
    return ReactSharedInternals.H.useCacheRefresh();
};
exports.use = function(usable) {
    return ReactSharedInternals.H.use(usable);
};
exports.useActionState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useActionState(action, initialState, permalink);
};
exports.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
};
exports.useContext = function(Context) {
    return ReactSharedInternals.H.useContext(Context);
};
exports.useDebugValue = function() {};
exports.useDeferredValue = function(value, initialValue) {
    return ReactSharedInternals.H.useDeferredValue(value, initialValue);
};
exports.useEffect = function(create, deps) {
    return ReactSharedInternals.H.useEffect(create, deps);
};
exports.useEffectEvent = function(callback) {
    return ReactSharedInternals.H.useEffectEvent(callback);
};
exports.useId = function() {
    return ReactSharedInternals.H.useId();
};
exports.useImperativeHandle = function(ref, create, deps) {
    return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
};
exports.useInsertionEffect = function(create, deps) {
    return ReactSharedInternals.H.useInsertionEffect(create, deps);
};
exports.useLayoutEffect = function(create, deps) {
    return ReactSharedInternals.H.useLayoutEffect(create, deps);
};
exports.useMemo = function(create, deps) {
    return ReactSharedInternals.H.useMemo(create, deps);
};
exports.useOptimistic = function(passthrough, reducer) {
    return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
};
exports.useReducer = function(reducer, initialArg, init) {
    return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
};
exports.useRef = function(initialValue) {
    return ReactSharedInternals.H.useRef(initialValue);
};
exports.useState = function(initialState) {
    return ReactSharedInternals.H.useState(initialState);
};
exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
    return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
exports.useTransition = function() {
    return ReactSharedInternals.H.useTransition();
};
exports.version = "19.2.7";


},
6734
/*!*****************************************************************!*\
  !*** ./node_modules/react/cjs/react.react-server.production.js ***!
  \*****************************************************************/
(__unused_rspack_module, exports) {
"use strict";
/**
 * @license React
 * react.react-server.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var ReactSharedInternals = {
    H: null,
    A: null
};
function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
        url += "?args[]=" + encodeURIComponent(arguments[1]);
        for(var i = 2; i < arguments.length; i++)url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var isArrayImpl = Array.isArray;
function noop() {}
var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== (typeof maybeIterable === "undefined" ? "undefined" : _type_of(maybeIterable))) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
}
var hasOwnProperty = Object.prototype.hasOwnProperty, assign = Object.assign;
function ReactElement(type, key, props) {
    var refProp = props.ref;
    return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        key: key,
        ref: void 0 !== refProp ? refProp : null,
        props: props
    };
}
function cloneAndReplaceKey(oldElement, newKey) {
    return ReactElement(oldElement.type, newKey, oldElement.props);
}
function isValidElement(object) {
    return "object" === (typeof object === "undefined" ? "undefined" : _type_of(object)) && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
}
function escape(key) {
    var escaperLookup = {
        "=": "=0",
        ":": "=2"
    };
    return "$" + key.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
    });
}
var userProvidedKeyEscapeRegex = /\/+/g;
function getElementKey(element, index) {
    return "object" === (typeof element === "undefined" ? "undefined" : _type_of(element)) && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
}
function resolveThenable(thenable) {
    switch(thenable.status){
        case "fulfilled":
            return thenable.value;
        case "rejected":
            throw thenable.reason;
        default:
            switch("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            }, function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            })), thenable.status){
                case "fulfilled":
                    return thenable.value;
                case "rejected":
                    throw thenable.reason;
            }
    }
    throw thenable;
}
function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    var type = typeof children === "undefined" ? "undefined" : _type_of(children);
    if ("undefined" === type || "boolean" === type) children = null;
    var invokeCallback = !1;
    if (null === children) invokeCallback = !0;
    else switch(type){
        case "bigint":
        case "string":
        case "number":
            invokeCallback = !0;
            break;
        case "object":
            switch(children.$$typeof){
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                    invokeCallback = !0;
                    break;
                case REACT_LAZY_TYPE:
                    return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
            }
    }
    if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
        return c;
    })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
    invokeCallback = 0;
    var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
    if (isArrayImpl(children)) for(var i = 0; i < children.length; i++)nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
    else if (i = getIteratorFn(children), "function" === typeof i) for(children = i.call(children), i = 0; !(nameSoFar = children.next()).done;)nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
    else if ("object" === type) {
        if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
        array = String(children);
        throw Error(formatProdErrorMessage(31, "[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array));
    }
    return invokeCallback;
}
function mapChildren(children, func, context) {
    if (null == children) return children;
    var result = [], count = 0;
    mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
    });
    return result;
}
function lazyInitializer(payload) {
    if (-1 === payload._status) {
        var ctor = payload._result;
        ctor = ctor();
        ctor.then(function(moduleObject) {
            if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
        }, function(error) {
            if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
        });
        -1 === payload._status && (payload._status = 0, payload._result = ctor);
    }
    if (1 === payload._status) return payload._result.default;
    throw payload._result;
}
function createCacheRoot() {
    return new WeakMap();
}
function createCacheNode() {
    return {
        s: 0,
        v: void 0,
        o: null,
        p: null
    };
}
exports.Children = {
    map: mapChildren,
    forEach: function forEach(children, forEachFunc, forEachContext) {
        mapChildren(children, function() {
            forEachFunc.apply(this, arguments);
        }, forEachContext);
    },
    count: function count(children) {
        var n = 0;
        mapChildren(children, function() {
            n++;
        });
        return n;
    },
    toArray: function toArray(children) {
        return mapChildren(children, function(child) {
            return child;
        }) || [];
    },
    only: function only(children) {
        if (!isValidElement(children)) throw Error(formatProdErrorMessage(143));
        return children;
    }
};
exports.Fragment = REACT_FRAGMENT_TYPE;
exports.Profiler = REACT_PROFILER_TYPE;
exports.StrictMode = REACT_STRICT_MODE_TYPE;
exports.Suspense = REACT_SUSPENSE_TYPE;
exports.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
exports.cache = function(fn) {
    return function() {
        var dispatcher = ReactSharedInternals.A;
        if (!dispatcher) return fn.apply(null, arguments);
        var fnMap = dispatcher.getCacheForType(createCacheRoot);
        dispatcher = fnMap.get(fn);
        void 0 === dispatcher && (dispatcher = createCacheNode(), fnMap.set(fn, dispatcher));
        fnMap = 0;
        for(var l = arguments.length; fnMap < l; fnMap++){
            var arg = arguments[fnMap];
            if ("function" === typeof arg || "object" === (typeof arg === "undefined" ? "undefined" : _type_of(arg)) && null !== arg) {
                var objectCache = dispatcher.o;
                null === objectCache && (dispatcher.o = objectCache = new WeakMap());
                dispatcher = objectCache.get(arg);
                void 0 === dispatcher && (dispatcher = createCacheNode(), objectCache.set(arg, dispatcher));
            } else objectCache = dispatcher.p, null === objectCache && (dispatcher.p = objectCache = new Map()), dispatcher = objectCache.get(arg), void 0 === dispatcher && (dispatcher = createCacheNode(), objectCache.set(arg, dispatcher));
        }
        if (1 === dispatcher.s) return dispatcher.v;
        if (2 === dispatcher.s) throw dispatcher.v;
        try {
            var result = fn.apply(null, arguments);
            fnMap = dispatcher;
            fnMap.s = 1;
            return fnMap.v = result;
        } catch (error) {
            throw result = dispatcher, result.s = 2, result.v = error, error;
        }
    };
};
exports.cacheSignal = function() {
    var dispatcher = ReactSharedInternals.A;
    return dispatcher ? dispatcher.cacheSignal() : null;
};
exports.captureOwnerStack = function() {
    return null;
};
exports.cloneElement = function(element, config, children) {
    if (null === element || void 0 === element) throw Error(formatProdErrorMessage(267, element));
    var props = assign({}, element.props), key = element.key;
    if (null != config) for(propName in void 0 !== config.key && (key = "" + config.key), config)!hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
    var propName = arguments.length - 2;
    if (1 === propName) props.children = children;
    else if (1 < propName) {
        for(var childArray = Array(propName), i = 0; i < propName; i++)childArray[i] = arguments[i + 2];
        props.children = childArray;
    }
    return ReactElement(element.type, key, props);
};
exports.createElement = function(type, config, children) {
    var propName, props = {}, key = null;
    if (null != config) for(propName in void 0 !== config.key && (key = "" + config.key), config)hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) props.children = children;
    else if (1 < childrenLength) {
        for(var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)childArray[i] = arguments[i + 2];
        props.children = childArray;
    }
    if (type && type.defaultProps) for(propName in childrenLength = type.defaultProps, childrenLength)void 0 === props[propName] && (props[propName] = childrenLength[propName]);
    return ReactElement(type, key, props);
};
exports.createRef = function() {
    return {
        current: null
    };
};
exports.forwardRef = function(render) {
    return {
        $$typeof: REACT_FORWARD_REF_TYPE,
        render: render
    };
};
exports.isValidElement = isValidElement;
exports.lazy = function(ctor) {
    return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: {
            _status: -1,
            _result: ctor
        },
        _init: lazyInitializer
    };
};
exports.memo = function(type, compare) {
    return {
        $$typeof: REACT_MEMO_TYPE,
        type: type,
        compare: void 0 === compare ? null : compare
    };
};
exports.use = function(usable) {
    return ReactSharedInternals.H.use(usable);
};
exports.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
};
exports.useDebugValue = function() {};
exports.useId = function() {
    return ReactSharedInternals.H.useId();
};
exports.useMemo = function(create, deps) {
    return ReactSharedInternals.H.useMemo(create, deps);
};
exports.version = "19.2.7";


},
3380
/*!*************************************!*\
  !*** ./node_modules/react/index.js ***!
  \*************************************/
(module, __unused_rspack_exports, __webpack_require__) {
"use strict";

if (true) {
    module.exports = __webpack_require__(/*! ./cjs/react.production.js */ 7953);
} else {}


},
7576
/*!*******************************************!*\
  !*** ./node_modules/react/jsx-runtime.js ***!
  \*******************************************/
(module, __unused_rspack_exports, __webpack_require__) {
"use strict";

if (true) {
    module.exports = __webpack_require__(/*! ./cjs/react-jsx-runtime.production.js */ 9226);
} else {}


},
1933
/*!********************************************************!*\
  !*** ./node_modules/react/jsx-runtime.react-server.js ***!
  \********************************************************/
(module, __unused_rspack_exports, __webpack_require__) {
"use strict";

if (true) {
    module.exports = __webpack_require__(/*! ./cjs/react-jsx-runtime.react-server.production.js */ 5215);
} else {}


},
9404
/*!**************************************************!*\
  !*** ./node_modules/react/react.react-server.js ***!
  \**************************************************/
(module, __unused_rspack_exports, __webpack_require__) {
"use strict";

if (true) {
    module.exports = __webpack_require__(/*! ./cjs/react.react-server.production.js */ 6734);
} else {}


},
407
/*!*****************************************************!*\
  !*** ./src/rsc/components/counter.tsx + 38 modules ***!
  \*****************************************************/
(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Counter: () => (/* binding */ Counter)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(7576);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(3380);
;// CONCATENATED MODULE: ../../node_modules/tslib/tslib.es6.mjs
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol */ var extendStatics = function extendStatics1(d, b) {
    extendStatics = Object.setPrototypeOf || _instanceof({
        __proto__: []
    }, Array) && function(d, b) {
        d.__proto__ = b;
    } || function(d, b) {
        for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return extendStatics(d, b);
};
function __extends(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var tslib_es6_assign = function __assign1() {
    tslib_es6_assign = Object.assign || function __assign(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return tslib_es6_assign.apply(this, arguments);
};
function __rest(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ((typeof Reflect === "undefined" ? "undefined" : _type_of(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
        return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for(var i = decorators.length - 1; i >= 0; i--){
        var context = {};
        for(var p in contextIn)context[p] = p === "access" ? {} : contextIn[p];
        for(var p in contextIn.access)context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
            if (done) throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? {
            get: descriptor.get,
            set: descriptor.set
        } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || (typeof result === "undefined" ? "undefined" : _type_of(result)) !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        } else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
;
function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for(var i = 0; i < initializers.length; i++){
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
}
;
function __propKey(x) {
    return (typeof x === "undefined" ? "undefined" : _type_of(x)) === "symbol" ? x : "".concat(x);
}
;
function __setFunctionName(f, name, prefix) {
    if ((typeof name === "undefined" ? "undefined" : _type_of(name)) === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
        configurable: true,
        value: prefix ? "".concat(prefix, " ", name) : name
    });
}
;
function __metadata(metadataKey, metadataValue) {
    if ((typeof Reflect === "undefined" ? "undefined" : _type_of(Reflect)) === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return _instanceof(value, P) ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = {
        label: 0,
        sent: function sent() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g;
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var __createBinding = Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function get() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
};
function __exportStar(m, o) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}
function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function next() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
}
/** @deprecated */ function __spread() {
    for(var ar = [], i = 0; i < arguments.length; i++)ar = ar.concat(__read(arguments[i]));
    return ar;
}
/** @deprecated */ function __spreadArrays() {
    for(var s = 0, i = 0, il = arguments.length; i < il; i++)s += arguments[i].length;
    for(var r = Array(s), k = 0, i = 0; i < il; i++)for(var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)r[k] = a[j];
    return r;
}
function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for(var i = 0, l = from.length, ar; i < l; i++){
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
    return _instanceof(this, __await) ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    function verb(n) {
        if (g[n]) i[n] = function(v) {
            return new Promise(function(a, b) {
                q.push([
                    n,
                    v,
                    a,
                    b
                ]) > 1 || resume(n, v);
            });
        };
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        _instanceof(r.value, __await) ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
}
function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
        return this;
    }, i;
    function verb(n, f) {
        i[n] = o[n] ? function(v) {
            return (p = !p) ? {
                value: __await(o[n](v)),
                done: false
            } : f ? f(v) : v;
        } : f;
    }
}
function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i);
    function verb(n) {
        i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
                v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
        };
    }
    function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v) {
            resolve({
                value: v,
                done: d
            });
        }, reject);
    }
}
function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) {
        Object.defineProperty(cooked, "raw", {
            value: raw
        });
    } else {
        cooked.raw = raw;
    }
    return cooked;
}
;
var __setModuleDefault = Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
};
function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
}
function __importDefault(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
}
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldIn(state, receiver) {
    if (receiver === null || (typeof receiver === "undefined" ? "undefined" : _type_of(receiver)) !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}
function __addDisposableResource(env, value, async) {
    if (value !== null && value !== void 0) {
        if ((typeof value === "undefined" ? "undefined" : _type_of(value)) !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        env.stack.push({
            value: value,
            dispose: dispose,
            async: async
        });
    } else if (async) {
        env.stack.push({
            async: true
        });
    }
    return value;
}
var _SuppressedError = (/* unused pure expression or super */ null && (typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
}));
function __disposeResources(env) {
    function fail(e) {
        env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
    }
    function next() {
        while(env.stack.length){
            var rec = env.stack.pop();
            try {
                var result = rec.dispose && rec.dispose.call(rec.value);
                if (rec.async) return Promise.resolve(result).then(next, function(e) {
                    fail(e);
                    return next();
                });
            } catch (e) {
                fail(e);
            }
        }
        if (env.hasError) throw env.error;
    }
    return next();
}
/* export default */ const tslib_es6 = ((/* unused pure expression or super */ null && ({
    __extends: __extends,
    __assign: tslib_es6_assign,
    __rest: __rest,
    __decorate: __decorate,
    __param: __param,
    __metadata: __metadata,
    __awaiter: __awaiter,
    __generator: __generator,
    __createBinding: __createBinding,
    __exportStar: __exportStar,
    __values: __values,
    __read: __read,
    __spread: __spread,
    __spreadArrays: __spreadArrays,
    __spreadArray: __spreadArray,
    __await: __await,
    __asyncGenerator: __asyncGenerator,
    __asyncDelegator: __asyncDelegator,
    __asyncValues: __asyncValues,
    __makeTemplateObject: __makeTemplateObject,
    __importStar: __importStar,
    __importDefault: __importDefault,
    __classPrivateFieldGet: __classPrivateFieldGet,
    __classPrivateFieldSet: __classPrivateFieldSet,
    __classPrivateFieldIn: __classPrivateFieldIn,
    __addDisposableResource: __addDisposableResource,
    __disposeResources: __disposeResources
})));

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-config/esm/CoreConfigContext.js


var CoreConfigContext = (0,react.createContext)({
    breakpoint: 1024,
    client: 'desktop'
});
var CoreConfigContext_useCoreConfig = function useCoreConfig(overrides) {
    if (overrides === void 0) {
        overrides = {};
    }
    var config = (0,react.useContext)(CoreConfigContext);
    var passedOverrides = Object.fromEntries(Object.entries(overrides).filter(function(_a) {
        var value = _a[1];
        return !(value === undefined);
    }));
    return tslib_es6_assign(tslib_es6_assign({}, config), passedOverrides);
};
 //# sourceMappingURL=CoreConfigContext.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-shared/esm/type-checks.js
// eslint-disable-next-line @typescript-eslint/ban-types
function isFn(value) {
    return typeof value === 'function';
}
 //# sourceMappingURL=type-checks.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/hooks/dist/esm/useLayoutEffect_SAFE_FOR_SSR/hook.js

// eslint-disable-next-line @typescript-eslint/naming-convention
var useLayoutEffect_SAFE_FOR_SSR = typeof document !== 'undefined' ? react.useLayoutEffect : react.useEffect;


;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-mq/esm/mq.json.js
var MqList = {
    "--mobile-xs": "(min-width: 320px)",
    "--mobile-s": "(min-width: 360px)",
    "--mobile-m": "(min-width: 375px)",
    "--mobile-l": "(min-width: 412px)",
    "--mobile": "(max-width: 599px)",
    "--tablet-s": "(min-width: 600px)",
    "--tablet-m": "(min-width: 768px)",
    "--tablet": "(min-width: 600px) and (max-width: 1023px)",
    "--desktop-s": "(min-width: 1024px)",
    "--desktop-m": "(min-width: 1280px)",
    "--desktop-l": "(min-width: 1440px)",
    "--desktop-xl": "(min-width: 1920px)",
    "--desktop": "(min-width: 1024px)"
};
 //# sourceMappingURL=mq.json.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-mq/esm/utils.js

// TODO: перенести в alfalab/utils
var pool = {};
var refCounters = {};
/**
 * Возвращает MediaQueryList для заданного media-выражения.
 *
 * @param queryProp media выражение или кастомный запрос из `mq.json`, например `--mobile`.
 */ function getMatchMedia(queryProp) {
    var query = MqList[queryProp] || queryProp;
    if (pool[query]) {
        refCounters[query] += 1;
    } else {
        pool[query] = window.matchMedia(query);
        refCounters[query] = 1;
    }
    return pool[query];
}
/**
 * Удаляет MediaQueryList.
 *
 * @param queryProp media выражение или кастомный запрос из `mq.json`, например `--mobile`.
 */ function releaseMatchMedia(queryProp) {
    var query = MqList[queryProp] || queryProp;
    refCounters[query] -= 1;
    if (pool[query] && refCounters[query] === 0) {
        delete pool[query];
        delete refCounters[query];
    }
}
/**
 * Возвращает `true`, если есть поддержка `Pointer Events`
 */ function isPointerEventsSupported() {
    return 'PointerEvent' in globalThis;
}
/**
 * Возвращает `true`, если есть поддержка `Touch Events`
 */ function isTouchSupported() {
    return 'ontouchstart' in globalThis || globalThis.navigator.maxTouchPoints > 0;
}
 //# sourceMappingURL=utils.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-mq/esm/useMatchMedia.js



/**
 * Хук для медиа запросов.
 * @param query media выражение или кастомный запрос из `mq.json`, например `--mobile`.
 * @param defaultValue Значение по-умолчанию.
 */ var useMatchMedia_useMatchMedia = function useMatchMedia(query, defaultValue) {
    if (defaultValue === void 0) {
        defaultValue = false;
    }
    var _a = (0,react.useState)(defaultValue), matches = _a[0], setMatches = _a[1];
    useLayoutEffect_SAFE_FOR_SSR(function() {
        var mql = getMatchMedia(query);
        var handleMatchChange = function handleMatchChange() {
            return setMatches(mql.matches);
        };
        handleMatchChange();
        if (mql.addListener) {
            mql.addListener(handleMatchChange);
        } else {
            mql.addEventListener('change', handleMatchChange);
        }
        return function() {
            if (mql.removeListener) {
                mql.removeListener(handleMatchChange);
            } else {
                mql.removeEventListener('change', handleMatchChange);
            }
            releaseMatchMedia(query);
        };
    }, [
        query
    ]);
    return [
        matches
    ];
};
 //# sourceMappingURL=useMatchMedia.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-mq/esm/useIsDesktop.js



function useIsDesktop(breakpoint, defaultValue) {
    var client;
    if (typeof defaultValue === 'boolean') {
        client = defaultValue ? 'desktop' : 'mobile';
    } else if (isFn(defaultValue)) {
        client = defaultValue() ? 'desktop' : 'mobile';
    }
    var config = CoreConfigContext_useCoreConfig({
        breakpoint: breakpoint,
        client: client
    });
    var query = "(min-width: ".concat(config.breakpoint, "px)");
    var isDesktop = useMatchMedia_useMatchMedia(query, config.client === 'desktop')[0];
    return isDesktop;
}
 //# sourceMappingURL=useIsDesktop.js.map

;// CONCATENATED MODULE: ../../node_modules/react-merge-refs/dist/react-merge-refs.esm.js
function mergeRefs(refs) {
    return function(value) {
        refs.forEach(function(ref) {
            if (typeof ref === "function") {
                ref(value);
            } else if (ref != null) {
                ref.current = value;
            }
        });
    };
}
/* export default */ const react_merge_refs_esm = (mergeRefs); //# sourceMappingURL=react-merge-refs.esm.js.map

// EXTERNAL MODULE: ../../node_modules/classnames/index.js
var classnames = __webpack_require__(5214);
var classnames_default = /*#__PURE__*/__webpack_require__.n(classnames);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-shared/esm/getDataTestId.js
function getDataTestId(dataTestId, element) {
    var elementPart = element ? "-".concat(element.toLowerCase()) : '';
    return dataTestId ? "".concat(dataTestId).concat(elementPart) : undefined;
}
 //# sourceMappingURL=getDataTestId.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-shared/esm/object.js
function object_type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}

function isObject(value) {
    return isNonNullable(value) && (typeof value === "undefined" ? "undefined" : object_type_of(value)) === 'object';
}
function object_hasOwnProperty(val, prop) {
    return Object.prototype.hasOwnProperty.call(val, prop);
}
/* eslint-enable @typescript-eslint/no-explicit-any */  //# sourceMappingURL=object.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-shared/esm/fnUtils.js
function fnUtils_instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
/**
 * Возвращает true, если значение равно null или undefined
 */ function isNullable(value) {
    return !fnUtils_isNonNullable(value);
}
function fnUtils_isNonNullable(value) {
    return value != null;
}
/**
 * Выбор значения между min max границами
 */ function clamp(value, min, max) {
    var clampedValue = Math.min(Number(max), Math.max(Number(min), Number(value)));
    return fnUtils_instanceof(value, Date) ? new Date(clampedValue) : clampedValue;
}
function noop() {}
var fnUtils = (/* unused pure expression or super */ null && ({
    clamp: clamp,
    noop: noop,
    isNil: isNullable
}));
 //# sourceMappingURL=fnUtils.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-shared/esm/warning.js
/* eslint-disable no-console */ var warnings;
if (false) {}
function devWarning(message) {
    if (true) return;
    // removed by dead control flow
{}
}
 //# sourceMappingURL=warning.js.map

;// CONCATENATED MODULE: ./node_modules/uuid/dist-node/rng.js
var rnds8 = new Uint8Array(16);
function rng() {
    return crypto.getRandomValues(rnds8);
}

;// CONCATENATED MODULE: ./node_modules/uuid/dist-node/stringify.js

var byteToHex = [];
for(var stringify_i = 0; stringify_i < 256; ++stringify_i){
    byteToHex.push((stringify_i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr) {
    var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr) {
    var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    var uuid = unsafeStringify(arr, offset);
    if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
    }
    return uuid;
}
/* export default */ const dist_node_stringify = ((/* unused pure expression or super */ null && (stringify)));

;// CONCATENATED MODULE: ./node_modules/uuid/dist-node/v4.js


function v4(options, buf, offset) {
    if (!buf && !options && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return _v4(options, buf, offset);
}
function _v4(options, buf, offset) {
    var _ref, _options_random;
    var _options_rng;
    options = options || {};
    var rnds = (_ref = (_options_random = options.random) !== null && _options_random !== void 0 ? _options_random : (_options_rng = options.rng) === null || _options_rng === void 0 ? void 0 : _options_rng.call(options)) !== null && _ref !== void 0 ? _ref : rng();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80;
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError("UUID byte range ".concat(offset, ":").concat(offset + 15, " is out of buffer bounds"));
        }
        for(var i = 0; i < 16; ++i){
            buf[offset + i] = rnds[i];
        }
        return buf;
    }
    return unsafeStringify(rnds);
}
/* export default */ const dist_node_v4 = (v4);

;// CONCATENATED MODULE: ./node_modules/@alfalab/hooks/dist/esm/useId/hook.js
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}


var useId = react.useId || function useUuid() {
    /*
     * Utilize useState instead of useMemo because React
     * makes no guarantees that the memo store is durable
     */ var _React_useState = _sliced_to_array(react.useState(function() {
        return dist_node_v4();
    }), 1), id = _React_useState[0];
    return id;
};


// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-spinner/esm/default.css
var esm_default = __webpack_require__(5014);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-spinner/esm/default.module.css.js

var defaultColors = {
    "component": "spinner__component_1q9vr"
};
 //# sourceMappingURL=default.module.css.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-spinner/esm/index.css
var esm = __webpack_require__(5053);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-spinner/esm/index.module.css.js

var index_module_css_styles = {
    "spinner": "spinner__spinner_1ye65",
    "visible": "spinner__visible_1ye65",
    "gradient": "spinner__gradient_1ye65"
};
 //# sourceMappingURL=index.module.css.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-spinner/esm/inverted.css
var inverted = __webpack_require__(4746);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-spinner/esm/inverted.module.css.js

var invertedColors = {
    "component": "spinner__component_15mzk"
};
 //# sourceMappingURL=inverted.module.css.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-spinner/esm/preset.css
var esm_preset = __webpack_require__(8940);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-spinner/esm/preset.module.css.js

var presetStyles = {
    "preset16": "spinner__preset16_2dvzl",
    "preset24": "spinner__preset24_2dvzl",
    "preset48": "spinner__preset48_2dvzl"
};
 //# sourceMappingURL=preset.module.css.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-spinner/esm/Component.js









var colorStyles = {
    default: defaultColors,
    inverted: invertedColors
};
var PRESET_CONFIG = {
    16: [
        2,
        14,
        'preset16'
    ],
    24: [
        2,
        20,
        'preset24'
    ],
    48: [
        4,
        40,
        'preset48'
    ]
};
var Component_Spinner = function Spinner(props) {
    var _a;
    var style = props.style, visible = props.visible, id = props.id, className = props.className, dataTestId = props.dataTestId, _b = props.colors, colors = _b === void 0 ? 'default' : _b;
    var size;
    var lineWidth;
    var presetClassname;
    if (object_hasOwnProperty(props, 'preset')) {
        var preset = props.preset;
        var config = PRESET_CONFIG[preset];
        var styleKey = config[2];
        lineWidth = config[0], size = config[1];
        presetClassname = presetStyles[styleKey];
    } else {
        size = props.size;
        lineWidth = props.lineWidth;
    }
    var color = style === null || style === void 0 ? void 0 : style.color;
    if (fnUtils_isNonNullable(color)) {
        devWarning("[Spinner]: \u041F\u0430\u043B\u0438\u0442\u0440\u0430, \u0432 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0435 \u043A\u043E\u0442\u043E\u0440\u043E\u0439 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0441\u043F\u0438\u043D\u043D\u0435\u0440 (\u043F\u0440\u043E\u043F 'colors') \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0435\u0442\u0441\u044F. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0446\u0432\u0435\u0442 'style.color' ".concat(color));
    }
    var uniqId = useId();
    var radius = size / 2 - lineWidth / 2;
    var rotationAngle /* deg */  = Math.ceil(Math.asin(lineWidth / 2 / radius) * 180 / Math.PI);
    var gap /* deg */  = 90;
    var pathLength /* deg */  = 360;
    var strokeDasharray = "".concat(pathLength - gap - rotationAngle, " ").concat(gap + rotationAngle);
    var gradient = "conic-gradient(from ".concat(rotationAngle, "deg, transparent ").concat(gap - rotationAngle * 2, "deg, currentColor)");
    return react.createElement("svg", {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: "0 0 ".concat(size, " ").concat(size),
        style: tslib_es6_assign(tslib_es6_assign({}, style), {
            height: size,
            width: size
        }),
        className: classnames_default()(index_module_css_styles.spinner, colorStyles[colors].component, presetClassname, className, (_a = {}, _a[index_module_css_styles.visible] = visible, _a)),
        "data-test-id": dataTestId,
        id: id
    }, react.createElement("defs", null, react.createElement("mask", {
        id: uniqId
    }, react.createElement("circle", {
        cx: '50%',
        cy: '50%',
        r: radius,
        strokeWidth: lineWidth,
        strokeLinecap: 'round',
        stroke: '#fff',
        strokeDashoffset: -rotationAngle,
        strokeDasharray: strokeDasharray,
        pathLength: pathLength
    }))), react.createElement("foreignObject", {
        x: '0',
        y: '0',
        width: size,
        height: size,
        mask: "url(#".concat(uniqId, ")")
    }, react.createElement("div", {
        className: index_module_css_styles.gradient,
        style: {
            backgroundImage: gradient
        }
    })));
};
 //# sourceMappingURL=Component.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/hooks/dist/esm/useFocus/hook.js
function hook_array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function hook_array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function hook_iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function hook_non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function hook_sliced_to_array(arr, i) {
    return hook_array_with_holes(arr) || hook_iterable_to_array_limit(arr, i) || hook_unsupported_iterable_to_array(arr, i) || hook_non_iterable_rest();
}
function hook_unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return hook_array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return hook_array_like_to_array(o, minLen);
}

var prevInputMethod;
function handleKeyDown(event) {
    if (event.key === 'Tab') {
        prevInputMethod = 'keyboard';
    }
}
function handleMouseDown() {
    prevInputMethod = 'mouse';
}
function handleTouchStart() {
    prevInputMethod = 'mouse';
}
/**
 * Навешивает несколько глобальных обработчиков и отслеживает метод ввода - мышь или клавиатура.
 * Note: Повторный вызов функции не дублирует обработчики
 */ function addGlobalListeners() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleTouchStart);
}
/**
 * Хук устанавливает обработчик события на focusin и focusout
 * по конкретному типу события
 * @param node Элемент на котором установится обработчик (default = document)
 * @param inputMethod Если параметр не задан, установит обработчик по любому событию фокуса
 */ function useFocus(ref, inputMethod) {
    var _React_useState = hook_sliced_to_array(react.useState(false), 2), focus = _React_useState[0], setFocus = _React_useState[1];
    var handleFocus = react.useCallback(function() {
        if (!inputMethod || inputMethod === prevInputMethod) {
            setFocus(true);
        }
    }, [
        inputMethod
    ]);
    var handleBlur = react.useCallback(function() {
        setFocus(false);
    }, []);
    react.useEffect(function() {
        var node = ref.current;
        if (node) {
            node.addEventListener('focusin', handleFocus);
            node.addEventListener('focusout', handleBlur);
        }
        return function() {
            if (node) {
                node.removeEventListener('focusin', handleFocus);
                node.removeEventListener('focusout', handleBlur);
            }
        };
    }, [
        handleBlur,
        handleFocus,
        ref
    ]);
    react.useEffect(addGlobalListeners, []);
    return [
        focus
    ];
}


;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/constants/loader-min-display-interval.js
/**
 * Минимальное время отображения лоадера - 500мс,
 * чтобы при быстрых ответах от сервера кнопка не «моргала».
 */ var LOADER_MIN_DISPLAY_INTERVAL = 500;
 //# sourceMappingURL=loader-min-display-interval.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-button/esm/components/base-button/default.css
var base_button_default = __webpack_require__(8847);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/components/base-button/default.module.css.js

var default_module_css_defaultColors = {
    "accent": "button__accent_u4mot",
    "loader": "button__loader_u4mot",
    "primary": "button__primary_u4mot",
    "secondary": "button__secondary_u4mot",
    "hint": "button__hint_u4mot",
    "outlined": "button__outlined_u4mot",
    "transparent": "button__transparent_u4mot",
    "text": "button__text_u4mot",
    "component": "button__component_u4mot",
    "loading": "button__loading_u4mot"
};
 //# sourceMappingURL=default.module.css.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-button/esm/components/base-button/index.css
var base_button = __webpack_require__(8444);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/components/base-button/index.module.css.js

var commonStyles = {
    "component": "button__component_1kqu4",
    "hug": "button__hug_1kqu4",
    "fill": "button__fill_1kqu4",
    "hint": "button__hint_1kqu4",
    "allowBackdropBlur": "button__allowBackdropBlur_1kqu4",
    "secondary": "button__secondary_1kqu4",
    "accent": "button__accent_1kqu4",
    "primary": "button__primary_1kqu4",
    "focused": "button__focused_1kqu4",
    "loading": "button__loading_1kqu4",
    "label": "button__label_1kqu4",
    "addons": "button__addons_1kqu4",
    "stretchText": "button__stretchText_1kqu4",
    "loader": "button__loader_1kqu4",
    "size-32": "button__size-32_1kqu4",
    "iconOnly": "button__iconOnly_1kqu4",
    "size-40": "button__size-40_1kqu4",
    "size-48": "button__size-48_1kqu4",
    "size-56": "button__size-56_1kqu4",
    "size-64": "button__size-64_1kqu4",
    "size-72": "button__size-72_1kqu4",
    "withRightAddons": "button__withRightAddons_1kqu4",
    "text": "button__text_1kqu4",
    "withLeftAddons": "button__withLeftAddons_1kqu4",
    "transparent": "button__transparent_1kqu4",
    "block": "button__block_1kqu4",
    "nowrap": "button__nowrap_1kqu4",
    "rounded": "button__rounded_1kqu4"
};
 //# sourceMappingURL=index.module.css.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-button/esm/components/base-button/inverted.css
var base_button_inverted = __webpack_require__(8657);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/components/base-button/inverted.module.css.js

var inverted_module_css_invertedColors = {
    "accent": "button__accent_1cj58",
    "loader": "button__loader_1cj58",
    "primary": "button__primary_1cj58",
    "secondary": "button__secondary_1cj58",
    "hint": "button__hint_1cj58",
    "outlined": "button__outlined_1cj58",
    "transparent": "button__transparent_1cj58",
    "text": "button__text_1cj58",
    "component": "button__component_1cj58",
    "loading": "button__loading_1cj58"
};
 //# sourceMappingURL=inverted.module.css.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/components/base-button/Component.js











var Component_colorStyles = {
    default: default_module_css_defaultColors,
    inverted: inverted_module_css_invertedColors
};
var BaseButton = (0,react.forwardRef)(function(_a, ref) {
    var _b, _c, _d;
    var allowBackdropBlur = _a.allowBackdropBlur, children = _a.children, _e = _a.view, view = _e === void 0 ? 'secondary' : _e, _f = _a.shape, shape = _f === void 0 ? 'rectangular' : _f, _g = _a.textResizing, textResizing = _g === void 0 ? 'hug' : _g, hint = _a.hint, leftAddons = _a.leftAddons, rightAddons = _a.rightAddons, _h = _a.size, size = _h === void 0 ? 56 : _h, _j = _a.block, block = _j === void 0 ? false : _j, className = _a.className, spinnerClassName = _a.spinnerClassName, dataTestId = _a.dataTestId, href = _a.href, _k = _a.loading, loading = _k === void 0 ? false : _k, _l = _a.nowrap, nowrap = _l === void 0 ? false : _l, _m = _a.colors, colors = _m === void 0 ? 'default' : _m, _o = _a.Component, Component = _o === void 0 ? href ? 'a' : 'button' : _o, onClick = _a.onClick, _p = _a.styles, styles = _p === void 0 ? {} : _p, _q = _a.colorStylesMap, colorStylesMap = _q === void 0 ? {
        default: {},
        inverted: {}
    } : _q, labelClassName = _a.labelClassName, hintClassName = _a.hintClassName, restProps = __rest(_a, [
        "allowBackdropBlur",
        "children",
        "view",
        "shape",
        "textResizing",
        "hint",
        "leftAddons",
        "rightAddons",
        "size",
        "block",
        "className",
        "spinnerClassName",
        "dataTestId",
        "href",
        "loading",
        "nowrap",
        "colors",
        "Component",
        "onClick",
        "styles",
        "colorStylesMap",
        "labelClassName",
        "hintClassName"
    ]);
    var buttonRef = (0,react.useRef)(null);
    var focused = useFocus(buttonRef, 'keyboard')[0];
    var _r = (0,react.useState)(true), loaderTimePassed = _r[0], setLoaderTimePassed = _r[1];
    var timerId = (0,react.useRef)(0);
    var showLoader = loading || !loaderTimePassed;
    var showHint = hint && [
        56,
        64,
        72
    ].includes(size);
    var iconOnly = !children;
    var sizeStyle = "size-".concat(size);
    var componentProps = {
        className: classnames_default()(commonStyles.component, commonStyles[view], commonStyles[sizeStyle], commonStyles[textResizing], shape === 'rectangular' && styles[sizeStyle], shape === 'rounded' && commonStyles[shape], Component_colorStyles[colors].component, Component_colorStyles[colors][view], colorStylesMap[colors].component, (_b = {}, _b[commonStyles.allowBackdropBlur] = allowBackdropBlur, _b[colorStylesMap[colors][view]] = Boolean(colorStylesMap[colors][view]), _b[commonStyles.focused] = focused, _b[commonStyles.block] = block, _b[commonStyles.iconOnly] = iconOnly, _b[commonStyles.loading] = showLoader, _b[commonStyles.withRightAddons] = Boolean(rightAddons) && !iconOnly, _b[commonStyles.withLeftAddons] = Boolean(leftAddons) && !iconOnly, _b[Component_colorStyles[colors].loading] = showLoader, _b[colorStylesMap[colors].loading] = showLoader, _b), className),
        'data-test-id': dataTestId || null
    };
    var _s = restProps, disabled = _s.disabled, _t = _s.type, type = _t === void 0 ? 'button' : _t, restButtonProps = __rest(_s, [
        "disabled",
        "type"
    ]);
    var buttonChildren = react.createElement(react.Fragment, null, leftAddons && react.createElement("span", {
        className: commonStyles.addons
    }, leftAddons), children && react.createElement("span", {
        className: classnames_default()(commonStyles.label, labelClassName, (_c = {}, _c[commonStyles.nowrap] = nowrap, _c[commonStyles.stretchText] = !(leftAddons || rightAddons) || textResizing === 'fill', _c))
    }, children, showHint && react.createElement("span", {
        className: classnames_default()(commonStyles.hint, colorStylesMap[colors].hint, Component_colorStyles[colors].hint, hintClassName)
    }, hint)), showLoader && react.createElement(Component_Spinner, {
        preset: 24,
        dataTestId: getDataTestId(dataTestId, 'loader'),
        visible: true,
        className: classnames_default()(commonStyles.loader, Component_colorStyles[colors].loader, colorStylesMap[colors].loader, spinnerClassName)
    }), rightAddons && react.createElement("span", {
        className: commonStyles.addons
    }, rightAddons));
    (0,react.useEffect)(function() {
        if (loading) {
            setLoaderTimePassed(false);
            timerId.current = window.setTimeout(function() {
                setLoaderTimePassed(true);
            }, LOADER_MIN_DISPLAY_INTERVAL);
        }
    }, [
        loading
    ]);
    (0,react.useEffect)(function() {
        return function() {
            window.clearTimeout(timerId.current);
        };
    }, []);
    var handleClick = function handleClick(e) {
        if (disabled || showLoader) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onClick === null || onClick === void 0 ? void 0 : onClick(e);
    };
    if (href) {
        var target = restProps.target;
        // Для совместимости с react-router-dom, меняем href на to
        var hrefProps = (_d = {}, _d[typeof Component === 'string' ? 'href' : 'to'] = href, _d);
        return react.createElement(Component, tslib_es6_assign({
            rel: target === '_blank' ? 'noreferrer noopener' : undefined
        }, componentProps, restProps, hrefProps, {
            onClick: handleClick,
            disabled: disabled || showLoader,
            ref: react_merge_refs_esm([
                buttonRef,
                ref
            ])
        }), buttonChildren);
    }
    return react.createElement(Component, tslib_es6_assign({}, componentProps, restButtonProps, {
        onClick: handleClick,
        type: type,
        disabled: disabled || showLoader,
        ref: react_merge_refs_esm([
            buttonRef,
            ref
        ])
    }), buttonChildren);
});
 //# sourceMappingURL=Component.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-button/esm/desktop/default.desktop.css
var default_desktop = __webpack_require__(4338);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/desktop/default.desktop.module.css.js

var default_desktop_module_css_defaultColors = {
    "accent": "button__accent_j9c9k",
    "hint": "button__hint_j9c9k",
    "primary": "button__primary_j9c9k",
    "loader": "button__loader_j9c9k",
    "secondary": "button__secondary_j9c9k",
    "text": "button__text_j9c9k",
    "component": "button__component_j9c9k",
    "loading": "button__loading_j9c9k",
    "outlined": "button__outlined_j9c9k",
    "transparent": "button__transparent_j9c9k"
};
 //# sourceMappingURL=default.desktop.module.css.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-button/esm/desktop/desktop.css
var desktop = __webpack_require__(9687);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/desktop/desktop.module.css.js

var desktop_module_css_styles = {
    "size-32": "button__size-32_1wxbx",
    "size-40": "button__size-40_1wxbx",
    "size-48": "button__size-48_1wxbx",
    "size-56": "button__size-56_1wxbx",
    "size-64": "button__size-64_1wxbx",
    "size-72": "button__size-72_1wxbx"
};
 //# sourceMappingURL=desktop.module.css.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-button/esm/desktop/inverted.desktop.css
var inverted_desktop = __webpack_require__(362);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/desktop/inverted.desktop.module.css.js

var inverted_desktop_module_css_invertedColors = {
    "accent": "button__accent_rnv5n",
    "hint": "button__hint_rnv5n",
    "primary": "button__primary_rnv5n",
    "loader": "button__loader_rnv5n",
    "secondary": "button__secondary_rnv5n",
    "text": "button__text_rnv5n",
    "component": "button__component_rnv5n",
    "loading": "button__loading_rnv5n",
    "outlined": "button__outlined_rnv5n",
    "transparent": "button__transparent_rnv5n"
};
 //# sourceMappingURL=inverted.desktop.module.css.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/desktop/Component.desktop.js






var Component_desktop_colorStyles = {
    default: default_desktop_module_css_defaultColors,
    inverted: inverted_desktop_module_css_invertedColors
};
var ButtonDesktop = (0,react.forwardRef)(function(restProps, ref) {
    return react.createElement(BaseButton, tslib_es6_assign({}, restProps, {
        ref: ref,
        styles: desktop_module_css_styles,
        colorStylesMap: Component_desktop_colorStyles
    }));
});
 //# sourceMappingURL=Component.desktop.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-button/esm/mobile/default.mobile.css
var default_mobile = __webpack_require__(8562);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/mobile/default.mobile.module.css.js

var default_mobile_module_css_defaultColors = {
    "accent": "button__accent_181ey",
    "hint": "button__hint_181ey",
    "primary": "button__primary_181ey",
    "loader": "button__loader_181ey",
    "secondary": "button__secondary_181ey",
    "text": "button__text_181ey",
    "component": "button__component_181ey",
    "loading": "button__loading_181ey",
    "outlined": "button__outlined_181ey",
    "transparent": "button__transparent_181ey"
};
 //# sourceMappingURL=default.mobile.module.css.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-button/esm/mobile/inverted.mobile.css
var inverted_mobile = __webpack_require__(7138);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/mobile/inverted.mobile.module.css.js

var inverted_mobile_module_css_invertedColors = {
    "accent": "button__accent_pys59",
    "hint": "button__hint_pys59",
    "primary": "button__primary_pys59",
    "loader": "button__loader_pys59",
    "secondary": "button__secondary_pys59",
    "text": "button__text_pys59",
    "component": "button__component_pys59",
    "loading": "button__loading_pys59",
    "outlined": "button__outlined_pys59",
    "transparent": "button__transparent_pys59"
};
 //# sourceMappingURL=inverted.mobile.module.css.js.map

// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-button/esm/mobile/mobile.css
var mobile = __webpack_require__(4225);
;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/mobile/mobile.module.css.js

var mobile_module_css_styles = {
    "size-32": "button__size-32_v6lpt",
    "size-40": "button__size-40_v6lpt",
    "size-48": "button__size-48_v6lpt",
    "size-56": "button__size-56_v6lpt",
    "size-64": "button__size-64_v6lpt",
    "size-72": "button__size-72_v6lpt"
};
 //# sourceMappingURL=mobile.module.css.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/mobile/Component.mobile.js






var Component_mobile_colorStyles = {
    default: default_mobile_module_css_defaultColors,
    inverted: inverted_mobile_module_css_invertedColors
};
var ButtonMobile = (0,react.forwardRef)(function(restProps, ref) {
    return react.createElement(BaseButton, tslib_es6_assign({}, restProps, {
        ref: ref,
        colorStylesMap: Component_mobile_colorStyles,
        styles: mobile_module_css_styles
    }));
});
 //# sourceMappingURL=Component.mobile.js.map

;// CONCATENATED MODULE: ./node_modules/@alfalab/core-components-button/esm/Component.responsive.js





var Button = (0,react.forwardRef)(function(_a, ref) {
    var children = _a.children, breakpoint = _a.breakpoint, client = _a.client, _b = _a.defaultMatchMediaValue, defaultMatchMediaValue = _b === void 0 ? client === undefined ? undefined : client === 'desktop' : _b, restProps = __rest(_a, [
        "children",
        "breakpoint",
        "client",
        "defaultMatchMediaValue"
    ]);
    var isDesktop = useIsDesktop(breakpoint, defaultMatchMediaValue);
    var Component = isDesktop ? ButtonDesktop : ButtonMobile;
    return react.createElement(Component, tslib_es6_assign({
        ref: ref
    }, restProps), children);
});
Button.displayName = 'Button';
 //# sourceMappingURL=Component.responsive.js.map

// EXTERNAL MODULE: ./node_modules/react-server-dom-rspack/client.node.js
var client_node = __webpack_require__(3693);
;// CONCATENATED MODULE: ./src/rsc/actions.ts

const $$RSC_SERVER_ACTION_0 = /*#__PURE__*/ (0,client_node.createServerReference)("4021670c6f9f964c40370841a697fb94447dd4f23f0abaf40c74c2958cd632e2d6");


// EXTERNAL MODULE: ./node_modules/@alfalab/core-components-button/desktop/default.desktop.css
var desktop_default_desktop = __webpack_require__(230);
;// CONCATENATED MODULE: ./src/rsc/components/counter.tsx


// вопрос POC №9: банковская библиотека на React 19 внутри 'use client'
// (SSR через ssr-слой + гидратация + интерактивность)




function Counter({ initial }) {
    const [count, setCount] = react.useState(initial);
    const [serverEcho, setServerEcho] = react.useState(null);
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        style: {
            border: '1px solid #ccc',
            padding: 12,
            marginTop: 12
        },
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)(Button, {
                dataTestId: "inc",
                view: "primary",
                size: 32,
                onClick: ()=>setCount((c)=>c + 1),
                children: "+1 (core-components)"
            }),
            ' ',
            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                "data-testid": "count",
                children: count
            }),
            ' ',
            /*#__PURE__*/ (0,jsx_runtime.jsx)("button", {
                "data-testid": "call-action",
                type: "button",
                onClick: async ()=>{
                    const result = await $$RSC_SERVER_ACTION_0(count);
                    setServerEcho(result);
                },
                children: "вызвать server action"
            }),
            serverEcho ? /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                "data-testid": "echo",
                children: serverEcho
            }) : null
        ]
    });
}


},
5214
/*!**********************************************!*\
  !*** ../../node_modules/classnames/index.js ***!
  \**********************************************/
(module) {
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/ /* global define */ (function() {
    'use strict';
    var hasOwn = {}.hasOwnProperty;
    function classNames() {
        var classes = '';
        for(var i = 0; i < arguments.length; i++){
            var arg = arguments[i];
            if (arg) {
                classes = appendClass(classes, parseValue(arg));
            }
        }
        return classes;
    }
    function parseValue(arg) {
        if (typeof arg === 'string' || typeof arg === 'number') {
            return arg;
        }
        if ((typeof arg === "undefined" ? "undefined" : _type_of(arg)) !== 'object') {
            return '';
        }
        if (Array.isArray(arg)) {
            return classNames.apply(null, arg);
        }
        if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
            return arg.toString();
        }
        var classes = '';
        for(var key in arg){
            if (hasOwn.call(arg, key) && arg[key]) {
                classes = appendClass(classes, key);
            }
        }
        return classes;
    }
    function appendClass(value, newClass) {
        if (!newClass) {
            return value;
        }
        if (value) {
            return value + ' ' + newClass;
        }
        return value + newClass;
    }
    if ( true && module.exports) {
        classNames.default = classNames;
        module.exports = classNames;
    } else if (typeof define === 'function' && _type_of(define.amd) === 'object' && define.amd) {
        // register as 'classnames', consistent with npm package name
        define('classnames', [], function() {
            return classNames;
        });
    } else {
        window.classNames = classNames;
    }
})();


},
6738
/*!****************************************************!*\
  !*** ../../node_modules/rsc-html-stream/server.js ***!
  \****************************************************/
(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  injectRSCPayload: () => (injectRSCPayload)
});
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _async_iterator(iterable) {
    var method, async, sync, retry = 2;
    for("undefined" != typeof Symbol && (async = Symbol.asyncIterator, sync = Symbol.iterator); retry--;){
        if (async && null != (method = iterable[async])) return method.call(iterable);
        if (sync && null != (method = iterable[sync])) return new AsyncFromSyncIterator(method.call(iterable));
        async = "@@asyncIterator", sync = "@@iterator";
    }
    throw new TypeError("Object is not async iterable");
}
function AsyncFromSyncIterator(s) {
    function AsyncFromSyncIteratorContinuation(r) {
        if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object."));
        var done = r.done;
        return Promise.resolve(r.value).then(function(value) {
            return {
                value: value,
                done: done
            };
        });
    }
    return AsyncFromSyncIterator = function(s) {
        this.s = s, this.n = s.next;
    }, AsyncFromSyncIterator.prototype = {
        s: null,
        n: null,
        next: function() {
            return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
        },
        return: function(value) {
            var ret = this.s.return;
            return void 0 === ret ? Promise.resolve({
                value: value,
                done: !0
            }) : AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments));
        },
        throw: function(value) {
            var thr = this.s.return;
            return void 0 === thr ? Promise.reject(value) : AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments));
        }
    }, new AsyncFromSyncIterator(s);
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype), d = Object.defineProperty;
    return d(g, "next", {
        value: verb(0)
    }), d(g, "throw", {
        value: verb(1)
    }), d(g, "return", {
        value: verb(2)
    }), typeof Symbol === "function" && d(g, Symbol.iterator, {
        value: function() {
            return this;
        }
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var encoder = new TextEncoder();
var trailer = '</body></html>';
function injectRSCPayload(rscStream, options) {
    var decoder = new TextDecoder();
    var resolveFlightDataPromise;
    var flightDataPromise = new Promise(function(resolve) {
        return resolveFlightDataPromise = resolve;
    });
    var startedRSC = false;
    var nonce = options && typeof options.nonce === 'string' ? options.nonce : undefined;
    // Buffer all HTML chunks enqueued during the current tick of the event loop (roughly)
    // and write them to the output stream all at once. This ensures that we don't generate
    // invalid HTML by injecting RSC in between two partial chunks of HTML.
    var buffered = [];
    var timeout = null;
    function flushBufferedChunks(controller) {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            for(var _iterator = buffered[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                var chunk = _step.value;
                var buf = decoder.decode(chunk, {
                    stream: true
                });
                if (buf.endsWith(trailer)) {
                    buf = buf.slice(0, -trailer.length);
                }
                controller.enqueue(encoder.encode(buf));
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
        var remaining = decoder.decode();
        if (remaining.length) {
            if (remaining.endsWith(trailer)) {
                remaining = remaining.slice(0, -trailer.length);
            }
            controller.enqueue(encoder.encode(remaining));
        }
        buffered.length = 0;
        timeout = null;
    }
    return new TransformStream({
        transform: function transform(chunk, controller) {
            buffered.push(chunk);
            if (timeout) {
                return;
            }
            timeout = setTimeout(function() {
                return _async_to_generator(function() {
                    return _ts_generator(this, function(_state) {
                        try {
                            flushBufferedChunks(controller);
                        } catch (e) {
                            controller.error(e);
                            resolveFlightDataPromise();
                            return [
                                2
                            ];
                        }
                        if (!startedRSC) {
                            startedRSC = true;
                            writeRSCStream(rscStream, controller, nonce).catch(function(err) {
                                return controller.error(err);
                            }).then(resolveFlightDataPromise);
                        }
                        return [
                            2
                        ];
                    });
                })();
            }, 0);
        },
        flush: function flush(controller) {
            return _async_to_generator(function() {
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            return [
                                4,
                                flightDataPromise
                            ];
                        case 1:
                            _state.sent();
                            if (timeout) {
                                clearTimeout(timeout);
                                flushBufferedChunks(controller);
                            }
                            controller.enqueue(encoder.encode(trailer));
                            return [
                                2
                            ];
                    }
                });
            })();
        }
    });
}
function writeRSCStream(rscStream, controller, nonce) {
    return _async_to_generator(function() {
        var decoder, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, chunk, _String, base64, err, remaining;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    decoder = new TextDecoder('utf-8', {
                        fatal: true
                    });
                    _iteratorAbruptCompletion = false, _didIteratorError = false;
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        6,
                        7,
                        12
                    ]);
                    _iterator = _async_iterator(rscStream);
                    _state.label = 2;
                case 2:
                    return [
                        4,
                        _iterator.next()
                    ];
                case 3:
                    if (!(_iteratorAbruptCompletion = !(_step = _state.sent()).done)) return [
                        3,
                        5
                    ];
                    _value = _step.value;
                    chunk = _value;
                    // Try decoding the chunk to send as a string.
                    // If that fails (e.g. binary data that is invalid unicode), write as base64.
                    try {
                        writeChunk(JSON.stringify(decoder.decode(chunk, {
                            stream: true
                        })), controller, nonce);
                    } catch (err) {
                        ;
                        base64 = JSON.stringify(btoa((_String = String).fromCodePoint.apply(_String, _to_consumable_array(chunk))));
                        writeChunk("Uint8Array.from(atob(".concat(base64, "), m => m.codePointAt(0))"), controller, nonce);
                    }
                    _state.label = 4;
                case 4:
                    _iteratorAbruptCompletion = false;
                    return [
                        3,
                        2
                    ];
                case 5:
                    return [
                        3,
                        12
                    ];
                case 6:
                    err = _state.sent();
                    _didIteratorError = true;
                    _iteratorError = err;
                    return [
                        3,
                        12
                    ];
                case 7:
                    _state.trys.push([
                        7,
                        ,
                        10,
                        11
                    ]);
                    if (!(_iteratorAbruptCompletion && _iterator.return != null)) return [
                        3,
                        9
                    ];
                    return [
                        4,
                        _iterator.return()
                    ];
                case 8:
                    _state.sent();
                    _state.label = 9;
                case 9:
                    return [
                        3,
                        11
                    ];
                case 10:
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                    return [
                        7
                    ];
                case 11:
                    return [
                        7
                    ];
                case 12:
                    remaining = decoder.decode();
                    if (remaining.length) {
                        writeChunk(JSON.stringify(remaining), controller, nonce);
                    }
                    return [
                        2
                    ];
            }
        });
    })();
}
function writeChunk(chunk, controller, nonce) {
    controller.enqueue(encoder.encode("<script".concat(nonce ? ' nonce="'.concat(nonce, '"') : "", ">").concat(escapeScript("(self.__FLIGHT_DATA||=[]).push(".concat(chunk, ")")), "</script>")));
}
// Escape closing script tags and HTML comments in JS content.
// https://www.w3.org/TR/html52/semantics-scripting.html#restrictions-for-contents-of-script-elements
// Avoid replacing </script with <\/script as it would break the following valid JS: 0</script/ (i.e. regexp literal).
// Instead, escape the s character.
function escapeScript(script) {
    return script.replace(/<!--/g, '<\\!--').replace(/<\/(script)/gi, '</\\$1');
}


},
5920
/*!*****************************!*\
  !*** rsc client entry main ***!
  \*****************************/
() {
"use strict";
/*! ./src/rsc/components/counter.tsx */
/*! ./src/rsc/components/counter.tsx */

},

});
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

// webpack/runtime/compat_get_default_export
(() => {
// getDefaultExport function for compatibility with non-ESM modules
__webpack_require__.n = (module) => {
	var getter = module && module.__esModule ?
		() => (module['default']) :
		() => (module);
	__webpack_require__.d(getter, { a: getter });
	return getter;
};

})();
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/ensure_chunk
(() => {
// The chunk loading function for additional chunks
// Since all referenced chunks are already included
// in this file, this function is empty here.
__webpack_require__.e = () => (Promise.resolve()) 
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
// webpack/runtime/rsc_manifest
(() => {
__webpack_require__.rscM = JSON.parse("{\"serverManifest\":{\"4021670c6f9f964c40370841a697fb94447dd4f23f0abaf40c74c2958cd632e2d6\":{\"id\":\"1406\",\"name\":\"4021670c6f9f964c40370841a697fb94447dd4f23f0abaf40c74c2958cd632e2d6\",\"chunks\":[],\"async\":false}},\"clientManifest\":{\"/Users/dmitrbrvsk/alfabank/arui-scripts/packages/example-rsc/src/rsc/components/counter.tsx\":{\"id\":\"421\",\"name\":\"*\",\"chunks\":[\"432\",\"432.a5f60584.chunk.js\",\"366\",\"366.4b4d2056.chunk.js\"],\"cssFiles\":[\"/assets/366.a02d50c0.chunk.css\"],\"async\":false}},\"serverConsumerModuleMap\":{\"421\":{\"*\":{\"id\":\"407\",\"name\":\"*\",\"chunks\":[],\"async\":false}}},\"moduleLoading\":{\"prefix\":\"/assets/\"},\"entryCssFiles\":{\"/Users/dmitrbrvsk/alfabank/arui-scripts/packages/example-rsc/src/rsc/pages/home.tsx\":[\"/assets/783.d0e0a1ab.chunk.css\"]},\"entryJsFiles\":[\"/assets/vendor.61f0861c.js\",\"/assets/main.4494425b.js\"]}");

})();
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";

/*!*****************************************!*\
  !*** ./src/server/index.ts + 5 modules ***!
  \*****************************************/

// EXTERNAL MODULE: external "express"
var external_express_ = __webpack_require__(7252);
var external_express_default = /*#__PURE__*/__webpack_require__.n(external_express_);
;// CONCATENATED MODULE: external "node:path"
const external_node_path_namespaceObject = require("node:path");
var external_node_path_default = /*#__PURE__*/__webpack_require__.n(external_node_path_namespaceObject);
// EXTERNAL MODULE: ../arui-scripts-server/build/rsc/express.js
var express = __webpack_require__(4121);
// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.react-server.js
var jsx_runtime_react_server = __webpack_require__(1933);
// EXTERNAL MODULE: ./node_modules/react/react.react-server.js
var react_react_server = __webpack_require__(9404);
// EXTERNAL MODULE: ../arui-scripts-server/build/rsc/index.js
var rsc = __webpack_require__(354);
// EXTERNAL MODULE: ./node_modules/react-server-dom-rspack/server.node.js
var server_node = __webpack_require__(9261);
;// CONCATENATED MODULE: ./src/rsc/components/counter.tsx


const resources = (__webpack_require__.rscM.clientManifest?.["/Users/dmitrbrvsk/alfabank/arui-scripts/packages/example-rsc/src/rsc/components/counter.tsx"]?.cssFiles ?? []).map(function(href) {
    return /*#__PURE__*/ react_react_server.createElement("link", {
        key: href,
        rel: "stylesheet",
        href: href,
        precedence: "default"
    });
});
const Ref1 = (0,server_node.registerClientReference)(function() {
    throw new Error("Attempted to call the default export of \"/Users/dmitrbrvsk/alfabank/arui-scripts/packages/example-rsc/src/rsc/components/counter.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "/Users/dmitrbrvsk/alfabank/arui-scripts/packages/example-rsc/src/rsc/components/counter.tsx", "Counter");
const Counter = resources.length ? (props)=>/*#__PURE__*/ react_react_server.createElement(react_react_server.Fragment, null, resources, /*#__PURE__*/ react_react_server.createElement(Ref1, props)) : Ref1;

;// CONCATENATED MODULE: ./src/rsc/pages/home.tsx?rsc-server-entry-proxy=true
'use server-entry';

// Страница — асинхронный серверный компонент.
// Директива 'use server-entry' даёт rspack точку для сбора entryJsFiles/entryCssFiles.


async function getServerData() {
    // имитация похода за данными на сервере
    await new Promise((resolve)=>{
        setTimeout(resolve, 10);
    });
    return {
        now: new Date().toISOString(),
        pid: process.pid
    };
}
async function HomePage() {
    const data = await getServerData();
    return /*#__PURE__*/ (0,jsx_runtime_react_server.jsxs)("html", {
        lang: "ru",
        children: [
            /*#__PURE__*/ (0,jsx_runtime_react_server.jsxs)("head", {
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_react_server.jsx)("meta", {
                        charSet: "utf-8"
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_react_server.jsx)("title", {
                        children: "example-rsc POC"
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime_react_server.jsxs)("body", {
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_react_server.jsx)("h1", {
                        children: "RSC на arui-scripts"
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_react_server.jsxs)("p", {
                        "data-testid": "server-time",
                        children: [
                            "Отрендерено на сервере: ",
                            data.now,
                            " (pid ",
                            data.pid,
                            ")"
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_react_server.jsx)(Counter, {
                        initial: 5
                    })
                ]
            })
        ]
    });
}

;// CONCATENATED MODULE: ./src/rsc/pages/home.tsx


const home_HomePage = (0,server_node.createServerEntry)(
  HomePage,
  "/Users/dmitrbrvsk/alfabank/arui-scripts/packages/example-rsc/src/rsc/pages/home.tsx"
);

;// CONCATENATED MODULE: ./src/rsc/entry.tsx

// Модуль-граница RSC-графа (experimentalRsc.serverComponentsEntry, по умолчанию src/rsc/entry):
// этот модуль и всё, что он импортирует, arui-scripts компилирует в слое
// 'react-server-components' с условием резолва 'react-server'.



const page = home_HomePage;
const rscHandler = (0,rsc.createRscAppHandler)({
    render: ()=>({
            root: /*#__PURE__*/ (0,jsx_runtime_react_server.jsxs)(react_react_server.Fragment, {
                children: [
                    page.entryCssFiles?.map((href)=>/*#__PURE__*/ (0,jsx_runtime_react_server.jsx)("link", {
                            rel: "stylesheet",
                            href: href,
                            precedence: "default"
                        }, href)),
                    /*#__PURE__*/ (0,jsx_runtime_react_server.jsx)(home_HomePage, {})
                ]
            }),
            // в RSC-режиме publicPath абсолютный — пути готовы к использованию как есть
            bootstrapScripts: page.entryJsFiles
        })
});

;// CONCATENATED MODULE: ./src/server/index.ts
// Пользовательский сервер (serverEntry, обычный node-граф без react-server условия).




const app = external_express_default()();
// в prod ассеты отдаёт сам сервер; в dev их перехватывает dev-server до прокси
app.use('/assets', external_express_default()["static"](external_node_path_default().resolve('.build/assets')));
app.use((0,express/* .createRscExpress */.R)(rscHandler));
app.listen(3000, ()=>{
    // eslint-disable-next-line no-console
    console.log('[example-rsc] app server on http://localhost:3000');
});

})();

})()
;
//# sourceMappingURL=server.js.map