import { Action, Middleware } from "redux"

import { SitkaModuleAction } from "../../src/sitka_module_action"
import { SagaMeta } from "../../src/saga_meta"

import CounterModule from "./test_counter_module"
import { CounterState } from "./test_index"

export default class TestSitkaModule extends CounterModule {
    constructor() {
        super()
    }

    public testCreateAction(): SitkaModuleAction<CounterState> {
        return this.createAction({ counter: 42 })
    }

    public testCreateActionNull(): SitkaModuleAction<CounterState> {
        return this.createAction(null)
    }

    public testCreateActionEmptyObject(): SitkaModuleAction<CounterState> {
        return this.createAction({})
    }

    public testSetState(): Action<any> {
        return this.setState({ counter: 42 })
    }

    public testProvideMiddleware(): Middleware[] {
        return this.provideMiddleware()
    }

    public testProvideSubscriptions(): SagaMeta[] {
        return this.provideSubscriptions()
    }
}