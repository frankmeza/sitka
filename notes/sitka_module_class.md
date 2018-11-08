# SitkaModule (abstract class)

```typescript
export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES> {
```

## `modules`

```typescript
    public modules: MODULES
```

## `moduleName`

```typescript
    public abstract moduleName: string
```

## `reduxKey`

```typescript
    // by default, the redux key is same as the moduleName
    public reduxKey(): string {
        return this.moduleName
    }
```

## `defaultState`

```typescript
    public abstract defaultState: MODULE_STATE
```

## `createAction`

```typescript
    protected createAction(
        v: Partial<MODULE_STATE>
    ): SitkaModuleAction<MODULE_STATE> {
        const type = createStateChangeKey(this.reduxKey())

        if (!v) {
            return { type, [type]: null }
        }

        if (typeof v !== "object") {
            return { type, [type]: v }
        } else {
            return Object.assign({ type }, v)
        }
    }
```

## `setState`

```typescript
    protected setState(state: MODULE_STATE): Action {
        return this.createAction(state)
    }
```

## `createSubscription`

```typescript
    protected createSubscription(
        actionType: string,
        handler: Function,
    ): SagaMeta {
        return {
            name: actionType,
            handler,
            direct: true
        }
    }
```

## `provideMiddleware`

```typescript
    provideMiddleware(): Middleware[] {
        return []
    }
```

## `provideSubscriptions`

```typescript
    provideSubscriptions(): SagaMeta[] {
        return []
    }
}
```
