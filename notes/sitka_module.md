## `class` SitkaModule

```ts
export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES> {
    public modules: MODULES;
    public abstract defaultState?: MODULE_STATE;
    public abstract moduleName: string;

    private handlerOriginalFunctionMap = new Map<Function, GeneratorContext>();

    constructor () {
        this.getState = this.getState.bind(this);
        this.mergeState = this.mergeState.bind(this);
    }
    // ... methods
}
```

---

## `method` reduxKey

```ts
// by default, the redux key is same as the moduleName
public reduxKey (): string {
    return this.moduleName;
}
```

---

## `method` createAction

```ts
protected createAction (
    v: Partial<MODULE_STATE>,
    usePayload?: boolean,
): SitkaModuleAction<MODULE_STATE> {
    const type = createStateChangeKey(this.reduxKey());
    if (!v) {
        return { type, [type]: null };
    }

    if (typeof v !== "object") {
        return { type, [type]: v };
    } else {
        if (usePayload) {
            return {
                type,
                payload: v,
            };
        }
        return Object.assign({ type }, v);
    }
}
```

---

## `method` setState

```ts
protected setState (state: MODULE_STATE, replace?: boolean): Action {
    return this.createAction(state, replace);
}
```

---

## `method` resetState

```ts
protected resetState (): Action {
    return this.setState(this.defaultState);
}
```

---

## `method` getState

```ts
protected getState (state: {}): MODULE_STATE {
    return state[this.reduxKey()];
}
```

---

## `method` *mergeState, generator function

```ts
protected *mergeState (partialState: Partial<MODULE_STATE>): {} {
    const currentState = yield select(this.getState);
    const newState = { ...currentState, ...partialState };
    yield put(this.setState(newState));
}
```

---

## `createSubscription`

```ts
// can be either the action type string, or the module function to watch
protected createSubscription (
    actionTarget: string | Function,
    handler: CallEffectFn<any>,
): SagaMeta {
    if (typeof actionTarget === "string") {
        return {
            name: actionTarget,
            handler,
            direct: true,
        };
    } else {
        const generatorContext: GeneratorContext = this.handlerOriginalFunctionMap.get(
            actionTarget,
        );
        return {
            name: generatorContext.handlerKey,
            handler,
            direct: true,
        };
    }
}
```

---

## `method` provideMiddleware

```ts
public provideMiddleware (): Middleware[] {
    return [];
}
```

---

## `method` provideSubscriptions

```ts
provideSubscriptions (): SagaMeta[] {
    return [];
}
```

---

## `method` provideForks

```ts
provideForks (): CallEffectFn<any>[] {
    return [];
}
```

---

## `method` *callAsGenerator, generator function

```ts
protected *callAsGenerator (fn: Function, ...rest: any[]): {} {
    const generatorContext: GeneratorContext = this.handlerOriginalFunctionMap.get(
        fn,
    );

return yield apply(
        generatorContext.context,
        generatorContext.fn,
        <any>rest,
    );
}
```
