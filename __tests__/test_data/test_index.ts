import { Sitka } from "../../src/sitka"
import CounterModule from "./test_sitka_module"
import TestSitkaModule from "./test_sitka_module"
import { Store } from "redux"

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

const sitka = new Sitka<AppModules>()

sitka.register([
    new CounterModule(),
    new TestSitkaModule(),
])

const store: Store = sitka.createStore()

export {
    CounterState,
    AppModules,
    AppState,
    sitka,
    store,
}