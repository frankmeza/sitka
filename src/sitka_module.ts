import { Action, Middleware } from "redux";
import { select, put, CallEffectFn, apply } from "redux-saga/effects";
import { ModuleState, GeneratorContext, SitkaModuleAction, SagaMeta } from "./types";

export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES> {
    public modules: MODULES;
    handlerOriginalFunctionMap = new Map<Function, GeneratorContext>();

    public abstract moduleName: string;

    constructor () {
        this.getState = this.getState.bind(this);
        this.mergeState = this.mergeState.bind(this);
    }

    // by default, the redux key is same as the moduleName
    public reduxKey (): string {
        return this.moduleName;
    }

    public abstract defaultState?: MODULE_STATE;

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

    protected setState (state: MODULE_STATE, replace?: boolean): Action {
        return this.createAction(state, replace);
    }

    protected resetState (): Action {
        return this.setState(this.defaultState);
    }

    protected getState (state: {}): MODULE_STATE {
        return state[this.reduxKey()];
    }

    protected *mergeState (partialState: Partial<MODULE_STATE>): {} {
        const currentState = yield select(this.getState);
        const newState = { ...currentState, ...partialState };
        yield put(this.setState(newState));
    }

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

    provideMiddleware (): Middleware[] {
        return [];
    }

    provideSubscriptions (): SagaMeta[] {
        return [];
    }

    provideForks (): CallEffectFn<any>[] {
        return [];
    }

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
}
