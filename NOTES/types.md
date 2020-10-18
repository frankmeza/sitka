```typescript
export class SitkaMeta {
    public readonly defaultState: {};
    public readonly middleware: Middleware[];
    public readonly reducersToCombine: ReducersMapObject;
    public readonly sagaRoot: (() => IterableIterator<{}>);
    public readonly sagaProvider: () => SitkaSagaMiddlewareProvider;
}
```

```typescript
export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store;
```

```typescript
export type GeneratorContext = {
    readonly handlerKey: string;
    readonly fn: CallEffectFn<any>;
    readonly context: {};
};
```

```typescript
export type ModuleState = {} | undefined | null;
```

```typescript
export type PayloadAction = Action & {
    readonly payload?: {};
};
```

```typescript
export type SagaMeta = {
    // tslint:disable-next-line:no-any
    readonly handler: any;
    readonly name: string;
    readonly direct?: boolean;
};
```

```typescript
export type SitkaAction = Action & {
    _moduleId: string;
    // tslint:disable-next-line:no-any
    _args: any;
};
```

```typescript
export type SitkaModuleAction<T> =
    | Partial<T> & { type: string; payload?: {} }
    | Action;
```

```typescript
export type SitkaOptions = {
    readonly log?: boolean;
    readonly sitkaInState?: boolean;
};
```

```typescript
export type SitkaSagaMiddlewareProvider = {
    middleware: SagaMiddleware<{}>;
    activate: () => void;
};
```

```typescript
export type StoreOptions = {
    readonly initialState?: {};
    readonly reducersToCombine?: ReducersMapObject[];
    readonly storeEnhancers?: StoreEnhancer[];
    readonly middleware?: Middleware[];
    readonly sagaRoot?: () => IterableIterator<{}>;
    readonly log?: boolean;
};
```