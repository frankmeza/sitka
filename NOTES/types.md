## `class` SitkaMeta

```ts
export class SitkaMeta {
    public readonly defaultState: {};
    public readonly middleware: Middleware[];
    public readonly reducersToCombine: ReducersMapObject;
    public readonly sagaRoot: (() => IterableIterator<{}>);
    public readonly sagaProvider: () => SitkaSagaMiddlewareProvider;
}
```

---

## `type` AppStoreCreator

```ts
export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store;
```

---

## `type` GeneratorContext

```ts
export type GeneratorContext = {
    readonly handlerKey: string;
    readonly fn: CallEffectFn<any>;
    readonly context: {};
};
```

---

## `type` ModuleState

```ts
export type ModuleState = {} | undefined | null;
```

---

## `type` PayloadAction

```ts
export type PayloadAction = Action & {
    readonly payload?: {};
};
```

---

## `type` SagaMeta

```ts
export type SagaMeta = {
    // tslint:disable-next-line:no-any
    readonly handler: any;
    readonly name: string;
    readonly direct?: boolean;
};
```

---

## `type` SitkaAction

```ts
export type SitkaAction = Action & {
    _moduleId: string;
    // tslint:disable-next-line:no-any
    _args: any;
};
```

---

## `type` SitkaModuleAction

```ts
export type SitkaModuleAction<T> =
    | Partial<T> & { type: string; payload?: {} }
    | Action;
```

---

## `type` SitkaOptions

```ts
export type SitkaOptions = {
    readonly log?: boolean;
    readonly sitkaInState?: boolean;
};
```

### `readonly log?: boolean`

This key gives the developer the options of seeing the Redux logs in the browser console.

### `readonly sitkaInState?: boolean;`

This key in not being used in code currently.

---

## SitkaSagaMiddlewareProvider


```ts
export type SitkaSagaMiddlewareProvider = {
    middleware: SagaMiddleware<{}>;
    activate: () => void;
};
```

---

## StoreOptions

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