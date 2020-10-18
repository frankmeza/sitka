<!-- BEGIN: TYPES -->
# Types in Sitka

- summary of types 
## `class` SitkaMeta

```ts
export class SitkaMeta {
    public readonly defaultState: {};
    public readonly middleware: Middleware[];
    public readonly reducersToCombine: ReducersMapObject;
    public readonly sagaRoot: (() => IterableIterator<{}>);
    public readonly sagaProvider: () => SitkaSagaMiddlewareProvider;
}
```

---

## `type` AppStoreCreator

```ts
export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store;
```

---

## `type` GeneratorContext

```ts
export type GeneratorContext = {
    readonly handlerKey: string;
    readonly fn: CallEffectFn<any>;
    readonly context: {};
};
```

---

## `type` ModuleState

```ts
export type ModuleState = {} | undefined | null;
```

---

## `type` PayloadAction

```ts
export type PayloadAction = Action & {
    readonly payload?: {};
};
```

---

## `type` SagaMeta

```ts
export type SagaMeta = {
    // tslint:disable-next-line:no-any
    readonly handler: any;
    readonly name: string;
    readonly direct?: boolean;
};
```

---

## `type` SitkaAction

```ts
export type SitkaAction = Action & {
    _moduleId: string;
    // tslint:disable-next-line:no-any
    _args: any;
};
```

---

## `type` SitkaModuleAction

```ts
export type SitkaModuleAction<T> =
    | Partial<T> & { type: string; payload?: {} }
    | Action;
```

---

## `type` SitkaOptions

```ts
export type SitkaOptions = {
    readonly log?: boolean;
    readonly sitkaInState?: boolean;
};
```

### `readonly log?: boolean`

This key gives the developer the options of seeing the Redux logs in the browser console.

### `readonly sitkaInState?: boolean;`

This key in not being used in code currently.

---

## `type` SitkaSagaMiddlewareProvider


```ts
export type SitkaSagaMiddlewareProvider = {
    middleware: SagaMiddleware<{}>;
    activate: () => void;
};
```

---

## `type` StoreOptions

```ts
export type StoreOptions = {
    readonly initialState?: {};
    readonly reducersToCombine?: ReducersMapObject[];
    readonly storeEnhancers?: StoreEnhancer[];
    readonly middleware?: Middleware[];
    readonly sagaRoot?: () => IterableIterator<{}>;
    readonly log?: boolean;
};
```

<!-- END: TYPES -->

<!-- BEGIN: UTILS -->

## `function` createAppStore

```ts
export const createAppStore = (options: StoreOptions): Store => {
    const {
        initialState = {},
        log = false,
        middleware = [],
        reducersToCombine = [],
        sagaRoot,
        storeEnhancers = [],
    } = options;

    const logger: Middleware = createLogger({
        stateTransformer: (state: {}) => state,
    });

    const sagaMiddleware: SagaMiddleware<{}> = createSagaMiddleware();

    const commonMiddleware: ReadonlyArray<Middleware> =
        log ? [sagaMiddleware, logger] :
        [sagaMiddleware];

    const appReducer = reducersToCombine.reduce(
        (acc, r) => ({ ...acc, ...r }),
        {},
    );

    const combinedMiddleware = [...commonMiddleware, ...middleware];

    const store: Store = createStore(
        combineReducers(appReducer),
        initialState as DeepPartial<{}>,
        compose(...storeEnhancers, applyMiddleware(...combinedMiddleware)),
    );

    if (sagaRoot) {
        sagaMiddleware.run(<any>sagaRoot);
    }

    return store;
};
```

---

## `function` createStateChangeKey

```ts
export const createStateChangeKey = (module: string) =>
    `module_${module}_change_state`.toUpperCase();
```

---

## `function` createHandlerKey

```ts
export const createHandlerKey = (module: string, handler: string) =>
    `module_${module}_${snakeCase(handler)}`.toUpperCase();
```

---

## `function` getInstanceMethodNames

```ts
export const getInstanceMethodNames = (obj: {}, stop: {}) => {
    const array: string[] = [];
    let proto = Object.getPrototypeOf(obj);

    while (proto && proto !== stop) {
        Object.getOwnPropertyNames(proto).forEach(name => {
            if (name !== "constructor") {
                if (hasMethod(proto, name)) {
                    array.push(name);
                }
            }
        });

        proto = Object.getPrototypeOf(proto);
    }

    return array;
};
```

## `function` hasMethod

```ts
const hasMethod = (obj: {}, name: string) => {
    const desc = Object.getOwnPropertyDescriptor(obj, name);
    return !!desc && typeof desc.value === "function";
};
```

---

<!-- END: UTILS -->

# Sitka class

<!-- BEGIN: SITKA -->

## `class` Sitka

```ts
export class Sitka<MODULES = {}> {
    protected registeredModules: MODULES;

    private forks: CallEffectFn<any>[] = [];
    private middlewareToAdd: Middleware[] = [];
    // tslint:disable-next-line:no-any
    private reducersToCombine: ReducersMapObject = {};
    // tslint:disable-next-line:no-any
    private sagas: SagaMeta[] = [];

    private dispatch?: Dispatch;
    private handlerOriginalFunctionMap = new Map<Function, GeneratorContext>();
    private sitkaOptions: SitkaOptions;

    constructor (sitkaOptions?: SitkaOptions) {
        this.sitkaOptions = sitkaOptions;
        this.doDispatch = this.doDispatch.bind(this);
        this.createStore = this.createStore.bind(this);
        this.createRoot = this.createRoot.bind(this);
        this.registeredModules = {} as MODULES;
    }
}
```

---

## `Sitka method` createSitkaMeta

```ts
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
```

---

## `Sitka method` createStore

```ts
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
```

---

## `Sitka method` getModules

```ts
public getModules (): MODULES {
    return this.registeredModules;
}
```

---

## `Sitka method` register

```ts
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
```

---

## `Sitka method` setDispatch

```ts
public setDispatch (dispatch: Dispatch): void {
    this.dispatch = dispatch;
}
```

---

## `Sitka method` createRoot

```ts
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
```

---

## `Sitka method` doDispatch

```ts
private doDispatch (action: Action): void {
    const { dispatch } = this;

    if (!!dispatch) {
        dispatch(action);
    } else {
        alert("no dispatch");
    }
}
```

---

## `Sitka method` getDefaultState

```ts
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
```

<!-- END: SITKA -->

<!-- BEGIN: SITKA_MODULE -->

# SitkaModule class

## `class` SitkaModule

```ts
export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES> {
    public modules: MODULES;
    public abstract defaultState?: MODULE_STATE;
    public abstract moduleName: string;

    private handlerOriginalFunctionMap = new Map<Function, GeneratorContext>();

    constructor () {
        this.getState = this.getState.bind(this);
        this.mergeState = this.mergeState.bind(this);
    }
    // ... methods
}
```

---

## `SitkaModule method` reduxKey

```ts
// by default, the redux key is same as the moduleName
public reduxKey (): string {
    return this.moduleName;
}
```

---

## `SitkaModule method` createAction

```ts
protected createAction (
    v: Partial<MODULE_STATE>,
    usePayload?: boolean,
): SitkaModuleAction<MODULE_STATE> {
    const type = createStateChangeKey(this.reduxKey());
    if (!v) {
        return { type, [type]: null };
    }

    if (typeof v !== "object") {
        return { type, [type]: v };
    } else {
        if (usePayload) {
            return {
                type,
                payload: v,
            };
        }
        return Object.assign({ type }, v);
    }
}
```

---

## `SitkaModule method` setState

```ts
protected setState (state: MODULE_STATE, replace?: boolean): Action {
    return this.createAction(state, replace);
}
```

---

## `SitkaModule method` resetState

```ts
protected resetState (): Action {
    return this.setState(this.defaultState);
}
```

---

## `SitkaModule method` getState

```ts
protected getState (state: {}): MODULE_STATE {
    return state[this.reduxKey()];
}
```

---

## `SitkaModule method` *mergeState, generator function

```ts
protected *mergeState (partialState: Partial<MODULE_STATE>): {} {
    const currentState = yield select(this.getState);
    const newState = { ...currentState, ...partialState };
    yield put(this.setState(newState));
}
```

---

## `SitkaModule method` createSubscription

```ts
// can be either the action type string, or the module function to watch
protected createSubscription (
    actionTarget: string | Function,
    handler: CallEffectFn<any>,
): SagaMeta {
    if (typeof actionTarget === "string") {
        return {
            name: actionTarget,
            handler,
            direct: true,
        };
    } else {
        const generatorContext: GeneratorContext = this.handlerOriginalFunctionMap.get(
            actionTarget,
        );
        return {
            name: generatorContext.handlerKey,
            handler,
            direct: true,
        };
    }
}
```

---

## `SitkaModule method` provideMiddleware

```ts
public provideMiddleware (): Middleware[] {
    return [];
}
```

---

## `SitkaModule method` provideSubscriptions

```ts
provideSubscriptions (): SagaMeta[] {
    return [];
}
```

---

## `SitkaModule method` provideForks

```ts
provideForks (): CallEffectFn<any>[] {
    return [];
}
```

---

## `SitkaModule method` *callAsGenerator, generator function

```ts
protected *callAsGenerator (fn: Function, ...rest: any[]): {} {
    const generatorContext: GeneratorContext = this.handlerOriginalFunctionMap.get(
        fn,
    );

return yield apply(
        generatorContext.context,
        generatorContext.fn,
        <any>rest,
    );
}
```

<!-- END: SITKA_MODULE -->
