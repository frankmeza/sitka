import {
    Action,
    AnyAction,
    Dispatch,
    Reducer,
    Store,
    createStore,
} from "redux"

import TestSitka from "./test_data/test_sitka"
import CounterModule from "./test_data/test_counter_module"
import { Sitka } from "../src/sitka"
import { SitkaMeta, AppStoreCreator } from "../src/interfaces_and_types"
import { createAppStore } from "../src/utils"

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

        test("returns an instance of SitkaMeta", () => {
            const createdSitkaMeta = sitka.createSitkaMeta()
            expect(Object.keys(createdSitkaMeta)).toEqual(Object.keys(expectedSitkaMeta))

            expect(createdSitkaMeta.defaultState).toEqual(expectedSitkaMeta.defaultState)
            expect(createdSitkaMeta.middleware).toEqual(expectedSitkaMeta.middleware)

            // anonymous function causes problems when using .toEqual(),
            // so function results are stringified then compared using jest#expect
            expect(JSON.stringify(createdSitkaMeta.reducersToCombine))
                .toEqual(JSON.stringify(expectedSitkaMeta.reducersToCombine))

            expect(JSON.stringify(createdSitkaMeta.sagaRoot))
                .toEqual(JSON.stringify(expectedSitkaMeta.sagaRoot))
        })
    })

    describe("public createStore()", () => {
        const reducerStub: Reducer<{}, AnyAction> = () => null
        const reduxStore: Store = createStore(reducerStub)

        test("given AppStoreCreator type, returns Redux Store<{}>", () => {
            const appStoreCreator: AppStoreCreator = (meta: SitkaMeta): Store<{}> => {
                return createAppStore({
                    initialState: meta.defaultState,
                    reducersToCombine: [meta.reducersToCombine],
                    middleware: meta.middleware,
                    sagaRoot: meta.sagaRoot,
                    log: this.sitkaOptions && this.sitkaOptions.log === true,
                })
            }

            // createStore() is called with appStoreCreator passed in
            expect(Object.keys(sitka.createStore(appStoreCreator)))
                .toEqual(Object.keys(reduxStore))
        })

        test("not given AppStoreCreator type, returns Redux Store<{}>", () => {
            // createStore() is called without appStoreCreator passed in
            expect(Object.keys(sitka.createStore()))
                .toEqual(Object.keys(reduxStore))
        })
    })

    // describe("public register()", () => {})

    describe("private getDefaultState()", () => {
        test("returns default state of Sitka", () => {
            const defaultSitkaState = sitka.testGetDefaultState()
            const expectedDefaultState = {
                counter: testCounterModule.defaultState,
            }

            expect(defaultSitkaState).toEqual(expectedDefaultState)
        })
    })

    describe("private createRoot()", () => {
        test("returns () => IterableIterator<{}>", () => {
            type funcReturnsIterableIterator = () => IterableIterator<{}>

            const functionOutput: funcReturnsIterableIterator = sitka.testCreateRoot()
            const returnedFromFunctionOutput: IterableIterator<{}> = functionOutput()

            expect(sitka.testCreateRoot())
                .toBeInstanceOf(Function as unknown as funcReturnsIterableIterator)

            expect(returnedFromFunctionOutput)
                .toBeInstanceOf(Object as unknown as IterableIterator<{}>)
        })
    })

    // describe("private doDispatch()", () => {
    //     test("if dispatch property exists, function calls dispatch with passed in Action", () => {})
    // })
})