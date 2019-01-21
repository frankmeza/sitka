import { Sitka } from "../../src/sitka"
import CounterModule from "./test_sitka_module"
import TestSitkaModule from "./test_sitka_module"
import { Action, Store } from "redux"
import { SitkaModuleAction } from "../../src/interfaces_and_types"

interface CounterState {
    readonly counter: number
}

interface AppModules {
    readonly counter: CounterModule,
}

interface AppState {
    readonly counter: CounterState,
    readonly __sitka__: Sitka<AppModules>
}

type TestSitkaModuleAction = SitkaModuleAction<CounterState>

type TestAction = Action<"MODULE_COUNTER_CHANGE_STATE"> & {
    readonly counter: number
}

const sitka = new Sitka<AppModules>()

sitka.register([
    new CounterModule(),
    new TestSitkaModule(),
])

const store: Store = sitka.createStore()

export {
    AppModules,
    AppState,
    CounterState,
    TestAction,
    TestSitkaModuleAction,
    sitka,
    store,
}