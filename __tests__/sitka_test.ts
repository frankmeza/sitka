import { Action, Dispatch } from "redux"
import TestSitka from "./test_data/test_sitka"
import CounterModule from "./test_data/test_counter_module"

describe("Sitka", () => {
    const sitka = new TestSitka()
    const testCounterModule = new CounterModule()

    sitka.register([testCounterModule])

    describe("public setDispatch()", () => {
        test("receives a Dispatch object, sets it as private class property", () => {
            const dispatchObject: Dispatch<Action> = action => action
            expect(sitka["dispatch"]).toEqual(undefined) // private property

            sitka.setDispatch(dispatchObject)
            expect(sitka["dispatch"]).toEqual(dispatchObject)
        })
    })

    describe("public getModules()", () => {
        test("returns the registeredModules", () => {
            const expected = { counter: testCounterModule }

            expect(sitka.testGetModules()).toEqual(expected)
        })
    })

    // describe("public createSitkaMeta()", () => {

    // })

    // describe("public createStore()", () => {

    // })

    // describe("public register()", () => {

    // })

    describe("private getDefaultState()", () => {
        test("returns default state of Sitka", () => {
            const defaultSitkaState = sitka.testGetDefaultState()
            const expectedDefaultState = { counter: testCounterModule.defaultState }

            expect(defaultSitkaState).toEqual(expectedDefaultState)
        })
    })

    // describe("private createRoot()", () => {

    // })

    // describe("private doDispatch()", () => {

    // })
})