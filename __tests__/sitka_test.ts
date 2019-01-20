import { Action, Dispatch } from "redux"
import TestSitka from "./test_data/test_sitka"
import CounterModule from "./test_data/test_counter_module"
import { Sitka } from "../src/sitka";
import { SitkaMeta } from "../src/interfaces_and_types"

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

    describe("public createSitkaMeta()", () => {
        test("returns an instance of SitkaMeta", () => {
            const expectedSitkaMeta: SitkaMeta = {
                defaultState: {
                    ...sitka.testGetDefaultState(),
                    __sitka__: sitka,
                },
                middleware: sitka["middlewareToAdd"],
                reducersToCombine: {
                    ...sitka["reducersToCombine"],
                    __sitka__: (state: Sitka | null = null): Sitka | null => state,
                },
                sagaRoot: sitka["createRoot"](),
            }

            expect(Object.keys(sitka.createSitkaMeta()))
                .toEqual(Object.keys(expectedSitkaMeta))
        })
    })

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

    describe("private doDispatch()", () => {
        test("if dispatch property exists, function calls dispatch with passed in Action", () => {})
    })
})