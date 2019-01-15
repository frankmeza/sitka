import { Action, Dispatch } from "redux"
import { Sitka } from "../src/sitka"
import TestSitka from "./test_data/test_sitka"

describe("Sitka", () => {
    const sitka: Sitka = new TestSitka()

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

    describe("public createSitkaMeta()", () => {

    })

    describe("public createStore()", () => {

    })

    describe("public register()", () => {

    })

    describe("private getDefaultState()", () => {

    })

    describe("private createRoot()", () => {

    })

    describe("private doDispatch()", () => {

    })
})