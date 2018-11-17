import CounterModule from "./test_counter_module"

export default class TestSitkaModule extends CounterModule {
    constructor() {
        super()
    }

    public testCreateAction() {
        return this.createAction({ counter: 42 })
    }

    public testCreateActionNull() {
        return this.createAction(null)
    }

    public testCreateActionEmptyObject() {
        return this.createAction({})
    }

    public testSetState() {
        return this.setState({ counter: 42 })
    }

    public spyCreateAction() {
        return this.createAction({})
    }
}