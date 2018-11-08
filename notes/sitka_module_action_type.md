# SitkaModuleAction<T> (type)

```typescript
export type SitkaModuleAction<T> = Partial<T> & {
    type: string
} | Action
```

- is the returned shape from `export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES>`
