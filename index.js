// import { Ref } from "vue"
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import ValidateEmail from "./validate/ValidateEmail.js";
import ValidateTelephone from "./validate/ValidateTelephone.js";
import { ref } from "vue";
import ValidateRange from "./validate/ValidateRange.js";
import ValidateGreater from "./validate/ValidateGreater.js";
import ValidateLess from "./validate/ValidateLess.js";
export var config = {
    get: function (object_) { return object_; },
    set: function (object_, value) { return object_ = value; },
    init: function (value) { return value; },
    request: function (url, params) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(url, params)];
            case 1: return [2 /*return*/, (_a.sent()).text()];
        }
    }); }); },
    saveCookie: function (name, value, expr) { },
    getCookie: function (name) { },
    router: function () { return null; }
};
export var globalStateManager = function (class_) {
    _earlyInstances.push(class_);
};
export var __globas = function () {
    return _earlyInstances;
};
var addToPath = function (url, data) {
    if (url[url.length - 1] == '/') {
        return url + data;
    }
    return url + '/' + data;
};
var aavalidata = function (data) {
    if (typeof data == 'boolean')
        return true;
    if (Array.isArray(data) && data.length > 0) {
        return true;
    }
    else if (typeof data == 'object') {
        if ('__wrt' in data) {
            return aavalidata(data.__ref.get());
        }
        else {
            if (Object.keys(data).length > 0)
                return true;
        }
    }
    else if (typeof data == 'string') {
        if (data.trim().length > 0)
            return true;
    }
    else if (typeof data == 'undefined') {
        return false;
    }
    else if (typeof data == 'number') {
        return !Number.isNaN(data);
    }
    return false;
};
var buildUrl = function (path, query, pagiantion, template) {
    var fullURL = path;
    if (query == null) {
        query = {};
    }
    if (pagiantion.size > 0) {
        if (template == 'yii2-data-provider') {
            query['number'] = pagiantion.offset + 1;
            query['page[number]'] = pagiantion.offset + 1;
            query['page[size]'] = pagiantion.size;
        }
    }
    fullURL += '?';
    var compileName = function (names) {
        var result = '';
        var index = 0;
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
            var value = names_1[_i];
            if (index == 0) {
                result = value;
                index += 1;
            }
            else {
                result += "[".concat(value, "]");
            }
        }
        return result;
    };
    var proval = function (inner, names) {
        var mapOfQueryInne = [];
        for (var _i = 0, _a = Object.entries(inner); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            names.push(key);
            if (aavalidata(value) == false)
                continue;
            if (typeof value == 'object') {
                if ('__wrt' in value) {
                    mapOfQueryInne.push("".concat(compileName(names), "=").concat(value.__ref.get()));
                }
                else {
                    mapOfQueryInne.push(proval(value, names));
                }
            }
            else {
                mapOfQueryInne.push("".concat(compileName(names), "=").concat(value));
            }
        }
        return mapOfQueryInne.join('&');
    };
    var mapOfQuery = [];
    for (var _i = 0, _a = Object.entries(query); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (aavalidata(value) == false)
            continue;
        if (typeof value == 'object') {
            if ('__wrt' in value) {
                mapOfQuery.push("".concat(key, "=").concat(value.__ref.get()));
            }
            else {
                mapOfQuery.push(proval(value, [key]));
            }
        }
        else {
            mapOfQuery.push("".concat(key, "=").concat(value));
        }
    }
    fullURL += mapOfQuery.join('&');
    return fullURL;
};
var queryToApi = function (url, params, template) { return __awaiter(void 0, void 0, void 0, function () {
    var raw, dry;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, config.request(url, params)];
            case 1:
                raw = _a.sent();
                dry = JSON.parse(raw);
                if (template == 'yii2-data-provider') {
                    if ('data' in dry) {
                        if (Array.isArray(dry.data)) {
                            return [2 /*return*/, dry.data.map(function (value) { return value.attributes; })];
                        }
                        return [2 /*return*/, dry.data.attributes];
                    }
                }
                return [2 /*return*/, dry];
        }
    });
}); };
export var state = function (value) {
    if (value === void 0) { value = null; }
    var ref = null;
    var _A = new Proxy({ __wrt: [], __value: value }, {
        get: function (target, p, receiver) {
            if (p == '__wrt' || p == '__value') {
                return target[p];
            }
            else if (p == '__ref') {
                return ref;
            }
            else {
                return function () {
                    var kwargs = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        kwargs[_i] = arguments[_i];
                    }
                    target.__wrt.push([p, kwargs]);
                    return _A;
                };
            }
        },
        set: function (target, p, newValue, receiver) {
            if (p == '__ref') {
                ref = newValue;
            }
            return true;
        },
    });
    return _A;
};
export var pin = function (_data) {
    var _target = {
        __obbsv: 1,
        value: config.init(_data.__value),
        get: function () {
            return config.get(_target.value);
        },
        set: function (v) {
            config.set(_target.value, v);
            if (_target._lockKick == false) {
                _target.subs.forEach(function (value) {
                    value();
                });
            }
        },
        _lockKick: false,
        isSaving: config.init(false),
        api: {
            check: null,
            checkValue: '',
            once: true,
            path: '',
            method: "GET",
            customParams: {},
            auth: {
                login: '',
                password: ''
            },
            queryLinked: {},
            query: {},
            join: {
                object: null,
                name: ''
            },
            pagination: {
                append: false,
                size: 0,
                offset: 0,
                maxOffset: -1
            }
        },
        with: [],
        kick: null,
        subs: [],
        buxt: null,
        template: "",
        cache: {
            loaded: false,
            cacheType: "string",
            where: {
                isLocalStorage: false,
                isCache: false,
                isCooke: false
            },
            name: '',
            duration: 0,
        },
        type: 0
    };
    _data.__ref = _target;
    var _maps = [];
    var _isLoading = config.init(false);
    var apiOne = {
        __obbsv: 2,
        unlock: false,
        get: function (value) {
            var _this = this;
            _target.kick = function () {
                _this.user().get(value);
            };
            if (this.unlock == false && Object.keys(this.value).length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                var _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                var _path = _target.api.path;
                if (typeof value == 'object') {
                    _query = Object.assign(_query, value);
                }
                else {
                    if (_target.api.check != null) {
                        var inner = _target.api.check.get();
                        if (inner.length > 0) {
                            for (var _i = 0, inner_1 = inner; _i < inner_1.length; _i++) {
                                var part = inner_1[_i];
                                if (part[_target.api.checkValue] == value) {
                                    config.set(_target.value, part);
                                    return config.get(_target.value);
                                }
                            }
                        }
                    }
                    _path = addToPath(_path, value);
                }
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(function (e) {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            this.unlock = false;
            return config.get(_target.value);
        },
        getBy: function (name) {
            var _this = this;
            _target.kick = function () {
                _this.user().getBy(name);
            };
            if (this.unlock == false && Object.keys(this.value).length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                var _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                var _path = _target.api.path;
                var router = config.router();
                if (typeof name == 'object') {
                    var completeName = {};
                    for (var _i = 0, _a = Object.entries(name); _i < _a.length; _i++) {
                        var _b = _a[_i], key = _b[0], value = _b[1];
                        var val = '';
                        if (router.currentRoute.value.params && value in router.currentRoute.value.params) {
                            val = router.currentRoute.value.params[value];
                        }
                        else if (router.currentRoute.value.query && value in router.currentRoute.value.query) {
                            val = router.currentRoute.value.query[value];
                        }
                        completeName[key] = val;
                    }
                    _query = Object.assign(_query, completeName);
                }
                else {
                    var val = '';
                    if (router.currentRoute.value.params && name in router.currentRoute.value.params) {
                        val = router.currentRoute.value.params[name];
                    }
                    else if (router.currentRoute.value.query && name in router.currentRoute.value.query) {
                        val = router.currentRoute.value.query[name];
                    }
                    if (_target.api.check != null) {
                        var inner = _target.api.check.get();
                        if (inner.length > 0) {
                            for (var _c = 0, inner_2 = inner; _c < inner_2.length; _c++) {
                                var part = inner_2[_c];
                                if (part[_target.api.checkValue] == val) {
                                    config.set(_target.value, part);
                                    return config.get(_target.value);
                                }
                            }
                        }
                    }
                    _path = addToPath(_path, val);
                }
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(function (e) {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            this.unlock = false;
            return config.get(_target.value);
        },
        send: function (body) {
            config.set(_isLoading, true);
            var _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
            var _path = _target.api.path;
            var parsedBody = body;
            if (typeof body == 'object') {
                try {
                    parsedBody = JSON.parse(body);
                }
                catch (e) {
                    parsedBody = body;
                }
            }
            queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                method: _target.api.method,
                body: parsedBody
            }, _target.api.customParams), _target.template).then(function (e) {
                _target.set(e);
                config.set(_isLoading, false);
            });
        },
        multipart: function (formData) {
            config.set(_isLoading, true);
            var _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
            var _path = _target.api.path;
            var parsedBody = formData;
            queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                method: _target.api.method,
                body: parsedBody
            }, _target.api.customParams), _target.template).then(function (e) {
                _target.set(e);
                config.set(_isLoading, false);
            });
        },
        sync: function () {
            return {
                get: function (value) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _query, _path, inner, _i, inner_3, part;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                                    _path = _target.api.path;
                                    if (typeof value == 'object') {
                                        _query = Object.assign(_query, value);
                                    }
                                    else {
                                        if (_target.api.check != null) {
                                            inner = _target.api.check.get();
                                            if (inner.length > 0) {
                                                for (_i = 0, inner_3 = inner; _i < inner_3.length; _i++) {
                                                    part = inner_3[_i];
                                                    if (part[_target.api.checkValue] == value) {
                                                        config.set(_target.value, part);
                                                        return [2 /*return*/, config.get(_target.value)];
                                                    }
                                                }
                                            }
                                        }
                                        _path = addToPath(_path, value);
                                    }
                                    return [4 /*yield*/, queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                                            method: _target.api.method
                                        }, _target.api.customParams), _target.template)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                },
                send: function (body) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _query, _path, parsedBody;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                                    _path = _target.api.path;
                                    parsedBody = body;
                                    if (typeof body == 'object') {
                                        try {
                                            parsedBody = JSON.parse(body);
                                        }
                                        catch (e) {
                                            parsedBody = body;
                                        }
                                    }
                                    return [4 /*yield*/, queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                                            method: _target.api.method,
                                            body: parsedBody
                                        }, _target.api.customParams), _target.template)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                },
                multipart: function (formData) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _query, _path, parsedBody;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                                    _path = _target.api.path;
                                    parsedBody = formData;
                                    return [4 /*yield*/, queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                                            method: _target.api.method,
                                            body: parsedBody
                                        }, _target.api.customParams), _target.template)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                },
            };
        },
        method: function (type) {
            _target.api.method = type;
            return this;
        },
        setQuery: function (params) {
            _target.api.query = Object.assign(params, _target.api.query);
            return this;
        },
        user: function () {
            this.unlock = true;
            return this;
        }
    };
    var apiMany = {
        __obbsv: 2,
        unlock: false,
        all: function () {
            var _this = this;
            if (apiMany.unlock == false && apiMany.value.length == 0 || _target.api.once == false || apiMany.unlock) {
                if (_target.api.once && Object.keys(apiMany.value).length != 0 && apiMany.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                var _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                var _path = _target.api.path;
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(function (e) {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            apiMany.unlock = false;
            _target.kick = function () {
                _this.user().all();
            };
            return config.get(_target.value);
        },
        next: function () {
            if (this.unlock == false && this.value.length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                _target.api.pagination.offset += 1;
                var _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                var _path = _target.api.path;
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(function (e) {
                    if (_target.api.pagination.append) {
                        _target.set(_target.get().concat(e));
                        config.set(_isLoading, false);
                    }
                    else {
                        _target.set(e);
                        config.set(_isLoading, false);
                    }
                });
            }
            this.unlock = false;
        },
        prev: function () {
            if (this.unlock == false && this.value.length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                _target.api.pagination.offset -= 1;
                var _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                var _path = _target.api.path;
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(function (e) {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            this.unlock = false;
        },
        page: function (number) {
            if (this.unlock == false && this.value.length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                _target.set([]);
                _target.api.pagination.offset = number - 1;
                var _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                var _path = _target.api.path;
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(function (e) {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            this.unlock = false;
        },
        size: function (sze) {
            _target.api.pagination.size = sze;
            return this;
        },
        pageBy: function (name) {
            if (this.unlock == false && this.value.length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                _target.set([]);
                var router = config.router();
                var val = 0;
                if (router.currentRoute.value.params && name in router.currentRoute.value.params) {
                    val = Number.parseInt(router.currentRoute.value.params[name]);
                }
                else if (router.currentRoute.value.query && name in router.currentRoute.value.query) {
                    val = Number.parseInt(router.currentRoute.value.query[name]);
                }
                _target.api.pagination.offset = val - 1;
                var _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                var _path = _target.api.path;
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(function (e) {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            this.unlock = false;
        },
        reset: function () {
            if (this.unlock == false && this.value.length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                _target.api.pagination.offset = 0;
                _target.set([]);
            }
            this.unlock = false;
        },
        setQuery: function (params) {
            _target.api.query = Object.assign(params, _target.api.query);
            return this;
        },
        user: function () {
            this.unlock = true;
            return this;
        }
    };
    for (var _i = 0, _a = _data.__wrt; _i < _a.length; _i++) {
        var doOf = _a[_i];
        var args = doOf[1];
        switch (doOf[0]) {
            case "reload":
                _target.api.once = false;
                break;
            case "api":
                _target.type = 1;
                if (typeof args[0] == 'object') {
                    _target.api.path = args[0].path;
                    _target.api.query = args[0].query;
                }
                else {
                    _target.api.path = args[0];
                }
                break;
            case "keep":
                _target.type = 2;
                _target.cache.name = args[0];
                _target.cache.duration = args[1];
                break;
            case "cacheType":
                _target.cache.cacheType = args[0];
                break;
            case "template":
                _target.template = args[0];
                break;
            case "pagination":
                _target.api.pagination.size = args[0];
                if (args.length > 1)
                    _target.api.pagination.append = args[1];
                break;
            case "map":
                _maps.push(args[0]);
                break;
            case "place":
                if (!Array.isArray(args[0])) {
                    args[0] = [args[0]];
                }
                _target.cache.where.isLocalStorage = false;
                _target.cache.where.isCooke = false;
                _target.cache.where.isCache = false;
                for (var _b = 0, _c = args[0]; _b < _c.length; _b++) {
                    var a = _c[_b];
                    if (a == 'localStorage') {
                        _target.cache.where.isLocalStorage = true;
                    }
                    else if (a == 'cache') {
                        _target.cache.where.isCache = true;
                    }
                    else {
                        _target.cache.where.isCooke = true;
                    }
                }
                break;
            case "join":
                var objectJoin = args[0];
                if (typeof objectJoin == 'string') {
                    var data = objectJoin.split('.');
                    objectJoin = { __ref: StateManager.manager(data[0]).getParams(data[1]) };
                }
                if (objectJoin.__ref.type == 1) {
                    if (_data.__wrt[_data.__wrt.length - 1][0] == 'one') {
                        _target.api.check = objectJoin.__ref;
                        _target.api.once = false;
                        if (args.length > 1) {
                            _target.api.checkValue = args[1];
                        }
                    }
                    else {
                        _target.with.push({ name: objectJoin.__ref, field: args[1] });
                    }
                }
                else {
                    objectJoin.__ref.subs.push(function () {
                        if (_target.kick != null) {
                            _target.kick();
                        }
                    });
                }
                break;
            case "joinToQuery":
                {
                    var objectJoin_1 = args[1];
                    if (typeof objectJoin_1 == 'string') {
                        var data = objectJoin_1.split('.');
                        objectJoin_1 = { __ref: StateManager.manager(data[0]).getParams(data[1]), __wrt: [] };
                    }
                    if (objectJoin_1.__ref.type == 2 || objectJoin_1.__ref.type == 0) {
                        _target.api.queryLinked[args[0]] = objectJoin_1;
                    }
                }
                break;
            case "auth":
                if (typeof args[0] == 'object') {
                }
                _target.api.auth.login = args[0];
                _target.api.auth.password = args[1];
                break;
            case "one":
                if (_target.type == 1) {
                    if (config.get(_target.value) == null) {
                        config.set(_target.value, {});
                    }
                    Object.defineProperty(apiOne, 'value', {
                        get: function () {
                            return _target.get();
                        },
                        set: function (v) {
                            _target.set(v);
                        },
                    });
                    Object.defineProperty(apiOne, 'isLoading', {
                        get: function () {
                            return config.get(_isLoading);
                        },
                    });
                    return apiOne;
                }
                else if (_target.type == 2) {
                    _target.set = function (v) {
                        if (typeof localStorage !== 'undefined') {
                            if (_target.cache.where.isLocalStorage) {
                                if (typeof v == 'object') {
                                    v = JSON.parse(v);
                                }
                                localStorage[_target.cache.name] = v;
                                if (_target.cache.duration != 0 && _target.cache.duration != Infinity) {
                                    localStorage[_target.cache.name + "_exp"] = Date.now() + _target.cache.duration;
                                }
                            }
                        }
                        if (_target.cache.where.isCooke) {
                            if (typeof v == 'object') {
                                throw "Object cannot be keep in Cookie";
                            }
                            var expr = undefined;
                            if (_target.cache.duration != 0 && _target.cache.duration != Infinity) {
                                expr = Date.now() + _target.cache.duration;
                            }
                            config.saveCookie(_target.cache.name, v, expr);
                        }
                        if (typeof caches !== 'undefined') {
                            if (_target.cache.where.isCache) {
                                config.set(_target.isSaving, true);
                                caches.open("caching").then(function (e) {
                                    var reponse = new Response(v);
                                    e.put(_target.cache.name, reponse).then(function (e) {
                                        config.set(_target.isSaving, false);
                                    });
                                });
                                if (_target.cache.duration != 0 && _target.cache.duration != Infinity) {
                                    localStorage[_target.cache.name + "_exp"] = Date.now() + _target.cache.duration;
                                }
                            }
                        }
                        config.set(_target.value, v);
                        setTimeout(function () {
                            _target.subs.forEach(function (value) {
                                value();
                            });
                        }, 50);
                    };
                    _target.get = function () {
                        if (_target.cache.where.isCooke) {
                            if (_target.cache.loaded == false) {
                                config.set(_target.value, config.getCookie(_target.cache.name));
                                _target.cache.loaded == true;
                            }
                        }
                        else if (_target.cache.where.isLocalStorage) {
                            if (_target.cache.loaded == false) {
                                config.set(_target.value, localStorage[_target.cache.name]);
                                _target.cache.loaded == true;
                            }
                        }
                        else {
                            if (_target.cache.loaded == false) {
                                caches.open("vue-power-store").then(function (e) {
                                    e.match(_target.cache.name).then(function (e) {
                                        if (_target.cache.cacheType == 'string') {
                                            e === null || e === void 0 ? void 0 : e.text().then(function (e) {
                                                config.set(_target.value, e);
                                            });
                                        }
                                        else if (_target.cache.cacheType == 'number') {
                                            e === null || e === void 0 ? void 0 : e.text().then(function (e) {
                                                config.set(_target.value, Number.parseFloat(e));
                                            });
                                        }
                                        else if (_target.cache.cacheType == 'json') {
                                            e === null || e === void 0 ? void 0 : e.json().then(function (e) {
                                                config.set(_target.value, e);
                                            });
                                        }
                                        else if (_target.cache.cacheType == 'blob') {
                                            e === null || e === void 0 ? void 0 : e.blob().then(function (e) {
                                                config.set(_target.value, e);
                                            });
                                        }
                                        else if (_target.cache.cacheType == 'arrayBuffer') {
                                            e === null || e === void 0 ? void 0 : e.arrayBuffer().then(function (e) {
                                                config.set(_target.value, e);
                                            });
                                        }
                                        _target.cache.loaded == true;
                                    });
                                });
                            }
                        }
                        return config.get(_target.value);
                    };
                    return _target;
                }
                return _target;
                break;
            case "many":
                if (_target.type == 1) {
                    if (_target.get() == null) {
                        _target.set([]);
                    }
                    Object.defineProperty(apiMany, 'value', {
                        get: function () {
                            return _target.get();
                        },
                        set: function (v) {
                            _target.set(v);
                        },
                    });
                    Object.defineProperty(apiMany, 'isLoading', {
                        get: function () {
                            return config.get(_isLoading);
                        },
                    });
                    if (_target.api.pagination.size > 0) {
                        _target.kick = function () {
                            apiMany.user().page(1);
                        };
                    }
                    return apiMany;
                }
                return _target;
                break;
        }
    }
    return _target;
};
var _instances = new Map();
var _earlyInstances = [];
var StateManager = /** @class */ (function () {
    function StateManager(name) {
        if (name === void 0) { name = null; }
        this._nameInstance = "";
        this._isServer = false;
        this._paramsObjects = new Map();
        this._nameInstance = this.constructor.name;
        if (name != null) {
            this._nameInstance = name;
        }
        if (_instances.has(this._nameInstance) == false) {
            _instances.set(this._nameInstance, null);
            var server = new this.constructor();
            _instances.set(this._nameInstance, server);
        }
        this._isServer = _instances.get(this._nameInstance) == null;
    }
    StateManager.manager = function (name) {
        return _instances.get(name);
    };
    StateManager.prototype.getParams = function (name) {
        return this._paramsObjects.get(name);
    };
    StateManager.prototype.manage = function () {
        var names = Object.getOwnPropertyNames(this);
        var getServer = _instances.get(this._nameInstance);
        var _loop_1 = function (name_1) {
            if (this_1._isServer) {
                var objectGet = this_1[name_1];
                if (typeof objectGet == 'object' && '__wrt' in objectGet) {
                    var dataContains_1 = pin(objectGet);
                    dataContains_1.buxt = this_1;
                    if (dataContains_1.__obbsv == 1) {
                        Object.defineProperty(this_1, name_1, {
                            get: function () {
                                return dataContains_1.get();
                            },
                            set: function (v) {
                                dataContains_1.set(v);
                            }
                        });
                        if (dataContains_1.type == 2) {
                            dataContains_1.get();
                        }
                        this_1._paramsObjects.set(name_1, dataContains_1);
                    }
                    else {
                        Object.defineProperty(this_1, name_1, {
                            get: function () {
                                return dataContains_1;
                            }
                        });
                        this_1._paramsObjects.set(name_1, dataContains_1);
                    }
                }
            }
            else {
                var objectGet = this_1[name_1];
                if (typeof objectGet == 'object' && '__wrt' in objectGet) {
                    Object.defineProperty(this_1, name_1, {
                        get: function () {
                            return getServer[name_1];
                        },
                        set: function (v) {
                            getServer[name_1] = v;
                        }
                    });
                }
            }
        };
        var this_1 = this;
        for (var _i = 0, names_2 = names; _i < names_2.length; _i++) {
            var name_1 = names_2[_i];
            _loop_1(name_1);
        }
    };
    StateManager.prototype.name = function () {
        return this._nameInstance;
    };
    return StateManager;
}());
export default StateManager;
var FormModel = /** @class */ (function (_super) {
    __extends(FormModel, _super);
    function FormModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._fields = {};
        return _this;
    }
    FormModel.prototype.createForm = function (description) {
        if (this._isServer) {
            this._fields = description;
        }
        else {
            var context_1 = _instances.get(this.name());
            Object.defineProperty(this, '_fields', {
                get: function () {
                    return context_1._fields;
                },
            });
        }
    };
    Object.defineProperty(FormModel.prototype, "formData", {
        get: function () {
            var form = new FormData();
            for (var _i = 0, _a = Object.entries(this._fields); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                form.append(key, value.value.value);
            }
            return form;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FormModel.prototype, "form", {
        get: function () {
            return this._fields;
        },
        enumerable: false,
        configurable: true
    });
    FormModel.prototype.getValues = function () { };
    FormModel.prototype.setValues = function (data) {
        if ('value' in data) {
        }
        else {
            for (var _i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                this._fields[key].value.value = value;
            }
        }
    };
    FormModel.prototype.validate = function () {
        var _a;
        var result = true;
        for (var _i = 0, _b = Object.entries(this._fields); _i < _b.length; _i++) {
            var _c = _b[_i], key = _c[0], value = _c[1];
            if (value.validate != null) {
                var argv = [];
                if (value.validate instanceof ValidateRange) {
                    if (value.options.min)
                        argv.push(value.options.min);
                    else
                        argv.push(null);
                    if (value.options.max)
                        argv.push(value.options.max);
                    else
                        argv.push(null);
                }
                else if (value.validate instanceof ValidateGreater) {
                    if (value.options.max)
                        argv.push(value.options.max);
                }
                else if (value.validate instanceof ValidateLess) {
                    if (value.options.min)
                        argv.push(value.options.min);
                }
                if (!(_a = value.validate).behaviour.apply(_a, __spreadArray([value.value.value], argv, false))) {
                    result = false;
                }
            }
        }
        return result;
    };
    FormModel.prototype.localValidate = function (name) {
        var _a, _b;
        var data = this._fields[name];
        if (data.validate != null) {
            var argv = [];
            if (data.validate == ValidateRange) {
                if (data.options.min)
                    argv.push(data.options.min);
                else
                    argv.push(null);
                if (data.options.max)
                    argv.push(data.options.max);
                else
                    argv.push(null);
            }
            else if (data.validate == ValidateGreater) {
                if (data.options.max)
                    argv.push(data.options.max);
            }
            else if (data.validate == ValidateLess) {
                if (data.options.min)
                    argv.push(data.options.min);
            }
            if ((_a = data.validate).behaviour.apply(_a, __spreadArray([data.value.value], argv, false))) {
                data.options.validateMessage.value = "";
            }
            else {
                data.options.validateMessage.value = (_b = data.validate).getMessage.apply(_b, argv);
            }
        }
    };
    Object.defineProperty(FormModel.prototype, "field", {
        get: function () {
            return {
                text: function (title, options) {
                    var data = {
                        type: 'basic',
                        value: ref(""),
                        title: title,
                        options: __assign(__assign({}, options), { validateMessage: ref("") }),
                        validate: null
                    };
                    if (options.validate) {
                        data['validate'] = options.validate;
                    }
                    if (options.multiline) {
                        data.type = 'multiline';
                    }
                    return data;
                },
                email: function (title, options) {
                    return {
                        type: 'email',
                        value: ref(""),
                        title: title,
                        options: __assign(__assign({}, options), { validateMessage: ref("") }),
                        validate: ValidateEmail
                    };
                },
                tel: function (title, prefix) {
                    if (prefix === void 0) { prefix = "+1"; }
                    return {
                        type: 'tel',
                        value: ref(""),
                        title: title,
                        options: {
                            prefix: prefix,
                            validateMessage: ref("")
                        },
                        validate: ValidateTelephone
                    };
                },
                number: function (title, options) {
                    var data = {
                        type: 'number',
                        value: ref(0),
                        title: title,
                        options: __assign(__assign({}, options), { validateMessage: ref("") }),
                        validate: null
                    };
                    if (options.validate) {
                        data['validate'] = options.validate;
                    }
                    return data;
                },
                checkbox: function (title, validate) {
                    var data = {
                        type: 'checkbox',
                        value: ref(false),
                        title: title,
                        options: {
                            validateMessage: ref("")
                        },
                        validate: null
                    };
                    if (validate) {
                        data['validate'] = validate;
                    }
                    return data;
                }
            };
        },
        enumerable: false,
        configurable: true
    });
    return FormModel;
}(StateManager));
export { FormModel };
