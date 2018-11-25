import { Action, Middleware } from "redux"

import {
    ModuleState,
    SagaMeta,
    SitkaModuleAction,
} from "./interfaces_and_types"

import { createStateChangeKey } from "./utils"

export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES> {
    public modules: MODULES

    public abstract moduleName: string

    // by default, the redux key is same as the moduleName
    public reduxKey(): string {
        return this.moduleName
    }

    public abstract defaultState: MODULE_STATE

    protected createAction(
        valueInState: Partial<MODULE_STATE>
    ): SitkaModuleAction<MODULE_STATE> {
        const type: string = createStateChangeKey(this.reduxKey())

        if (!valueInState) {
            return { type, [type]: null }
        }

        if (typeof valueInState !== "object") {
            return { type, [type]: valueInState }
        } else {
            return Object.assign({ type }, valueInState)
        }
    }

    protected setState(state: MODULE_STATE): Action {
        return this.createAction(state)
    }

    // this is used inside of each array
    // item in this.provideMiddleware()
    protected createSubscription(
        actionType: string,
        handler: Function,
    ): SagaMeta {
        return {
            name: actionType,
            handler,
            direct: true
        }
    }

    provideMiddleware(): Middleware[] {
        return []
    }

    provideSubscriptions(): SagaMeta[] {
        return []
    }
}

