"use strict";
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var effects_1 = require("redux-saga/effects");
var utils_1 = require("./utils");
var interfaces_and_types_1 = require("./interfaces_and_types");
var Sitka = /** @class */ (function () {
    function Sitka(sitkaOptions) {
        // tslint:disable-next-line:no-any
        this.sagas = [];
        this.forks = [];
        // tslint:disable-next-line:no-any
        this.reducersToCombine = {};
        this.middlewareToAdd = [];
        this.sitkaOptions = sitkaOptions;
        this.doDispatch = this.doDispatch.bind(this);
        this.createStore = this.createStore.bind(this);
        this.createRoot = this.createRoot.bind(this);
        this.registeredModules = {};
    }
    Sitka.prototype.setDispatch = function (dispatch) {
        this.dispatch = dispatch;
    };
    Sitka.prototype.getModules = function () {
        return this.registeredModules;
    };
    Sitka.prototype.createSitkaMeta = function () {
        return {
            defaultState: __assign({}, this.getDefaultState(), { __sitka__: this }),
            middleware: this.middlewareToAdd,
            reducersToCombine: __assign({}, this.reducersToCombine, { __sitka__: function (state) {
                    if (state === void 0) { state = null; }
                    return state;
                } }),
            sagaRoot: this.createRoot(),
        };
    };
    Sitka.prototype.createStore = function (appstoreCreator) {
        if (!!appstoreCreator) {
            var store = appstoreCreator(this.createSitkaMeta());
            this.dispatch = store.dispatch;
            return store;
        }
        else {
            // use own appstore creator
            var meta = this.createSitkaMeta();
            var store = utils_1.createAppStore({
                initialState: meta.defaultState,
                reducersToCombine: [meta.reducersToCombine],
                middleware: meta.middleware,
                sagaRoot: meta.sagaRoot,
                log: this.sitkaOptions && this.sitkaOptions.log === true,
            });
            this.dispatch = store.dispatch;
            return store;
        }
    };
    Sitka.prototype.register = function (instances) {
        var _this = this;
        instances.forEach(function (instance) {
            var methodNames = utils_1.getInstanceMethodNames(instance, Object.prototype);
            var handlers = methodNames.filter(function (m) { return m.indexOf("handle") === 0; });
            var moduleName = instance.moduleName;
            var _a = _this, middlewareToAdd = _a.middlewareToAdd, sagas = _a.sagas, forks = _a.forks, reducersToCombine = _a.reducersToCombine, dispatch = _a.doDispatch;
            instance.modules = _this.getModules();
            middlewareToAdd.push.apply(middlewareToAdd, instance.provideMiddleware());
            instance.provideForks().forEach(function (f) {
                forks.push(f.bind(instance));
            });
            handlers.forEach(function (s) {
                // tslint:disable:ban-types
                var original = instance[s]; // tslint:disable:no-any
                var handlerKey = utils_1.createHandlerKey(moduleName, s);
                function patched() {
                    var args = arguments;
                    var action = {
                        _args: args,
                        _moduleId: moduleName,
                        type: handlerKey,
                    };
                    dispatch(action);
                }
                sagas.push({
                    handler: original,
                    name: utils_1.createHandlerKey(moduleName, s),
                });
                // tslint:disable-next-line:no-any
                instance[s] = patched;
                interfaces_and_types_1.handlerOriginalFunctionMap.set(patched, {
                    handlerKey: handlerKey,
                    fn: original,
                    context: instance,
                });
            });
            if (instance.defaultState !== undefined) {
                // create reducer
                var reduxKey = instance.reduxKey();
                var defaultState_1 = instance.defaultState;
                var actionType_1 = utils_1.createStateChangeKey(reduxKey);
                reducersToCombine[reduxKey] = function (state, action) {
                    if (state === void 0) { state = defaultState_1; }
                    if (action.type !== actionType_1) {
                        return state;
                    }
                    var type = utils_1.createStateChangeKey(moduleName);
                    var newState = Object.keys(action)
                        .filter(function (k) { return k !== "type"; })
                        .reduce(function (acc, k) {
                        var _a, _b;
                        var val = action[k];
                        if (k === type) {
                            return val;
                        }
                        if (val === null || typeof val === "undefined") {
                            return Object.assign(acc, (_a = {},
                                _a[k] = null,
                                _a));
                        }
                        return Object.assign(acc, (_b = {},
                            _b[k] = val,
                            _b));
                    }, Object.assign({}, state));
                    return newState;
                };
            }
            _this.registeredModules[moduleName] = instance;
        });
        // do subscribers after all has been registered
        instances.forEach(function (instance) {
            var sagas = _this.sagas;
            var subscribers = instance.provideSubscriptions();
            sagas.push.apply(sagas, subscribers);
        });
    };
    Sitka.prototype.getDefaultState = function () {
        var modules = this.getModules();
        return Object.keys(modules)
            .map(function (k) { return modules[k]; })
            .reduce(function (acc, m) {
            var _a;
            return (__assign({}, acc, (_a = {}, _a[m.moduleName] = m.defaultState, _a)));
        }, {});
    };
    Sitka.prototype.createRoot = function () {
        var _a = this, sagas = _a.sagas, forks = _a.forks, registeredModules = _a.registeredModules;
        function root() {
            var toYield, _loop_1, i, i, f, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        toYield = [];
                        _loop_1 = function (i) {
                            var s, item, generator, item;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        s = sagas[i];
                                        if (!s.direct) return [3 /*break*/, 2];
                                        return [4 /*yield*/, effects_1.takeEvery(s.name, s.handler)];
                                    case 1:
                                        item = _a.sent();
                                        toYield.push(item);
                                        return [3 /*break*/, 4];
                                    case 2:
                                        generator = function (action) {
                                            var instance;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        instance = registeredModules[action._moduleId];
                                                        return [4 /*yield*/, effects_1.apply(instance, s.handler, action._args)];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        };
                                        return [4 /*yield*/, effects_1.takeEvery(s.name, generator)];
                                    case 3:
                                        item = _a.sent();
                                        toYield.push(item);
                                        _a.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < sagas.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // forks
                        for (i = 0; i < forks.length; i++) {
                            f = forks[i];
                            item = effects_1.fork(f);
                            toYield.push(item);
                        }
                        /* tslint:enable */
                        return [4 /*yield*/, effects_1.all(toYield)];
                    case 5:
                        /* tslint:enable */
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        return root;
    };
    Sitka.prototype.doDispatch = function (action) {
        var dispatch = this.dispatch;
        if (!!dispatch) {
            dispatch(action);
        }
        else {
            // alert("no dispatch")
        }
    };
    return Sitka;
}());
exports.Sitka = Sitka;
//# sourceMappingURL=sitka.js.map