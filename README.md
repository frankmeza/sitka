[![Build Status](https://travis-ci.com/frankmeza/sitka.svg?branch=master)](https://travis-ci.com/frankmeza/sitka)

# Sitka Redux Module Manager

This library allows you to construct strongly typed APIs for managing your Redux store. You can use it to package up related behavior into Typescript classes, which can be injected into your Redux store for easy access throughout your application.

The Sitka Redux package manager can be used in many different contexts, including React apps, Electron apps, and more. A canonical use of this library can be found in https://github.com/frankmeza/sitka-counter-ts, a simple counter app illustrating how Sitka can be used in a React Web app.

The Sitka Monorepo (https://github.com/olioapps/sitka-monorepo) also illustrates how you can use Sitka inside larger Redux based apps.

## Whats a Sitka Redux Module?

A Sitka Redux Module refers to the logical grouping of a region of Redux store state and the operations which can change it. Mutators of state are typically reducers and sagas, which are triggered by action creators.

Sitka makes it possible to define and manage a piece of the Redux store conveniently, organizing all the responsibilities described above into a single Typescript class.

## Instantiating the module manager

Create an instance of the module manager using its constructor:

```typescript
const sitka = new Sitka<AppModules>()
```

The library needs to know the type of your modules, hence providing the type parameter `AppModules`; this will be used by your modules to recognize and invoke their peers.

You can register you modules via a simple register method on the sitka instance:

```typescript
sitka.register([
    new ColorModule(),
])
```

## Example Sitka Redux Module

Sitka Redux Modules are plain Typescript classes which expose Redux Sagas as public methods. 
Here is a simple example, a module which tracks the `color` state in your Redux state.

```typescript
import { AppModules } from "../../index"
import { put } from "Redux-saga/effects"
import { SitkaModule } from "olio-sitka"

export type ColorState = string | null

export class ColorModule extends SitkaModule<ColorState, AppModules> {
    public moduleName: string = "color"
    public defaultState: ColorState = null

    public *handleColor(color: string): IterableIterator<{}> {
        yield put(this.setState(color))
    }
}
```

This simple module can be invoked via plain calls inside of your presentational components:

```typescript
sitka.handleColor("red")
```

Invoking `handleColor` will instruct the sitka package manager to dispatch an action which will call the generator function defined in `ColorModule`. The generator function can then produce futher effects, such as the `setState` function which will mutate the Redux state tree for the piece of state idenfied by the `moduleName` class attribute. You can alternatively specify a different key to manage by overriding the `reduxKey()`.

Any Sitka module generator function whose name is prefixed with `handle` will be wrapped in an action and can be invoked directly from client code such as React components.

## Using the Sikta Module Manager

The module manager can be used to integrate with an existing Redux store, or to entire manage the store by itself. The simplest case is the latter, where the store shape and the API for mutating it is entirely managed by Sitka modules.

### Creating a Sitka managed store

```typescript
const sitka = new Sitka<AppModules>()
sitka.register([ 
    new ColorModule(),
])

const store = sitka.createStore()
```

This instance of the Redux store can be injected into your application, for example using `react-Redux`. Please see the section below for an example of how to use Sitka modules within a React application.

### Adding Sitka to a Redux store
See the wiki (https://github.com/olioapps/sitka/wiki/Adding-Sitka-to-a-Redux-store) for an example of how to integrate Sitka with an existing Redux storer.

## Using Sitka managed Redux modules

### Basic usage
After you create a Sitka managed or integrated store, you can begin to change its state by calling methods on the modules. For example:

```typescript
// create a sitka instance and register a module
const sitka = new Sitka<{readonly color: ColorModule}>()
sitka.register([ new ColorModule() ])

// create a wholly sitka-managed store
const store = sitka.createStore()

// print the current state of the store
console.log(store.getState())
// returns: { "color": null }

// invoke the color module, and
sitka.getModules().color.handleColor("red")
// print the current state of the store
console.log(store.getState())
// returns: { "color": "red" }
```

### React web usage
Using Sitka modules inside React applications is easy! Check out https://github.com/olioapps/sitka/wiki/React-web-usage for an example. You can also head over to https://github.com/frankmeza/sitka-counter-ts for an example of a simple repo using Sitka modules.

===

<sub><a name="top_of_page">@top_of_page</a></sub>  

## Table Of Contents

### Types

- [class_sitkameta](#class_sitkameta)
- [type_appstorecreator](#type_appstorecreator)
- [type_generatorcontext](#type_generatorcontext)
- [type_modulestate](#type_modulestate)
- [type_payloadaction](#type_payloadaction)
- [type_sagameta](#type_sagameta)
- [type_sitkaaction](#type_sitkaaction)
- [type_sitkamoduleaction](#type_sitkamoduleaction)
- [type_sitkaoptions](#type_sitkaoptions)
- [type_sitkasagamiddlewareprovider](#type_sitkasagamiddlewareprovider)
- [type_storeoptions](#type_storeoptions)

### Functions

- [function_createappstore](#function_createappstore)
- [function_createstagechangekey](#function_createstagechangekey)
- [function_createhandlerkey](#function_createhandlerkey)
- [function_getinstancemethodnames](#function_getinstancemethodnames)
- [function_hasmethod](#function_hasmethod)

<!-- BEGIN: TYPES -->
  
# Types in Sitka 

<sub><a name="class_sitkameta">@class_sitkameta</a></sub>
  
## `class` SitkaMeta

```ts
export class SitkaMeta {
    public readonly defaultState: {};
    public readonly middleware: Middleware[];
    public readonly reducersToCombine: ReducersMapObject;
    public readonly sagaRoot: () => IterableIterator<{}>;
    public readonly sagaProvider: () => SitkaSagaMiddlewareProvider;
}
```

<sub>[go back to top](#top_of_page)</sub>  

---

<sub><a name="type_appstorecreator">@type_appstorecreator</a></sub>

## `type` AppStoreCreator

```ts
export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store;
```

<sub>[go back to top](#top_of_page)</sub>  

---

<sub><a name="type_generatorcontext">@type_generatorcontext</a></sub>

## `type` GeneratorContext

```ts
export type GeneratorContext = {
    readonly handlerKey: string;
    readonly fn: CallEffectFn<any>;
    readonly context: {};
};
```

<sub>[go back to top](#top_of_page)</sub>  

---

<sub><a name="type_modulestate">@type_modulestate</a></sub>

## `type` ModuleState

```ts
export type ModuleState = {} | undefined | null;
```

<sub>[go back to top](#top_of_page)</sub>  

---

<sub><a name="type_payloadaction">@type_payloadaction</a></sub>

## `type` PayloadAction

```ts
export type PayloadAction = Action & {
    readonly payload?: {};
};
```

<sub>[go back to top](#top_of_page)</sub>  

---

<sub><a name="type_sagameta">@type_sagameta</a></sub>

## `type` SagaMeta

```ts
export type SagaMeta = {
    // tslint:disable-next-line:no-any
    readonly handler: any;
    readonly name: string;
    readonly direct?: boolean;
};
```

<sub>[go back to top](#top_of_page)</sub>  

---

<sub><a name="type_sitkaaction">@type_sitkaaction</a></sub>

## `type` SitkaAction

```ts
export type SitkaAction = Action & {
    _moduleId: string;
    // tslint:disable-next-line:no-any
    _args: any;
};
```

<sub>[go back to top](#top_of_page)</sub>  

---

<sub><a name="type_sitkamoduleaction">@type_sitkamoduleaction</a></sub>

## `type` SitkaModuleAction

```ts
export type SitkaModuleAction<T> =
    | Partial<T> & { type: string; payload?: {} }
    | Action;
```

<sub>[go back to top](#top_of_page)</sub>  

---

<sub><a name="type_sitkaoptions">@type_sitkaoptions</a></sub>

## `type` SitkaOptions

```ts
export type SitkaOptions = {
    readonly log?: boolean;
    readonly sitkaInState?: boolean;
};
```

<sub>[go back to top](#top_of_page)</sub>  

### `readonly log?: boolean`

This key gives the developer the options of seeing the Redux logs in the browser console, by setting it to `{ log: true }`.

### `readonly sitkaInState?: boolean;`

---

<sub><a name="type_sitkasagamiddlewareprovider">@type_sitkasagamiddlewareprovider</a></sub>

## `type` SitkaSagaMiddlewareProvider

```ts
export type SitkaSagaMiddlewareProvider = {
    middleware: SagaMiddleware<{}>;
    activate: () => void;
};
```

---

<sub><a name="type_storeoptions">@type_storeoptions</a></sub>

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

<sub><a name="function_createappstore">@function_createappstore</a></sub>

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
        sagaMiddleware.run(sagaRoot as any);
    }

    return store;
};
```

<sub>[go back to top](#top_of_page)</sub>  

---

<sub><a name="function_createstagechangekey">@function_createstagechangekey</a></sub>

## `function` createStateChangeKey

```ts
export const createStateChangeKey = (module: string) =>
    `${module}_module_change_state`.toUpperCase();
```

<sub>[go back to top](#top_of_page)</sub>  

// todo

This is used in `SitkaModule.createAction` to create a `type` for use in a Redux action. 

---

<sub><a name="function_createhandlerkey">@function_createhandlerkey</a></sub>

## `function` createHandlerKey

```ts
export const createHandlerKey = (module: string, handler: string) =>
    `module_${module}_${snakeCase(handler)}`.toUpperCase();
```

<sub>[go back to top](#top_of_page)</sub>  

---

<sub><a name="function_getinstancemethodnames">@function_getinstancemethodnames</a></sub>

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

<sub>[go back to top](#top_of_page)</sub>

---

<sub><a name="function_hasmethod">@function_hasmethod</a></sub>

## `function` hasMethod

```ts
const hasMethod = (obj: {}, name: string) => {
    const desc = Object.getOwnPropertyDescriptor(obj, name);
    return !!desc && typeof desc.value === "function";
};
```

<sub>[go back to top](#top_of_page)</sub>  

---

<!-- END: UTILS -->

# Sitka class

<!-- BEGIN: SITKA -->

## `class` Sitka

### properties and `constructor()`

```ts
export class Sitka<MODULES = {}> {
    public handlerOriginalFunctionMap = new Map<
        Function,
        GeneratorContext
    >();

    protected registeredModules: MODULES;

    private dispatch?: Dispatch;
    private forks: CallEffectFn<any>[] = [];
    private middlewareToAdd: Middleware[] = [];
    // tslint:disable-next-line:no-any
    private reducersToCombine: ReducersMapObject = {};
    // tslint:disable-next-line:no-any
    private sagas: SagaMeta[] = [];
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
                        const value = action[key];

                        if (key === changeKey) {
                            return value;
                        }

                        if (value === null || typeof value === "undefined") {
                            return Object.assign(acc, {
                                [key]: null,
                            });
                        }

                        return Object.assign(acc, {
                            [key]: value,
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

### `private`

This method returns the default state of all registered modules, as a store.
<!-- 
The modules are mapped into an array from the modules map, returned from `this.getModules()`.  -->

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

### `protected resetState()`

This function resets a module's state back to its default, and can only be called within the module itself.  

So, in order to provide a public API to `resetState`, you would have to wrap the function call with a `handle*` method, ex. `handleResetModuleState`, to be able to pass this function into a UI component.

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
