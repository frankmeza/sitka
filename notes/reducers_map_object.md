# ReducersMapObject

- is a shape directly from the redux library
- passed around as part of `SagaMeta`
- is ultimately passed into redux or sitka store to be the ultimate source of app state

```typescript
export type ReducersMapObject<S = any, A extends Action = Action> = {
  [K in keyof S]: Reducer<S[K], A>
}
```