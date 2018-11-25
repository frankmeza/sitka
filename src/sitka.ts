import {
    Action,
    Dispatch,
    Middleware,
    ReducersMapObject,
    Store,
} from "redux"

import {
    all,
    apply,
    takeEvery,
} from "redux-saga/effects"

import {
    createAppStore,
    createHandlerKey,
    createStateChangeKey,
    getInstanceMethodNames,
} from "./utils"

import {
    AppStoreCreator,
    ModuleState,
    SagaMeta,
    SitkaAction,
    SitkaMeta,
} from "./interfaces_and_types"

import { SitkaModule } from "./sitka_module"

export class Sitka<MODULES = {}> {
    // tslint:disable-next-line:no-any
    private sagas: SagaMeta[] = []
    // tslint:disable-next-line:no-any
    private reducersToCombine: ReducersMapObject = {}
    private middlewareToAdd: Middleware[] = []
    protected registeredModules: MODULES
    private dispatch?: Dispatch

    constructor() {
        this.doDispatch = this.doDispatch.bind(this)
        this.createStore = this.createStore.bind(this)
        this.createRoot = this.createRoot.bind(this)
        this.registeredModules = {} as MODULES
    }

    public setDispatch(dispatch: Dispatch): void {
        this.dispatch = dispatch
    }

    public getModules(): MODULES {
        return this.registeredModules
    }

    public createSitkaMeta(): SitkaMeta {
        return {
            defaultState: {
                ...this.getDefaultState(),
                __sitka__: this
            },
            middleware: this.middlewareToAdd,
            reducersToCombine: {
                ...this.reducersToCombine,
                __sitka__: (state: this | null = null): this | null => state
            },
            sagaRoot: this.createRoot(),
        }
    }

    public createStore(appstoreCreator?: AppStoreCreator): Store<{}> | null {
        if (!!appstoreCreator) {
            const store = appstoreCreator(this.createSitkaMeta())
            this.dispatch = store.dispatch
            return store
        } else {
            // use own appstore creator
            const meta = this.createSitkaMeta()

            const store = createAppStore(
                meta.defaultState,
                [meta.reducersToCombine],
                meta.middleware,
                meta.sagaRoot,
            )

            this.dispatch = store.dispatch
            return store
        }
    }

    public register<SITKA_MODULE extends SitkaModule<ModuleState, MODULES>>(
        instances: SITKA_MODULE[],
    ): void {
        instances.forEach(instance => {
            const methodNames = getInstanceMethodNames(instance, Object.prototype)
            const handlers = methodNames.filter(m => m.indexOf("handle") === 0)
            const subscribers = instance.provideSubscriptions()
            const { moduleName } = instance

            const {
                middlewareToAdd,
                sagas,
                reducersToCombine,
                doDispatch: dispatch,
            } = this

            instance.modules = this.getModules()
            sagas.push(...subscribers)

            middlewareToAdd.push(...instance.provideMiddleware())

            handlers.forEach(s => {
                // tslint:disable:ban-types
                const original: Function = instance[s] // tslint:disable:no-any

                function patched(): void {
                    const args = arguments

                    const action: SitkaAction = {
                        _args: args,
                        _moduleId: moduleName,
                        type: createHandlerKey(moduleName, s),
                    }

                    dispatch(action)
                }

                sagas.push({
                    handler: original,
                    name: createHandlerKey(moduleName, s),
                })
                // tslint:disable-next-line:no-any
                instance[s] = patched
            })

            // create reducer
            const reduxKey: string = instance.reduxKey()
            const defaultState = instance.defaultState
            const actionType: string = createStateChangeKey(reduxKey)

            reducersToCombine[reduxKey] = (
                state: ModuleState = defaultState,
                action: Action
            ): ModuleState => {
                if (action.type !== actionType) {
                    return state
                }

                const type = createStateChangeKey(moduleName)
                const newState: ModuleState = Object.keys(action)
                    .filter(k => k !== "type")
                    .reduce((acc, k) => {
                        const val = action[k]

                        if (k === type) {
                            return val
                        }

                        if (val === null || typeof val === "undefined") {
                            return Object.assign(acc, {
                                [k]: null
                            })
                        }

                        return Object.assign(acc, {
                            [k]: val
                        })
                    }, Object.assign({}, state)) as ModuleState

                return newState
            }

            this.registeredModules[moduleName] = instance
        })
    }

    private getDefaultState(): {} {
        const modules = this.getModules()

        return Object.keys(modules)
            .map(k => modules[k])
            .reduce(
                (acc: {}, m: SitkaModule<{} | null, MODULES>) => ({
                    ...acc,
                    [m.moduleName]: m.defaultState
                }),
                {}
            )
    }

    private createRoot(): (() => IterableIterator<{}>) {
        const { sagas, registeredModules } = this

        function* root(): IterableIterator<{}> {
            /* tslint:disable */
            const toYield: any[] = []

            for (let i = 0; i < sagas.length; i++) {
                const s: SagaMeta = sagas[i]

                if (s.direct) {
                    const item: any = yield takeEvery(s.name, s.handler)
                    toYield.push(item)
                } else {
                    const generator = function* (action: any): {} {
                        const instance: {} = registeredModules[action._moduleId]
                        yield apply(instance, s.handler, action._args)
                    }

                    const item: any = yield takeEvery(s.name, generator)
                    toYield.push(item)
                }
            }
            /* tslint:enable */
            yield all(toYield)
        }

        return root
    }

    private doDispatch(action: Action): void {
        const { dispatch } = this

        if (!!dispatch) {
            dispatch(action)
        }
    }
}
