# Sitka (Class)

```typescript
export class Sitka<MODULES = {}> {
```

- is a concrete class.
- receives `MODULES`, which defaults to `{}`.
- registers all of the instances of sitka modules.
- is the most dramatic actor in overstepping redux to manage app state.

## Sitka has knowledge of Redux machinery

## `sagas`

```typescript
    // tslint:disable-next-line:no-any
    private sagas: SagaMeta[] = []
```

- is used within Sitka itself to create a root saga to run the rest in `createRoot()` .at 264
- is returned from `createSubscription()` .at 60
- see `NOTES/saga-meta-interface` for more in-depth information

## `reducersToCombine`

```typescript
    private reducersToCombine: ReducersMapObject = {}
```

- This is essentially redux state, this is passed into `createAppStore` .at 303
- defaults to `{}`
- see `NOTES/reducers-map-object` for more in-depth information

## `registeredModules`

```typescript
    protected registeredModules: MODULES
```

- These are the modules which are passed into Sitka when an instance is created

## `dispatch?`

```typescript
	private dispatch?: Dispatch
```

- IDK yet

## `constructor()`

```typescript
    constructor() {
        this.doDispatch = this.doDispatch.bind(this)
        this.createStore = this.createStore.bind(this)
        this.createRoot = this.createRoot.bind(this)
        this.registeredModules = {} as MODULES
    }
```

- a pretty standard constructor function
- may be able to bind functions to Sitka with fat arrow syntax
- we'll see these functions in more detail
- `this.registeredModules` defaults to `{}`

<!-- ```typescript
public exampleFn = (someParam: string): {} => {
    // all your codez here
}
``` -->

## `setDispatch(dispatch: Dispatch) -> void`

```typescript
    public setDispatch(dispatch: Dispatch): void {
        this.dispatch = dispatch
    }
```

- rcv a Redux `Dispatch` and sets the instance `dispatch` equal to the rcvd one

## `getModules() -> MODULES`

```typescript
    public getModules(): MODULES {
        return this.registeredModules
    }
```

## `createSitkaMeta() -> SitkaMeta`

```typescript
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
```

## `createStore(appstoreCreator?: AppStoreCreator): Store<{}> | null`

```typescript
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
```

## `register<SITKA_MODULE extends SitkaModule<ModuleState, MODULES>>(instances: SITKA_MODULE[]) -> void`

```typescript
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
```

## `getDefaultState() -> {}`

```typescript
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
```

## `createRoot() -> () => IterableIterator<{}>`

```typescript
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
```

## `doDispatch(action: Action) -> void`

```typescript
    private doDispatch(action: Action): void {
        const { dispatch } = this

        if (!!dispatch) {
            dispatch(action)
        }
    }
}
```
