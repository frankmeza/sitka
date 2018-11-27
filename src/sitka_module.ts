import { Action, Middleware } from "redux"
import { apply, CallEffectFn } from "redux-saga/effects"

import {
    ModuleState,
    SagaMeta,
    SitkaModuleAction,
    GeneratorContext,
    handlerOriginalFunctionMap,
} from "./interfaces_and_types"

import { createStateChangeKey } from "./utils"

export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES> {
    public modules: MODULES

    public abstract moduleName: string

    // by default, the redux key is same as the moduleName
    public reduxKey(): string {
        return this.moduleName
    }

    public abstract defaultState?: MODULE_STATE

    protected createAction(
        v: Partial<MODULE_STATE>,
    ): SitkaModuleAction<MODULE_STATE> {
        const type: string = createStateChangeKey(this.reduxKey())

        if (!v) {
            return { type, [type]: null }
        }

        if (typeof v !== "object") {
            return { type, [type]: v }
        } else {
            return Object.assign({ type }, v)
        }
    }

    protected setState(state: MODULE_STATE): Action {
        return this.createAction(state)
    }

    // this is used inside of each array
    // item in this.provideMiddleware()
    protected createSubscription(
        actionTarget: string | Function,
        handler: CallEffectFn<any>,
    ): SagaMeta {
        if (typeof actionTarget === "string") {
            return {
                name: actionTarget,
                handler,
                direct: true,
            }
        } else {
            const generatorContext: GeneratorContext =
                handlerOriginalFunctionMap.get(actionTarget)

            return {
                name: generatorContext.handlerKey,
                handler,
                direct: true,
            }
        }
    }

    provideMiddleware(): Middleware[] {
        return []
    }

    provideSubscriptions(): SagaMeta[] {
        return []
    }

    provideForks(): CallEffectFn<any>[] {
        return []
    }

    static *callAsGenerator(fn: Function, ...rest: any[]): {} {
        const generatorContext: GeneratorContext = handlerOriginalFunctionMap.get(fn)
        return yield apply(generatorContext.context, generatorContext.fn, <any> rest)
    }
}

