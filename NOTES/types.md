```ts
export class SitkaMeta {
    public readonly defaultState: {};
    public readonly middleware: Middleware[];
    public readonly reducersToCombine: ReducersMapObject;
    public readonly sagaRoot: (() => IterableIterator<{}>);
    public readonly sagaProvider: () => SitkaSagaMiddlewareProvider;
}
```

```ts
export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store;
```

```ts
export type GeneratorContext = {
    readonly handlerKey: string;
    readonly fn: CallEffectFn<any>;
    readonly context: {};
};
```

```ts
export type ModuleState = {} | undefined | null;
```

```ts
export type PayloadAction = Action & {
    readonly payload?: {};
};
```

```ts
export type SagaMeta = {
    // tslint:disable-next-line:no-any
    readonly handler: any;
    readonly name: string;
    readonly direct?: boolean;
};
```

```ts
export type SitkaAction = Action & {
    _moduleId: string;
    // tslint:disable-next-line:no-any
    _args: any;
};
```

```ts
export type SitkaModuleAction<T> =
    | Partial<T> & { type: string; payload?: {} }
    | Action;
```

```ts
export type SitkaOptions = {
    readonly log?: boolean;
    readonly sitkaInState?: boolean;
};
```

```ts
export type SitkaSagaMiddlewareProvider = {
    middleware: SagaMiddleware<{}>;
    activate: () => void;
};
```

```ts
export type StoreOptions = {
    readonly initialState?: {};
    readonly reducersToCombine?: ReducersMapObject[];
    readonly storeEnhancers?: StoreEnhancer[];
    readonly middleware?: Middleware[];
    readonly sagaRoot?: () => IterableIterator<{}>;
    readonly log?: boolean;
};
```