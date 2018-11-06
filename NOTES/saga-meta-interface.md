# `export interface SagaMeta {}`

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