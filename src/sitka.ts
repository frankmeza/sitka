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
    CallEffectFn,
    fork,
    ForkEffect,
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
    SitkaOptions,
    handlerOriginalFunctionMap,
} from "./interfaces_and_types"

import { SitkaModule } from "./sitka_module"

export class Sitka<MODULES = {}> {
    // tslint:disable-next-line:no-any
    private sagas: SagaMeta[] = []
    private forks: CallEffectFn<any>[] = []
    // tslint:disable-next-line:no-any
    private reducersToCombine: ReducersMapObject = {}
    private middlewareToAdd: Middleware[] = []
    protected registeredModules: MODULES
    private dispatch?: Dispatch
    private sitkaOptions: SitkaOptions

    constructor(sitkaOptions?: SitkaOptions) {
        this.sitkaOptions = sitkaOptions
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
                __sitka__: this,
            },
            middleware: this.middlewareToAdd,
            reducersToCombine: {
                ...this.reducersToCombine,
                __sitka__: (state: this | null = null): this | null => state,
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
                {
                    initialState: meta.defaultState,
                    reducersToCombine: [meta.reducersToCombine],
                    middleware: meta.middleware,
                    sagaRoot: meta.sagaRoot,
                    log: this.sitkaOptions && this.sitkaOptions.log === true,
                }
            )
            this.dispatch = store.dispatch
            return store
        }
    }

    public register<SITKA_MODULE extends SitkaModule<ModuleState, MODULES>>(
        instances: SITKA_MODULE[],
    ): void {
        instances.forEach(instance => {
            const methodNames = getInstanceMethodNames(
                instance,
                Object.prototype,
            )
            const handlers = methodNames.filter(m => m.indexOf("handle") === 0)

            const { moduleName } = instance
            const { middlewareToAdd, sagas, forks, reducersToCombine, doDispatch: dispatch } = this

            instance.modules = this.getModules()

            middlewareToAdd.push(...instance.provideMiddleware())

            instance.provideForks().forEach(f => {
                forks.push(f.bind(instance))
            })

            handlers.forEach(s => {
                // tslint:disable:ban-types
                const original: Function = instance[s] // tslint:disable:no-any

                const handlerKey = createHandlerKey(moduleName, s)

                function patched(): void {
                    const args = arguments
                    const action: SitkaAction = {
                        _args: args,
                        _moduleId: moduleName,
                        type: handlerKey,
                    }

                    dispatch(action)
                }

                sagas.push({
                    handler: original,
                    name: createHandlerKey(moduleName, s),
                })
                // tslint:disable-next-line:no-any
                instance[s] = patched
                handlerOriginalFunctionMap.set(patched, {
                    handlerKey,
                    fn: original,
                    context: instance,
                })
            })

            if (instance.defaultState !== undefined) {
                // create reducer
                const reduxKey: string = instance.reduxKey()
                const defaultState = instance.defaultState
                const actionType: string = createStateChangeKey(reduxKey)

                reducersToCombine[reduxKey] = (
                    state: ModuleState = defaultState,
                    action: Action,
                ): ModuleState => {
                    if (action.type !== actionType) {
                        return state
                    }

                    const type = createStateChangeKey(moduleName)
                    const newState: ModuleState = Object.keys(action)
                        .filter(k => k !== "type")
                        .reduce(
                            (acc, k) => {
                                const val = action[k]
                                if (k === type) {
                                    return val
                                }

                                if (val === null || typeof val === "undefined") {
                                    return Object.assign(acc, {
                                        [k]: null,
                                    })
                                }

                                return Object.assign(acc, {
                                    [k]: val,
                                })
                            },
                            Object.assign({}, state),
                        ) as ModuleState

                    return newState
                }
            }

            this.registeredModules[moduleName] = instance
        })

        // do subscribers after all has been registered
        instances.forEach(instance => {
            const { sagas } = this
            const subscribers = instance.provideSubscriptions()
            sagas.push(...subscribers)
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
        const { sagas, forks, registeredModules } = this

        function* root(): IterableIterator<{}> {
            /* tslint:disable */
            const toYield: ForkEffect[] = []

            // generators
            for (let i = 0; i < sagas.length; i++) {
                const s: SagaMeta = sagas[i]
                if (s.direct) {
                    const item: any = yield takeEvery(s.name, s.handler)
                    toYield.push(item)
                } else {
                    const generator = function*(action: SitkaAction): {} {
                        const instance: {} = registeredModules[action._moduleId]
                        yield apply(instance, s.handler, action._args)
                    }
                    const item: any = yield takeEvery(s.name, generator)
                    toYield.push(item)
                }
            }

            // forks
            for (let i = 0; i < forks.length; i++) {
                const f = forks[i]
                const item: any = fork(f)
                toYield.push(item)
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
        } else {
            // alert("no dispatch")
        }
    }
}
