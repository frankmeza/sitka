# Interfaces and Types

## AppStoreCreator

```typescript
export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store
```

## Module State

```typescript
type ModuleState = {} | undefined | null
```

## SagaMeta

```typescript
export interface SagaMeta {
	// tslint:disable-next-line:no-any
	readonly handler: any
	readonly name: string
	readonly direct?: boolean
}
```

### USED BY

SagaMeta is returned by `abstract class SitkaModule` in `create subscription` and in `provideSubscription`.

`class Sitka` has a key:

```typescript
// tslint:disable-next-line:no-any
private sagas: SagaMeta[] = []
```

`Sitka` uses this key as a collection of all saga functions in the application, and is named as a type in `createRoot` .at 264

## SitkaAction

```typescript
interface SitkaAction extends Action {
	_moduleId: string
	// tslint:disable-next-line:no-any
	_args: any
}
```

## SitkaMeta (class)

```typescript
export class SitkaMeta {
	public readonly defaultState: {}
	public readonly middleware: Middleware[]
	public readonly reducersToCombine: ReducersMapObject
	public readonly sagaRoot: (() => IterableIterator<{}>)
}
```

## SitkaModuleAction<T> (type)

```typescript
export type SitkaModuleAction<T> = Partial<T> & {
    type: string
} | Action
```

- is the returned shape from `export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES>`
