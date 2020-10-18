import { Action, Dispatch, Middleware, ReducersMapObject, Store } from "redux";
import { createLogger } from "redux-logger";
import createSagaMiddleware from "redux-saga";
import {
    all,
    apply,
    takeEvery,
    fork,
    ForkEffect,
    CallEffectFn,
} from "redux-saga/effects";

import { SitkaModule } from "./sitka_module";
import {
    SagaMeta,
    SitkaOptions,
    GeneratorContext,
    SitkaMeta,
    SitkaSagaMiddlewareProvider,
    AppStoreCreator,
    ModuleState,
    PayloadAction,
    SitkaAction,
} from "./types";
import {
    createAppStore,
    createHandlerKey,
    createStateChangeKey,
    getInstanceMethodNames,
} from "./utils";

export class Sitka<MODULES = {}> {
    private forks: CallEffectFn<any>[] = [];

    public handlerOriginalFunctionMap = new Map<Function, GeneratorContext>();

    private middlewareToAdd: Middleware[] = [];
    // tslint:disable-next-line:no-any
    private reducersToCombine: ReducersMapObject = {};
    // tslint:disable-next-line:no-any
    private sagas: SagaMeta[] = [];

    protected registeredModules: MODULES;

    private dispatch?: Dispatch;
    private sitkaOptions: SitkaOptions;

    constructor (sitkaOptions?: SitkaOptions) {
        this.sitkaOptions = sitkaOptions;
        this.doDispatch = this.doDispatch.bind(this);
        this.createStore = this.createStore.bind(this);
        this.createRoot = this.createRoot.bind(this);
        this.registeredModules = {} as MODULES;
    }

    public createSitkaMeta (): SitkaMeta {
        // by default, we include sitka object in the meta
        const includeSitka =
            // if no options, or
            !this.sitkaOptions ||
            // if options were provided, but sitkaInState is not defined, or
            this.sitkaOptions.sitkaInState === undefined ||
            // if sitkaInState is defined, and is not explicitly set, then don't include it
            this.sitkaOptions.sitkaInState !== false;

        const includeLogging = !!this.sitkaOptions && this.sitkaOptions.log;

        const logger: Middleware = createLogger({
            stateTransformer: (state: {}) => state,
        });

        const sagaRoot = this.createRoot();

        const defaultState = {
            ...this.getDefaultState(),
            __sitka__:
                includeSitka ? this :
                undefined,
        };

        const middleware =
            includeLogging ? [...this.middlewareToAdd, logger] :
            this.middlewareToAdd;

        const sitkaReducer = (state: this | null = null): this | null => state;

        const reducersToCombine = {
            ...this.reducersToCombine,
            __sitka__:
                includeSitka ? sitkaReducer :
                undefined,
        };

        const sagaProvider = (): SitkaSagaMiddlewareProvider => {
            const middleware = createSagaMiddleware<{}>();

            return {
                middleware,
                activate: () => {
                    middleware.run(sagaRoot);
                },
            };
        };

        return {
            defaultState,
            middleware,
            reducersToCombine,
            sagaRoot,
            sagaProvider,
        };
    }

    public createStore (appstoreCreator?: AppStoreCreator): Store<{}> | null {
        if (!!appstoreCreator) {
            const store = appstoreCreator(this.createSitkaMeta());
            this.dispatch = store.dispatch;
            return store;
        } else {
            // use own appstore creator
            const {
                defaultState,
                middleware,
                reducersToCombine,
                sagaRoot,
            } = this.createSitkaMeta();

            const store = createAppStore({
                initialState: defaultState,
                reducersToCombine: [reducersToCombine],
                middleware: middleware,
                sagaRoot: sagaRoot,
                log: this.sitkaOptions && this.sitkaOptions.log,
            });

            this.dispatch = store.dispatch;

            return store;
        }
    }

    public getModules (): MODULES {
        return this.registeredModules;
    }

    public register<SITKA_MODULE extends SitkaModule<ModuleState, MODULES>> (
        instances: SITKA_MODULE[],
    ): void {
        instances.forEach(instance => {
            const methodNames = getInstanceMethodNames(
                instance,
                Object.prototype,
            );

            const {
                doDispatch: dispatch,
                forks,
                middlewareToAdd,
                reducersToCombine,
                sagas,
            } = this;

            instance.modules = this.getModules();
            instance.handlerOriginalFunctionMap = this.handlerOriginalFunctionMap;

            middlewareToAdd.push(...instance.provideMiddleware());

            instance.provideForks().forEach(fork => {
                forks.push(fork.bind(instance));
            });

            const { moduleName } = instance;

            const handlers = methodNames.filter(methodName => {
                return methodName.indexOf("handle") === 0;
            });

            handlers.forEach(handlerName => {
                // tslint:disable:ban-types
                const original: Function = instance[handlerName]; // tslint:disable:no-any
                const handlerKey = createHandlerKey(moduleName, handlerName);

                function patched (): void {
                    const args = arguments;

                    const action: SitkaAction = {
                        _args: args,
                        _moduleId: moduleName,
                        type: handlerKey,
                    };

                    dispatch(action);
                }

                sagas.push({
                    handler: original,
                    name: createHandlerKey(moduleName, handlerName),
                });

                // tslint:disable-next-line:no-any
                instance[handlerName] = patched;

                this.handlerOriginalFunctionMap.set(patched, {
                    handlerKey,
                    fn: original,
                    context: instance,
                });
            });

            if (instance.defaultState !== undefined) {
                // create reducer
                const reduxKey: string = instance.reduxKey();
                const defaultState = instance.defaultState;
                const actionType: string = createStateChangeKey(reduxKey);

                reducersToCombine[reduxKey] = (
                    state: ModuleState = defaultState,
                    action: PayloadAction,
                ): ModuleState => {
                    if (action.type !== actionType) {
                        return state;
                    }

                    const changeKey = createStateChangeKey(moduleName);
                    const payload = action.payload;

                    if (!!payload) {
                        return payload;
                    }

                    const newState: ModuleState = Object.keys(action)
                        .filter(key => key !== "type")
                        .reduce((acc, key) => {
                            const val = action[key];

                            if (key === changeKey) {
                                return val;
                            }

                            if (val === null || typeof val === "undefined") {
                                return Object.assign(acc, {
                                    [key]: null,
                                });
                            }

                            return Object.assign(acc, {
                                [key]: val,
                            });
                        }, Object.assign({}, state)) as ModuleState;

                    return newState;
                };
            }

            this.registeredModules[moduleName] = instance;
        });

        // do subscribers after all has been registered
        instances.forEach(instance => {
            const { sagas } = this;
            const subscribers = instance.provideSubscriptions();
            sagas.push(...subscribers);
        });
    }

    public setDispatch (dispatch: Dispatch): void {
        this.dispatch = dispatch;
    }

    private createRoot (): (() => IterableIterator<{}>) {
        const { sagas, forks, registeredModules } = this;

        function* root (): IterableIterator<{}> {
            /* tslint:disable */
            const toYield: ForkEffect[] = [];

            // generators
            for (let i = 0; i < sagas.length; i++) {
                const sagaMeta: SagaMeta = sagas[i];

                if (sagaMeta.direct) {
                    const item: any = yield takeEvery(
                        sagaMeta.name,
                        sagaMeta.handler,
                    );

                    toYield.push(item);
                } else {
                    const generator = function* (action: SitkaAction): {} {
                        const instance: {} =
                            registeredModules[action._moduleId];

                        yield apply(instance, sagaMeta.handler, action._args);
                    };

                    const item: any = yield takeEvery(sagaMeta.name, generator);
                    toYield.push(item);
                }
            }

            // forks
            for (let i = 0; i < forks.length; i++) {
                const f = forks[i];
                const item: any = fork(f);
                toYield.push(item);
            }

            /* tslint:enable */
            yield all(toYield);
        }

        return root;
    }

    private doDispatch (action: Action): void {
        const { dispatch } = this;

        if (!!dispatch) {
            dispatch(action);
        } else {
            alert("no dispatch");
        }
    }

    private getDefaultState (): {} {
        const modules = this.getModules();

        const defaultState = Object.keys(modules)
            .map(key => modules[key])
            .reduce((acc: {}, module: SitkaModule<{} | null, MODULES>) => {
                return {
                    ...acc,
                    [module.moduleName]: module.defaultState,
                };
            }, {});

        return defaultState;
    }
}

export {
    // utils
    createAppStore,
    createHandlerKey,
    createStateChangeKey,
    getInstanceMethodNames,

    // types
    AppStoreCreator,
    GeneratorContext,
    SagaMeta,
    ModuleState,
    PayloadAction,
    SitkaAction,
    SitkaMeta,
    SitkaModule,
    SitkaOptions,
    SitkaSagaMiddlewareProvider,
};
