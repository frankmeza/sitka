import { Sitka } from "../../src/sitka"
import { AppModules } from "./test_index"

export default class TestSitka extends Sitka<AppModules> {
    public testGetModules(): {} {
        return this.getModules()
    }

    public testGetDefaultState(): {} {
        // this is a private method
        return this["getDefaultState"]()
    }

    public testCreateRoot(): () => IterableIterator<{}> {
        // this is a private method
        return this["createRoot"]()
    }
}