```typescript
const createStateChangeKey = (module: string) =>
    `module_${module}_change_state`.toUpperCase()
```
```typescript
const createHandlerKey = (module: string, handler: string) =>
	`module_${module}_${handler}`.toUpperCase()
```
```typescript
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
```
```typescript
const hasMethod = (obj: {}, name: string) => {
    // raw! getting into Object methods here
	const desc = Object.getOwnPropertyDescriptor(obj, name)
	return !!desc && typeof desc.value === "function"
}
```
```typescript
const getInstanceMethodNames = (obj: {}, stop: {}) => {
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
```