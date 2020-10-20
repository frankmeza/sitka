import { Action, Middleware } from "redux";
import { select, put, CallEffectFn, apply } from "redux-saga/effects";
import {
    ModuleState,
    GeneratorContext,
    SitkaModuleAction,
    SagaMeta,
} from "./types";
import { createStateChangeKey } from "./utils";

export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES> {
    public abstract defaultState?: MODULE_STATE;
    public abstract moduleName: string;

    public modules: MODULES;
    public handlerOriginalFunctionMap = new Map<Function, GeneratorContext>();

    constructor () {
        this.getState = this.getState.bind(this);
        this.mergeState = this.mergeState.bind(this);
    }

    public provideMiddleware (): Middleware[] {
        return [];
    }

    public provideSubscriptions (): SagaMeta[] {
        return [];
    }

    public provideForks (): CallEffectFn<any>[] {
        return [];
    }

    // by default, the redux key is same as the moduleName
    public reduxKey (): string {
        return this.moduleName;
    }

    protected createAction (
        payload: Partial<MODULE_STATE>,
        usePayload?: boolean,
    ): SitkaModuleAction<MODULE_STATE> {
        const type = createStateChangeKey(this.reduxKey());

        if (!payload) {
            return { type, [type]: null };
        }

        if (typeof payload !== "object") {
            return { type, [type]: payload };
        } else {
            if (usePayload) {
                return {
                    type,
                    payload,
                };
            }

            return Object.assign({ type }, payload);
        }
    }

    protected getState (state: {}): MODULE_STATE {
        return state[this.reduxKey()];
    }

    protected *mergeState (partialState: Partial<MODULE_STATE>): {} {
        const currentState = yield select(this.getState);
        const newState = { ...currentState, ...partialState };
        yield put(this.setState(newState));
    }

    protected setState (state: MODULE_STATE, replace?: boolean): Action {
        return this.createAction(state, replace);
    }

    protected resetState (): Action {
        return this.setState(this.defaultState);
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

    protected *callAsGenerator (fn: Function, ...rest: any[]): {} {
        const generatorContext: GeneratorContext = this.handlerOriginalFunctionMap.get(
            fn,
        );

        return yield apply(
            generatorContext.context,
            generatorContext.fn,
            rest as any,
        );
    }
}
