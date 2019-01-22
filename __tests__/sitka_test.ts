import {
    Action,
    AnyAction,
    Dispatch,
    Reducer,
    Store,
    createStore,
} from "redux"

import { Sitka } from "../src/sitka"
import { SitkaMeta, AppStoreCreator } from "../src/interfaces_and_types"
import * as utils from "../src/utils"

import TestSitka from "./test_data/test_sitka"
import TestSitkaModule from "./test_data/test_sitka_module"
import { AppModules } from "./test_data/test_index";

describe("Sitka", () => {
    const sitka = new TestSitka()
    const testCounterModule = new TestSitkaModule()

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
            const expected: AppModules = { counter: testCounterModule }

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
            const createdSitkaMeta: SitkaMeta = sitka.createSitkaMeta()
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
                return utils.createAppStore({
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

    describe("public register()", () => {

        test("registers SitkaModules", () => {
            const testSitka = new TestSitka()
            const testCounterModule = new TestSitkaModule()

            // before registering a module
            const modules: AppModules = testSitka.getModules()
            const numberOfModules: number = Object.keys(modules).length
            expect(numberOfModules).toEqual(0)

            testSitka.register([testCounterModule])

            // after registering a module
            const modulesUpdated: AppModules = testSitka.getModules()
            const numberOfModulesUpdated: number = Object.keys(modulesUpdated).length
            expect(numberOfModulesUpdated).toEqual(1)

            // the module registered is testCounterModule
            expect(modulesUpdated.counter).toEqual(testCounterModule)
        })

        test("registers SitkaModules", () => {
            const testSitka = new TestSitka()
            const testCounterModule = new TestSitkaModule()

            // before registering a module
            const modules = testSitka.getModules()
            const numberOfModules = Object.keys(modules).length
            expect(numberOfModules).toEqual(0)

            testSitka.register([testCounterModule])

            // after registering a module
            const modulesUpdated = testSitka.getModules()
            const numberOfModulesUpdated = Object.keys(modulesUpdated).length
            expect(numberOfModulesUpdated).toEqual(1)

            // the module registered is testCounterModule
            expect(modulesUpdated.counter).toEqual(testCounterModule)
        })

        test("generates instance method names for each module", () => {
            const testSitka = new TestSitka()
            const testCounterModule = new TestSitkaModule()

            const spy = jest.spyOn(utils, "getInstanceMethodNames")
            testSitka.register([testCounterModule])

            expect(spy).toHaveBeenCalled()

            const modules: AppModules = testSitka.getModules()
            const numberOfModules: number = Object.keys(modules).length

            expect(numberOfModules).toBe(1)
            expect(spy.mock.calls.length).toEqual(numberOfModules)
        })

        // needs more tests...
    })

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

    describe("private doDispatch()", () => {
        test("if dispatch property exists, function calls sitka[\"dispatch\"] with passed in Action", () => {
            const action: Action = {
                "type": "MODULE_COUNTER_CHANGE_STATE",
            }

            // set private property as a mock
            const mockedDispatchFn: jest.Mock<{}> = sitka["doDispatch"] = jest.fn()
            sitka.testDoDispatch(action)

            expect(mockedDispatchFn).toHaveBeenLastCalledWith(action)
            expect(mockedDispatchFn.mock.calls.length).toBe(1)
        })
    })
})