import { Action, Middleware } from "redux";

import { SagaMeta, SitkaModuleAction } from "../../src/types";

import CounterModule from "./test_counter_module";
import { CounterState } from "./test_index";

export default class TestSitkaModule extends CounterModule {
    constructor () {
        super();
    }

    public testCreateAction (): SitkaModuleAction<CounterState> {
        return this.createAction({ counter: 42 });
    }

    public testCreateActionNull (): SitkaModuleAction<CounterState> {
        return this.createAction(null);
    }

    public testCreateActionEmptyObject (): SitkaModuleAction<CounterState> {
        return this.createAction({});
    }

    public testSetState (): Action<any> {
        return this.setState({ counter: 42 });
    }

    public testCallbackFunction (): string {
        return "testCallbackFunction";
    }

    public testCreateSubscription (): SagaMeta {
        return this.createSubscription(
            "MODULE_COUNTER_CHANGE_STATE",
            this.testCallbackFunction,
        );
    }

    public testProvideMiddleware (): Middleware[] {
        return this.provideMiddleware();
    }

    public testProvideSubscriptions (): SagaMeta[] {
        return this.provideSubscriptions();
    }
}
