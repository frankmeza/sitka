import snakeCase from "lodash.snakecase";
import {
    Store,
    Middleware,
    createStore,
    combineReducers,
    DeepPartial,
    compose,
    applyMiddleware,
} from "redux";
import { createLogger } from "redux-logger";
import createSagaMiddleware, { SagaMiddleware } from "redux-saga";

import { StoreOptions } from "./types";

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

export const createStateChangeKey = (module: string) =>
    `${module}_module_change_state`.toUpperCase();

export const createHandlerKey = (module: string, handler: string) =>
    `${module}_module_${snakeCase(handler)}`.toUpperCase();

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

const hasMethod = (obj: {}, name: string) => {
    const desc = Object.getOwnPropertyDescriptor(obj, name);
    return !!desc && typeof desc.value === "function";
};
