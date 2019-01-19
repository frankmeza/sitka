import { Action, Dispatch } from "redux"
import TestSitka from "./test_data/test_sitka"

describe("Sitka", () => {
    const sitka = new TestSitka()

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
        })
    })

    // describe("public setDispatch()", () => {})
    // describe("public getModules()", () => {})

    // describe("public createSitkaMeta()", () => {

    // })

    // describe("public createStore()", () => {

    // })

    // describe("public register()", () => {

    // })

    describe("private getDefaultState()", () => {
        test("returns default state of Sitka", () => {
            const defaultState = sitka.testGetDefaultState()
            expect(defaultState).toEqual({})
        })
    })

    // describe("private createRoot()", () => {

    // })

    // describe("private doDispatch()", () => {

    // })
})