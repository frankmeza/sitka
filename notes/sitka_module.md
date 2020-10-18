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

```ts
// by default, the redux key is same as the moduleName
public reduxKey (): string {
    return this.moduleName;
}
```

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

```ts
protected setState (state: MODULE_STATE, replace?: boolean): Action {
    return this.createAction(state, replace);
}
```

```ts
protected resetState (): Action {
    return this.setState(this.defaultState);
}
```

```ts
protected getState (state: {}): MODULE_STATE {
    return state[this.reduxKey()];
}
```

```ts
protected *mergeState (partialState: Partial<MODULE_STATE>): {} {
    const currentState = yield select(this.getState);
    const newState = { ...currentState, ...partialState };
    yield put(this.setState(newState));
}
```

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

```ts
public provideMiddleware (): Middleware[] {
    return [];
}
```

```ts
    provideSubscriptions (): SagaMeta[] {
        return [];
    }
```

```ts
    provideForks (): CallEffectFn<any>[] {
        return [];
    }
```

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