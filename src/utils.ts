import {
    DeepPartial,
    Middleware,
    ReducersMapObject,
    Store,
    applyMiddleware,
    createStore,
    combineReducers,
} from "redux"

import { createLogger } from "redux-logger"
import createSagaMiddleware, { SagaMiddleware } from "redux-saga"
import { StoreOptions } from "./interfaces_and_types"

export const createStateChangeKey = (module: string): string =>
    `module_${module}_change_state`.toUpperCase()

export const createHandlerKey = (module: string, handler: string): string =>
    `module_${module}_${handler}`.toUpperCase()

export const hasMethod = (obj: {}, name: string): boolean => {
    const desc = Object.getOwnPropertyDescriptor(obj, name)
    return !!desc && typeof desc.value === "function"
}

export const getInstanceMethodNames = (obj: {}, stop: {}): string[] => {
    const array: string[] = []
    let proto = Object.getPrototypeOf(obj)

    while (proto && proto !== stop) {
        Object.getOwnPropertyNames(proto).forEach(name => {
            if (name !== "constructor") {
                if (hasMethod(proto, name)) {
                    array.push(name)
                }
            }
        })

        proto = Object.getPrototypeOf(proto)
    }

    return array
}

export const createAppStore = (
    options: StoreOptions,
): Store => {
    const {
        initialState = {},
        reducersToCombine = [],
        middleware = [],
        sagaRoot,
        log = false,
    } = options

    const logger: Middleware = createLogger({
        stateTransformer: (state: {}) => state,
    })

    const sagaMiddleware: SagaMiddleware<{}> = createSagaMiddleware()

    const commonMiddleware: ReadonlyArray<Middleware> = log
        ? [sagaMiddleware, logger] : [sagaMiddleware]

    const appReducer = reducersToCombine.reduce(
        (acc, r) => ({...acc, ...r}), {}
    )

    const combinedMiddleware = [...commonMiddleware, ...middleware]

    // const createStoreWithMiddleware = applyMiddleware(...combinedMiddleware)(createStore)

    // const store: Store = createStoreWithMiddleware(combineReducers(appReducer))

    const store: Store = createStore(
        combineReducers(appReducer),
        initialState as DeepPartial<{}>,
        applyMiddleware(...combinedMiddleware),
    )

    if (sagaRoot) {
        sagaMiddleware.run(<any> sagaRoot)
    }

    return store
}