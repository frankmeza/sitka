```typescript
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

```typescript
export const createStateChangeKey = (module: string) =>
    `module_${module}_change_state`.toUpperCase();
```

```typescript
export const createHandlerKey = (module: string, handler: string) =>
    `module_${module}_${snakeCase(handler)}`.toUpperCase();
```

```typescript
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

```typescript
const hasMethod = (obj: {}, name: string) => {
    const desc = Object.getOwnPropertyDescriptor(obj, name);
    return !!desc && typeof desc.value === "function";
};
```