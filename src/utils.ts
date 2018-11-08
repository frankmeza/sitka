import { createLogger } from "redux-logger"
import {
    DeepPartial,
    Middleware,
    ReducersMapObject,
    Store,
    applyMiddleware,
    createStore,
    combineReducers,
} from "redux"
import { SagaMiddleware } from "redux-saga"
import createSagaMiddleware from "redux-saga"
import { snakeCase } from "lodash"

export const createStateChangeKey = (module: string): string =>
    `module_${snakeCase(module)}_change_state`.toUpperCase()

export const createHandlerKey = (module: string, handler: string): string =>
    `module_${module}_${handler}`.toUpperCase()

export const hasMethod = (obj: {}, name: string): boolean => {
    // raw! getting into Object methods here
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
    intialState: {} = {},
    reducersToCombine: ReducersMapObject[] = [],
    middleware: Middleware[] = [],
    sagaRoot?: (() => IterableIterator<{}>)
): Store => {
    const logger: Middleware = createLogger({
        stateTransformer: (state: {}) => state
    })

    const sagaMiddleware: SagaMiddleware<{}> = createSagaMiddleware()
    const commonMiddleware: ReadonlyArray<Middleware> = [sagaMiddleware, logger]

    const appReducer = reducersToCombine.reduce(
        (acc, r) => ({ ...acc, ...r }),
        {}
    )

    const combinedMiddleware = [...commonMiddleware, ...middleware]

    const store: Store = createStore(
        combineReducers(appReducer),
        intialState as DeepPartial<{}>,
        applyMiddleware(...combinedMiddleware)
    )

    if (sagaRoot) {
        sagaMiddleware.run(sagaRoot)
    }

    return store
}
