import { Action, Middleware } from "redux"
import { SagaMeta } from "./saga_meta"
import { SitkaModuleAction } from "./sitka_module_action"
import { ModuleState } from "./module_state"
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
        v: Partial<MODULE_STATE>
    ): SitkaModuleAction<MODULE_STATE> {
        const type = createStateChangeKey(this.reduxKey())

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

